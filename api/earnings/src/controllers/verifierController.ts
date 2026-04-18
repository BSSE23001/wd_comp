import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { prisma, VerificationStatus } from "@repo/prisma";

export const getQueue = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.shiftLog.findMany({
      where: { status: "PENDING", screenshotUrl: { not: null } },
      include: { worker: { select: { email: true } }, platform: true },
      take: 50, // Pagination limit
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch queue" });
  }
};

export const updateVerification = async (req: AuthRequest, res: Response) => {
  try {
    const verifierId = req.user!.id;
    
    // 1. Force TypeScript to recognize this as a single string
    const id = req.params.id as string;

    // 2. SAFETY CHECK
    if (!id) {
      return res.status(400).json({ error: "Missing log ID in the URL path." });
    }

    const { status, verifierNotes } = req.body;

    // 3. DATABASE UPDATE
    const log = await prisma.shiftLog.update({
      where: { id }, // TypeScript is now happy!
      data: {
        status: status as VerificationStatus, 
        verifierId,
        verifierNotes: verifierNotes || "", 
      },
    });

    res.status(200).json({ message: "Log verified successfully", log });

  } catch (error: any) {
    console.error(">>> UPDATE_VERIFICATION_ERROR:", error.message);
    res.status(500).json({ error: "Failed to update log" });
  }
};