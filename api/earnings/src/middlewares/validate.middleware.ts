import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

export const validate =
  (schema: ZodType) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
        return next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: error.issues.map((e: any) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          });
          return;
        }
        res.status(500).json({ success: false, message: "Internal server error" });
        return;
      }
    };
