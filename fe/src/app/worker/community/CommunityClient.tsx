"use client";

import { useState } from "react";
import { fetchPublicGrievances, createGrievance } from "@/app/actions/grievances";
import { Search, Filter, MessageSquare, Plus, Loader2, Megaphone } from "lucide-react";

type Grievance = {
  id: string;
  category: string;
  description: string;
  rateIntel: number | null;
  tags: string[];
  createdAt: string;
  platform?: { name: string };
  cluster?: { name: string };
};

type Platform = {
  id: string;
  name: string;
};

export default function CommunityClient({ 
  initialGrievances, 
  platforms 
}: { 
  initialGrievances: Grievance[],
  platforms: Platform[]
}) {
  const [grievances, setGrievances] = useState<Grievance[]>(initialGrievances);
  
  // Filters
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState("");
  const [sort, setSort] = useState("desc");
  const [isSearching, setIsSearching] = useState(false);

  // New Post Form
  const [isPosting, setIsPosting] = useState(false);
  const [category, setCategory] = useState("PLATFORM_COMPLAINT");
  const [description, setDescription] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [rateIntel, setRateIntel] = useState("");
  const [postTags, setPostTags] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const res = await fetchPublicGrievances(search, tags, sort);
    if (res.success) {
      setGrievances(res.data);
    }
    setIsSearching(false);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsPosting(true);
    
    const tagsArray = postTags.split(",").map(t => t.trim()).filter(Boolean);
    
    const payload = {
      category,
      description,
      platformId: platformId || null,
      rateIntel: rateIntel ? parseFloat(rateIntel) : null,
      tags: tagsArray
    };

    const res = await createGrievance(payload);
    
    if (res.success) {
      // Clear form and refetch
      setDescription("");
      setRateIntel("");
      setPostTags("");
      setPlatformId("");
      handleSearch(e);
    } else {
      alert(res.error || "Failed to post");
    }
    
    setIsPosting(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 flex flex-col lg:flex-row gap-8">
      
      {/* Main Feed (Left Side) */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-blue-600" />
            Community Board
          </h1>
          <p className="text-slate-500 mt-2">Anonymous bulletin board to share grievances and coordinate action.</p>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none focus:ring-0 text-sm font-medium rounded-xl"
            />
          </div>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Tags (e.g. pay, app)" 
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-40 px-4 py-2.5 bg-slate-50 border-none focus:ring-0 text-sm font-medium rounded-xl"
            />
            <select 
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border-none focus:ring-0 text-sm font-medium rounded-xl cursor-pointer"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
            <button 
              type="submit" 
              disabled={isSearching}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Filter"}
            </button>
          </div>
        </form>

        {/* Posts List */}
        <div className="space-y-4">
          {grievances.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
              No posts found.
            </div>
          ) : (
            grievances.map(post => (
              <article key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Anonymous Worker</p>
                      <p className="text-xs text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                        {post.platform && ` • ${post.platform.name}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                    post.category === "PLATFORM_COMPLAINT" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {post.category.replace("_", " ")}
                  </span>
                </div>
                
                <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
                
                {post.rateIntel && (
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 text-xs font-semibold">
                    Reported Rate: ${post.rateIntel.toFixed(2)}/hr
                  </div>
                )}

                {(post.tags.length > 0 || post.cluster) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {post.cluster && (
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md text-[10px] font-bold">
                        📁 Linked to: {post.cluster.name}
                      </span>
                    )}
                    {post.tags.map(tag => (
                      <span key={tag} className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>

      {/* New Post Form (Right Side) */}
      <div className="w-full lg:w-96 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 sticky top-8">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Plus className="h-5 w-5 text-blue-600" />
            Share Your Experience
          </h2>
          <p className="text-xs text-slate-500 mb-6">Your identity is completely hidden. Speak freely about platform conditions.</p>
          
          <form onSubmit={handlePost} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm"
              >
                <option value="PLATFORM_COMPLAINT">Platform Complaint</option>
                <option value="SUPPORT_REQUEST">Community Support</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Platform (Optional)</label>
              <select 
                value={platformId}
                onChange={e => setPlatformId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm"
              >
                <option value="">General Issue</option>
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">What happened?</label>
              <textarea 
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the pay drop, app glitch, or unfair treatment..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Rate Intel ($/hr)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={rateIntel}
                  onChange={e => setRateIntel(e.target.value)}
                  placeholder="e.g. 12.50"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Tags (comma-separated)</label>
                <input 
                  type="text"
                  value={postTags}
                  onChange={e => setPostTags(e.target.value)}
                  placeholder="pay, app-crash"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPosting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 mt-4"
            >
              {isPosting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Post Anonymously"}
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}
