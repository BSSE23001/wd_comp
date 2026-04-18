"use client";

import React, { useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Plus,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import type {
  CSVRow,
  ManualFormData,
  PlatformOption,
  ShiftLoggingModalProps,
  SuccessToastProps,
  TabMode,
} from "@/types/types";

import {
  calculateNetReceived,
  parseShiftCsv,
  PLATFORMS,
  SAMPLE_CSV,
  validateManualShiftForm,
} from "@/utils/LoggingModal";

import type { ManualFormErrors } from "../utils/LoggingModal";

function SuccessToast({ visible, onDismiss, onUploadClick }: SuccessToastProps) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-lg sm:bottom-6 sm:right-6">
      <div className="shrink-0">
        <CheckCircle2 className="h-6 w-6 text-emerald-600" aria-hidden="true" />
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-950">
            Shift logged successfully!
          </p>
          <p className="mt-1 text-sm text-emerald-900">
            Would you like to upload a screenshot now to verify these earnings?
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onUploadClick}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Upload Screenshot
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Later
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-emerald-400 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      >
        <span className="sr-only">Close</span>
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}

function ManualEntryForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: ManualFormData) => Promise<void>;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<ManualFormData>({
    platform: "",
    date: new Date().toISOString().split("T")[0],
    hoursWorked: "",
    grossEarned: "",
    platformDeductions: "",
  });

  const [errors, setErrors] = useState<ManualFormErrors>({});

  const netReceived = useMemo(() => {
    return calculateNetReceived(formData.grossEarned, formData.platformDeductions);
  }, [formData.grossEarned, formData.platformDeductions]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: ManualFormData) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ManualFormData]) {
      setErrors((prev: ManualFormErrors) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = validateManualShiftForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Platform Dropdown */}
      <div>
        <label
          htmlFor="platform"
          className="block text-sm font-semibold text-slate-900"
        >
          Platform <span className="text-red-600">*</span>
        </label>
        <select
          id="platform"
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          className="mt-2 block w-full min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        >
          <option value="">Select a platform</option>
          {PLATFORMS.map((platform: PlatformOption) => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>
        {errors.platform && (
          <p className="mt-1 text-sm text-red-600">{errors.platform}</p>
        )}
      </div>

      {/* Date Picker */}
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-semibold text-slate-900"
        >
          Date <span className="text-red-600">*</span>
        </label>
        <input
          id="date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="mt-2 block w-full min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
        )}
      </div>

      {/* Hours Worked */}
      <div>
        <label
          htmlFor="hoursWorked"
          className="block text-sm font-semibold text-slate-900"
        >
          Hours Worked <span className="text-red-600">*</span>
        </label>
        <input
          id="hoursWorked"
          type="number"
          name="hoursWorked"
          placeholder="e.g., 8"
          value={formData.hoursWorked}
          onChange={handleChange}
          step="0.5"
          min="0"
          className="mt-2 block w-full min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
        />
        {errors.hoursWorked && (
          <p className="mt-1 text-sm text-red-600">{errors.hoursWorked}</p>
        )}
      </div>

      {/* Gross Earned */}
      <div>
        <label
          htmlFor="grossEarned"
          className="block text-sm font-semibold text-slate-900"
        >
          Gross Earned (before fees) <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-600">
            $
          </span>
          <input
            id="grossEarned"
            type="number"
            name="grossEarned"
            placeholder="0.00"
            value={formData.grossEarned}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-2 block w-full min-h-12 rounded-xl border border-slate-300 bg-white pl-8 pr-4 py-3 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
        </div>
        {errors.grossEarned && (
          <p className="mt-1 text-sm text-red-600">{errors.grossEarned}</p>
        )}
      </div>

      {/* Platform Deductions */}
      <div>
        <label
          htmlFor="platformDeductions"
          className="block text-sm font-semibold text-slate-900"
        >
          Platform Deductions (fees/commissions){" "}
          <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-600">
            $
          </span>
          <input
            id="platformDeductions"
            type="number"
            name="platformDeductions"
            placeholder="0.00"
            value={formData.platformDeductions}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="mt-2 block w-full min-h-12 rounded-xl border border-slate-300 bg-white pl-8 pr-4 py-3 text-sm font-medium text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          />
        </div>
        {errors.platformDeductions && (
          <p className="mt-1 text-sm text-red-600">
            {errors.platformDeductions}
          </p>
        )}
      </div>

      {/* Net Received (Read-Only, Auto-Calculated) */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <label className="block text-sm font-semibold text-emerald-950">
          Net Received (auto-calculated)
        </label>
        <p className="mt-3 text-4xl font-extrabold text-emerald-700">
          ${netReceived.toFixed(2)}
        </p>
        <p className="mt-2 text-xs text-emerald-700">
          This is the amount you&apos;ll receive after platform deductions.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full min-h-14 rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        {isLoading ? "Logging Shift..." : "Log Shift"}
      </button>
    </form>
  );
}

function BulkImportForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (rows: CSVRow[]) => Promise<void>;
  isLoading: boolean;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [parseError, setParseError] = useState<string>("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setParseError("");

    const files = e.dataTransfer.files;
    if (files[0]) {
      processFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files?.[0]) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    try {
      const text = await file.text();
      const rows = parseShiftCsv(text);
      console.log("CSV data imported:", rows);
      setCsvData(rows);
      setPreviewMode(true);
      setParseError("");
    } catch (error) {
      setParseError(
        error instanceof Error ? error.message : "Failed to parse CSV"
      );
      setCsvData([]);
      setPreviewMode(false);
    }
  };

  const downloadSample = () => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(SAMPLE_CSV)
    );
    element.setAttribute("download", "fairgig-sample.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (previewMode) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">
            Preview: {csvData.length} shift(s) ready to log
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold text-slate-900">
                  Platform
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">
                  Date
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900">
                  Hours
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900">
                  Gross
                </th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900">
                  Deductions
                </th>
                <th className="px-4 py-3 text-right font-semibold text-emerald-700">
                  Net
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {csvData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.platform}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.date}</td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {row.hoursWorked}h
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    ${row.grossEarned.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    ${row.platformDeductions.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                    ${row.netReceived.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setPreviewMode(false);
              setCsvData([]);
            }}
            className="flex-1 min-h-14 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Choose Different File
          </button>
          <button
            type="button"
            onClick={() => onSubmit(csvData)}
            disabled={isLoading}
            className="flex-1 min-h-14 rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            {isLoading ? "Importing..." : "Import Shifts"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragActive
            ? "border-slate-900 bg-slate-50"
            : "border-slate-300 bg-white"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-slate-100 p-3">
            <Upload className="h-6 w-6 text-slate-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">
              Drop your CSV here
            </p>
            <p className="mt-1 text-sm text-slate-600">
              or{" "}
              <label className="cursor-pointer font-semibold text-slate-900 hover:underline">
                click to select
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleChange}
                  className="hidden"
                  aria-label="Upload CSV file"
                />
              </label>
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {parseError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-red-950">
              Error parsing CSV:
            </p>
            <p className="mt-1 text-sm text-red-900">{parseError}</p>
          </div>
        </div>
      )}

      {/* Sample CSV Download */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Need help formatting your CSV?
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Download our sample template to get started.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadSample}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 border border-slate-300 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sample CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShiftLoggingModal({
  isOpen,
  onClose,
}: ShiftLoggingModalProps) {
  const [mode, setMode] = useState<TabMode>("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleManualSubmit = async (data: ManualFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      const payload = {
        ...data,
        netReceived: (
          parseFloat(data.grossEarned) - parseFloat(data.platformDeductions)
        ).toFixed(2),
        timestamp: new Date().toISOString(),
      };
      console.log("Manual shift submission:", payload);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      handleSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkSubmit = async (rows: CSVRow[]) => {
    setIsLoading(true);
    try {
      const payload = {
        shifts: rows,
        count: rows.length,
        timestamp: new Date().toISOString(),
      };
      console.log("Bulk CSV submission:", payload);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      handleSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      onClose();
      setMode("manual");
      setShowSuccess(false);
    }, 3000);
  };

  const handleUploadProof = () => {
    console.log("User wants to upload proof screenshot");
    setShowSuccess(false);
    onClose();
    setMode("manual");
  };

  return (
    <>
      <Transition show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-40" onClose={onClose}>
          {/* Backdrop */}
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          </Transition.Child>

          {/* Modal Container - Full screen on mobile, side drawer on desktop */}
          <div className="fixed inset-0 flex items-end sm:items-center sm:justify-end">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full sm:translate-x-full sm:translate-y-0"
              enterTo="translate-y-0 sm:translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0 sm:translate-x-0"
              leaveTo="translate-y-full sm:translate-x-full sm:translate-y-0"
            >
              <Dialog.Panel className="w-full sm:max-w-md bg-white shadow-xl rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none h-screen sm:h-screen flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
                  <div>
                    <Dialog.Title className="text-2xl font-bold text-slate-950">
                      Log a Shift
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-slate-600">
                      Track your earnings across platforms.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                  >
                    <span className="sr-only">Close modal</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-slate-200 px-5 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={() => setMode("manual")}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      mode === "manual"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Plus className="inline h-4 w-4 mr-2" aria-hidden="true" />
                    Manual Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("bulk")}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      mode === "bulk"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <Upload className="inline h-4 w-4 mr-2" aria-hidden="true" />
                    Bulk Import
                  </button>
                </div>

                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <div className="px-5 py-6 sm:px-6">
                    {mode === "manual" ? (
                      <ManualEntryForm
                        onSubmit={handleManualSubmit}
                        isLoading={isLoading}
                      />
                    ) : (
                      <BulkImportForm
                        onSubmit={handleBulkSubmit}
                        isLoading={isLoading}
                      />
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Success Toast */}
      <SuccessToast
        visible={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        onUploadClick={handleUploadProof}
      />
    </>
  );
}





