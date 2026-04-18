import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { prisma, VerificationStatus } from "@repo/prisma";
import { uploadScreenshot } from "../services/supabase";
import { parse } from "csv-parse/sync";

export const logEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const workerId = req.user?.id;
    if (!workerId) {
      return res.status(401).json({ error: "Unauthorized", message: "User ID missing from token." });
    }

    const {
      platformId,
      date,
      hoursWorked,
      grossEarned,
      platformDeductions,
      netReceived,
      currency,
    } = req.body;

    // 1. Basic Validation Check
    if (!platformId || !date || !netReceived) {
      return res.status(400).json({ 
        error: "Validation Failed", 
        message: "platformId, date, and netReceived are required fields." 
      });
    }

    let screenshotUrl = null;
    if (req.file) {
      try {
        screenshotUrl = await uploadScreenshot(
          req.file.buffer,
          req.file.originalname,
        );
      } catch (uploadErr) {
        console.error("Screenshot upload failed:", uploadErr);
        return res.status(500).json({ error: "Upload Failed", message: "Failed to upload screenshot to storage." });
      }
    }

    // 2. Prisma Create with Number Parsing Safety
    const log = await prisma.shiftLog.create({
      data: {
        workerId,
        platformId,
        date: new Date(date),
        // Use || 0 to prevent NaN (Not a Number) from crashing Prisma
        hoursWorked: parseFloat(hoursWorked) || 0,
        grossEarned: parseFloat(grossEarned) || 0,
        platformDeductions: parseFloat(platformDeductions) || 0,
        netReceived: parseFloat(netReceived) || 0,
        currency: currency || "PKR",
        screenshotUrl,
      },
    });

    res.status(201).json({ message: "Log created successfully", log });

  } catch (error: any) {
    // 3. Detailed Server Logging
    console.error(">>> EARNINGS_LOG_ERROR:", error);

    // Handle Specific Prisma Error: Foreign Key Constraint (P2003)
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: "Database Constraint Error", 
        message: `The provided platformId (${req.body.platformId}) does not exist in the database.` 
      });
    }

    // Handle Specific Prisma Error: Invalid Data Type (P2002, etc.)
    if (error.name === 'PrismaClientKnownRequestError') {
      return res.status(400).json({ 
        error: "Prisma Error", 
        message: error.message,
        code: error.code 
      });
    }

    // Final Fallback
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: error.message || "An unexpected error occurred while creating the log." 
    });
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
