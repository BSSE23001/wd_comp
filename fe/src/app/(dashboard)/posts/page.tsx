"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Edit } from "lucide-react";
import { useCallback } from "react";
import { useApiClient } from "@/utils/apiClient";

// 🚀 IMPORTS FROM SHARED WORKSPACE
import { createPostSchema, type CreatePostInput } from "@repo/shared";

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export default function PostsPage() {
  const api = useApiClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formSchema = createPostSchema.shape.body;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(formSchema),
  });

  const fetchPosts = useCallback(async () => {
    try {
      const response = await api.get("/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await api.get("/posts");
        setPosts(response.data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [api]);

  const onSubmit = async (data: CreatePostInput) => {
    try {
      await api.post("/posts", data);
      reset();
      fetchPosts();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      fetchPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Posts Management</h1>
        <p className="text-gray-500 mt-2">
          Create, read, update, and delete your posts here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Create New Post
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                {...register("title")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Post title..."
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                {...register("content")}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Write something awesome..."
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.content.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-70"
            >
              {isSubmitting ? (
                "Creating..."
              ) : (
                <>
                  <Plus size={18} /> Create Post
                </>
              )}
            </button>
          </form>
        </div>

        {/* Posts List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
              No posts found. Create one to get started!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start"
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mt-2">{post.content}</p>
                  <p className="text-xs text-gray-400 mt-4">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
