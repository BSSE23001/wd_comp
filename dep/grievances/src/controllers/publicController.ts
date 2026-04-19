import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { prisma, PostCategory } from "@repo/prisma";

export const getGrievances = async (req: Request, res: Response) => {
  try {
    const { search, tags, sort } = req.query;

    const query: any = {};

    // 1. Simple string search on description
    if (search) {
      query.description = { contains: search as string, mode: "insensitive" };
    }

    // 2. Postgres Array filtering (hasSome)
    if (tags) {
      const tagsArray = (tags as string).split(",").map((t) => t.trim());
      query.tags = { hasSome: tagsArray };
    }

    const posts = await prisma.grievancePost.findMany({
      where: query,
      orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
      include: {
        platform: { select: { name: true } },
        cluster: { select: { name: true } },
      },
      // CRITICAL: We DO NOT include the `worker` relation here to ensure anonymity
    });

    // Strip the workerId before sending to the client just to be absolutely safe
    const sanitizedPosts = posts.map(({ workerId, ...rest }) => rest);

    res.json(sanitizedPosts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch grievances" });
  }
};

export const createGrievance = async (req: AuthRequest, res: Response) => {
  try {
    const workerId = req.user!.id;
    const { category, description, rateIntel, tags, platformId } = req.body;

    const post = await prisma.grievancePost.create({
      data: {
        workerId,
        category: category as PostCategory,
        description,
        rateIntel: rateIntel ? parseFloat(rateIntel) : null,
        tags: tags || [],
        platformId: platformId || null,
      },
    });

    // Strip workerId from the response to maintain the illusion of anonymity on the client
    const { workerId: _, ...sanitizedPost } = post;
    res.status(201).json(sanitizedPost);
  } catch (error) {
    res.status(500).json({ error: "Failed to create grievance" });
  }
};
