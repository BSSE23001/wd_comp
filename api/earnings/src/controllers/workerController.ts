import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { prisma, VerificationStatus } from "@repo/prisma";
import { uploadScreenshot } from "../services/supabase";
import { parse } from "csv-parse/sync";

export const logEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const workerId = req.user!.id;
    const {
      platformId,
      date,
      hoursWorked,
      grossEarned,
      platformDeductions,
      netReceived,
      currency,
    } = req.body;

    let screenshotUrl = null;
    if (req.file) {
      screenshotUrl = await uploadScreenshot(
        req.file.buffer,
        req.file.originalname,
      );
    }

    const log = await prisma.shiftLog.create({
      data: {
        workerId,
        platformId,
        date: new Date(date),
        hoursWorked: parseFloat(hoursWorked),
        grossEarned: parseFloat(grossEarned),
        platformDeductions: parseFloat(platformDeductions),
        netReceived: parseFloat(netReceived),
        currency: currency || "PKR",
        screenshotUrl,
      },
    });

    res.status(201).json({ message: "Log created", log });
  } catch (error) {
    res.status(500).json({ error: "Failed to create log" });
  }
};

export const bulkCsvImport = async (req: AuthRequest, res: Response) => {
  try {
    const workerId = req.user!.id;
    if (!req.file) return res.status(400).json({ error: "No CSV provided" });

    const records = parse(req.file.buffer, {
      columns: true,
      skip_empty_lines: true,
    });

    const shiftLogsData = records.map((record: any) => ({
      workerId,
      platformId: record.platformId,
      date: new Date(record.date),
      hoursWorked: parseFloat(record.hoursWorked),
      grossEarned: parseFloat(record.grossEarned),
      platformDeductions: parseFloat(record.platformDeductions),
      netReceived: parseFloat(record.netReceived),
      currency: record.currency || "PKR",
      status: "PENDING" as VerificationStatus,
    }));

    await prisma.shiftLog.createMany({ data: shiftLogsData });
    res.status(201).json({
      message: `Successfully imported ${shiftLogsData.length} records.`,
    });
  } catch (error) {
    res.status(500).json({ error: "CSV Processing failed" });
  }
};

export const getWorkerLogs = async (req: AuthRequest, res: Response) => {
  try {
    const workerId = req.user!.id;
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    const query: any = { workerId };
    if (startDate && endDate) {
      query.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const logs = await prisma.shiftLog.findMany({
      where: query,
      orderBy: { date: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: { platform: true },
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

export const getActivePlatforms = async (req: AuthRequest, res: Response) => {
  try {
    const platforms = await prisma.platform.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    res.json(platforms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch platforms" });
  }
};
