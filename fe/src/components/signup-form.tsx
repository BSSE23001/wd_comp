"use client";

import { useActionState, useState } from "react";
import { signupAction } from "@/app/actions/auth";
import { Loader2, AlertCircle, Briefcase, ShieldCheck } from "lucide-react";
import Link from "next/link";

const initialState = {
  error: undefined,
};

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);
  const [selectedRole, setSelectedRole] = useState("WORKER");

  return (
    <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Create an Account</h2>
        <p className="text-sm text-slate-500 mt-1">Join the FairGig platform</p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        
        {/* Role Selection Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedRole("WORKER")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition ${
              selectedRole === "WORKER" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Briefcase className="h-4 w-4" /> Worker
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole("VERIFIER")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition ${
              selectedRole === "VERIFIER" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Verifier
          </button>
        </div>
        <input type="hidden" name="role" value={selectedRole} />

        {state?.error && (
          <div className="flex items-start gap-2 p-3 bg-rose-50 text-rose-700 text-sm font-medium rounded-xl border border-rose-100">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{state.error}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition"
          />
        </div>

        {selectedRole === "WORKER" && (
          <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4 my-2">
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-semibold text-slate-700">Category</label>
              <select
                id="category"
                name="category"
                className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition"
              >
                <option value="RIDE_HAILING">Ride Hailing</option>
                <option value="FOOD_DELIVERY">Food Delivery</option>
                <option value="FREELANCE_DESIGNER">Freelance</option>
                <option value="DOMESTIC_WORKER">Domestic</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cityZone" className="text-sm font-semibold text-slate-700">City Zone</label>
              <input 
                id="cityZone" 
                name="cityZone" 
                type="text" 
                placeholder="e.g. Downtown" 
                required={selectedRole === "WORKER"} 
                className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Minimum 8 characters"
            required
            minLength={8}
            className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700">Confirm Password</label>
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="Confirm your password"
            required
            minLength={8}
            className="flex h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600 outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white shadow-md hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:opacity-50 transition"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
        </button>

        <div className="mt-4 text-center text-sm text-slate-500 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-800 transition">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}