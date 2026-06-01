"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resetSchema, ResetInput } from "@/lib/validations/auth";
import { Eye, EyeOff, Loader2, KeyRound, CheckCircle } from "lucide-react";
import { z } from "zod";

export default function ResetForm() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState<ResetInput>({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ResetInput, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors
    if (formErrors[name as keyof ResetInput]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});
    setError(null);

    // Validate with Zod
    try {
      resetSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Partial<Record<keyof ResetInput, string>> = {};
        err.issues.forEach((zodErr) => {
          const path = zodErr.path[0] as keyof ResetInput;
          if (path && !errors[path]) {
            errors[path] = zodErr.message;
          }
        });
        setFormErrors(errors);
      }
      setIsLoading(false);
      return;
    }

    // Call Supabase update
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-950/20 text-green-500 mb-6">
          <CheckCircle className="h-6 w-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Password updated!
        </h2>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
          Your password has been successfully reset. Redirecting you to the sign in page...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center sm:text-left mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          Reset Password
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Please enter your new password below.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      {/* New Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all"
          />
        </div>
        {formErrors.password && (
          <p className="text-[10px] font-semibold text-red-500 leading-relaxed max-w-[340px]">
            {formErrors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {formErrors.confirmPassword && (
          <p className="text-[10px] font-semibold text-red-500">
            {formErrors.confirmPassword}
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
            <span>Updating password...</span>
          </>
        ) : (
          <span>Update Password</span>
        )}
      </button>
    </form>
  );
}
