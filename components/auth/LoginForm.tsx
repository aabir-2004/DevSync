"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { Eye, EyeOff, Loader2, KeyRound, Mail, Lock } from "lucide-react";
import { z } from "zod";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors
    if (formErrors[name as keyof LoginInput]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});
    setSubmitError(null);

    // Validate with Zod
    try {
      loginSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Partial<Record<keyof LoginInput, string>> = {};
        err.issues.forEach((zodErr) => {
          const path = zodErr.path[0] as keyof LoginInput;
          if (path && !errors[path]) {
            errors[path] = zodErr.message;
          }
        });
        setFormErrors(errors);
      }
      setIsLoading(false);
      return;
    }

    // Call Supabase login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        // Redirect to original page or home
        const nextUrl = searchParams.get("next") || "/";
        router.push(nextUrl);
        router.refresh(); // Refresh layout to check auth cookies
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid email or password.";
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center sm:text-left mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          Welcome back
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Sign in to access your dashboard workspace.
        </p>
      </div>

      {submitError && (
        <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
          {submitError}
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
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@decsync.com"
            disabled={isLoading}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 transition-all"
          />
        </div>
        {formErrors.email && (
          <p className="text-[10px] font-semibold text-red-500">{formErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Password
          </label>
          <Link
            href="/auth/forgot"
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Lock className="h-4.5 w-4.5 text-zinc-400" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formErrors.password && (
          <p className="text-[10px] font-semibold text-red-500">{formErrors.password}</p>
        )}
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
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>

      {/* Redirect back to Register */}
      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-2">
        Don&apos;t have an account yet?{" "}
        <Link href="/auth/signup" className="font-bold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
