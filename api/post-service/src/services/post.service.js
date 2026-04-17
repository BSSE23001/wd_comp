import { prisma } from "../lib/db.js";
import { ApiError } from "../utils/ApiError.js";
export const createPost = async (data, authorId) => {
    return await prisma.post.create({ data: { ...data, authorId } });
};
export const getPosts = async (authorId) => {
    return await prisma.post.findMany({ where: { authorId } });
};
export const getPostById = async (id, authorId) => {
    const post = await prisma.post.findFirst({
        where: { id, authorId },
    });
    if (!post) {
        throw new ApiError(404, "Post not found or unauthorized");
    }
    return post;
};
export const updatePost = async (id, data, authorId) => {
    await getPostById(id, authorId); // Verify existence & ownership
    return await prisma.post.update({ where: { id }, data });
};
export const deletePost = async (id, authorId) => {
    await getPostById(id, authorId); // Verify existence & ownership
    return await prisma.post.delete({ where: { id } });
};
//# sourceMappingURL=post.service.js.map