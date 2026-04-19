import { Request, Response } from "express";
import { prisma, User, Role, ApprovalStatus } from "@repo/prisma";
import { UpdateUserPayload } from "../types";
/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const getUserProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Assuming req.user is populated by your auth middleware
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        approvalStatus: true,
        createdAt: true,
        updatedAt: true,
        workerProfile: true, // Included relation from schema for richness
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @openapi
 * /api/users/me:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               profile_photo_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export const updateUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // NOTE: first_name, last_name, phone_number, profile_photo_url are missing from the schema.
    // If you update your schema to include these, you can add them to the 'data' object below.
    // For now, this route validates authentication and ensures the user exists.

    const userToUpdate = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!userToUpdate) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Placeholder update for when schema fields are added.
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        // e.g., firstName: req.body.first_name,
      },
      select: {
        id: true,
        email: true,
        role: true,
        approvalStatus: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: "User profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @openapi
 * /api/users/me:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently delete the authenticated user's account
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export const deleteUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    // Prisma throws an error if trying to delete a non-existent record
    const userExists = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!userExists) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * @openapi
 * /api/users/advocate/verifiers:
 */
export const getVerifiersList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== Role.ADVOCATE) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    const verifiers = await prisma.user.findMany({
      where: { role: Role.VERIFIER },
      select: { id: true, email: true, approvalStatus: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: verifiers });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @openapi
 * /api/users/advocate/verifiers/{id}/status:
 */
export const updateVerifierStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== Role.ADVOCATE) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    const verifierId = req.params.id as string;
    const { status } = req.body;

    if (![ApprovalStatus.APPROVED, ApprovalStatus.REJECTED].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be APPROVED or REJECTED",
      });
      return;
    }

    const verifier = await prisma.user.findUnique({
      where: { id: verifierId },
    });

    if (!verifier || verifier.role !== Role.VERIFIER) {
      res.status(404).json({ success: false, message: "Verifier not found" });
      return;
    }

    const updatedVerifier = await prisma.user.update({
      where: { id: verifierId },
      data: { approvalStatus: status as ApprovalStatus },
      select: { id: true, email: true, role: true, approvalStatus: true },
    });

    res.json({
      success: true,
      message: `Verifier status updated to ${status}`,
      data: updatedVerifier,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users (Advocate only)
 *     description: Retrieve a list of all users. Only Advocate can access this endpoint.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: role
 *         in: query
 *         schema:
 *           type: string
 *           enum: [WORKER, VERIFIER, ADVOCATE]
 *         description: Filter users by role
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only Advocate can access
 *       500:
 *         description: Internal server error
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.user.role) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }

    if (req.user.role !== Role.ADVOCATE) {
      res.status(403).json({
        success: false,
        message: "Only Advocate can view all users",
      });
      return;
    }

    const role = req.query.role as string | undefined;

    const users = await prisma.user.findMany({
      where: role ? { role: role as Role } : undefined,
      select: {
        id: true,
        email: true,
        role: true,
        approvalStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
