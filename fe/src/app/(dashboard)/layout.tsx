import { UserButton } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sm:px-10">
          <h1 className="text-xl font-semibold text-gray-800">Application</h1>
          <UserButton />
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
