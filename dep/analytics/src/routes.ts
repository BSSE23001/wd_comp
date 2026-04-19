import { Router } from "express";
import { requireAuth } from "./middlewares/auth";
import {
  getWorkerTrends,
  getWorkerMedian,
} from "./controllers/workerController";
import {
  getCommissions,
  getDistributions,
  getVulnerabilities,
} from "./controllers/advocateController";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Worker Analytics
 *     description: >
 *       Personalized financial intelligence and performance metrics for workers.
 *       Provides individual earning trends, hourly rate efficiency, and localized income comparisons.
 *   - name: Advocate Analytics
 *     description: >
 *       Macro-level system insights and cross-platform aggregate data.
 *       Focuses on identifying regional wage anomalies, platform-wide shifts, and collective bargaining data points.
 */

// ==========================================
// WORKER ROUTES
// ==========================================

/**
 * @swagger
 * /api/analytics/worker/{workerId}/trends:
 *   get:
 *     summary: Get weekly/monthly earnings trends and effective hourly rate
 *     description: >
 *       Generates time-series data for a worker's income. Calculates the 'Effective Hourly Rate'
 *       by cross-referencing total earnings against verified hours worked across all platforms.
 *     tags:
 *       - Worker Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the worker.
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [weekly, monthly]
 *           default: weekly
 *         description: The grouping interval for the trend data.
 *     responses:
 *       200:
 *         description: Financial trends and efficiency metrics calculated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workerId: { type: string }
 *                 effectiveHourlyRate: { type: number, example: 18.50 }
 *                 trends:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label: { type: string, example: "Week 42" }
 *                       totalEarnings: { type: number, example: 450.00 }
 *                       avgHourlyRate: { type: number, example: 17.25 }
 *       401:
 *         description: Unauthorized - Valid bearer token required.
 *       403:
 *         description: Forbidden - You cannot access another worker's analytics.
 */

router.get(
  "/worker/:workerId/trends",
  requireAuth(["WORKER", "ADVOCATE"]),
  getWorkerTrends,
);

/**
 * @swagger
 * /api/analytics/worker/{workerId}/median:
 *   get:
 *     summary: Compare worker's earnings against the anonymized city-wide median
 *     description: >
 *       Provides a benchmarking insight by comparing the authenticated worker's performance
 *       metrics against the aggregated, anonymized median of all workers in their primary city.
 *     tags:
 *       - Worker Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the worker.
 *     responses:
 *       200:
 *         description: Benchmarking data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workerId: { type: string }
 *                 city: { type: string, example: "Islamabad" }
 *                 workerHourlyAvg: { type: number, example: 22.50 }
 *                 cityMedianHourly: { type: number, example: 19.80 }
 *                 percentileRank: { type: integer, example: 75, description: "Worker's standing relative to the city population" }
 *                 comparisonStatus:
 *                   type: string
 *                   enum: [ABOVE_AVERAGE, AVERAGE, BELOW_AVERAGE]
 *       401:
 *         description: Unauthorized - Valid bearer token required.
 *       403:
 *         description: Forbidden - Access restricted to the account owner.
 *       404:
 *         description: Not Found - No historical data available for this worker or city.
 */

router.get(
  "/worker/:workerId/median",
  requireAuth(["WORKER", "ADVOCATE"]),
  getWorkerMedian,
);

// ==========================================
// ADVOCATE ROUTES
// ==========================================

/**
 * @swagger
 * /api/analytics/advocate/commissions:
 *   get:
 *     summary: Aggregate average commission rates across platforms over time
 *     description: >
 *       Provides a macro-level view of platform fee structures. This endpoint calculates
 *       the actual average commission percentage taken by gig platforms by analyzing the
 *       difference between gross earnings and net payouts across the entire worker population.
 *     tags:
 *       - Advocate Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 6
 *         description: The number of historical months to include in the aggregation.
 *     responses:
 *       200:
 *         description: Successfully aggregated platform commission trends.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   platformName: { type: string, example: "Uber" }
 *                   dataPoints:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         month: { type: string, example: "2023-11" }
 *                         avgCommissionPercentage: { type: number, example: 25.4 }
 *                         totalGrossAnalyzed: { type: number, example: 50000.00 }
 *       401:
 *         description: Unauthorized - Valid credentials required.
 *       403:
 *         description: Forbidden - Access restricted to Advocate/Admin roles.
 */

router.get("/advocate/commissions", requireAuth(["ADVOCATE"]), getCommissions);

/**
 * @swagger
 * /api/analytics/advocate/distributions:
 *   get:
 *     summary: Income distribution brackets grouped by City Zone
 *     description: >
 *       Provides a demographic breakdown of worker earnings. Groups the population into
 *       income brackets (e.g., Low, Middle, High earners) per geographic zone to help
 *       Advocates identify regions with systemic underpayment or high wealth disparity.
 *     tags:
 *       - Advocate Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Optional filter to narrow down the distribution to a specific city.
 *     responses:
 *       200:
 *         description: Income bracket distribution successfully calculated.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   zone: { type: string, example: "Islamabad - Blue Area" }
 *                   currency: { type: string, example: "PKR" }
 *                   brackets:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         range: { type: string, example: "30k - 50k" }
 *                         workerCount: { type: integer, example: 145 }
 *                         percentageOfZone: { type: number, example: 32.5 }
 *       401:
 *         description: Unauthorized - Valid bearer token required.
 *       403:
 *         description: Forbidden - Advocate privileges required.
 */

router.get(
  "/advocate/distributions",
  requireAuth(["ADVOCATE"]),
  getDistributions,
);

/**
 * @swagger
 * /api/analytics/advocate/vulnerabilities:
 *   get:
 *     summary: Fetch all unresolved vulnerability flags across the system
 *     description: >
 *       Retrieves an overview of workers flagged with systemic risks, such as sudden
 *       income drops or unusual platform deductions. This serves as a high-priority
 *       dashboard for Advocates to identify individuals needing immediate support or intervention.
 *     tags:
 *       - Advocate Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Filter flags by priority level.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [UNUSUAL_DEDUCTION, SUDDEN_INCOME_DROP]
 *         description: Filter by the specific category of vulnerability.
 *     responses:
 *       200:
 *         description: Successfully retrieved the vulnerability queue.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   workerId: { type: string }
 *                   flagType: { type: string }
 *                   severity: { type: string }
 *                   detectedAt: { type: string, format: date-time }
 *                   explanation: { type: string, example: "Net earnings decreased by 60% over 7 days." }
 *                   status: { type: string, example: "UNRESOLVED" }
 *       401:
 *         description: Unauthorized - Valid Advocate token required.
 *       403:
 *         description: Forbidden - Access restricted to the Advocate role.
 */

router.get(
  "/advocate/vulnerabilities",
  requireAuth(["ADVOCATE"]),
  getVulnerabilities,
);

export default router;
