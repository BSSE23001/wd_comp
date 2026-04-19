"use client";

import { useState } from "react";
import { X, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { verifyLogAction } from "@/app/actions/earnings";

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

type ReviewModalProps = {
  record: VerificationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  // onSave is now optional since the modal handles the API call
  onSave?: (id: string, status: VerificationRecord["status"], verifierNotes: string) => void;
};

export default function ReviewModal({ record, isOpen, onClose, onSave }: ReviewModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<VerificationRecord["status"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const handleAction = async (status: VerificationRecord["status"]) => {
    setIsSubmitting(status);
    setError(null);

    const result = await verifyLogAction(record.id, status, notes);

    if (result.success) {
      if (onSave) onSave(record.id, status, notes);
      setNotes("");
      setIsSubmitting(null);
      onClose();
    } else {
      setError(result.error || "Failed to update");
      setIsSubmitting(null);
    }
  };

  const formattedDate = new Date(record.date).toLocaleDateString('en-GB');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Review shift log">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:flex-row">
        
        {/* Left Side: Screenshot Viewer */}
        <div className="flex flex-1 items-center justify-center bg-slate-200 p-4 md:p-8">
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-white shadow-inner flex items-center justify-center">
            {record.screenshotUrl ? (
              <img src={record.screenshotUrl} alt="Proof" className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="text-center p-10">
                <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-medium">No screenshot provided</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="flex w-full flex-col border-l border-slate-100 p-8 md:w-[420px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Review Shift</h2>
            <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close review modal">
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-y-4 rounded-2xl border border-slate-200 p-5 bg-slate-50/50 text-sm">
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Worker Email</p>
                <p className="font-semibold text-slate-900 truncate">{record.worker.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Platform</p>
                <p className="font-semibold text-slate-900">{record.platform.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date</p>
                <p className="font-semibold text-slate-900">{formattedDate}</p>
              </div>
              <div className="col-span-2 pt-2 border-t mt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Net Amount</p>
                <p className="text-2xl font-black text-emerald-700">${record.netReceived.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="review-notes" className="text-sm font-semibold text-slate-700">Review Notes</label>
              <textarea
                id="review-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about discrepancies or approval reasons..."
                className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600 border border-red-100">
                {error}
              </div>
            )}
          </div>

          {/* Action Buttons with Loading States */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => handleAction("VERIFIED")}
              disabled={!!isSubmitting || record.status === "UNVERIFIABLE" || record.status === "DISCREPANCY"}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={record.status === "UNVERIFIABLE" || record.status === "DISCREPANCY" ? "Cannot approve flagged/disputed logs" : ""}
            >
              {isSubmitting === "VERIFIED" ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
              Approve & Verify
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAction("DISCREPANCY")}
                disabled={!!isSubmitting}
                className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
              >
                {isSubmitting === "DISCREPANCY" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
                Flag Anomaly
              </button>
              <button
                onClick={() => handleAction("UNVERIFIABLE")}
                disabled={!!isSubmitting}
                className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
              >
                {isSubmitting === "UNVERIFIABLE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Dispute
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}