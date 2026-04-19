"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions/auth";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-1">Sign in to your FairGig account</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl border border-rose-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
        <input 
          id="email"
          type="email" 
          name="email" 
          placeholder="name@example.com"
          required 
          className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
        <input 
          id="password"
          type="password" 
          name="password" 
          placeholder="••••••••"
          required 
          className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition"
        />
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-50 transition"
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
      </button>

      <div className="mt-4 text-center text-sm text-slate-500 font-medium">
        Don't have an account?{" "}
        <Link href="/signup" className="text-blue-600 hover:text-blue-800 transition">
          Sign up
        </Link>
      </div>
    </form>
  );
}