"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, 
  FileText, 
  HelpCircle, 
  Rss, 
  TrendingUp,
  Megaphone,
  Clock,
  Loader2
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  type: string;
  created_at: string;
  expires_at: string | null;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  timestamp: number;
}

export default function RightPanel() {
  const supabase = createClient();

  // Dynamic States
  const [activeMembers, setActiveMembers] = useState(248);
  const [resourcesCount, setResourcesCount] = useState(1104);
  const [solvedCount, setSolvedCount] = useState(842);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Timeago helper
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;
    return "just now";
  };

  useEffect(() => {
    const fetchRightPanelData = async () => {
      try {
        // 1. Fetch Real Community Metrics
        // Total Users
        const { count: usersCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });
        if (usersCount) setActiveMembers(usersCount);

        // Total Resources Shared
        const { count: rCount } = await supabase
          .from("resources")
          .select("*", { count: "exact", head: true });
        if (rCount) setResourcesCount(rCount);

        // Total Solved Progress Problems
        const { count: sCount } = await supabase
          .from("dsa_progress")
          .select("*", { count: "exact", head: true })
          .eq("status", "solved");
        if (sCount) setSolvedCount(sCount);

        // 2. Fetch Latest Active Announcements (limit 3)
        const nowStr = new Date().toISOString();
        const { data: annData } = await supabase
          .from("announcements")
          .select("id, title, type, created_at, expires_at")
          .or(`expires_at.gt.${nowStr},expires_at.is.null`)
          .order("created_at", { ascending: false })
          .limit(3);
        
        if (annData) {
          setAnnouncements(annData as Announcement[]);
        }

        // 3. Fetch Unified Recent Activities
        // Parallel queries to fetch most recent records
        const [recentResources, recentBlogs, recentThreads] = await Promise.all([
          supabase
            .from("resources")
            .select("id, title, created_at, users(name)")
            .order("created_at", { ascending: false })
            .limit(2),
          supabase
            .from("blog_posts")
            .select("id, title, created_at, users(name)")
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .limit(2),
          supabase
            .from("forum_threads")
            .select("id, title, created_at, users(name)")
            .order("created_at", { ascending: false })
            .limit(2)
        ]);

        const merged: ActivityItem[] = [];

        if (recentResources.data) {
          recentResources.data.forEach((r) => {
            merged.push({
              id: r.id,
              user: (r.users as any)?.name || "Cohort Member",
              action: "uploaded notes on",
              target: r.title,
              time: formatTimeAgo(r.created_at),
              timestamp: new Date(r.created_at).getTime(),
            });
          });
        }

        if (recentBlogs.data) {
          recentBlogs.data.forEach((b) => {
            merged.push({
              id: b.id,
              user: (b.users as any)?.name || "Cohort Author",
              action: "published a blog",
              target: b.title,
              time: formatTimeAgo(b.created_at),
              timestamp: new Date(b.created_at).getTime(),
            });
          });
        }

        if (recentThreads.data) {
          recentThreads.data.forEach((t) => {
            merged.push({
              id: t.id,
              user: (t.users as any)?.name || "Cohort Member",
              action: "asked in discussions",
              target: t.title,
              time: formatTimeAgo(t.created_at),
              timestamp: new Date(t.created_at).getTime(),
            });
          });
        }

        // Sort by timestamp descending and take top 3
        setActivities(merged.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3));

      } catch (err) {
        console.error("RightPanel data fetching failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRightPanelData();
  }, [supabase]);

  // Visual categorization mapping
  const getAnnouncementBadgeColor = (type: string) => {
    switch (type) {
      case "placement":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400";
      case "internship":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";
      case "hackathon":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400";
      case "deadline":
        return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
      default:
        return "bg-zinc-150 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  // Stat items array
  const communityStats = [
    { label: "Active Members", value: activeMembers.toString(), icon: Users, change: "Cohort batch" },
    { label: "Resources Shared", value: resourcesCount.toString(), icon: FileText, change: "Shared files" },
    { label: "DSA Solutions", value: solvedCount.toString(), icon: HelpCircle, change: "Solved questions" },
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Community Stats Widget */}
      <div className="premium-card rounded-2xl p-5 border border-zinc-150/80 dark:border-zinc-800/80">
        <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Community Metrics</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {communityStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex items-center gap-4 border-b border-zinc-50 pb-3 last:border-0 last:pb-0 dark:border-zinc-850/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-850 dark:text-zinc-200">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-zinc-450 font-medium">
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-zinc-950 dark:text-white">
                      {stat.value}
                    </span>
                    <span className="text-[9px] font-bold text-green-500">
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Announcements Panel */}
      <div className="premium-card rounded-2xl p-5 border border-zinc-150/80 dark:border-zinc-800/80">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
            <Megaphone className="h-4 w-4 text-primary" />
            <span>Latest Announcements</span>
          </h3>
          <Link href="/announcements" className="text-[10px] font-bold text-primary hover:underline">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="flex py-6 justify-center">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-5 text-xs text-zinc-400 font-semibold">
            No active announcements.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {announcements.map((ann) => (
              <div 
                key={ann.id} 
                className="rounded-xl p-3 border border-zinc-100 bg-zinc-50/20 text-xs relative overflow-hidden transition-all hover:bg-zinc-50 dark:border-zinc-800/60 dark:bg-zinc-900/10 dark:hover:bg-zinc-850/50"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${getAnnouncementBadgeColor(ann.type)}`}>
                    {ann.type}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-semibold flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(ann.created_at)}
                  </span>
                </div>
                <p className="font-extrabold text-zinc-850 dark:text-zinc-200 line-clamp-2 leading-relaxed tracking-wide">
                  {ann.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unified Timeline / Activity Feed */}
      <div className="premium-card rounded-2xl p-5 border border-zinc-150/80 dark:border-zinc-800/80">
        <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5 mb-4">
          <Rss className="h-4 w-4 text-primary" />
          <span>Recent Activity</span>
        </h3>

        {isLoading ? (
          <div className="flex py-6 justify-center">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-5 text-xs text-zinc-400 font-semibold">
            No recent activity logged.
          </div>
        ) : (
          <div className="relative border-l border-zinc-100 dark:border-zinc-800 pl-4 space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="relative text-xs">
                {/* Dot decorator on vertical timeline */}
                <span className="absolute -left-[21px] top-1.5 flex h-2 w-2 rounded-full bg-primary ring-4 ring-white dark:ring-zinc-900" />
                
                <div className="mb-0.5">
                  <span className="font-extrabold text-zinc-900 dark:text-zinc-200 hover:text-primary transition-colors cursor-pointer">
                    {act.user}
                  </span>{" "}
                  <span className="text-zinc-550 dark:text-zinc-400">
                    {act.action}
                  </span>
                </div>
                <p className="font-semibold text-zinc-700 dark:text-zinc-350 leading-snug line-clamp-1">
                  {act.target}
                </p>
                <span className="text-[9px] text-zinc-450 mt-1 block font-bold">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
