// app/verifier/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import VerifierClient from './verifier-client' // Make sure path is correct
import { logoutAction } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

export default async function VerifierPage() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')?.value

  if (!userCookie) {
    redirect('/')
  }

  const user = JSON.parse(userCookie)

  // Security routing: Ensure only VERIFIERs can access this page
  if (user.role !== 'VERIFIER') {
    if (user.role === 'WORKER') redirect('/worker')
    if (user.role === 'ADVOCATE') redirect('/advocate')
    redirect('/')
  }

  // In a real app, you would fetch the pending reviews from your database here
  // and pass them down as a prop. For now, we'll mock them in the client.
  
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

      <VerifierClient user={user} />
    </div>
  )
}