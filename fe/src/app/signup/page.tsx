import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = {
  title: "Sign Up | FairGig",
  description: "Create your free FairGig account as a Worker, Verifier, or Advocate. Start tracking and verifying your gig earnings today.",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
