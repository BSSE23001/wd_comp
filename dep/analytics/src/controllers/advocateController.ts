import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { prisma } from "@repo/prisma";
import { format, startOfMonth } from "date-fns";

export const getCommissions = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.shiftLog.findMany({
      where: { status: "VERIFIED" },
      include: { platform: { select: { name: true } } },
    });

    // Group by Platform -> Month -> Rates
    const aggregates: Record<
      string,
      Record<string, { totalGross: number; totalNet: number }>
    > = {};

    logs.forEach((log) => {
      const platformName = log.platform.name;
      const monthKey = format(startOfMonth(log.date), "yyyy-MM");

      if (!aggregates[platformName]) aggregates[platformName] = {};
      if (!aggregates[platformName][monthKey]) {
        aggregates[platformName][monthKey] = { totalGross: 0, totalNet: 0 };
      }

      aggregates[platformName][monthKey].totalGross += log.grossEarned;
      aggregates[platformName][monthKey].totalNet += log.netReceived;
    });

    // Calculate final percentages
    const finalRates: any = {};
    for (const platform in aggregates) {
      finalRates[platform] = {};
      for (const month in aggregates[platform]) {
        const { totalGross, totalNet } = aggregates[platform][month];
        const commissionRate =
          totalGross > 0 ? ((totalGross - totalNet) / totalGross) * 100 : 0;
        finalRates[platform][month] = `${commissionRate.toFixed(2)}%`;
      }
    }

    res.json(finalRates);
  } catch (error) {
    res.status(500).json({ error: "Failed to aggregate commissions" });
  }
};

export const getDistributions = async (req: AuthRequest, res: Response) => {
  try {
    const workers = await prisma.workerProfile.findMany({
      include: { user: { include: { verifiedLogs: true } } },
    });

    const distributions: Record<
      string,
      { under50k: number; mid50kTo150k: number; over150k: number }
    > = {};

    workers.forEach((profile) => {
      const city = profile.cityZone;
      const totalIncome = profile.user.verifiedLogs.reduce(
        (sum, log) => sum + log.netReceived,
        0,
      );

      if (!distributions[city])
        distributions[city] = { under50k: 0, mid50kTo150k: 0, over150k: 0 };

      if (totalIncome < 50000) distributions[city].under50k++;
      else if (totalIncome <= 150000) distributions[city].mid50kTo150k++;
      else distributions[city].over150k++;
    });

    res.json(distributions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch distributions" });
  }
};

export const getVulnerabilities = async (req: AuthRequest, res: Response) => {
  try {
    const flags = await prisma.vulnerabilityFlag.findMany({
      where: { isResolved: false },
      include: {
        worker: {
          select: {
            email: true,
            workerProfile: { select: { cityZone: true, category: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(flags);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vulnerabilities" });
  }
};
