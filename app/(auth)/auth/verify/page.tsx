"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, RefreshCw } from "lucide-react";
import { Suspense, useState } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email address";
  
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle");

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus("idle");
    
    // Simulate/Trigger resend (in real, calls Supabase api or endpoint)
    setTimeout(() => {
      setIsResending(false);
      setResendStatus("success");
    }, 1500);
  };

  return (
    <div className="text-center">
      {/* Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary mb-6">
        <Mail className="h-8 w-8 animate-bounce" />
      </div>

      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Verify your email
      </h2>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
        We&apos;ve sent a verification link to <span className="font-semibold text-zinc-800 dark:text-zinc-200">{email}</span>. Please click the link to activate your account.
      </p>

      {/* Resend status or instructions */}
      <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-6 space-y-4">
        {resendStatus === "success" && (
          <p className="text-xs font-semibold text-green-600 bg-green-50/50 py-2 rounded-xl dark:bg-green-950/20 dark:text-green-400 flex items-center justify-center gap-1.5 border border-green-100 dark:border-green-900/10">
            <CheckCircle className="h-4 w-4" />
            Verification email resent!
          </p>
        )}
        
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Didn&apos;t receive the email?{" "}
          <button
            onClick={handleResend}
            disabled={isResending}
            className="font-bold text-primary hover:underline flex items-center gap-1 mx-auto mt-1 cursor-pointer disabled:opacity-50"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                Resending...
              </>
            ) : (
              "Click to resend"
            )}
          </button>
        </p>
      </div>

      {/* Back to Login Link */}
      <Link
        href="/auth/login"
        className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sign in
      </Link>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-[200px] w-full items-center justify-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
