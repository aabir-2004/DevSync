import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-zinc-50 via-white to-orange-50/20 dark:from-zinc-950 dark:via-zinc-950 dark:to-primary-950/10">
      
      {/* Brand Logo Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-3xl font-extrabold tracking-tight">
          <span className="text-primary font-mono text-3xl font-black">{`{`}</span>
          <span className="text-zinc-900 dark:text-white font-sans tracking-wide">DevSync</span>
          <span className="text-primary font-mono text-3xl font-black">{`}`}</span>
        </Link>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Learn. Share. Grow Together.
        </p>
      </div>

      {/* Main Form container Card */}
      <div className="w-full sm:max-w-md">
        <div className="premium-card rounded-3xl p-8 bg-white/70 dark:bg-zinc-900/50 backdrop-blur-xl shadow-xl dark:shadow-2xl border border-zinc-150/80 dark:border-zinc-800/80">
          {children}
        </div>
      </div>
      
    </div>
  );
}
