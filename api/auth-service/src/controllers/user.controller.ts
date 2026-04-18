import { Request, Response } from 'express';
import { query } from '../db';
import { User, UpdateUserPayload } from '../types';

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
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const result = await query(
      `SELECT id, email, role, is_approved_by_advocate, first_name, last_name, 
              phone_number, profile_photo_url, created_at, updated_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
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
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { first_name, last_name, phone_number, profile_photo_url } =
      req.body as UpdateUserPayload;

    // Build dynamic UPDATE query
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (first_name !== undefined) {
      fields.push(`first_name = $${paramIndex}`);
      values.push(first_name);
      paramIndex++;
    }

    if (last_name !== undefined) {
      fields.push(`last_name = $${paramIndex}`);
      values.push(last_name);
      paramIndex++;
    }

    if (phone_number !== undefined) {
      fields.push(`phone_number = $${paramIndex}`);
      values.push(phone_number);
      paramIndex++;
    }

    if (profile_photo_url !== undefined) {
      fields.push(`profile_photo_url = $${paramIndex}`);
      values.push(profile_photo_url);
      paramIndex++;
    }

    if (fields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
      return;
    }

    // Add user ID to the end of values array
    values.push(req.user.id);

    const updateQuery = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const updatedUser = result.rows[0];

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
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
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.user.id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * @openapi
 * /api/users/verify/{verifierId}:
 *   patch:
 *     summary: Approve a Verifier (Advocate only)
 *     description: |
 *       Allow the Advocate to approve a Verifier account.
 *       Only an ADVOCATE can call this endpoint.
 *       Once approved, the Verifier can login.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: verifierId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the Verifier to approve
 *     responses:
 *       200:
 *         description: Verifier approved successfully
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
 *       400:
 *         description: Invalid request or user is not a Verifier
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only Advocate can approve Verifiers
 *       404:
 *         description: Verifier not found
 *       500:
 *         description: Internal server error
 */
export const approveVerifier = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Only ADVOCATE can approve verifiers
    if (req.user.role !== 'ADVOCATE') {
      res.status(403).json({
        success: false,
        message: 'Only Advocate can approve Verifiers',
      });
      return;
    }

    const { verifierId } = req.params;

    if (!verifierId) {
      res.status(400).json({
        success: false,
        message: 'Verifier ID is required',
      });
      return;
    }

    // Query the verifier
    const userResult = await query('SELECT * FROM users WHERE id = $1', [verifierId]);

    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const verifier = userResult.rows[0] as User;

    // Ensure the user is a VERIFIER
    if (verifier.role !== 'VERIFIER') {
      res.status(400).json({
        success: false,
        message: 'User is not a Verifier',
      });
      return;
    }

    // Update the verifier's approval status
    const updateResult = await query(
      'UPDATE users SET is_approved_by_advocate = true WHERE id = $1 RETURNING *',
      [verifierId]
    );

    const approvedVerifier = updateResult.rows[0];

    res.json({
      success: true,
      message: 'Verifier approved successfully',
      data: {
        id: approvedVerifier.id,
        email: approvedVerifier.email,
        role: approvedVerifier.role,
        is_approved_by_advocate: approvedVerifier.is_approved_by_advocate,
        first_name: approvedVerifier.first_name,
        last_name: approvedVerifier.last_name,
      },
    });
  } catch (error) {
    console.error('Approve verifier error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
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
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Only ADVOCATE can view all users
    if (req.user.role !== 'ADVOCATE') {
      res.status(403).json({
        success: false,
        message: 'Only Advocate can view all users',
      });
      return;
    }

    const { role } = req.query;

    let queryText = `SELECT id, email, role, is_approved_by_advocate, first_name, last_name, 
                     phone_number, profile_photo_url, created_at, updated_at FROM users`;
    const values: any[] = [];

    if (role) {
      queryText += ' WHERE role = $1';
      values.push(role);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, values);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
