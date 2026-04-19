"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { AlertTriangle, TrendingDown, PieChart } from "lucide-react";

type AnalyticsData = {
  commissions: Record<string, Record<string, string>>; // Platform -> Month -> "15.00%"
  distributions: Record<
    string,
    { under50k: number; mid50kTo150k: number; over150k: number }
  >;
  vulnerabilities: Array<{
    id: string;
    type: string;
    explanation: string;
    createdAt: string;
    worker: {
      email: string;
      workerProfile: { cityZone: string; category: string };
    };
  }>;
};

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  // Transform commissions for LineChart
  const commissionChartData = useMemo(() => {
    const monthsSet = new Set<string>();
    Object.values(data.commissions).forEach((monthsObj) => {
      Object.keys(monthsObj).forEach((m) => monthsSet.add(m));
    });
    const sortedMonths = Array.from(monthsSet).sort();

    return sortedMonths.map((month) => {
      const point: Record<string, string | number> = { month };
      Object.keys(data.commissions).forEach((platform) => {
        const rateStr = data.commissions[platform][month];
        if (rateStr) {
          point[platform] = parseFloat(rateStr.replace("%", ""));
        }
      });
      return point;
    });
  }, [data.commissions]);

  // Transform distributions for BarChart
  const distributionChartData = useMemo(() => {
    return Object.entries(data.distributions).map(([city, dist]) => ({
      city,
      "< 50k": dist.under50k,
      "50k - 150k": dist.mid50kTo150k,
      "> 150k": dist.over150k,
    }));
  }, [data.distributions]);

  const platforms = Object.keys(data.commissions);
  const colors = ["#059669", "#2563eb", "#d97706", "#db2777", "#7c3aed"];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          System Analytics
        </h1>
        <p className="text-slate-500 mt-1">
          Aggregate view of platform fairness and worker distributions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission Rates Trends */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-emerald-600" />
                Commission Trends
              </h2>
              <p className="text-sm text-slate-500">
                Effective deduction rates by platform over time.
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={commissionChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [
                    `${value}%`,
                    "Commission Rate",
                  ]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                {platforms.map((platform, idx) => (
                  <Line
                    key={platform}
                    type="monotone"
                    dataKey={platform}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Income Distributions */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Income Distribution
              </h2>
              <p className="text-sm text-slate-500">
                Worker earnings brackets by city zone.
              </p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distributionChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="city"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Bar
                  dataKey="< 50k"
                  stackId="a"
                  fill="#ef4444"
                  radius={[0, 0, 4, 4]}
                />
                <Bar dataKey="50k - 150k" stackId="a" fill="#eab308" />
                <Bar
                  dataKey="> 150k"
                  stackId="a"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Vulnerability Flags */}
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              Active Vulnerability Flags
            </h2>
            <p className="text-sm text-slate-500">
              Sudden income drops and suspicious deductions requiring advocate
              intervention.
            </p>
          </div>
          <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-bold">
            {data.vulnerabilities.length} Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Worker
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Zone / Category
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Explanation
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.vulnerabilities.map((flag) => (
                <tr key={flag.id} className="hover:bg-slate-50 transition">
                  <td className="py-4 px-4 font-medium text-slate-900">
                    {flag.worker.email}
                  </td>
                  <td className="py-4 px-4 text-slate-600 text-sm">
                    {flag.worker.workerProfile.cityZone} &bull;{" "}
                    {flag.worker.workerProfile.category.replace("_", " ")}
                  </td>
                  <td className="py-4 px-4">
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">
                      {flag.type.replace("_", " ")}
                    </span>
                  </td>
                  <td
                    className="py-4 px-4 text-slate-600 text-sm max-w-md truncate"
                    title={flag.explanation}
                  >
                    {flag.explanation}
                  </td>
                  <td className="py-4 px-4 text-slate-500 text-sm text-right whitespace-nowrap">
                    {new Date(flag.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {data.vulnerabilities.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-slate-500 font-medium"
                  >
                    No active vulnerabilities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
