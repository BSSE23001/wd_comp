import { ApiResponse } from "./ApiResponse.js";
import {} from "express";
export const sendResponse = (res, statusCode, data, message) => {
    res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};
//# sourceMappingURL=sendResponse.js.map