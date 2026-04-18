import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { prisma } from "@repo/prisma";
import { startOfMonth, startOfWeek, format } from "date-fns";

export const getWorkerTrends = async (req: AuthRequest, res: Response) => {
  try {
    const { workerId } = req.params as { workerId: string };

    // Ensure worker can only see their own data
    if (req.user!.role === "WORKER" && req.user!.id !== workerId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const logs = await prisma.shiftLog.findMany({
      where: { workerId, status: "VERIFIED" },
      orderBy: { date: "asc" },
    });

    const monthlyTrends: Record<
      string,
      { gross: number; net: number; hours: number }
    > = {};
    let totalNet = 0;
    let totalHours = 0;

    logs.forEach((log) => {
      const monthKey = format(startOfMonth(log.date), "yyyy-MM");
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = { gross: 0, net: 0, hours: 0 };
      }
      monthlyTrends[monthKey].gross += log.grossEarned;
      monthlyTrends[monthKey].net += log.netReceived;
      monthlyTrends[monthKey].hours += log.hoursWorked;

      totalNet += log.netReceived;
      totalHours += log.hoursWorked;
    });

    const effectiveHourlyRate = totalHours > 0 ? totalNet / totalHours : 0;

    res.json({
      trends: monthlyTrends,
      effectiveHourlyRate,
      overallNet: totalNet,
      overallHours: totalHours,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trends" });
  }
};

export const getWorkerMedian = async (req: AuthRequest, res: Response) => {
  try {
    const { workerId } = req.params as { workerId: string };

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId: workerId },
    });

    if (!workerProfile)
      return res.status(404).json({ error: "Profile not found" });

    // Fetch all logs in that city and category
    const cityLogs = await prisma.shiftLog.findMany({
      where: {
        worker: {
          workerProfile: {
            cityZone: workerProfile.cityZone,
            category: workerProfile.category,
          },
        },
        status: "VERIFIED",
      },
    });

    // Group earnings by worker to find the median worker
    const workerEarnings: Record<string, number> = {};
    cityLogs.forEach((log) => {
      workerEarnings[log.workerId] =
        (workerEarnings[log.workerId] || 0) + log.netReceived;
    });

    const earningsArray = Object.values(workerEarnings).sort((a, b) => a - b);
    let median = 0;
    if (earningsArray.length > 0) {
      const mid = Math.floor(earningsArray.length / 2);
      median =
        earningsArray.length % 2 !== 0
          ? earningsArray[mid]
          : (earningsArray[mid - 1] + earningsArray[mid]) / 2;
    }

    const myEarnings = workerEarnings[workerId] || 0;

    res.json({
      cityZone: workerProfile.cityZone,
      category: workerProfile.category,
      yourTotalVerifiedEarnings: myEarnings,
      cityWideMedian: median,
      difference: myEarnings - median,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch median data" });
  }
};
