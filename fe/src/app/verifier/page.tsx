import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import VerifierClient from '@/app/verifier/verifier-client'

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
  
  return <VerifierClient user={user} />
}