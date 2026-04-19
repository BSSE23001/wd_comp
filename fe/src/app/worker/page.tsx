// app/worker/page.tsx
import type { Metadata } from "next";
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: "Worker Dashboard | FairGig",
  description: "View your shift logs, check for earning anomalies, and generate verifiable income certificates.",
};
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'
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
      <DashboardClient user={user} initialLogs={logsData || []} />
    </div>
  )
}