import { getAuth } from "@clerk/express";
import { ApiError } from "../utils/ApiError.js";
export const requireUser = (req, res, next) => {
    const { userId } = getAuth(req);
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }
    req.auth.userId = userId;
    next();
};
//# sourceMappingURL=auth.middleware.js.map