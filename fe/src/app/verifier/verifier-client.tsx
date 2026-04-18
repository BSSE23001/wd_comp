"use client";

import { useState } from "react";
import { ShieldCheck, Search, Filter } from "lucide-react";
import ReviewModal, { VerificationRecord } from "@/app/verifier/review-modal";

// MOCK DATA: Replace with real API fetch later
const initialRecords: VerificationRecord[] = [
  { id: "1", workerName: "Ali Raza", platform: "Uber", amount: 45.50, date: "2026-04-18", screenshotUrl: "https://placehold.co/600x800/png?text=Uber+Receipt", status: "PENDING" },
  { id: "2", workerName: "Sara Khan", platform: "Foodpanda", amount: 22.00, date: "2026-04-18", screenshotUrl: "https://placehold.co/600x800/png?text=Foodpanda+Receipt", status: "PENDING" },
  { id: "3", workerName: "Ahmed", platform: "Uber", amount: 120.00, date: "2026-04-17", screenshotUrl: "https://placehold.co/600x800/png?text=Uber+Receipt", status: "VERIFIED", comment: "Looks good." },
];

export default function VerifierClient({ user }: { user: any }) {
  const [records, setRecords] = useState<VerificationRecord[]>(initialRecords);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"PENDING" | "REVIEWED">("PENDING");

  const displayName = user.first_name || user.email.split("@")[0];

  // Logic to update the status when the modal saves
  const handleSaveReview = (id: string, newStatus: VerificationRecord["status"], comment: string) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, status: newStatus, comment } : rec
      )
    );
  };

  const filteredRecords = records.filter(rec => 
    activeTab === "PENDING" ? rec.status === "PENDING" : rec.status !== "PENDING"
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="mx-auto max-w-6xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Verifier Desk</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Logged in as {displayName}
            </p>
          </div>
          <div className="bg-slate-100 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
            <p className="text-2xl font-bold text-slate-900">
              {records.filter(r => r.status === "PENDING").length}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 mt-8">
        
        {/* Toolbar & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex bg-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "PENDING" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Pending Inbox
            </button>
            <button
              onClick={() => setActiveTab("REVIEWED")}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "REVIEWED" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Reviewed History
            </button>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search worker or platform..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Data List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No records found in this category.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Worker</th>
                  <th className="px-6 py-4 font-medium">Platform</th>
                  <th className="px-6 py-4 font-medium">Claimed Amount</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{record.workerName}</td>
                    <td className="px-6 py-4 text-slate-600">{record.platform}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">${record.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-600">{record.date}</td>
                    <td className="px-6 py-4">
                      {record.status === "PENDING" && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Pending</span>}
                      {record.status === "VERIFIED" && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Verified</span>}
                      {record.status === "DISCREPANCY" && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Anomaly</span>}
                      {record.status === "UNVERIFIABLE" && <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">Disputed</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedRecord(record)}
                        className="text-sm font-semibold text-slate-900 hover:text-slate-600"
                      >
                        {record.status === "PENDING" ? "Review" : "View Details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Injecting the Review Modal Component */}
      <ReviewModal 
        isOpen={!!selectedRecord} 
        record={selectedRecord} 
        onClose={() => setSelectedRecord(null)}
        onSave={handleSaveReview}
      />
    </main>
  );
}