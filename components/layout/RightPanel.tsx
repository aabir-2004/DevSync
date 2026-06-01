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
        const { count: usersCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });
        if (usersCount) setActiveMembers(usersCount);

        const { count: rCount } = await supabase
          .from("resources")
          .select("*", { count: "exact", head: true });
        if (rCount) setResourcesCount(rCount);

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
        return "bg-orange-100 text-orange-700";
      case "internship":
        return "bg-blue-100 text-blue-700";
      case "hackathon":
        return "bg-purple-100 text-purple-700";
      case "deadline":
        return "bg-red-100 text-red-700";
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  };

  // Stat items array
  const communityStats = [
    { label: "Members", value: activeMembers.toString(), icon: Users },
    { label: "Resources", value: resourcesCount.toString(), icon: FileText },
    { label: "DSA Solved", value: solvedCount.toString(), icon: HelpCircle },
  ];

  return (
    <div className="flex flex-col gap-5">
      
      {/* Community Stats Widget */}
      <div className="pixel-card p-4">
        <h3 className="font-pixel text-[8px] text-zinc-700 uppercase flex items-center gap-1.5 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Community Stats</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {communityStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex items-center gap-3 border-b-2 border-dashed border-zinc-100 pb-3 last:border-0 last:pb-0">
                <div className="flex h-9 w-9 items-center justify-center bg-zinc-100 border border-zinc-200">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <span className="font-pixel text-sm text-zinc-900">
                    {stat.value}
                  </span>
                  <p className="text-[10px] text-zinc-400 font-semibold">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Announcements Panel */}
      <div className="pixel-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-pixel text-[8px] text-zinc-700 uppercase flex items-center gap-1.5">
            <Megaphone className="h-4 w-4 text-primary" />
            <span>Announcements</span>
          </h3>
          <Link href="/announcements" className="text-[10px] font-bold text-primary hover:underline">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex py-5 justify-center">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-4 text-[10px] text-zinc-400 font-pixel">
            No announcements.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {announcements.map((ann) => (
              <div 
                key={ann.id} 
                className="p-2.5 border-2 border-zinc-100 text-xs relative overflow-hidden transition-all hover:border-primary-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase ${getAnnouncementBadgeColor(ann.type)}`}>
                    {ann.type}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-semibold flex items-center gap-0.5">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(ann.created_at)}
                  </span>
                </div>
                <p className="font-bold text-zinc-800 line-clamp-2 leading-relaxed">
                  {ann.title}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="pixel-card p-4">
        <h3 className="font-pixel text-[8px] text-zinc-700 uppercase flex items-center gap-1.5 mb-3">
          <Rss className="h-4 w-4 text-primary" />
          <span>Recent Activity</span>
        </h3>

        {isLoading ? (
          <div className="flex py-5 justify-center">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-4 text-[10px] text-zinc-400 font-pixel">
            No activity yet.
          </div>
        ) : (
          <div className="relative border-l-2 border-zinc-200 pl-3 space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="relative text-xs">
                {/* Pixel dot on timeline */}
                <span className="absolute -left-[17px] top-1 flex h-2.5 w-2.5 bg-primary border-2 border-white" />
                
                <div className="mb-0.5">
                  <span className="font-bold text-zinc-900 hover:text-primary transition-colors cursor-pointer">
                    {act.user}
                  </span>{" "}
                  <span className="text-zinc-500">
                    {act.action}
                  </span>
                </div>
                <p className="font-semibold text-zinc-600 leading-snug line-clamp-1">
                  {act.target}
                </p>
                <span className="text-[9px] text-zinc-400 mt-0.5 block font-bold">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/search"
          className="mt-3 flex w-full items-center justify-center border-2 border-dashed border-zinc-300 hover:border-primary py-1.5 text-[10px] font-semibold text-zinc-500 hover:text-primary transition-all"
        >
          View all activity →
        </Link>
      </div>
    </div>
  );
}
