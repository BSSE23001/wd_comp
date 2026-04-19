import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Log In | FairGig",
  description: "Sign in to your FairGig account to track earnings, verify income, and connect with the gig worker community.",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
