"use client";

import { useState } from "react";
import { X, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export type VerificationRecord = {
  id: string;
  workerName: string;
  platform: string;
  amount: number;
  date: string;
  screenshotUrl: string;
  status: "PENDING" | "VERIFIED" | "DISCREPANCY" | "UNVERIFIABLE";
  comment?: string;
};

type ReviewModalProps = {
  record: VerificationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, status: VerificationRecord["status"], comment: string) => void;
};

export default function ReviewModal({ record, isOpen, onClose, onSave }: ReviewModalProps) {
  const [comment, setComment] = useState("");

  if (!isOpen || !record) return null;

  const handleAction = (status: VerificationRecord["status"]) => {
    onSave(record.id, status, comment);
    setComment(""); // Reset for next time
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
        
        {/* Left Side: Screenshot Viewer */}
        <div className="flex flex-1 items-center justify-center bg-slate-100 p-6">
          {/* Using a placeholder for the receipt image */}
          <img
            src={record.screenshotUrl}
            alt="Earnings Screenshot"
            className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-sm md:max-h-[80vh]"
          />
        </div>

        {/* Right Side: Details & Actions */}
        <div className="flex w-full flex-col p-6 md:w-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Review Record</h2>
            <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4 rounded-xl border p-4 bg-slate-50 text-sm">
              <div>
                <p className="text-slate-500 font-medium">Worker</p>
                <p className="font-semibold text-slate-900">{record.workerName}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Platform</p>
                <p className="font-semibold text-slate-900">{record.platform}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Date</p>
                <p className="font-semibold text-slate-900">{record.date}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Claimed Amount</p>
                <p className="font-bold text-emerald-600">${record.amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="verifier-comment" className="text-sm font-medium text-slate-700">
                Verifier Notes / Discrepancy Details
              </label>
              <textarea
                id="verifier-comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment about anomalies or approvals..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => handleAction("VERIFIED")}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              <CheckCircle className="h-5 w-5" /> Approve & Verify
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAction("DISCREPANCY")}
                className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-semibold text-white transition-colors hover:bg-amber-600 text-sm"
              >
                <AlertTriangle className="h-4 w-4" /> Flag Anomaly
              </button>
              <button
                onClick={() => handleAction("UNVERIFIABLE")}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 font-semibold text-white transition-colors hover:bg-rose-700 text-sm"
              >
                <XCircle className="h-4 w-4" /> Dispute
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}