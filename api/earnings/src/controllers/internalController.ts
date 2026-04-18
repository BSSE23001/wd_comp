import { Request, Response } from "express";
import { prisma, FlagType } from "@repo/prisma";

export const getRecentLogs = async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params as { workerId: string };
    const logs = await prisma.shiftLog.findMany({
      where: { workerId },
      orderBy: { date: "desc" },
      take: 50, // Fetch recent for anomaly detection
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch internal logs" });
  }
};

export const getVerifiedLogs = async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params as { workerId: string };
    const { startDate, endDate } = req.query;

    const logs = await prisma.shiftLog.findMany({
      where: {
        workerId,
        status: "VERIFIED",
        date: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      },
      orderBy: { date: "asc" },
      include: { platform: { select: { name: true } } },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch verified logs" });
  }
};

export const createFlag = async (req: Request, res: Response) => {
  try {
    const { workerId, type, explanation } = req.body;
    const flag = await prisma.vulnerabilityFlag.create({
      data: {
        workerId,
        type: type as FlagType,
        explanation,
      },
    });
    res.status(201).json(flag);
  } catch (error) {
    res.status(500).json({ error: "Failed to create vulnerability flag" });
  }
};
