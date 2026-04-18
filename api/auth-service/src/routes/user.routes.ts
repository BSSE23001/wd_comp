import { Router } from 'express';
import {
  getUserProfile,
  updateUser,
  deleteUser,
  approveVerifier,
  getAllUsers,
} from '../controllers/user.controller';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// All routes in this file require authentication
router.use(authenticateJWT);

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
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [WORKER, VERIFIER, ADVOCATE]
 *                     is_approved_by_advocate:
 *                       type: boolean
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     profile_photo_url:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/me', getUserProfile);

/**
 * @openapi
 * /api/users/me:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information (name, phone, photo URL)
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
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               phone_number:
 *                 type: string
 *                 example: +1-555-0123
 *               profile_photo_url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/photos/john.jpg
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: No fields to update
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/me', updateUser);

/**
 * @openapi
 * /api/users/me:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently delete the authenticated user's account. This action cannot be undone.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/me', deleteUser);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users (Advocate only)
 *     description: |
 *       Retrieve a list of all users in the system.
 *       Only the ADVOCATE role can access this endpoint.
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
 *         description: Optional filter to retrieve users by role
 *         example: VERIFIER
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       is_approved_by_advocate:
 *                         type: boolean
 *                 count:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only Advocate can access this endpoint
 *       500:
 *         description: Internal server error
 */
router.get('/', authorizeRoles('ADVOCATE'), getAllUsers);

/**
 * @openapi
 * /api/users/verify/{verifierId}:
 *   patch:
 *     summary: Approve a Verifier (Advocate only)
 *     description: |
 *       Allow the Advocate to approve a Verifier account for login.
 *       Only the ADVOCATE role can call this endpoint.
 *       Once approved (is_approved_by_advocate = true), the Verifier can login.
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
 *         example: 550e8400-e29b-41d4-a716-446655440000
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Verifier approved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     is_approved_by_advocate:
 *                       type: boolean
 *                       example: true
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
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
router.patch('/verify/:verifierId', authorizeRoles('ADVOCATE'), approveVerifier);

export default router;
