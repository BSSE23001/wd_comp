import { prisma } from "../lib/db.js";
import type { CreatePostInput, UpdatePostInput } from "@repo/shared";
import { ApiError } from "../utils/ApiError.js";

export const createPost = async (data: CreatePostInput, authorId: string) => {
  return await prisma.post.create({ data: { ...data, authorId } });
};

export const getPosts = async (authorId: string) => {
  return await prisma.post.findMany({ where: { authorId } });
};

export const getPostById = async (id: number, authorId: string) => {
  const post = await prisma.post.findFirst({
    where: { id, authorId },
  });
  if (!post) {
    throw new ApiError(404, "Post not found or unauthorized");
  }
  return post;
};

export const updatePost = async (
  id: number,
  data: UpdatePostInput,
  authorId: string,
) => {
  await getPostById(id, authorId); // Verify existence & ownership
  return await prisma.post.update({ where: { id }, data });
};

export const deletePost = async (id: number, authorId: string) => {
  await getPostById(id, authorId); // Verify existence & ownership
  return await prisma.post.delete({ where: { id } });
};
