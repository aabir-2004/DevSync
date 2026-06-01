"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, SignupInput } from "@/lib/validations/auth";
import { Eye, EyeOff, Loader2, Sparkles, Mail, Lock, User, GraduationCap } from "lucide-react";
import { z } from "zod";

export default function SignupForm() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<SignupInput>({
    name: "",
    email: "",
    password: "",
    batch: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SignupInput, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const batchOptions = [
    "DecSync 2024 (Batch A)",
    "DecSync 2024 (Batch B)",
    "DecSync 2025 (Batch A)",
    "DecSync 2025 (Batch B)",
    "DecSync Alum",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field when editing
    if (formErrors[name as keyof SignupInput]) {
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
      signupSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Partial<Record<keyof SignupInput, string>> = {};
        err.issues.forEach((zodErr) => {
          const path = zodErr.path[0] as keyof SignupInput;
          if (path && !errors[path]) {
            errors[path] = zodErr.message;
          }
        });
        setFormErrors(errors);
      }
      setIsLoading(false);
      return;
    }

    // Call Supabase Auth
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            batch: formData.batch,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Check if user is created successfully
      if (data?.user) {
        router.push("/auth/verify?email=" + encodeURIComponent(formData.email));
      }
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center sm:text-left mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Create your account
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Join the collaborative DecSync cohort workspace.
        </p>
      </div>

      {submitError && (
        <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
          {submitError}
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Full Name
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <User className="h-4.5 w-4.5 text-zinc-400" />
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={isLoading}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 transition-all"
          />
        </div>
        {formErrors.name && (
          <p className="text-[10px] font-semibold text-red-500">{formErrors.name}</p>
        )}
      </div>

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
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 transition-all"
          />
        </div>
        {formErrors.email && (
          <p className="text-[10px] font-semibold text-red-500">{formErrors.email}</p>
        )}
      </div>

      {/* Batch Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Your Cohort Batch
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <GraduationCap className="h-4.5 w-4.5 text-zinc-400" />
          </div>
          <select
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled className="dark:bg-zinc-900 dark:text-zinc-400">Select your batch</option>
            {batchOptions.map((opt) => (
              <option key={opt} value={opt} className="dark:bg-zinc-900 dark:text-zinc-100">
                {opt}
              </option>
            ))}
          </select>
        </div>
        {formErrors.batch && (
          <p className="text-[10px] font-semibold text-red-500">{formErrors.batch}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Password
        </label>
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
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 pl-10 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 transition-all"
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
          <p className="text-[10px] font-semibold text-red-500 leading-relaxed max-w-[340px]">
            {formErrors.password}
          </p>
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
            <span>Creating account...</span>
          </>
        ) : (
          <span>Get Started</span>
        )}
      </button>

      {/* Redirect back to Login */}
      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-2">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-bold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
