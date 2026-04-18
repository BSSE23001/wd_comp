// app/home/page.tsx
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client' // Make sure this path points to the file above

export default async function HomePage() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')?.value

  // Protect the route: send back to login if they aren't authenticated
  if (!userCookie) {
    redirect('/')
  }

  // Parse the cookie back into an object
  const user = JSON.parse(userCookie)

  // Pass it down to your interactive UI
  return <DashboardClient user={user} />
}