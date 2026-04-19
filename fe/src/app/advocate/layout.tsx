import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Server, MessageSquare, LogOut, ShieldCheck } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export default async function AdvocateLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  
  if (!userCookie) {
    redirect("/");
  }

  const user = JSON.parse(userCookie.value);
  if (user.role !== "ADVOCATE") {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-emerald-500 rounded-lg p-2 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">FairGig</h1>
            <p className="text-xs font-medium text-emerald-400">Advocate Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link href="/advocate/analytics" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 text-emerald-400 font-medium transition hover:bg-slate-800">
            <LayoutDashboard className="h-5 w-5" />
            Analytics Dashboard
          </Link>
          <Link href="/advocate/verifiers" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 font-medium transition hover:bg-slate-800 hover:text-white">
            <Users className="h-5 w-5" />
            Verifiers
          </Link>
          <Link href="/advocate/platforms" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 font-medium transition hover:bg-slate-800 hover:text-white">
            <Server className="h-5 w-5" />
            Platforms
          </Link>
          <Link href="/advocate/grievances" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 font-medium transition hover:bg-slate-800 hover:text-white">
            <MessageSquare className="h-5 w-5" />
            Grievances
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-3">
            <p className="text-sm font-semibold text-white truncate">{user.email}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role.toLowerCase()}</p>
          </div>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 font-medium transition hover:bg-rose-500/10 hover:text-rose-300">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
