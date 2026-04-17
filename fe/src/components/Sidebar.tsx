import Link from "next/link";
import { LayoutDashboard, FileText } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full hidden md:flex">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
          Enterprise
        </h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link
          href="/posts"
          className="flex items-center gap-3 px-4 py-3 text-gray-700 bg-gray-50 rounded-lg transition-colors"
        >
          <FileText size={20} className="text-blue-600" />
          <span className="font-medium text-blue-600">Posts</span>
        </Link>
      </nav>
    </aside>
  );
}
