"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Loader2, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewThreadPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    category: "general",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categories = [
    { value: "dsa", label: "DSA Discussion" },
    { value: "development", label: "Web/App Development" },
    { value: "placements", label: "Placements & Prep" },
    { value: "projects", label: "Projects & Reviews" },
    { value: "college", label: "College & Academics" },
    { value: "research", label: "Research & Papers" },
    { value: "general", label: "General Chat" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.title.trim()) tempErrors.title = "Title is required";
    if (!formData.body.trim()) tempErrors.body = "Discussion body content is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("You must be logged in to create a thread.");
      }

      // Insert thread
      const { error: insertError } = await supabase.from("forum_threads").insert({
        title: formData.title,
        body: formData.body,
        category: formData.category,
        author_id: user.id,
        upvotes: 0,
        is_locked: false,
        is_pinned: false,
        views: 0,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push("/forums");
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Back Button */}
      <Link
        href="/forums"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discussions
      </Link>

      <div className="premium-card rounded-3xl p-8 bg-white dark:bg-zinc-900 shadow-lg border border-zinc-150/80 dark:border-zinc-800/80">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center sm:text-left mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              New Discussion
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Start a topic or post a question to solve with the DecSync batch.
            </p>
          </div>

          {submitError && (
            <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
              {submitError}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Topic Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Help needed with DP on Trees optimization?"
              disabled={isLoading}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all font-semibold"
            />
            {errors.title && <p className="text-[10px] font-semibold text-red-500">{errors.title}</p>}
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Topic Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value} className="dark:bg-zinc-950">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Discussion Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Discussion Content
            </label>
            <textarea
              name="body"
              value={formData.body}
              onChange={handleChange}
              rows={6}
              placeholder="Describe your question or discussion point in detail. Markdown format is supported..."
              disabled={isLoading}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all resize-none leading-relaxed"
            />
            {errors.body && <p className="text-[10px] font-semibold text-red-500">{errors.body}</p>}
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
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Post Discussion</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
