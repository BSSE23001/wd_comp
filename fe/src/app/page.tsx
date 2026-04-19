import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, TrendingUp, Users, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "FairGig - Take Back Control of Your Gig Earnings",
  description: "FairGig empowers gig workers with unified income tracking, peer-verified records, anomaly detection, and a collective voice against unfair platform practices.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg">
              F
            </div>
            <p className="text-xl font-extrabold tracking-tight text-slate-900">FairGig</p>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-sm"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-24">
        
        {/* Hero Section */}
        <section className="relative mx-auto w-full max-w-7xl px-6 py-20 lg:py-32">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none -z-10" />
          
          <div className="max-w-3xl text-center mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wide uppercase mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Empowering the Gig Economy
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Take Back Control of Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Gig Earnings.</span>
            </h1>
            
            <p className="mt-6 text-lg lg:text-xl leading-relaxed text-slate-600 max-w-2xl mx-auto">
              FairGig provides independent workers with a unified income record, peer-reviewed verification, and the collective power to challenge unfair platform pay practices.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 text-base font-bold text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20"
              >
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-white border-t border-slate-200">
          <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:py-32">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
                A Complete Toolkit for Gig Workers
              </h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                Everything you need to verify, prove, and protect your income across multiple platforms.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Log Earnings</h3>
                <p className="text-slate-600 leading-relaxed">
                  Track shifts, bonuses, and platform deductions across Uber, Foodpanda, and more in one timeline.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Verify Income</h3>
                <p className="text-slate-600 leading-relaxed">
                  Upload screenshots of your payouts. Our peer verifiers validate the data to create a trusted record.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Get Certificates</h3>
                <p className="text-slate-600 leading-relaxed">
                  Generate verifiable, beautifully formatted PDF income certificates for landlords or banks instantly.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Community Voice</h3>
                <p className="text-slate-600 leading-relaxed">
                  Join the anonymous grievance board to report issues, share rate intel, and organize with peers.
                </p>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-white font-bold text-xs">
              F
            </div>
            <p className="font-bold text-slate-900">FairGig</p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} FairGig. Built for worker empowerment.
          </p>
        </div>
      </footer>
    </div>
  );
}
