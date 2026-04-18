import { Router } from 'express';
import { signUp, login, refreshToken, logout } from '../controllers/auth.controller';

const router = Router();

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Create a new user account. 
 *       - WORKER and VERIFIER roles are allowed to signup
 *       - VERIFIER signup requires approval from Advocate before login
 *       - Only the hardcoded ADVOCATE can register with ADVOCATE role
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
 *                 format: email
 *                 example: worker@fairgig.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
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
 *         description: User registered successfully. Access token in response, refresh token in HttpOnly cookie.
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
 *                   example: User registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token (valid for 15 minutes)
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *       400:
 *         description: Invalid input or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       403:
 *         description: Only the designated Advocate can register with ADVOCATE role
 *       500:
 *         description: Internal server error
 */
router.post('/signup', signUp);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: |
 *       Authenticate user credentials and return tokens.
 *       - Workers can always login
 *       - Verifiers can only login if approved by Advocate (is_approved_by_advocate = true)
 *       - Access token returned in JSON response body
 *       - Refresh token set in secure HttpOnly cookie
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
 *                 format: email
 *                 example: worker@fairgig.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful. Refresh token set in HttpOnly cookie.
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT access token (valid for 15 minutes)
 *                     user:
 *                       type: object
 *       401:
 *         description: |
 *           Invalid credentials or user not approved.
 *           For Verifiers, returns specific message if not approved by Advocate.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: |
 *       Use the refresh token (from HttpOnly cookie) to get a new access token.
 *       No Authorization header needed - uses refreshToken cookie instead.
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       401:
 *         description: Invalid, expired, or missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/refresh', refreshToken);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clear the refresh token cookie to logout the user
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: Logout successful
 */
router.post('/logout', logout);

export default router;
