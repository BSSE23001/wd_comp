"use client";

import { useState } from "react";
import { updateGrievanceStatus, createCluster, addGrievanceToCluster } from "@/app/actions/advocate";
import { MessageSquare, AlertCircle, CheckCircle, ArrowRight, Plus, FolderPlus, Tag } from "lucide-react";
import { toast } from "sonner";

type Grievance = {
  id: string;
  category: string;
  description: string;
  rateIntel?: number | null;
  tags: string[];
  status: "OPEN" | "ESCALATED" | "RESOLVED";
  createdAt: string;
  platform?: { name: string } | null;
  cluster?: { name: string } | null;
};

type Cluster = {
  id: string;
  name: string;
  _count: { posts: number };
};

export default function GrievancesClient({ 
  initialGrievances, 
  initialClusters 
}: { 
  initialGrievances: Grievance[], 
  initialClusters: Cluster[] 
}) {
  const [grievances, setGrievances] = useState<Grievance[]>(initialGrievances);
  const [clusters, setClusters] = useState<Cluster[]>(initialClusters);
  
  const [newClusterName, setNewClusterName] = useState("");
  const [selectedClusters, setSelectedClusters] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusChange = async (id: string, status: "ESCALATED" | "RESOLVED") => {
    setIsProcessing(true);
    const res = await updateGrievanceStatus(id, status);
    if (res.success) {
      setGrievances(prev => prev.map(g => g.id === id ? { ...g, status } : g));
      toast.success(`Grievance marked as ${status}`);
    } else {
      toast.error(res.error || "Failed to update status");
    }
    setIsProcessing(false);
  };

  const handleCreateCluster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClusterName.trim()) return;
    
    setIsProcessing(true);
    const res = await createCluster(newClusterName);
    if (res.success && res.data) {
      toast.success("Cluster created successfully!");
      setClusters(prev => [...prev, {
        id: res.data.id,
        name: res.data.name,
        _count: { posts: 0 }
      }]);
      setNewClusterName("");
    } else {
      toast.error(res.error || "Failed to create cluster");
    }
    setIsProcessing(false);
  };

  const handleAddToCluster = async (postId: string) => {
    const clusterId = selectedClusters[postId];
    if (!clusterId) return toast.error("Select a cluster first");
    
    setIsProcessing(true);
    const res = await addGrievanceToCluster(clusterId, postId);
    if (res.success) {
      toast.success("Grievance added to cluster!");
      setClusters(prev => prev.map(c => 
        c.id === clusterId ? { ...c, _count: { posts: c._count.posts + 1 } } : c
      ));
      // Update the grievance to show it's now clustered
      const clusterName = clusters.find(c => c.id === clusterId)?.name;
      setGrievances(prev => prev.map(g => 
        g.id === postId ? { ...g, cluster: { name: clusterName || "" } } : g
      ));
    } else {
      toast.error(res.error || "Failed to add to cluster");
    }
    setIsProcessing(false);
  };

  const categoryLabels: Record<string, string> = {
    PLATFORM_COMPLAINT: "Platform Complaint",
    SUPPORT_REQUEST: "Support Request",
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 flex flex-col lg:flex-row gap-8">
      
      {/* Grievances List (Left Side) */}
      <div className="flex-1 space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" aria-hidden="true" />
            Worker Grievances
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">Monitor, escalate, and resolve community reports.</p>
        </div>

        <div className="space-y-4">
          {grievances.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
              No grievances found.
            </div>
          ) : (
            grievances.map(grievance => (
              <div key={grievance.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {categoryLabels[grievance.category] || grievance.category}
                      </span>
                      {grievance.platform?.name && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          {grievance.platform.name}
                        </span>
                      )}
                      {grievance.cluster?.name && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                          📁 {grievance.cluster.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(grievance.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {grievance.rateIntel && <span className="ml-2 font-semibold text-amber-600">Rate Intel: ${grievance.rateIntel.toFixed(2)}/hr</span>}
                    </p>
                  </div>
                  <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                    grievance.status === "OPEN" ? "bg-amber-100 text-amber-700" :
                    grievance.status === "ESCALATED" ? "bg-rose-100 text-rose-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {grievance.status}
                  </span>
                </div>
                
                {/* Description (the actual post content) */}
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl text-sm border border-slate-100 break-words">
                  {grievance.description}
                </p>

                {/* Tags */}
                {grievance.tags && grievance.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    {grievance.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {grievance.status !== "RESOLVED" && (
                      <button 
                        disabled={isProcessing}
                        onClick={() => handleStatusChange(grievance.id, "RESOLVED")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                        aria-label={`Resolve grievance ${grievance.id}`}
                      >
                        <CheckCircle className="h-4 w-4" aria-hidden="true" /> Resolve
                      </button>
                    )}
                    {grievance.status === "OPEN" && (
                      <button 
                        disabled={isProcessing}
                        onClick={() => handleStatusChange(grievance.id, "ESCALATED")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                        aria-label={`Escalate grievance ${grievance.id}`}
                      >
                        <AlertCircle className="h-4 w-4" aria-hidden="true" /> Escalate
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select 
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[140px]"
                      value={selectedClusters[grievance.id] || ""}
                      onChange={(e) => setSelectedClusters(prev => ({ ...prev, [grievance.id]: e.target.value }))}
                      aria-label="Select cluster for this grievance"
                    >
                      <option value="">Cluster...</option>
                      {clusters.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button 
                      disabled={isProcessing || !selectedClusters[grievance.id]}
                      onClick={() => handleAddToCluster(grievance.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                      aria-label="Add to selected cluster"
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden="true" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Clusters Management (Right Side) */}
      <div className="w-full lg:w-80 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 lg:sticky lg:top-8">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <FolderPlus className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            Issue Clusters
          </h2>
          <p className="text-xs text-slate-500 mb-6">Group similar grievances together to build a strong case.</p>
          
          <form onSubmit={handleCreateCluster} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newClusterName}
              onChange={(e) => setNewClusterName(e.target.value)}
              placeholder="E.g., Missing Uber Tips"
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-sm"
              required
              aria-label="New cluster name"
            />
            <button 
              type="submit" 
              disabled={isProcessing}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
              aria-label="Create cluster"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {clusters.length === 0 ? (
              <p className="text-sm text-center text-slate-400 py-4">No clusters created.</p>
            ) : (
              clusters.map(cluster => (
                <div key={cluster.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-700 text-sm">{cluster.name}</span>
                  <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {cluster._count?.posts || 0}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
