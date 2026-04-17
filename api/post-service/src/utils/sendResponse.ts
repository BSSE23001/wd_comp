import { ApiResponse } from "./ApiResponse.js";
import { type Response } from "express";
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string,
) => {
  res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};
