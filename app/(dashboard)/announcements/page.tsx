"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Megaphone, 
  Calendar, 
  Briefcase, 
  Trophy, 
  Sparkles, 
  Clock, 
  ShieldAlert, 
  Search,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Tag from "@/components/shared/Tag";

interface Announcement {
  id: string;
  title: string;
  body: string;
  type: "placement" | "internship" | "hackathon" | "event" | "deadline" | "general";
  expires_at: string | null;
  created_at: string;
  users?: {
    name: string;
  } | null;
}

export default function AnnouncementsPage() {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOrMod, setIsAdminOrMod] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  // Fetch announcements & user role
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get user role
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();
          
          if (profile && (profile.role === "admin" || profile.role === "moderator")) {
            setIsAdminOrMod(true);
          }
        }

        // Fetch announcements
        const { data, error } = await supabase
          .from("announcements")
          .select("*, users(name)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAnnouncements((data as Announcement[]) || []);
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [supabase]);

  // Apply filters
  useEffect(() => {
    const now = new Date();
    let result = announcements;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (selectedType !== "all") {
      result = result.filter((a) => a.type === selectedType);
    }

    // Archived (expired) filter
    result = result.filter((a) => {
      const isExpired = a.expires_at ? new Date(a.expires_at) < now : false;
      return showArchived ? true : !isExpired;
    });

    setFilteredAnnouncements(result);
  }, [announcements, searchQuery, selectedType, showArchived]);

  // Helper to format announcement type badges
  const getAnnouncementTypeDetails = (type: string) => {
    switch (type) {
      case "placement":
        return { label: "Placement Drive", variant: "primary" as const, icon: Briefcase, color: "text-orange-500 bg-orange-50 dark:bg-orange-950/20" };
      case "internship":
        return { label: "Internship Opening", variant: "info" as const, icon: Sparkles, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20" };
      case "hackathon":
        return { label: "Hackathon Event", variant: "success" as const, icon: Trophy, color: "text-green-500 bg-green-50 dark:bg-green-950/20" };
      case "deadline":
        return { label: "Submission Deadline", variant: "warning" as const, icon: Clock, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20" };
      case "event":
        return { label: "Cohort Meetup", variant: "success" as const, icon: Calendar, color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20" };
      default:
        return { label: "General", variant: "neutral" as const, icon: Megaphone, color: "text-zinc-500 bg-zinc-50 dark:bg-zinc-800" };
    }
  };

  const isAnnouncementExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Upper Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary flex items-center justify-center shadow-inner">
            <Megaphone className="h-5.5 w-5.5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
              Cohort Announcements
            </h2>
            <p className="text-xs text-zinc-400 font-semibold mt-0.5">
              Stay updated with deadlines, job listings, placements, and cohort events.
            </p>
          </div>
        </div>

        {isAdminOrMod && (
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-900 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Moderator Dashboard</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Filters and Search Panel */}
      <div className="premium-card rounded-2xl p-4 border border-zinc-150/80 dark:border-zinc-800/80 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
        {/* Search */}
        <div className="relative md:col-span-5 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all font-semibold"
          />
        </div>

        {/* Type Select */}
        <div className="relative md:col-span-4 w-full">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all cursor-pointer"
          >
            <option value="all">All Announcement Categories</option>
            <option value="placement">Placement Drive</option>
            <option value="internship">Internship Opening</option>
            <option value="hackathon">Hackathon Event</option>
            <option value="deadline">Submission Deadline</option>
            <option value="event">Cohort Meetup/Event</option>
            <option value="general">General Alerts</option>
          </select>
        </div>

        {/* Archive Toggle */}
        <div className="md:col-span-3 flex justify-start md:justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-600 dark:text-zinc-400 select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="rounded text-primary focus:ring-primary h-4 w-4 border-zinc-200 dark:border-zinc-800 accent-primary cursor-pointer"
            />
            <span>Include Expired Alerts</span>
          </label>
        </div>
      </div>

      {/* Main Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="premium-card rounded-2xl p-5 border border-zinc-150/80 dark:border-zinc-800/80 animate-pulse space-y-3">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="premium-card rounded-3xl p-12 text-center border border-zinc-150/80 dark:border-zinc-800/80">
          <Megaphone className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            No announcements found
          </h3>
          <p className="text-xs text-zinc-400 font-semibold max-w-sm mx-auto">
            Try adjusting your search criteria, switching categories, or togglingexpired alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => {
            const isExpired = isAnnouncementExpired(ann.expires_at);
            const { label, variant, icon: Icon, color } = getAnnouncementTypeDetails(ann.type);
            const dateStr = new Date(ann.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const expDateStr = ann.expires_at 
              ? new Date(ann.expires_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;

            return (
              <div 
                key={ann.id} 
                className={`premium-card rounded-2xl p-5 border transition-all relative overflow-hidden flex flex-col md:flex-row md:items-start gap-4 ${
                  isExpired 
                    ? "bg-zinc-50/40 border-zinc-200 dark:bg-zinc-950/20 dark:border-zinc-850 opacity-75 hover:opacity-100" 
                    : "border-zinc-150/80 dark:border-zinc-800/80"
                }`}
              >
                {/* Visual Category Accent Pin */}
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color} shadow-sm`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    {/* Tags */}
                    <div className="flex items-center gap-2">
                      <Tag label={label} variant={variant} size="xs" />
                      {isExpired && (
                        <span className="bg-red-50 text-red-600 dark:bg-red-950/25 dark:text-red-400 border border-red-100 dark:border-red-900/10 px-2 py-0.5 rounded-full text-[9px] font-bold">
                          EXPIRED
                        </span>
                      )}
                    </div>
                    {/* Timestamp */}
                    <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-wide">
                    {ann.title}
                  </h3>

                  {/* Body description */}
                  <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium whitespace-pre-wrap">
                    {ann.body}
                  </p>

                  {/* Footer details */}
                  <div className="flex flex-wrap items-center justify-between border-t border-zinc-50 dark:border-zinc-850/50 pt-2.5 mt-2.5 text-[10px] font-bold text-zinc-400 gap-2">
                    <span className="flex items-center gap-1.5">
                      <span>Posted by:</span>
                      <span className="text-zinc-700 dark:text-zinc-300 font-extrabold">{ann.users?.name || "Cohort Organizer"}</span>
                    </span>

                    {expDateStr && (
                      <span className={`flex items-center gap-1 ${isExpired ? "text-red-500" : "text-zinc-500 dark:text-zinc-450"}`}>
                        <Clock className="h-3.5 w-3.5" />
                        <span>Deadline / Expiry: {expDateStr}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
