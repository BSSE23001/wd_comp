"use client";

import { useState } from "react";
import { addPlatform, togglePlatform } from "@/app/actions/advocate";
import { Server, Plus, Loader2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

type Platform = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
};

export default function PlatformsClient({ initialPlatforms }: { initialPlatforms: Platform[] }) {
  const [platforms, setPlatforms] = useState<Platform[]>(initialPlatforms);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatformName.trim()) return;
    
    setIsAdding(true);
    const res = await addPlatform(newPlatformName);
    if (res.success) {
      toast.success("Platform added successfully!");
      // Optimistically add to list
      setPlatforms(prev => [...prev, {
        id: Math.random().toString(), // temporary ID
        name: newPlatformName,
        isActive: true,
        createdAt: new Date().toISOString()
      }]);
      setNewPlatformName("");
    } else {
      toast.error(res.error || "Failed to add platform");
    }
    setIsAdding(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setProcessingId(id);
    const res = await togglePlatform(id);
    if (res.success) {
      setPlatforms(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
      toast.success(`Platform ${currentStatus ? "disabled" : "enabled"}!`);
    } else {
      toast.error(res.error || "Failed to toggle platform");
    }
    setProcessingId(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Server className="h-8 w-8 text-blue-600" />
            Platform Directory
          </h1>
          <p className="text-slate-500 mt-2">Manage the list of gig economy platforms supported for verification.</p>
        </div>
        
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={newPlatformName}
            onChange={(e) => setNewPlatformName(e.target.value)}
            placeholder="New platform name..."
            className="px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none w-64 text-sm font-medium"
            required
          />
          <button 
            type="submit" 
            disabled={isAdding}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {platforms.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No platforms added yet.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Platform Name</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Date Added</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {platforms.map((platform) => (
                <tr key={platform.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{platform.name}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(platform.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      platform.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${platform.isActive ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                      {platform.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      disabled={processingId === platform.id}
                      onClick={() => handleToggle(platform.id, platform.isActive)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                        platform.isActive 
                          ? "bg-white border border-rose-200 text-rose-600 hover:bg-rose-50" 
                          : "bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {processingId === platform.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : platform.isActive ? (
                        <><Pause className="h-3.5 w-3.5" /> Disable</>
                      ) : (
                        <><Play className="h-3.5 w-3.5" /> Enable</>
                      )}
                    </button>
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
