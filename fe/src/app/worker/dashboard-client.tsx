"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronUp,
  CircleDollarSign,
  FileText,
  Plus,
  ShieldCheck,
  Loader2,
  Activity,
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
import { toast } from "sonner";
import { generateCertificateAction } from "@/app/actions/certificate";
import { checkAnomaliesAction } from "@/app/actions/anomaly";

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
  // Safety: guarantee we work with an array
  const safeLogs = Array.isArray(initialLogs) ? initialLogs : [];

  const [platformFilter, setPlatformFilter] = useState("All Platforms");
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Certificate: fetch PDF as base64 from server, decode on client, trigger download ---
  const handleGenerateCertificate = async () => {
    setIsGeneratingCert(true);
    toast.loading("Generating your income certificate...", { id: "cert" });

    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      const startDate = start.toISOString().split("T")[0];
      const endDate = end.toISOString().split("T")[0];

      const result = await generateCertificateAction(user.id, startDate, endDate);

      if (result.success && result.data) {
        // Decode base64 → binary → Blob → download
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `FairGig_Certificate_${startDate}_to_${endDate}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);

        toast.success("Certificate downloaded!", { id: "cert" });
      } else {
        toast.error(result.error || "Failed to generate certificate.", { id: "cert" });
      }
    } catch (error) {
      console.error("Certificate handler error:", error);
      toast.error("An unexpected error occurred.", { id: "cert" });
    } finally {
      setIsGeneratingCert(false);
    }
  };

  // --- Anomaly Detection ---
  const handleCheckAnomalies = async () => {
    setIsAnalyzing(true);
    toast.loading("Analyzing your earnings data...", { id: "anomaly" });

    try {
      const result = await checkAnomaliesAction(user.id);

      if (result.success) {
        if (result.data?.hasAnomaly) {
          toast.warning(`Anomaly Detected: ${result.data.explanation}`, { id: "anomaly", duration: 8000 });
        } else {
          toast.success(result.data?.explanation || "Your earnings look consistent. No anomalies found.", { id: "anomaly" });
        }
      } else {
        toast.error(result.error || "Failed to analyze data.", { id: "anomaly" });
      }
    } catch (error) {
      console.error("Anomaly handler error:", error);
      toast.error("An unexpected error occurred.", { id: "anomaly" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Dynamic Calculations ---

  const totalNetRevenue = useMemo(() => {
    return safeLogs.reduce((sum, log) => sum + Number(log.netReceived), 0);
  }, [safeLogs]);

  const verifiedEarnings = useMemo(() => {
    return safeLogs
      .filter((log) => log.status === "VERIFIED")
      .reduce((sum, log) => sum + Number(log.netReceived), 0);
  }, [safeLogs]);

  const pendingReview = useMemo(() => {
    return safeLogs
      .filter((log) => log.status === "PENDING")
      .reduce((sum, log) => sum + Number(log.netReceived), 0);
  }, [safeLogs]);

  const hourlyRate = useMemo(() => {
    const totalHours = safeLogs.reduce((sum, log) => sum + (Number(log.hoursWorked) || 0), 0);
    const totalNet = safeLogs.reduce((sum, log) => sum + Number(log.netReceived), 0);
    return totalHours > 0 ? totalNet / totalHours : 0;
  }, [safeLogs]);

  const chartData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    const last7Logs = safeLogs.slice(0, 10);

    last7Logs.forEach((log) => {
      const day = new Date(log.date).toLocaleDateString("en-US", { weekday: "short" });
      if (platformFilter === "All Platforms" || log.platform.name === platformFilter) {
        dailyMap[day] = (dailyMap[day] || 0) + Number(log.netReceived);
      }
    });

    return Object.entries(dailyMap).map(([day, value]) => ({ day, value }));
  }, [safeLogs, platformFilter]);

  const platformOptions = useMemo(() => {
    const names = Array.from(new Set(safeLogs.map((log) => log.platform.name)));
    return ["All Platforms", ...names];
  }, [safeLogs]);

  const rawName = user.first_name || user.email.split("@")[0];
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">

        {/* Header */}
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

        {/* Hero Metrics */}
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

        {/* Quick Actions */}
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
              onClick={handleCheckAnomalies}
              disabled={isAnalyzing}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-base font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <Loader2 className="h-5 w-5 animate-spin text-amber-700" aria-hidden="true" />
              ) : (
                <Activity className="h-5 w-5 text-amber-700" aria-hidden="true" />
              )}
              {isAnalyzing ? "Analyzing..." : "Check Anomalies"}
            </button>

            <button
              type="button"
              onClick={handleGenerateCertificate}
              disabled={isGeneratingCert}
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingCert ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-500" aria-hidden="true" />
              ) : (
                <FileText className="h-5 w-5" aria-hidden="true" />
              )}
              {isGeneratingCert ? "Generating..." : "Get Certificate"}
            </button>
          </div>
        </section>

        {/* Income Analytics */}
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

        {/* Recent Activity */}
        <section aria-label="Recent activity" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Recent Activity</h2>
              <p className="text-sm text-slate-600">Your latest logged shifts and their verification status.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {safeLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm font-medium text-slate-400">No shifts logged yet.</p>
              </div>
            ) : (
              safeLogs.map((log) => (
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