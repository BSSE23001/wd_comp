import { z } from "zod";
import { WorkerCategory } from "@repo/prisma";

export const registerWorkerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    category: z.enum(WorkerCategory).catch(() => {
      throw new Error(
        `Invalid category. Must be one of: ${Object.values(WorkerCategory).join(", ")}`,
      );
    }),
    cityZone: z.string().min(1, "City zone is required"),
  }),
});

export const registerVerifierSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
