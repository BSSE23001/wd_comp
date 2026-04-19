import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, MessageSquare, LogOut, CheckCircle2 } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export default async function WorkerLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  
  if (!userCookie) {
    redirect("/");
  }

  const user = JSON.parse(userCookie.value);
  if (user.role !== "WORKER") {
    redirect("/");
  }

  const rawName = user.first_name || user.email.split("@")[0];
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg font-semibold text-white">
              {userInitial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow ring-2 ring-slate-900">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            </span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">{displayName}</h1>
            <p className="text-xs font-medium text-emerald-400">Verified Worker</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link href="/worker" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 font-medium transition hover:bg-slate-800 hover:text-white">
            <LayoutDashboard className="h-5 w-5" />
            My Dashboard
          </Link>
          <Link href="/worker/community" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 font-medium transition hover:bg-slate-800 hover:text-white">
            <MessageSquare className="h-5 w-5" />
            Community Board
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 font-medium transition hover:bg-slate-800 hover:text-slate-200">
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
