import type { CreatePostInput, UpdatePostInput } from "@repo/shared";
export declare const createPost: (data: CreatePostInput, authorId: string) => Promise<{
    id: number;
    title: string;
    content: string | null;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const getPosts: (authorId: string) => Promise<{
    id: number;
    title: string;
    content: string | null;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const getPostById: (id: number, authorId: string) => Promise<{
    id: number;
    title: string;
    content: string | null;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updatePost: (id: number, data: UpdatePostInput, authorId: string) => Promise<{
    id: number;
    title: string;
    content: string | null;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const deletePost: (id: number, authorId: string) => Promise<{
    id: number;
    title: string;
    content: string | null;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=post.service.d.ts.map