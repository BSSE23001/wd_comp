import { Router } from "express";
import { requireAuth, requireInternalKey } from "./middlewares/auth";
import { upload } from "./middlewares/upload";
import {
  logEarnings,
  bulkCsvImport,
  getWorkerLogs,
  getActivePlatforms,
} from "./controllers/workerController";
import { getQueue, updateVerification } from "./controllers/verifierController";
import {
  createPlatform,
  togglePlatform,
} from "./controllers/advocateController";
import {
  getRecentLogs,
  getVerifiedLogs,
  createFlag,
} from "./controllers/internalController";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Worker Earnings
 *     description: Operations related to worker compensation, including shift logging, real-time earnings tracking, and historical data retrieval.
 *   - name: Verifier Operations
 *     description: Tools for manual and automated verification, including queue processing and proof-of-work screenshot validation.
 *   - name: Advocate Platform Management
 *     description: Administrative controls for gig platforms, enabling the management of active integrations, platform status, and advocate assignments.
 *   - name: Internal System
 *     description: Private endpoints restricted for inter-service communication, system health checks, and cross-module synchronization.
 */

// ==========================================
// WORKER ROUTES
// ==========================================

/**
 * @swagger
 * /api/earnings/logs:
 *   post:
 *     summary: Log a new shift with an optional screenshot
 *     description: Submits a worker's shift details including earnings and deductions. Optionally accepts a screenshot as proof of work.
 *     tags:
 *       - Worker Earnings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - platformId
 *               - date
 *               - netReceived
 *             properties:
 *               platformId:
 *                 type: string
 *                 description: The unique identifier of the gig platform.
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date the shift took place (YYYY-MM-DD).
 *               hoursWorked:
 *                 type: number
 *                 description: Total duration of the shift in hours.
 *               grossEarned:
 *                 type: number
 *                 description: Total earnings before platform fees or taxes.
 *               platformDeductions:
 *                 type: number
 *                 description: Total fees or commissions taken by the platform.
 *               netReceived:
 *                 type: number
 *                 description: The final amount received by the worker.
 *               currency:
 *                 type: string
 *                 example: USD
 *               screenshot:
 *                 type: string
 *                 format: binary
 *                 description: A PNG or JPG proof of the earnings dashboard.
 *     responses:
 *       201:
 *         description: Shift log created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 status: { type: string, example: "pending_verification" }
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized - Bearer token missing or invalid.
 */

router.post(
  "/logs",
  requireAuth(["WORKER"]),
  upload.single("screenshot"),
  logEarnings,
);

/**
 * @swagger
 * /api/earnings/logs/bulk-csv:
 *   post:
 *     summary: Bulk upload shift logs via CSV
 *     description: Upload a CSV file containing multiple shift records for batch processing. The system will parse the file and queue the records for import.
 *     tags:
 *       - Worker Earnings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - csv
 *             properties:
 *               csv:
 *                 type: string
 *                 format: binary
 *                 description: The CSV file containing shift data (columns: platformId, date, hoursWorked, grossEarned, netReceived, currency).
 *     responses:
 *       201:
 *         description: CSV parsed and records imported successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 importedCount: { type: integer, example: 25 }
 *                 skippedCount: { type: integer, example: 0 }
 *                 batchId: { type: string, example: "batch_98765" }
 *       400:
 *         description: Bad Request - Invalid CSV format or missing required columns.
 *       413:
 *         description: Payload Too Large - The uploaded CSV file exceeds the size limit.
 *       401:
 *         description: Unauthorized - Valid bearer token required.
 */
router.post(
  "/logs/bulk-csv",
  requireAuth(["WORKER"]),
  upload.single("csv"),
  bulkCsvImport,
);

/**
 * @swagger
 * /api/earnings/logs:
 *   get:
 *     summary: Get worker's shift logs history
 *     description: Retrieves a paginated list of shift logs for the authenticated worker. Supports filtering by date range.
 *     tags:
 *       - Worker Earnings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs from this date (inclusive).
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter logs up to this date (inclusive).
 *     responses:
 *       200:
 *         description: A paginated list of shift logs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       platformId: { type: string }
 *                       date: { type: string, format: date }
 *                       netReceived: { type: number }
 *                       status: { type: string, enum: [pending, verified, rejected] }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems: { type: integer }
 *                     totalPages: { type: integer }
 *                     currentPage: { type: integer }
 *       401:
 *         description: Unauthorized - Invalid or expired token.
 */

