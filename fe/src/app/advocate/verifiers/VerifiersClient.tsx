"use client";

import { useState } from "react";
import { updateVerifierStatus } from "@/app/actions/advocate";
import { CheckCircle2, XCircle, Clock, ShieldCheck, Loader2 } from "lucide-react";

type Verifier = {
  id: string;
  email: string;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export default function VerifiersClient({ initialVerifiers }: { initialVerifiers: Verifier[] }) {
  const [verifiers, setVerifiers] = useState<Verifier[]>(initialVerifiers);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: "APPROVED" | "REJECTED") => {
    setProcessingId(id);
    const res = await updateVerifierStatus(id, status);
    
    if (res.success) {
      setVerifiers(prev => prev.map(v => v.id === id ? { ...v, approvalStatus: status } : v));
    } else {
      alert(res.error || "Failed to update status");
    }
    
    setProcessingId(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-emerald-600" />
          Verifier Management
        </h1>
        <p className="text-slate-500 mt-2">Approve or reject verifier registrations to maintain platform trust.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {verifiers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No verifiers registered yet.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Email</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Registered</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {verifiers.map((verifier) => (
                <tr key={verifier.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{verifier.email}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(verifier.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      verifier.approvalStatus === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                      verifier.approvalStatus === "REJECTED" ? "bg-rose-100 text-rose-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {verifier.approvalStatus === "APPROVED" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {verifier.approvalStatus === "REJECTED" && <XCircle className="h-3.5 w-3.5" />}
                      {verifier.approvalStatus === "PENDING" && <Clock className="h-3.5 w-3.5" />}
                      {verifier.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {verifier.approvalStatus === "PENDING" && (
                      <>
                        <button 
                          disabled={processingId === verifier.id}
                          onClick={() => handleStatusChange(verifier.id, "APPROVED")}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          {processingId === verifier.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                        </button>
                        <button 
                          disabled={processingId === verifier.id}
                          onClick={() => handleStatusChange(verifier.id, "REJECTED")}
                          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {verifier.approvalStatus === "APPROVED" && (
                      <button 
                        disabled={processingId === verifier.id}
                        onClick={() => handleStatusChange(verifier.id, "REJECTED")}
                        className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50 transition disabled:opacity-50"
                      >
                        {processingId === verifier.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Revoke"}
                      </button>
                    )}
                    {verifier.approvalStatus === "REJECTED" && (
                      <button 
                        disabled={processingId === verifier.id}
                        onClick={() => handleStatusChange(verifier.id, "APPROVED")}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition disabled:opacity-50"
                      >
                        {processingId === verifier.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-Approve"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
