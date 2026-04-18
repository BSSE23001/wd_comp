"use client";

import { useState } from "react";
import { ShieldCheck, Search, Filter } from "lucide-react";
import ReviewModal from "@/app/verifier/review-modal";

// Update the type to match your API response exactly
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

export default function VerifierClient({ user, initialQueue }: { user: any; initialQueue: VerificationRecord[] }) {
  // Use the fetched queue as the initial state
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
  };

  const filteredRecords = records.filter(rec => 
    activeTab === "PENDING" ? rec.status === "PENDING" : rec.status !== "PENDING"
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-10">
      <header className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="mx-auto max-w-6xl flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Verifier Desk</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Logged in as {displayName}
            </p>
          </div>
          <div className="bg-slate-100 rounded-lg p-3 text-center min-w-[120px]">
            <p className="text-sm font-medium text-slate-500">Pending Reviews</p>
            <p className="text-2xl font-bold text-slate-900">
              {records.filter(r => r.status === "PENDING").length}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 mt-8">
        {/* Tabs & Search UI remains the same... */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex bg-slate-200/50 p-1 rounded-xl">
            <button onClick={() => setActiveTab("PENDING")} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "PENDING" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              Pending Inbox
            </button>
            <button onClick={() => setActiveTab("REVIEWED")} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "REVIEWED" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              Reviewed History
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No records found.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Worker</th>
                  <th className="px-6 py-4 font-medium">Platform</th>
                  <th className="px-6 py-4 font-medium">Net Amount</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {record.worker.email}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {record.platform.name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ${record.netReceived.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(record.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium 
                        ${record.status === "PENDING" ? "bg-slate-100 text-slate-700" : 
                          record.status === "VERIFIED" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedRecord(record)} className="text-sm font-semibold text-slate-900 hover:underline">
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

      <ReviewModal 
        isOpen={!!selectedRecord} 
        record={selectedRecord} 
        onClose={() => setSelectedRecord(null)}
        onSave={handleSaveReview}
      />
    </main>
  );
}