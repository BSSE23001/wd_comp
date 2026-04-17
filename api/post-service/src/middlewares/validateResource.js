import { z, ZodError } from "zod";
export const validateResource = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        req.validated = validatedData;
        next();
    }
    catch (e) {
        if (e instanceof ZodError) {
            return res.status(400).json({
                status: "error",
                errors: e.issues,
            });
        }
        next(e);
    }
};
//# sourceMappingURL=validateResource.js.map