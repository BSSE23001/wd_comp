import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// Adjust import based on how you expose enums from your shared repo/prisma
import { Role } from "@repo/prisma";

export interface AuthRequest extends Request {
  user?: { id: string; role: Role; email: string };
}

export const requireAuth = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (!allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ error: "Forbidden: Insufficient permissions" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};

export const requireInternalKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const key = req.headers["x-internal-api-key"];
  if (key !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid internal key" });
  }
  next();
};
