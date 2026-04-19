import { Router } from "express";
import { requireAuth } from "./middlewares/auth";
import { getGrievances, createGrievance } from "./controllers/publicController";
import {
  updatePostStatus,
  deletePost,
  createCluster,
  addPostToCluster,
} from "./controllers/advocateController";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Public & Worker Community
 *     description: >
 *       Anonymous bulletin board and community engagement operations.
 *       Includes public thread creation, anonymous identity management, and peer-to-peer discussions.
 *   - name: Advocate Moderation
 *     description: >
 *       Administrative tools for grievance oversight.
 *       Handles AI-driven clustering of worker issues, conflict resolution, and grievance lifecycle management.
 */

// ==========================================
// PUBLIC & WORKER ROUTES
// ==========================================

/**
 * @swagger
 * /api/grievances:
 *   get:
 *     summary: Fetch all anonymous community posts
 *     description: Retrieves a list of public grievance posts. Data is sanitized to maintain worker anonymity while supporting filtering by keywords, categorical tags, and chronological sorting.
 *     tags:
 *       - Public & Worker Community
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter results based on post content or title.
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         example: "unfair_deactivation,pay_drop"
 *         description: Comma-separated list of tags to filter by specific grievance categories.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [desc, asc]
 *           default: desc
 *         description: Order posts by creation date.
 *     responses:
 *       200:
 *         description: A collection of sanitized community posts.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   description: { type: string }
 *                   tags: { type: array, items: { type: string } }
 *                   createdAt: { type: string, format: date-time }
 *                   upvotes: { type: integer }
 *       400:
 *         description: Bad Request - Invalid query parameters.
 */

router.get("/", getGrievances);

/**
 * @swagger
 * /api/grievances:
 *   post:
 *     summary: Create a new anonymous grievance post
 *     description: Submits a worker grievance to the public board. The user's identity is stripped to ensure anonymity, but a valid token is required to prevent spam.
 *     tags:
 *       - Public & Worker Community
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - description
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [PLATFORM_COMPLAINT, SUPPORT_REQUEST]
 *                 description: The nature of the grievance.
 *               description:
 *                 type: string
 *                 description: Detailed explanation of the issue.
 *                 example: "App crashed during a high-surge delivery and I wasn't compensated."
 *               rateIntel:
 *                 type: number
 *                 nullable: true
 *                 description: Optional hourly rate or earnings detail related to the grievance.
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Descriptive keywords (e.g., ["technical-issue", "payment"]).
 *               platformId:
 *                 type: string
 *                 nullable: true
 *                 description: The ID of the gig platform involved.
 *     responses:
 *       201:
 *         description: Grievance created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 status: { type: string, example: "published" }
 *       401:
 *         description: Unauthorized - Token missing or invalid.
 *       422:
 *         description: Unprocessable Entity - Validation failed (e.g., description too short).
 */

router.post("/", requireAuth(["WORKER"]), createGrievance);

// ==========================================
// ADVOCATE MODERATION ROUTES
// ==========================================

/**
 * @swagger
 * /api/grievances/{id}/status:
 *   patch:
 *     summary: Update the escalation status of a post
 *     description: Modifies the lifecycle state of a grievance. Used by Advocates to track issues from initial reporting through to final resolution.
 *     tags:
 *       - Advocate Moderation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the grievance post.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, ESCALATED, RESOLVED]
 *                 description: The new operational status of the grievance.
 *     responses:
 *       200:
 *         description: Status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 previousStatus: { type: string }
 *                 currentStatus: { type: string }
 *                 updatedAt: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized - Valid bearer token required.
 *       403:
 *         description: Forbidden - Only authorized Advocates can update status.
 *       404:
 *         description: Not Found - Grievance ID does not exist.
 */

router.patch("/:id/status", requireAuth(["ADVOCATE"]), updatePostStatus);

/**
 * @swagger
 * /api/grievances/{id}:
 *   delete:
 *     summary: Permanently delete a grievance post
 *     description: >
 *       Removes a grievance post from the community board. This action is irreversible
 *       and is restricted to Advocates or Admins for moderation purposes.
 *     tags:
 *       - Advocate Moderation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the grievance post to be deleted.
 *     responses:
 *       200:
 *         description: Post deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "Grievance successfully removed." }
 *                 deletedId: { type: string }
 *       401:
 *         description: Unauthorized - Token missing or invalid.
 *       403:
 *         description: Forbidden - You do not have permission to delete posts.
 *       404:
 *         description: Not Found - The specified grievance ID does not exist.
 */

router.delete("/:id", requireAuth(["ADVOCATE"]), deletePost);

/**
 * @swagger
 * /api/grievances/clusters:
 *   post:
 *     summary: Create a new cluster to group related complaints
 *     description: >
 *       Initiates a new thematic cluster to aggregate individual grievances.
 *       Used by Advocates to group localized issues or platform-specific trends for collective action.
 *     tags:
 *       - Advocate Moderation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: A descriptive title for the grievance cluster.
 *                 example: "Uber Islamabad Commission Drop Nov"
 *               description:
 *                 type: string
 *                 description: Optional context regarding the purpose of this group.
 *                 example: "Tracking systemic pay issues affecting drivers in the twin cities."
 *     responses:
 *       201:
 *         description: Cluster created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 name: { type: string }
 *                 memberCount: { type: integer, example: 0 }
 *                 createdAt: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized - Valid credentials required.
 *       403:
 *         description: Forbidden - Insufficient permissions to manage clusters.
 *       409:
 *         description: Conflict - A cluster with this name already exists.
 */

router.post("/clusters", requireAuth(["ADVOCATE"]), createCluster);

/**
 * @swagger
 * /api/grievances/clusters/{clusterId}/add-post:
 *   patch:
 *     summary: Link a specific post to an existing cluster
 *     description: >
 *       Associates an individual grievance post with a thematic cluster.
 *       This allows Advocates to organize disparate complaints into a unified case for collective bargaining or investigation.
 *     tags:
 *       - Advocate Moderation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clusterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the target cluster.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The unique ID of the grievance post to be linked.
 *                 example: "grievance_7721"
 *     responses:
 *       200:
 *         description: Post successfully linked to the cluster.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clusterId: { type: string }
 *                 postId: { type: string }
 *                 totalClusterMembers: { type: integer, example: 12 }
 *       401:
 *         description: Unauthorized - Invalid authentication token.
 *       404:
 *         description: Not Found - Either the clusterId or the postId does not exist.
 *       409:
 *         description: Conflict - This post is already linked to this cluster.
 */

router.patch(
  "/clusters/:clusterId/add-post",
  requireAuth(["ADVOCATE"]),
  addPostToCluster,
);

export default router;
