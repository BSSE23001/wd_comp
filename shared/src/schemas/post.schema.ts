import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    title: z
      .string("Title is required")
      .min(3, "Title must be at least 3 characters"),
    content: z.string().nullable(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    content: z.string().nullable(),
  }),
});

export const paramsSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
