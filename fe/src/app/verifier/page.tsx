// app/verifier/page.tsx
import type { Metadata } from "next";
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: "Verifier Desk | FairGig",
  description: "Review and verify gig worker earnings submissions. Approve, flag discrepancies, or mark logs as unverifiable.",
};
import { redirect } from 'next/navigation'
import VerifierClient from './verifier-client'
import { logoutAction } from '@/app/actions/auth'
import { getVerifierQueueAction } from '@/app/actions/earnings' // Import the new action
import { LogOut } from 'lucide-react'

export default async function VerifierPage() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')?.value

  if (!userCookie) redirect('/')
  const user = JSON.parse(userCookie)

  if (user.role !== 'VERIFIER') {
    if (user.role === 'WORKER') redirect('/worker')
    if (user.role === 'ADVOCATE') redirect('/advocate')
    redirect('/')
  }

  // Fetch real pending logs from the microservice
  const pendingQueue = await getVerifierQueueAction();

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-50 sm:right-8 sm:top-6">
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>

      {/* Pass the real queue as initialQueue */}
      <VerifierClient user={user} initialQueue={pendingQueue} />
    </div>
  )
}