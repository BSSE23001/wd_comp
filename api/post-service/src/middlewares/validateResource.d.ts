import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
type ValidationSchema = z.ZodType<{
    body?: any;
    query?: any;
    params?: any;
}>;
export declare const validateResource: <T extends ValidationSchema>(schema: T) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=validateResource.d.ts.map