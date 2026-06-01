"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus, Sparkles, BookOpen, GraduationCap, Link2, Tag as TagIcon } from "lucide-react";
import Tag from "@/components/shared/Tag";

export default function ResourceUploadForm() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "notes",
    semester: "",
    subject: "",
    external_url: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categories = [
    { value: "notes", label: "Notes" },
    { value: "pdf", label: "PDF Documents" },
    { value: "placement", label: "Placement Sheets" },
    { value: "dsa", label: "DSA Sheets" },
    { value: "development", label: "Web/App Dev" },
    { value: "system_design", label: "System Design" },
    { value: "interview_exp", label: "Interview Prep" },
    { value: "competitive", label: "Competitive Coding" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) {
        setTags((prev) => [...prev, val]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.title.trim()) tempErrors.title = "Title is required";
    if (!formData.external_url.trim()) tempErrors.external_url = "Resource URL is required";
    else if (!formData.external_url.startsWith("http://") && !formData.external_url.startsWith("https://")) {
      tempErrors.external_url = "Please enter a valid URL starting with http:// or https://";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsLoading(true);

    try {
      // Fetch authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to contribute resources.");
      }

      // Insert resource
      const { error } = await supabase.from("resources").insert({
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        semester: formData.semester ? parseInt(formData.semester) : null,
        subject: formData.subject || null,
        tags: tags,
        external_url: formData.external_url,
        author_id: user.id,
        upvotes: 0,
      });

      if (error) {
        throw new Error(error.message);
      }

      router.push("/resources");
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center sm:text-left mb-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          Contribute a Resource
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Share high quality PDF notes, video links, or sheets with the cohort.
        </p>
      </div>

      {submitError && (
        <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
          {submitError}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Resource Title
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Master-Theorem-Cheatsheet.pdf"
          disabled={isLoading}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all"
        />
        {errors.title && <p className="text-[10px] font-semibold text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Short Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="What is this resource about? Mention key topics covered..."
          disabled={isLoading}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all"
        />
      </div>

      {/* Dual Row Category & Semester */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value} className="zinc-950">
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5 text-zinc-400" />
            Semester
          </label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all cursor-pointer"
          >
            <option value="">N/A (All Semesters)</option>
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={i + 1} className="zinc-950">
                Semester {i + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Subject/Course Name (Optional)
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="e.g. Design & Analysis of Algorithms"
          disabled={isLoading}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all"
        />
      </div>

      {/* External URL */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
          <Link2 className="h-3.5 w-3.5 text-zinc-400" />
          Resource Link (Google Drive / YouTube / GitHub)
        </label>
        <input
          type="text"
          name="external_url"
          value={formData.external_url}
          onChange={handleChange}
          placeholder="e.g. https://drive.google.com/..."
          disabled={isLoading}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all"
        />
        {errors.external_url && <p className="text-[10px] font-semibold text-red-500">{errors.external_url}</p>}
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
          <TagIcon className="h-3.5 w-3.5 text-zinc-400" />
          Add tags (Press Enter or Comma to add)
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="e.g. algorithms, trees, cheatsheet"
          disabled={isLoading}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all"
        />
        
        {/* Render added tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 zinc-800 dark:text-zinc-200 text-xs px-2 py-0.5 rounded-full">
                {t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="text-zinc-400 hover:text-zinc-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
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
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span>Share Resource</span>
          </>
        )}
      </button>
    </form>
  );
}
