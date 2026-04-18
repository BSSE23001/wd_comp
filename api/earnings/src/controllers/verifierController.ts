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
    const id = (
      Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
    ) as string;
    const { status, verifierNotes } = req.body;

    const log = await prisma.shiftLog.update({
      where: { id },
      data: {
        status: status as VerificationStatus,
        verifierId,
        verifierNotes,
      },
    });
    res.json({ message: "Log verified", log });
  } catch (error) {
    res.status(500).json({ error: "Failed to update log" });
  }
};
