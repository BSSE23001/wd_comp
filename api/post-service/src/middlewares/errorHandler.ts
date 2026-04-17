import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (err.code === "P2002") {
    statusCode = 400;
    message = "Duplicate field value";
  }

  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  if (err.name === "ZodError") {
    statusCode = 400;
    message = err.errors?.map((e: any) => e.message).join(", ");
  }

  console.error("❌ ERROR:", {
    path: req.originalUrl,
    method: req.method,
    message: err.message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};
