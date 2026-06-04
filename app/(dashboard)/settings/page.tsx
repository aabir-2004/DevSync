"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Settings, 
  User, 
  GraduationCap, 
  FileText, 
  Calendar, 
  LogOut, 
  Save, 
  Loader2, 
  Sparkles,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("");
  const [bio, setBio] = useState("");
  const [alertIgnoreDate, setAlertIgnoreDate] = useState("");
  
  // Messaging
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const batchOptions = [
    "DecSync 2024 (Batch A)",
    "DecSync 2024 (Batch B)",
    "DecSync 2025 (Batch A)",
    "DecSync 2025 (Batch B)",
    "DecSync Alum",
  ];

  useEffect(() => {
    const loadUserSettings = async () => {
      setIsLoading(true);
      try {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr || !user) {
          router.push("/auth/login");
          return;
        }

        // Load profile from database
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setName(profile.name || "");
          setBatch(profile.batch || "");
          setBio(profile.bio || "");
          
          // Format alert_ignore_date for date picker (YYYY-MM-DD)
          if (profile.alert_ignore_date) {
            const dateObj = new Date(profile.alert_ignore_date);
            const formatted = dateObj.toISOString().split("T")[0];
            setAlertIgnoreDate(formatted);
          } else {
            // Check local storage fallback
            const localDate = localStorage.getItem("devsync:alert_ignore_date");
            if (localDate) {
              setAlertIgnoreDate(localDate.split("T")[0]);
            }
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [supabase, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Auth session expired.");

      const ignoreDateISO = alertIgnoreDate 
        ? new Date(alertIgnoreDate).toISOString() 
        : null;

      // Update database
      const { error: updateErr } = await supabase
        .from("users")
        .update({
          name,
          batch: batch || null,
          bio: bio || null,
          alert_ignore_date: ignoreDateISO
        })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      // Save to local storage as well for instant client-side accessibility
      if (alertIgnoreDate) {
        localStorage.setItem("devsync:alert_ignore_date", ignoreDateISO || "");
      } else {
        localStorage.removeItem("devsync:alert_ignore_date");
      }

      setSuccess("Settings updated successfully!");
      router.refresh();
    } catch (err: any) {
      console.error("Error updating settings:", err);
      setError(err.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogOut = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("devsync:alert_ignore_date");
      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      console.error("Failed to sign out:", err);
      setIsLoggingOut(false);
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
      
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 bg-primary-50 text-primary flex items-center justify-center border-2 border-primary-100 shadow-inner">
          <Settings className="h-5.5 w-5.5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white">
            Settings
          </h2>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
            Configure your cohort profile, notification thresholds, and account preferences.
          </p>
        </div>
      </div>

      <div className="premium-card rounded-3xl p-8 bg-white dark:bg-zinc-900 shadow-lg border border-zinc-150/80 dark:border-zinc-800/80 space-y-6">
        
        {/* Messages */}
        {error && (
          <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="rounded-2xl bg-green-50 p-4 border border-green-100 flex items-start gap-3 text-xs font-semibold text-green-700 dark:bg-green-950/20 dark:text-green-400">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-pixel text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Cohort Profile Settings</span>
            </h3>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <User className="h-4 w-4 text-zinc-400" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              placeholder="e.g. Aabir Chakraborty"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all font-semibold"
            />
          </div>

          {/* Batch Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <GraduationCap className="h-4.5 w-4.5 text-zinc-400" />
              Cohort Batch
            </label>
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              disabled={isSaving}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all cursor-pointer"
            >
              <option value="">Select your batch</option>
              {batchOptions.map((opt) => (
                <option key={opt} value={opt} className="dark:bg-zinc-950">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Short Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <FileText className="h-4 w-4 text-zinc-400" />
              Short Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              disabled={isSaving}
              placeholder="Tell the batch about yourself..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all resize-none leading-relaxed"
            />
          </div>

          <div className="pt-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-pixel text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Announcements Preferences</span>
            </h3>
          </div>

          {/* Expiry / Ignored Date Threshold */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Ignore Announcements Older Than Date
            </label>
            <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed">
              After this date threshold, older announcements/alerts will be ignored and hidden by default. You can still access them by checking "Include Expired Alerts" on the announcements board.
            </p>
            <input
              type="date"
              value={alertIgnoreDate}
              onChange={(e) => setAlertIgnoreDate(e.target.value)}
              disabled={isSaving}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all cursor-pointer"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-900 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4" />

        {/* Account Prefs Section: Log Out */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200">
                Log Out of Account
              </h4>
              <p className="text-[10px] text-zinc-400 font-semibold">
                Sign out of your active cohort browser session.
              </p>
            </div>
            
            <button
              onClick={handleLogOut}
              disabled={isLoggingOut}
              className="flex items-center gap-1 px-4 py-2 border-2 border-red-200 hover:border-red-500 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>Log Out</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
