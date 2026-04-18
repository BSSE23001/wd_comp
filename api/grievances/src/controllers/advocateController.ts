import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { prisma, PostStatus } from "@repo/prisma";

export const updatePostStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const post = await prisma.grievancePost.update({
      where: { id },
      data: { status: status as PostStatus },
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.grievancePost.delete({ where: { id } });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
};

export const createCluster = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const cluster = await prisma.grievanceCluster.create({
      data: { name },
    });
    res.status(201).json(cluster);
  } catch (error) {
    res.status(500).json({ error: "Failed to create cluster" });
  }
};

export const addPostToCluster = async (req: AuthRequest, res: Response) => {
  try {
    const { clusterId } = req.params as { clusterId: string };
    const { postId } = req.body;

    const updatedPost = await prisma.grievancePost.update({
      where: { id: postId },
      data: { clusterId },
    });
    res.json({ message: "Post added to cluster", post: updatedPost });
  } catch (error) {
    res.status(500).json({ error: "Failed to link post to cluster" });
  }
};
