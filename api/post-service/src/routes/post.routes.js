import { Router } from "express";
import { requireUser } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validateResource.js";
import { createPostSchema, updatePostSchema, paramsSchema } from "@repo/shared";
import * as controller from "../controllers/post.controller.js";
const router = Router();
// Apply Clerk Auth globally to these routes
router.use(requireUser);
router
    .route("/")
    .post(validateResource(createPostSchema), controller.createPostHandler)
    .get(controller.getPostsHandler);
router
    .route("/:id")
    .all(validateResource(paramsSchema))
    .get(controller.getPostHandler)
    .put(validateResource(updatePostSchema), controller.updatePostHandler)
    .delete(controller.deletePostHandler);
export default router;
//# sourceMappingURL=post.routes.js.map