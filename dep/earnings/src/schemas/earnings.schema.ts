import { z } from "zod";
import { VerificationStatus } from "@repo/prisma";

export const logEarningsSchema = z.object({
  body: z.object({
    platformId: z.string().min(1, "platformId is required"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
    hoursWorked: z.string().or(z.number()).optional(),
    grossEarned: z.string().or(z.number()).optional(),
    platformDeductions: z.string().or(z.number()).optional(),
    netReceived: z.string().or(z.number()),
    currency: z.string().optional(),
  }),
});

export const updateVerificationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(VerificationStatus),
    verifierNotes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, "Log ID is required"),
  }),
});

export const createPlatformSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Platform name is required"),
    isActive: z.boolean().optional(),
  }),
});
