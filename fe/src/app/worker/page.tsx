// app/worker/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'
import { logoutAction } from '@/app/actions/auth' // Import the action
import { LogOut } from 'lucide-react' // Optional: icon for the button
import { getEarningsLogsAction } from '@/app/actions/earnings';

export default async function WorkerPage() {
  const logsData = await getEarningsLogsAction(1, 20); // Fetch first 20 logs

  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')?.value

  if (!userCookie) {
    redirect('/')
  }

  const user = JSON.parse(userCookie)

  if (user.role !== 'WORKER') {
    if (user.role === 'VERIFIER') redirect('/verifier')
    if (user.role === 'ADVOCATE') redirect('/advocate')
    redirect('/')
  }

  return (
    <div className="relative">
      {/* Sign Out Button Container */}
      <div className="absolute right-4 top-4 z-50 sm:right-8 sm:top-6">
        <form action={logoutAction}>
          <button 
            type="submit" 
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>

      {/* Main Dashboard */}
      <DashboardClient user={user} 
      initialLogs={logsData || []} />
    </div>
  )
}