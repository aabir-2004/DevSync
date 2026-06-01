"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Megaphone, 
  CheckCircle, 
  XCircle, 
  UserX, 
  UserCheck, 
  Plus, 
  Loader2,
  Calendar,
  Sparkles
} from "lucide-react";
import Avatar from "@/components/shared/Avatar";

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"reports" | "users" | "announcements">("reports");
  const [isLoading, setIsLoading] = useState(true);

  // States
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [annForm, setAnnForm] = useState({
    title: "",
    body: "",
    type: "general",
    expires_at: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const announcementTypes = [
    { value: "general", label: "General Announcement" },
    { value: "placement", label: "Placement Drive" },
    { value: "internship", label: "Internship Opening" },
    { value: "hackathon", label: "Hackathon Event" },
    { value: "event", label: "Cohort Meetup/Event" },
    { value: "deadline", label: "Submission Deadline" },
  ];

  // Verify Auth & Admin Role
  useEffect(() => {
    const verifyAdmin = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }

        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
          // Redirect unauthorized users back to home
          router.push("/");
          return;
        }

        setCurrentUser(profile);
        fetchDashboardData();
      } catch (err) {
        console.error("Error verifying admin details:", err);
      }
    };
    verifyAdmin();
  }, [router, supabase]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch pending reports
      const { data: reportData } = await supabase
        .from("reports")
        .select("*, users!reports_reporter_id_fkey(name)")
        .order("created_at", { ascending: false });
      
      setReports(reportData || []);

      // Fetch users list
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .order("name", { ascending: true });
      
      setUsers(userData || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Moderation Actions
  const handleResolveReport = async (reportId: string, status: "resolved" | "dismissed") => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status })
        .eq("id", reportId);
      
      if (error) throw error;
      
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status } : r));
    } catch (err) {
      console.error("Error updating report:", err);
    }
  };

  const handleUpdateUserRole = async (userId: string, currentRole: string, action: "promote" | "demote" | "ban" | "unban") => {
    let newRole = currentRole;
    if (action === "promote") newRole = "moderator";
    else if (action === "demote") newRole = "student";
    else if (action === "ban") newRole = "banned";
    else if (action === "unban") newRole = "student";

    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);
      
      if (error) throw error;

      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  };

  // Create Announcement
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!annForm.title.trim() || !annForm.body.trim()) {
      setError("Title and announcement body are required");
      return;
    }

    setIsSaving(true);
    try {
      const { error: insertError } = await supabase.from("announcements").insert({
        title: annForm.title,
        body: annForm.body,
        type: annForm.type,
        expires_at: annForm.expires_at ? new Date(annForm.expires_at).toISOString() : null,
        author_id: currentUser.id,
      });

      if (insertError) throw insertError;

      setSuccessMsg("Announcement published successfully!");
      setAnnForm({ title: "", body: "", type: "general", expires_at: "" });
    } catch (err: any) {
      setError(err.message || "Failed to publish announcement.");
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
    <div className="space-y-6">
      
      {/* Header Overview */}
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary flex items-center justify-center">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white">
            Moderator Portal
          </h2>
          <p className="text-[11px] text-zinc-400 font-medium">
            Manage reports queues, moderate cohort users, and write announcements.
          </p>
        </div>
      </div>

      {/* Tabs Menu Panel */}
      <div className="flex items-center gap-2 pb-2 border-b border-zinc-100/60 dark:border-zinc-800/40 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "reports"
              ? "bg-primary text-white border-primary"
              : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850"
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Report Queue ({reports.filter(r => r.status === 'pending').length})</span>
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "users"
              ? "bg-primary text-white border-primary"
              : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Moderation</span>
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "announcements"
              ? "bg-primary text-white border-primary"
              : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850"
          }`}
        >
          <Megaphone className="h-4 w-4" />
          <span>Write Announcement</span>
        </button>
      </div>

      {/* Tab Contents: Report Queue */}
      {activeTab === "reports" && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {reports.length === 0 ? (
            <div className="premium-card rounded-3xl p-10 text-center text-xs text-zinc-400">
              Clean state! No content has been flagged.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {reports.map((rep) => (
                <div key={rep.id} className="premium-card rounded-2xl p-5 border border-zinc-150/80 dark:border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-red-500 uppercase flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Reported {rep.target_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      rep.status === 'pending' 
                        ? 'bg-amber-100 text-amber-700' 
                        : rep.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {rep.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-800 dark:text-zinc-200 font-semibold leading-relaxed">
                    Reason: "{rep.reason}"
                  </p>
                  
                  <p className="text-[10px] text-zinc-400 font-medium">
                    Reporter: {rep.users?.name || "Anonymous student"} • Target Ref: {rep.target_id.slice(0,8)}...
                  </p>

                  {rep.status === "pending" && (
                    <div className="flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3 text-[10px] font-bold">
                      <button
                        onClick={() => handleResolveReport(rep.id, "dismissed")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Dismiss</span>
                      </button>
                      <button
                        onClick={() => handleResolveReport(rep.id, "resolved")}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 border border-green-100 dark:border-green-900/10 cursor-pointer"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Confirm & Resolve</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: User Moderation */}
      {activeTab === "users" && (
        <div className="premium-card rounded-3xl p-5 border border-zinc-150/80 dark:border-zinc-800/80 space-y-4 animate-in fade-in duration-150">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 pb-2 text-[10px] uppercase font-bold text-zinc-400">
                  <th className="py-2.5">Student</th>
                  <th>Cohort Batch</th>
                  <th>Role status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850">
                {users.map((u) => (
                  <tr key={u.id} className="align-middle">
                    <td className="py-3 flex items-center gap-2.5">
                      <Avatar name={u.name} src={u.avatar_url} size="xs" />
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">{u.name}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{u.email}</p>
                      </div>
                    </td>
                    <td className="font-semibold text-zinc-600 dark:text-zinc-400">
                      {u.batch || "DecSync Cohort"}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        u.role === 'admin' 
                          ? 'bg-primary-50 text-primary dark:bg-primary-950/20' 
                          : u.role === 'moderator'
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'
                          : u.role === 'banned'
                          ? 'bg-red-50 text-red-500 dark:bg-red-950/20'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-right py-3 space-x-1 text-[9px] font-bold">
                      {u.role === "student" && (
                        <button
                          onClick={() => handleUpdateUserRole(u.id, u.role, "promote")}
                          className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg dark:bg-blue-950/20 dark:text-blue-400 cursor-pointer"
                        >
                          Make Mod
                        </button>
                      )}
                      {u.role === "moderator" && (
                        <button
                          onClick={() => handleUpdateUserRole(u.id, u.role, "demote")}
                          className="px-2 py-1 border border-zinc-200 hover:bg-zinc-50 rounded-lg dark:border-zinc-800 dark:hover:bg-zinc-850 cursor-pointer"
                        >
                          Demote
                        </button>
                      )}
                      {u.role !== "banned" && u.role !== "admin" && (
                        <button
                          onClick={() => handleUpdateUserRole(u.id, u.role, "ban")}
                          className="px-2 py-1 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg dark:bg-red-950/20 dark:text-red-450 cursor-pointer"
                        >
                          Ban User
                        </button>
                      )}
                      {u.role === "banned" && (
                        <button
                          onClick={() => handleUpdateUserRole(u.id, u.role, "unban")}
                          className="px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg dark:bg-green-950/20 dark:text-green-400 cursor-pointer"
                        >
                          Unban
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Contents: Write Announcement */}
      {activeTab === "announcements" && (
        <div className="premium-card rounded-3xl p-8 bg-white dark:bg-zinc-900 border border-zinc-150/80 dark:border-zinc-800/80 max-w-lg animate-in fade-in duration-150">
          <form onSubmit={handleAnnouncementSubmit} className="space-y-5">
            <div className="text-center sm:text-left mb-6">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                Publish Announcement
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                This will trigger a notification and pin an alert across dashboard feeds.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl bg-green-50 p-3.5 text-xs font-semibold text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-100 dark:border-green-900/10">
                {successMsg}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Announcement Title
              </label>
              <input
                type="text"
                value={annForm.title}
                onChange={(e) => setAnnForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Meta SDE-1 Offcampus Drive Registration"
                disabled={isSaving}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all font-semibold"
              />
            </div>

            {/* Announcement Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Event Type
              </label>
              <select
                value={annForm.type}
                onChange={(e) => setAnnForm(prev => ({ ...prev, type: e.target.value }))}
                disabled={isSaving}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all cursor-pointer"
              >
                {announcementTypes.map((type) => (
                  <option key={type.value} value={type.value} className="dark:bg-zinc-950">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Expires At Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <Calendar className="h-4 w-4 text-zinc-400" />
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={annForm.expires_at}
                onChange={(e) => setAnnForm(prev => ({ ...prev, expires_at: e.target.value }))}
                disabled={isSaving}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all cursor-pointer"
              />
            </div>

            {/* Announcement Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Detailed Body
              </label>
              <textarea
                value={annForm.body}
                onChange={(e) => setAnnForm(prev => ({ ...prev, body: e.target.value }))}
                rows={5}
                disabled={isSaving}
                placeholder="Compose detailed message info here. E.g. registration links, criteria, timelines..."
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-900 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Publish Alert</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
