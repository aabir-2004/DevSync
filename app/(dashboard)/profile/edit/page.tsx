"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Loader2, Save, ArrowLeft, User, GraduationCap, FileText, Image as ImageIcon, Upload } from "lucide-react";
import Avatar from "@/components/shared/Avatar";

export default function ProfileEditPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    batch: "",
    bio: "",
    avatar_url: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const batchOptions = [
    "DecSync 2024 (Batch A)",
    "DecSync 2024 (Batch B)",
    "DecSync 2025 (Batch A)",
    "DecSync 2025 (Batch B)",
    "DecSync Alum",
  ];

  // Fetch current user details
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push("/auth/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          setFormData({
            name: profile.name || "",
            batch: profile.batch || "",
            bio: profile.bio || "",
            avatar_url: profile.avatar_url || "",
          });
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSubmitError("Please upload an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setSubmitError("Image file size must be less than 2MB.");
      return;
    }

    setIsUploading(true);
    setSubmitError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication session expired.");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
    } catch (err: any) {
      console.error("Upload error:", err);
      setSubmitError(err.message || "Failed to upload avatar image.");
    } finally {
      setIsUploading(false);
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.batch) tempErrors.batch = "Please select your batch";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication session expired.");

      // Update user details
      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: formData.name,
          batch: formData.batch,
          bio: formData.bio || null,
          avatar_url: formData.avatar_url || null,
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      router.push("/profile/me");
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Back Button */}
      <Link
        href="/profile/me"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <div className="premium-card rounded-3xl p-8 bg-white dark:bg-zinc-900 shadow-lg border border-zinc-150/80 dark:border-zinc-800/80">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-center sm:text-left mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              Edit Profile
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Update your personal cohort bio, cohort name, or profiles avatar links.
            </p>
          </div>

          {submitError && (
            <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
              {submitError}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <User className="h-4 w-4 text-zinc-400" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all font-semibold"
            />
            {errors.name && <p className="text-[10px] font-semibold text-red-500">{errors.name}</p>}
          </div>

          {/* Cohort Batch Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <GraduationCap className="h-4.5 w-4.5 text-zinc-400" />
              Cohort Batch
            </label>
            <select
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              disabled={isSaving}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all cursor-pointer"
            >
              <option value="" disabled>Select your batch</option>
              {batchOptions.map((opt) => (
                <option key={opt} value={opt} className="dark:bg-zinc-950">
                  {opt}
                </option>
              ))}
            </select>
            {errors.batch && <p className="text-[10px] font-semibold text-red-500">{errors.batch}</p>}
          </div>

          {/* Personal Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <FileText className="h-4 w-4 text-zinc-400" />
              Short Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              disabled={isSaving}
              placeholder="Tell the batch about your technical stacks, interests, or career objectives..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Profile Avatar upload & preview */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <ImageIcon className="h-4 w-4 text-zinc-400" />
              Profile Picture
            </label>
            
            <div className="flex items-center gap-4 p-4 border border-zinc-200 rounded-2xl bg-zinc-50/20 dark:border-zinc-800">
              <Avatar 
                name={formData.name || "Preview"} 
                src={formData.avatar_url} 
                size="lg" 
              />
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isSaving || isUploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 hover:border-primary text-zinc-650 hover:text-primary transition-all text-xs font-semibold cursor-pointer select-none dark:border-zinc-800 dark:text-zinc-300"
                  >
                    {isUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
                  </label>
                </div>
                <p className="text-[10px] text-zinc-400 font-semibold">
                  Supports JPG, PNG, GIF. Max 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500">
                Or paste direct Image URL
              </label>
              <input
                type="text"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                disabled={isSaving || isUploading}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* Submit Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-900 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
