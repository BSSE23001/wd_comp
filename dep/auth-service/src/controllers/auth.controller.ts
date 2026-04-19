import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  prisma,
  User,
  Role,
  ApprovalStatus,
  WorkerCategory,
} from "@repo/prisma";
import {
  SignUpPayload,
  LoginPayload,
  AuthResponse,
  JWTPayload,
} from "../types";

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

/**
 * Generate Access Token
 */
const generateAccessToken = (user: User): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || "secret", {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (user: User): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "refresh_secret", {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Create a new user account.
 *       - WORKER and VERIFIER roles are auto-approved for signup
 *       - Only the hardcoded ADVOCATE can use role='ADVOCATE'
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: worker@fairgig.com
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *               role:
 *                 type: string
 *                 enum: [WORKER, VERIFIER, ADVOCATE]
 *                 example: WORKER
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *             required:
 *               - email
 *               - password
 *               - role
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       400:
 *         description: Invalid input or email already exists
 *       500:
 *         description: Internal server error
 */
export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body as SignUpPayload;

    // Validate required fields
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
      return;
    }

    // Validate role using Prisma Enums
    if (!Object.values(Role).includes(role as Role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role. Must be WORKER, VERIFIER, or ADVOCATE",
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "Email already registered",
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Map role and approval logic
    let approvalStatus: ApprovalStatus = ApprovalStatus.PENDING;

    if (role === Role.ADVOCATE) {
      if (email !== process.env.ADVOCATE_EMAIL) {
        res.status(403).json({
          success: false,
          message:
            "Only the designated Advocate can register with ADVOCATE role",
        });
        return;
      }
      approvalStatus = ApprovalStatus.APPROVED; // Advocate is auto-approved
    } else if (role === Role.WORKER) {
      approvalStatus = ApprovalStatus.APPROVED; // Workers don't need approval
    }

    // Insert new user using Prisma
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as Role,
        approvalStatus,
        // first_name, last_name, etc. omitted as they are not in the provided Prisma schema
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response: AuthResponse = {
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        // Removed missing fields to align with Schema
      },
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: response,
    });
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: |
 *       Authenticate user credentials and return tokens.
 *       - Verifiers cannot login unless is_approved_by_advocate is true
 *       - Access token returned in response, refresh token in HttpOnly cookie
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: worker@fairgig.com
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid credentials or user not approved
 *       500:
 *         description: Internal server error
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginPayload;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    // Query user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // CRITICAL: Check if Verifier is approved
    if (
      user.role === Role.VERIFIER &&
      user.approvalStatus !== ApprovalStatus.APPROVED
    ) {
      res.status(401).json({
        success: false,
        message:
          "Your account has not been approved by the Advocate yet. Please wait for approval.",
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response: AuthResponse = {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };

    res.json({
      success: true,
      message: "Login successful",
      data: response,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Use the refresh token (from HttpOnly cookie) to get a new access token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: Invalid or missing refresh token
 *       500:
 *         description: Internal server error
 */
export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) {
      res.status(401).json({
        success: false,
        message: "Refresh token not found in cookies",
      });
      return;
    }

    // Verify refresh token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(
        refreshTokenCookie,
        process.env.JWT_REFRESH_SECRET || "refresh_secret",
      ) as JWTPayload;
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    // Query user to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clear the refresh token cookie
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logout successful
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "Logout successful",
  });
};

/**
 * @openapi
 * /api/auth/register/worker:
 */
export const registerWorker = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password, category, cityZone } = req.body;

    if (!email || !password || !category || !cityZone) {
      res.status(400).json({
        success: false,
        message: "Email, password, category, and cityZone are required",
      });
      return;
    }

    if (!Object.values(WorkerCategory).includes(category as WorkerCategory)) {
      res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${Object.values(WorkerCategory).join(", ")}`,
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res
        .status(400)
        .json({ success: false, message: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Use Prisma Transaction to ensure both User and Profile are created together
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: Role.WORKER,
          approvalStatus: ApprovalStatus.APPROVED, // Workers are auto-approved
        },
      });

      await tx.workerProfile.create({
        data: {
          userId: user.id,
          category: category as WorkerCategory,
          cityZone,
          defaultCurrency: "PKR",
        },
      });

      return user;
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Worker registered successfully",
      data: {
        accessToken,
        user: { id: newUser.id, email: newUser.email, role: newUser.role },
      },
    });
  } catch (error) {
    console.error("Worker registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @openapi
 * /api/auth/register/verifier:
 */
export const registerVerifier = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res
        .status(400)
        .json({ success: false, message: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: Role.VERIFIER,
        approvalStatus: ApprovalStatus.PENDING, // Verifiers wait for approval
      },
    });

    // We DO NOT generate tokens here because they cannot log in yet
    res.status(201).json({
      success: true,
      message:
        "Verifier registered successfully. Please wait for an Advocate to approve your account before logging in.",
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          status: newUser.approvalStatus,
        },
      },
    });
  } catch (error) {
    console.error("Verifier registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
