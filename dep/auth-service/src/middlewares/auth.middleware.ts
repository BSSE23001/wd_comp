import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole } from '../types';

/**
 * Extend Express Request to include user payload
 */
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 * Extracts the token from the Authorization header (Bearer token)
 * and attaches the decoded payload to req.user
 */
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Missing or invalid Authorization header',
    });
    return;
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Factory middleware to authorize specific roles
 * Usage: router.post('/route', authorizeRoles('ADVOCATE', 'VERIFIER'), controller)
 */
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Optional middleware to attach user if token exists, but not required
 * Useful for routes that work with or without authentication
 */
export const optionalJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JWTPayload;
      req.user = decoded;
    } catch (error) {
      // Silently fail - token may be invalid but route doesn't require it
      console.log('Optional JWT verification failed:', error);
    }
  }

  next();
};
