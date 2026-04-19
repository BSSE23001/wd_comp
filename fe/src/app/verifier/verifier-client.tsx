"use client";

import { useState } from "react";
import { ShieldCheck, CheckCircle2, Clock, Eye } from "lucide-react";
import ReviewModal from "@/app/verifier/review-modal";
import { toast } from "sonner";

export type VerificationRecord = {
  id: string;
  worker: { email: string };
  platform: { name: string };
  netReceived: number;
  date: string;
  screenshotUrl: string;
  status: "PENDING" | "VERIFIED" | "DISCREPANCY" | "UNVERIFIABLE";
  verifierNotes?: string | null;
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DISCREPANCY: "bg-rose-50 text-rose-700 border-rose-200",
  UNVERIFIABLE: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function VerifierClient({ user, initialQueue }: { user: any; initialQueue: VerificationRecord[] }) {
  const [records, setRecords] = useState<VerificationRecord[]>(initialQueue);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"PENDING" | "REVIEWED">("PENDING");

  const displayName = user.first_name || user.email.split("@")[0];

  const handleSaveReview = (id: string, newStatus: VerificationRecord["status"], comment: string) => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === id ? { ...rec, status: newStatus, verifierNotes: comment } : rec
      )
    );
    toast.success(`Log marked as ${newStatus}`);
  };

  const pendingCount = records.filter(r => r.status === "PENDING").length;
  const reviewedCount = records.filter(r => r.status !== "PENDING").length;

  const filteredRecords = records.filter(rec => 
    activeTab === "PENDING" ? rec.status === "PENDING" : rec.status !== "PENDING"
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans selection:bg-emerald-200">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-6 sm:px-6 sm:py-8 lg:px-8" aria-label="Verifier overview">
        <div className="mx-auto max-w-7xl flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Verifier Desk</h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Peer Reviewer: <span className="text-slate-700 font-semibold">{displayName}</span>
              </p>
            </div>
          </div>
          
          {/* Stat cards — always side by side, compact on mobile */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:max-w-sm">
            <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" /> Pending
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {pendingCount}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-3 sm:p-4 border border-emerald-100 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" /> Reviewed
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700">
                {reviewedCount}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        
        {/* Tabs */}
        <div className="flex bg-slate-200/50 p-1 sm:p-1.5 rounded-2xl w-full sm:w-fit mb-6 shadow-inner" role="tablist" aria-label="Filter by review status">
          <button 
            role="tab"
            aria-selected={activeTab === "PENDING"}
            onClick={() => setActiveTab("PENDING")} 
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "PENDING" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button 
            role="tab"
            aria-selected={activeTab === "REVIEWED"}
            onClick={() => setActiveTab("REVIEWED")} 
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "REVIEWED" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            History ({reviewedCount})
          </button>
        </div>

        {/* Records */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-12 sm:p-16 text-center">
              <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
                <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Queue is empty</h3>
              <p className="text-sm text-slate-500 mt-1">There are no logs to review right now.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table — hidden on small screens */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm" role="table">
                  <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-xs font-bold">
                    <tr>
                      <th scope="col" className="px-6 py-4">Worker</th>
                      <th scope="col" className="px-6 py-4">Platform</th>
                      <th scope="col" className="px-6 py-4">Net Amount</th>
                      <th scope="col" className="px-6 py-4">Date</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 max-w-[200px] truncate">
                          {record.worker.email}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {record.platform.name}
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-700">
                          ${Number(record.netReceived).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles[record.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedRecord(record)} 
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
                            aria-label={`Review log from ${record.worker.email}`}
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            {record.status === "PENDING" ? "Review" : "View"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards — visible only on small screens */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <div key={record.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{record.worker.email}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {record.platform.name} &bull; {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles[record.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {record.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-black text-emerald-700">
                        ${Number(record.netReceived).toFixed(2)}
                      </p>
                      <button 
                        onClick={() => setSelectedRecord(record)} 
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
                        aria-label={`Review log from ${record.worker.email}`}
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        {record.status === "PENDING" ? "Review" : "View"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ReviewModal 
        isOpen={!!selectedRecord} 
        record={selectedRecord} 
        onClose={() => setSelectedRecord(null)}
        onSave={handleSaveReview}
      />
    </main>
  );
}