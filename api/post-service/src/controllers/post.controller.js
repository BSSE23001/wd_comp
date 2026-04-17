import { catchAsync } from "../utils/catchAsync.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as postService from "../services/post.service.js";
import { sendResponse } from "../utils/sendResponse.js";
export const createPostHandler = catchAsync(async (req, res) => {
    const post = await postService.createPost(req.body, req.auth.userId);
    return sendResponse(res, 201, post, "Post created Successfully");
});
export const getPostsHandler = catchAsync(async (req, res) => {
    const posts = await postService.getPosts(req.auth.userId);
    return sendResponse(res, 200, posts, "Posts Retrieved");
});
export const getPostHandler = catchAsync(async (req, res) => {
    const post = await postService.getPostById(Number(req.params.id), req.auth.userId);
    return sendResponse(res, 200, post, "Post Retrieved");
});
export const updatePostHandler = catchAsync(async (req, res) => {
    const post = await postService.updatePost(Number(req.params.id), req.body, req.auth.userId);
    return sendResponse(res, 200, post, "Post Updated");
});
export const deletePostHandler = catchAsync(async (req, res) => {
    await postService.deletePost(Number(req.params.id), req.auth.userId);
    return sendResponse(res, 200, null, "Post Deleted");
});
//# sourceMappingURL=post.controller.js.map