router.get("/logs", requireAuth(["WORKER"]), getWorkerLogs);

/**
 * @swagger
 * /api/earnings/platforms:
 *   get:
 *     summary: Get all active platforms for the dropdown form
 *     description: Returns a list of gig platforms currently supported by the system. Use this to populate selection menus in the worker earnings form.
 *     tags:
 *       - Worker Earnings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of active gig platforms.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "p_001"
 *                   name:
 *                     type: string
 *                     example: "Uber Eats"
 *                   logoUrl:
 *                     type: string
 *                     example: "https://example.com"
 *                   requiresScreenshot:
 *                     type: boolean
 *                     description: Indicates if this platform requires proof of work for verification.
 *       401:
 *         description: Unauthorized - Token is missing or invalid.
 */
router.get("/platforms", requireAuth(["WORKER"]), getActivePlatforms);

// ==========================================
// VERIFIER ROUTES
// ==========================================

/**
 * @swagger
 * /api/earnings/verifier/queue:
 *   get:
 *     summary: Fetch logs pending verification with screenshots
 *     description: Retrieves the current workload for verifiers. Returns a list of earnings submissions that require manual review of uploaded screenshots.
 *     tags:
 *       - Verifier Operations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of logs awaiting verification.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   logId:
 *                     type: string
 *                     example: "log_abc123"
 *                   workerName:
 *                     type: string
 *                     example: "John Doe"
 *                   submittedAt:
 *                     type: string
 *                     format: date-time
 *                   platformName:
 *                     type: string
 *                     example: "DoorDash"
 *                   reportedEarnings:
 *                     type: number
 *                     example: 150.50
 *                   screenshotUrl:
 *                     type: string
 *                     format: uri
 *                     example: "https://googleapis.com"
 *       401:
 *         description: Unauthorized - Token missing or invalid.
 *       403:
 *         description: Forbidden - User does not have verifier permissions.
 */

router.get("/verifier/queue", requireAuth(["VERIFIER"]), getQueue);

/**
 * @swagger
 * /api/earnings/verifier/logs/{id}:
 *   patch:
 *     summary: Approve or flag a discrepancy on a worker's log
 *     description: Updates the verification status of a specific shift log. Verifiers can approve the log, flag it for discrepancies, or mark it as unverifiable if the screenshot is poor quality.
 *     tags:
 *       - Verifier Operations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the shift log to verify.
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
 *                 enum: [VERIFIED, DISCREPANCY, UNVERIFIABLE]
 *                 description: The new status resulting from the manual review.
 *               verifierNotes:
 *                 type: string
 *                 description: Internal notes or feedback for the worker regarding the decision.
 *                 example: "Screenshot does not match the reported net earnings."
 *     responses:
 *       200:
 *         description: Log verification status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 newStatus: { type: string }
 *                 updatedAt: { type: string, format: date-time }
 *       400:
 *         description: Invalid status value provided.
 *       403:
 *         description: Forbidden - Insufficient permissions to perform verification.
 *       404:
 *         description: Log ID not found.
 */

router.patch(
  "/verifier/logs/:id",
  requireAuth(["VERIFIER"]),
  updateVerification,
);

// ==========================================
// ADVOCATE ROUTES
// ==========================================

/**
 * @swagger
 * /api/earnings/platforms:
 *   post:
 *     summary: Add a new gig platform to the system
 *     description: Registers a new supported gig platform (e.g., Instacart, TaskRabbit) that workers can select when logging earnings.
 *     tags:
 *       - Advocate Platform Management
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
 *                 description: The official name of the gig platform.
 *                 example: "Instacart"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the platform should be immediately visible to workers.
 *     responses:
 *       201:
 *         description: Platform created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 name: { type: string }
 *                 createdAt: { type: string, format: date-time }
 *       400:
 *         description: Bad Request - Platform name already exists or is missing.
 *       401:
 *         description: Unauthorized - Valid bearer token required.
 *       403:
 *         description: Forbidden - Only Advocate Admins can add platforms.
 */

router.post("/platforms", requireAuth(["ADVOCATE"]), createPlatform);

