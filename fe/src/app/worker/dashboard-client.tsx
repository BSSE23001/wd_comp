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

// --- Types ---

type User = {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
};

type ShiftLog = {
  id: string;
  date: string;
  platform: { name: string };
  netReceived: number;
  hoursWorked: number;
  status: "VERIFIED" | "PENDING" | "REJECTED";
};

interface DashboardClientProps {
  user: User;
  initialLogs: ShiftLog[];
}

// --- Helpers ---

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencyPrecise(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const statusStyles: Record<string, string> = {
  VERIFIED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-100",
  REJECTED: "bg-red-50 text-red-700 border border-red-100",
};

export default function DashboardClient({ user, initialLogs }: DashboardClientProps) {
  const [platformFilter, setPlatformFilter] = useState("All Platforms");
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // --- Dynamic Calculations ---

  // 1. Total Net Revenue (All logs regardless of status)
  const totalNetRevenue = useMemo(() => {
    return initialLogs.reduce((sum, log) => sum + Number(log.netReceived), 0);
  }, [initialLogs]);

  // 2. Verified Earnings (Current logs with VERIFIED status)
  const verifiedEarnings = useMemo(() => {
    return initialLogs
      .filter((log) => log.status === "VERIFIED")
      .reduce((sum, log) => sum + Number(log.netReceived), 0);
  }, [initialLogs]);

  // 3. Pending Review (Current logs with PENDING status)
  const pendingReview = useMemo(() => {
    return initialLogs
      .filter((log) => log.status === "PENDING")
      .reduce((sum, log) => sum + Number(log.netReceived), 0);
  }, [initialLogs]);

  // 4. Effective Hourly Rate (Total Net / Total Hours)
  const hourlyRate = useMemo(() => {
    const totalHours = initialLogs.reduce((sum, log) => sum + (Number(log.hoursWorked) || 0), 0);
    const totalNet = initialLogs.reduce((sum, log) => sum + Number(log.netReceived), 0);
    return totalHours > 0 ? totalNet / totalHours : 0;
  }, [initialLogs]);

  // 4. Chart Data (Group last 7 logs by weekday)
  const chartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    const last7Logs = initialLogs.slice(0, 10); // Take a sample to build the 7-day view

    last7Logs.forEach((log) => {
      const day = new Date(log.date).toLocaleDateString("en-US", { weekday: "short" });
      if (platformFilter === "All Platforms" || log.platform.name === platformFilter) {
        dailyMap[day] = (dailyMap[day] || 0) + Number(log.netReceived);
      }
    });

    return Object.entries(dailyMap).map(([day, value]) => ({ day, value }));
  }, [initialLogs, platformFilter]);

  // 5. Extract unique platform names for the filter dropdown
  const platformOptions = useMemo(() => {
    const names = Array.from(new Set(initialLogs.map((log) => log.platform.name)));
    return ["All Platforms", ...names];
  }, [initialLogs]);

  const rawName = user.first_name || user.email.split("@")[0];
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
              Welcome back, {displayName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white">
                {userInitial}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-white">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 capitalize">
                {user.role.toLowerCase()} profile
              </p>
              <p className="flex items-center gap-1 text-sm text-emerald-700">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Worker trust badge active
              </p>
            </div>
          </div>
        </header>

        <section aria-label="Hero metrics">
          <div className="grid grid-flow-col auto-cols-[minmax(16rem,1fr)] gap-4 overflow-x-auto pb-1 sm:auto-cols-auto sm:grid-cols-4 sm:overflow-visible">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">Total Net Revenue</p>
                <CircleDollarSign className="h-5 w-5 text-blue-600" aria-hidden="true" />
              </div>
              <p className="mt-4 text-4xl font-extrabold tracking-tight text-blue-700 sm:text-5xl">
                {formatCurrency(totalNetRevenue)}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Combined revenue across all logged shifts.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">Verified Earnings</p>
                <CircleDollarSign className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              </div>
              <p className="mt-4 text-4xl font-extrabold tracking-tight text-emerald-700 sm:text-5xl">
                {formatCurrency(verifiedEarnings)}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Bankable income approved for records and certificates.
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">Pending Review</p>
                <ChevronUp className="h-5 w-5 rotate-90 text-amber-500" aria-hidden="true" />
              </div>
              <p className="mt-4 text-4xl font-extrabold tracking-tight text-amber-600 sm:text-5xl">
                {formatCurrency(pendingReview)}
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
                {formatCurrencyPrecise(hourlyRate)}/hr
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Calculated across all logged hours.</p>
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
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-slate-900 px-4 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
              Log New Shift
            </button>

            <button
              type="button"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <Camera className="h-5 w-5" aria-hidden="true" />
              Upload Proof
            </button>

            <button
              type="button"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
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
              <p className="text-sm text-slate-600">Daily net income trend.</p>
            </div>

            <label htmlFor="platform-filter" className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Filter by platform
              <select
                id="platform-filter"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="min-h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
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

        <section aria-label="Recent activity" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Recent Activity</h2>
              <p className="text-sm text-slate-600">Your latest logged shifts and their verification status.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {initialLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm font-medium text-slate-400">No shifts logged yet.</p>
              </div>
            ) : (
              initialLogs.map((log) => (
                <article
                  key={log.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {new Date(log.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-slate-600">{log.platform.name}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-bold text-slate-950">{formatCurrencyPrecise(log.netReceived)}</p>
                    <span
                      className={`mt-1 inline-flex min-h-7 items-center rounded-full px-3 text-[10px] font-bold tracking-wide uppercase border ${
                        statusStyles[log.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <ShiftLoggingModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} />
    </main>
  );
}