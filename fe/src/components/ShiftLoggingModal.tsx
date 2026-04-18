"use client";

import { useActionState, useEffect, useState } from "react";
import { X, Loader2, Camera } from "lucide-react";
import { logShiftAction, getPlatformsAction } from "@/app/actions/earnings";

type Platform = {
  id: string;
  name: string;
};

export default function ShiftLoggingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
const [state, formAction, isPending] = useActionState(logShiftAction, { 
  error: undefined, 
  success: false, 
  data: null // Add this line
});  
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);

  // Fetch platforms only when the modal opens
  useEffect(() => {
    if (isOpen) {
      const loadPlatforms = async () => {
        setIsLoadingPlatforms(true);
        try {
          const data = await getPlatformsAction();
          
          // Debugging log to see what the server action returned
          console.log("Fetched platforms from server action:", data);
          
          setPlatforms(data);
        } catch (error) {
          console.error("Error in loadPlatforms:", error);
        } finally {
          setIsLoadingPlatforms(false);
        }
      };
      loadPlatforms();
    }
  }, [isOpen]);

  // Log whenever the platforms state changes
  useEffect(() => {
    console.log("Current platforms state:", platforms);
  }, [platforms]);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state?.success, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">Log New Shift</h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form action={formAction} className="flex flex-col gap-5 p-6 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Platform Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="platformId" className="text-sm font-semibold text-slate-700">Platform</label>
              <div className="relative">
                <select 
  id="platformId" 
  name="platformId" // This matches the key in logEarnings req.body
  required 
  disabled={isLoadingPlatforms}
  className="..."
>
  <option value="">{isLoadingPlatforms ? "Loading..." : "Select Platform"}</option>
  {platforms.map((p) => (
    // p.id is the UUID (e.g., ad9e4388-...)
    // p.name is the Label (e.g., Uber)
    <option key={p.id} value={p.id}>
      {p.name}
    </option>
  ))}
</select>
                {isLoadingPlatforms && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-slate-400" />
                )}
              </div>
            </div>

            {/* Date Field */}
            <div className="space-y-1.5">
              <label htmlFor="date" className="text-sm font-semibold text-slate-700">Date</label>
              <input 
                id="date" 
                name="date" 
                type="date" 
                required 
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-slate-900 focus:outline-none" 
              />
            </div>
          </div>

          {/* Net Received (Main Field) */}
          <div className="space-y-1.5">
            <label htmlFor="netReceived" className="text-sm font-semibold text-slate-700">Net Received (Actual Earnings)</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-400 font-medium">$</span>
              <input 
                id="netReceived" 
                name="netReceived" 
                type="number" 
                step="0.01" 
                required 
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 pl-8 pr-4 py-2.5 text-sm font-bold focus:border-slate-900 focus:outline-none" 
              />
            </div>
          </div>

          {/* Optional Metrics Section */}
          <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optional Details</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="hoursWorked" className="text-xs font-medium text-slate-600">Hours Worked</label>
                <input id="hoursWorked" name="hoursWorked" type="number" step="0.1" placeholder="0.0" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="currency" className="text-xs font-medium text-slate-600">Currency</label>
                <input id="currency" name="currency" type="text" defaultValue="USD" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="grossEarned" className="text-xs font-medium text-slate-600">Gross Earned</label>
                <input id="grossEarned" name="grossEarned" type="number" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="platformDeductions" className="text-xs font-medium text-slate-600">Deductions</label>
                <input id="platformDeductions" name="platformDeductions" type="number" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Earnings Screenshot</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-4 text-slate-500 transition hover:bg-slate-50 hover:border-slate-300">
              <Camera className="h-5 w-5" />
              <span className="text-xs font-medium">Upload PNG or JPG</span>
              <input 
                id="screenshot" 
                name="screenshot" 
                type="file" 
                accept="image/*" 
                className="hidden" 
              />
            </label>
          </div>

          {/* Error Message */}
          {state?.error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100">
              {state.error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isPending || isLoadingPlatforms}
            className="mt-2 w-full rounded-2xl bg-slate-900 py-4 text-base font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? "Logging Shift..." : "Submit Shift Log"}
          </button>
        </form>
      </div>
    </div>
  );
}