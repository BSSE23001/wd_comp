import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

type ValidationSchema = z.ZodType<{
  body?: any;
  query?: any;
  params?: any;
}>;

export const validateResource =
  <T extends ValidationSchema>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.validated = validatedData;
      next();
    } catch (e: unknown) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          status: "error",
          errors: e.issues,
        });
      }
      next(e);
    }
  };
