// app/home/dashboard-client.tsx
"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Camera,
  CheckCircle2,
  ChevronUp,
  CircleDollarSign,
  FileText,
  Plus,
  ShieldCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ShiftLoggingModal from "@/components/ShiftLoggingModal";

import {
  PlatformFilter,
  platformOptions,
  weeklyIncome,
  ledger,
  statusStyles,
  verifiedEarnings,
  pendingReview,
  hourlyRate,
} from "@/utils/placeholder-data";

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function currencyPrecise(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// 1. Define the User type based on your API response
type User = {
  id: string;
  email: string;
  role: string;
  first_name?: string; 
  last_name?: string;
};

// 2. Accept the user object as a prop
export default function DashboardClient({ user }: { user: User }) {
  const [platform, setPlatform] = useState<PlatformFilter>("All Platforms");
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const chartData = useMemo(() => {
    return weeklyIncome.map((row) => ({
      day: row.day,
      value:
        platform === "All Platforms"
          ? row.Uber + row.Foodpanda
          : row[platform],
    }));
  }, [platform]);

  // 3. Dynamically calculate the display name and initial
  // Fallback to the first part of the email if first_name isn't provided by the login API yet
  const rawName = user.first_name || user.email.split('@')[0];
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header
          className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6"
          aria-label="User overview"
        >
          <div>
            <p className="text-sm font-medium text-slate-500">Welcome back</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {/* Inject the dynamic name here */}
              Welcome back, {displayName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                {/* Inject the dynamic initial here */}
                {userInitial}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-white">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="sr-only">Verified account badge</span>
            </div>
            <div className="hidden sm:block">
              {/* Dynamically show their role */}
              <p className="text-sm font-semibold text-slate-900 capitalize">{user.role.toLowerCase()} profile</p>
              <p className="flex items-center gap-1 text-sm text-emerald-700">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Worker trust badge active
              </p>
            </div>
          </div>
        </header>

        {/* --- The rest of your sections remain EXACTLY the same --- */}
        <section aria-label="Hero metrics">
          <div className="grid grid-flow-col auto-cols-[minmax(16rem,1fr)] gap-4 overflow-x-auto pb-1 sm:auto-cols-auto sm:grid-cols-3 sm:overflow-visible">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">Verified Earnings (This Month)</p>
                <CircleDollarSign className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              </div>
              <p className="mt-4 text-4xl font-extrabold tracking-tight text-emerald-700 sm:text-5xl">
                {currency(verifiedEarnings)}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Bankable income approved for records and certificates.</p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">Pending Review</p>
                <ChevronUp className="h-5 w-5 rotate-90 text-amber-500" aria-hidden="true" />
              </div>
              <p className="mt-4 text-4xl font-extrabold tracking-tight text-amber-600 sm:text-5xl">
                {currency(pendingReview)}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Income currently under verification.</p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">Effective Hourly Rate</p>
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  +5% from last week
                </div>
              </div>
              <p className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                {currencyPrecise(hourlyRate)}/hr
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">A simple average that stays easy to read on mobile.</p>
            </article>
          </div>
        </section>

        <section aria-label="Quick actions" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Quick Actions</h2>
              <p className="text-sm text-slate-600">Large buttons designed for easy tapping outdoors.</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setIsShiftModalOpen(true)}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-4 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              Log New Shift
            </button>

            <button
              type="button"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <Camera className="h-5 w-5" aria-hidden="true" />
              Upload Proof
            </button>

            <button
              type="button"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
              Get Certificate
            </button>
          </div>
        </section>

        <section aria-label="Income analytics" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Income Analytics</h2>
              <p className="text-sm text-slate-600">Daily net income over the last 7 days.</p>
            </div>

            <label htmlFor="platform-filter" className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Filter by platform
              <select
                id="platform-filter"
                value={platform}
                onChange={(event) => setPlatform(event.target.value as PlatformFilter)}
                className="min-h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                aria-label="Filter income chart by platform"
              >
                {platformOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 h-72 w-full rounded-2xl bg-slate-50 p-3 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 0, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#dbe4ee" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#475569", fontSize: 12 }}
                  width={40}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
                  }}
                  formatter={(value) => [`$${value}`, "Net income"]}
                />
                <Bar dataKey="value" fill="#059669" radius={[12, 12, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6" aria-label="Community pulse alert">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 text-amber-900">
              <span className="text-lg font-black" aria-hidden="true">!</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-amber-950">Community Pulse</h2>
              <p className="mt-1 text-sm leading-6 text-amber-950">
                ⚠️ Alert: 15 workers in your area reported a 2% commission drop on Platform X today.
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Recent activity" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Recent Activity</h2>
              <p className="text-sm text-slate-600">Your latest logged shifts and their verification status.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {ledger.map((row) => (
              <article
                key={`${row.date}-${row.platform}-${row.amount}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-950">{row.date}</p>
                  <p className="text-sm text-slate-600">{row.platform}</p>
                </div>

                <div className="text-right">
                  <p className="text-base font-bold text-slate-950">{row.amount}</p>
                  <span
                    className={`mt-1 inline-flex min-h-8 items-center rounded-full px-3 text-xs font-semibold ${statusStyles[row.status]}`}
                  >
                    {row.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <ShiftLoggingModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
      />
    </main>
  );
}