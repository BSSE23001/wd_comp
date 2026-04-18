import Link from "next/link";

const features = [
  {
    title: "Log Earnings",
    description:
      "Track shifts, bonuses, and platform deductions in one clear timeline.",
  },
  {
    title: "Verify Income",
    description:
      "Upload screenshots and proof to create a trusted record of what you earned.",
  },
  {
    title: "Get Certificates",
    description:
      "Generate shareable income reports for landlords, banks, or loan applications.",
  },
  {
    title: "Community Voice",
    description:
      "Use an anonymous board to report issues and share rate intelligence with peers.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xl font-bold tracking-tight text-blue-900">FairGig</p>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Authentication">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              Log In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center justify-center rounded-full bg-blue-700 px-4 text-sm font-medium text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
          <div className="max-w-3xl">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Take Control of Your Gig Earnings
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              FairGig helps gig workers unify income records across apps, verify what
              they earned, and protect their rights when payout rules change.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue-700 px-6 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-blue-950 sm:text-3xl">
                Why FairGig Matters
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                Most gig workers get no unified record, no formal payslip, and no
                warning when platforms change commission rates overnight. FairGig
                gives workers a single source of truth and stronger evidence when
                pay feels unfair.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Built for Everyday Gig Work
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} FairGig. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
