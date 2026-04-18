import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { User, SignUpPayload, LoginPayload, AuthResponse, JWTPayload } from '../types';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * Generate Access Token
 */
const generateAccessToken = (user: User): string => {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
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
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
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
    const { email, password, role, first_name, last_name } = req.body as SignUpPayload;

    // Validate required fields
    if (!email || !password || !role) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and role are required',
      });
      return;
    }

    // Validate role
    const validRoles = ['WORKER', 'VERIFIER', 'ADVOCATE'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be WORKER, VERIFIER, or ADVOCATE',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Only the hardcoded advocate email can register as ADVOCATE
    let isApprovedByAdvocate = false;
    if (role === 'ADVOCATE') {
      if (email !== process.env.ADVOCATE_EMAIL) {
        res.status(403).json({
          success: false,
          message: 'Only the designated Advocate can register with ADVOCATE role',
        });
        return;
      }
      isApprovedByAdvocate = true; // Advocate is auto-approved
    } else if (role === 'WORKER') {
      isApprovedByAdvocate = true; // Workers don't need approval
    }

    // Insert new user
    const result = await query(
      `INSERT INTO users 
       (email, password_hash, role, is_approved_by_advocate, first_name, last_name) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [email, password_hash, role, isApprovedByAdvocate, first_name || null, last_name || null]
    );

    const newUser = result.rows[0] as User;

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response: AuthResponse = {
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      },
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: response,
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
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

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    // Query user by email
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const user = userResult.rows[0] as User;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // CRITICAL: Check if Verifier is approved by Advocate
    if (user.role === 'VERIFIER' && !user.is_approved_by_advocate) {
      res.status(401).json({
        success: false,
        message: 'Your account has not been approved by the Advocate yet. Please wait for approval.',
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const response: AuthResponse = {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: response,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
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
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) {
      res.status(401).json({
        success: false,
        message: 'Refresh token not found in cookies',
      });
      return;
    }

    // Verify refresh token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(
        refreshTokenCookie,
        process.env.JWT_REFRESH_SECRET || 'refresh_secret'
      ) as JWTPayload;
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Query user to ensure they still exist
    const userResult = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const user = userResult.rows[0] as User;

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
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
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    message: 'Logout successful',
  });
};
