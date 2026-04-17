import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { ApiError } from "../utils/ApiError.js";

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = getAuth(req);

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  req.auth.userId = userId;

  next();
};
