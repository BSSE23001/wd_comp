import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { prisma } from "@repo/prisma";

export const createPlatform = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const platform = await prisma.platform.create({
      data: { name },
    });
    res.status(201).json(platform);
  } catch (error) {
    res.status(500).json({ error: "Failed to create platform" });
  }
};

export const togglePlatform = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const platform = await prisma.platform.findUnique({ where: { id } });

    if (!platform) return res.status(404).json({ error: "Platform not found" });

    const updated = await prisma.platform.update({
      where: { id },
      data: { isActive: !platform.isActive },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle platform" });
  }
};
