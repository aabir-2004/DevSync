"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { forgotSchema, ForgotInput } from "@/lib/validations/auth";
import { Mail, Loader2, ArrowLeft, Send } from "lucide-react";
import { z } from "zod";

export default function ForgotForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate email
    try {
      forgotSchema.parse({ email });
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      }
      setIsLoading(false);
      return;
    }

    // Call Supabase API
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary mb-6">
          <Send className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Check your email
        </h2>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
          We've sent a password reset link to <span className="font-semibold text-zinc-800 dark:text-zinc-200">{email}</span>. Click the link inside to set a new password.
        </p>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center sm:text-left mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
          Forgot Password
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Enter your email and we'll send you a password reset link.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30 animate-shake">
          {error}
        </div>
      )}

      {/* Email Address */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Email Address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Mail className="h-4.5 w-4.5 text-zinc-400" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="name@decsync.com"
            disabled={isLoading}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-900 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending link...</span>
          </>
        ) : (
          <span>Send Reset Link</span>
        )}
      </button>

      {/* Redirect back to Login */}
      <div className="text-center pt-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign in
        </Link>
      </div>
    </form>
  );
}