/**
 * @swagger
 * /api/earnings/platforms/{id}/toggle:
 *   patch:
 *     summary: Enable or disable a platform globally
 *     description: Toggles the `isActive` status of a gig platform. Disabled platforms will no longer appear in worker selection dropdowns but historical data will remain preserved.
 *     tags:
 *       - Advocate Platform Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the platform to toggle.
 *     responses:
 *       200:
 *         description: Platform active status toggled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 name: { type: string }
 *                 isActive: { type: boolean }
 *                 updatedAt: { type: string, format: date-time }
 *       401:
 *         description: Unauthorized - Invalid or expired token.
 *       403:
 *         description: Forbidden - Administrative privileges required.
 *       404:
 *         description: Not Found - Platform ID does not exist.
 */

router.patch(
  "/platforms/:id/toggle",
  requireAuth(["ADVOCATE"]),
  togglePlatform,
);

// ==========================================
// INTERNAL SERVICE ROUTES
// ==========================================

/**
 * @swagger
 * /api/earnings/internal/logs/{workerId}:
 *   get:
 *     summary: Fetch recent logs for a worker (Used by Anomaly Service)
 *     description: Private inter-service endpoint to retrieve a worker's logging history for fraud detection and anomaly analysis. Access is restricted to internal services via API Key.
 *     tags:
 *       - Internal System
 *     security:
 *       - internalApiKey: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The internal UUID of the worker.
 *       - in: query
 *         name: lookbackDays
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days of history to retrieve for analysis.
 *     responses:
 *       200:
 *         description: Successfully retrieved recent logs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   date: { type: string, format: date }
 *                   grossEarned: { type: number }
 *                   netReceived: { type: number }
 *                   screenshotHash:
 *                     type: string
 *                     description: SHA-256 hash of the screenshot for duplicate detection.
 *       401:
 *         description: Unauthorized - Invalid Internal API Key.
 *       404:
 *         description: Worker not found.
 */

router.get("/internal/logs/:workerId", requireInternalKey, getRecentLogs);

/**
 * @swagger
 * /api/earnings/internal/logs/{workerId}/verified:
 *   get:
 *     summary: Fetch strictly VERIFIED logs for a date range (Used by Certificate Service)
 *     description: Restricted endpoint for the Certificate Service to retrieve high-confidence, verified shift data. This is used to generate official income certifications for workers.
 *     tags:
 *       - Internal System
 *     security:
 *       - internalApiKey: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the worker.
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date of the certification period (YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date of the certification period (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: A filtered list of verified logs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workerId: { type: string }
 *                 totalNetVerified: { type: number, description: "Sum of netReceived for this period" }
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       date: { type: string, format: date }
 *                       platformName: { type: string }
 *                       netReceived: { type: number }
 *                       verifiedAt: { type: string, format: date-time }
 *       400:
 *         description: Bad Request - Missing required date parameters or invalid date format.
 *       401:
 *         description: Unauthorized - Invalid Internal API Key.
 *       404:
 *         description: No verified logs found for this worker in the specified range.
 */

router.get(
  "/internal/logs/:workerId/verified",
  requireInternalKey,
  getVerifiedLogs,
);

/**
 * @swagger
 * /api/earnings/internal/flags:
 *   post:
 *     summary: Insert a new vulnerability flag for a worker (Used by Anomaly Service)
 *     description: Allows the Anomaly Service to record detected risks or suspicious earning patterns. These flags are used by the system to trigger manual reviews or support interventions.
 *     tags:
 *       - Internal System
 *     security:
 *       - internalApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workerId
 *               - type
 *               - explanation
 *             properties:
 *               workerId:
 *                 type: string
 *                 description: The unique ID of the worker being flagged.
 *                 example: "usr_550e8400"
 *               type:
 *                 type: string
 *                 enum: [UNUSUAL_DEDUCTION, SUDDEN_INCOME_DROP]
 *                 description: The category of the detected anomaly.
 *               explanation:
 *                 type: string
 *                 description: Detailed context regarding why the flag was triggered.
 *                 example: "Net earnings dropped by 80% compared to the 4-week trailing average."
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 default: MEDIUM
 *     responses:
 *       201:
 *         description: Flag created and recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flagId: { type: string }
 *                 status: { type: string, example: "active" }
 *       400:
 *         description: Bad Request - Missing required fields or invalid workerId.
 *       401:
 *         description: Unauthorized - Internal API Key is missing or invalid.
 */
router.post("/internal/flags", requireInternalKey, createFlag);

export default router;
