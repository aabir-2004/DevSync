"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Home, 
  User, 
  Bookmark, 
  Award, 
  Settings, 
  ChevronRight, 
  Flame, 
  Trophy,
  Activity
} from "lucide-react";

interface Contributor {
  name: string;
  reputation: number;
  avatar: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  const [solvedCount, setSolvedCount] = useState(0);
  const [totalProblems, setTotalProblems] = useState(0);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const sidebarLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/profile/me", label: "My Profile", icon: User },
    { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    { href: "/contributions", label: "My Contributions", icon: Award },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  // Fetch real statistics & leaderboard
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        // Fetch user session details
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Get user solved DSA problems count
          const { count: solved } = await supabase
            .from("dsa_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "solved");
          
          if (solved !== null) setSolvedCount(solved);
        }

        // Get total DSA problems count
        const { count: total } = await supabase
          .from("dsa_problems")
          .select("*", { count: "exact", head: true });
        
        if (total !== null) setTotalProblems(total);

        // Fetch top 5 contributors based on reputation points
        const { data: usersData } = await supabase
          .from("users")
          .select("name, reputation")
          .order("reputation", { ascending: false })
          .limit(5);

        if (usersData) {
          const parsed = usersData.map((u) => {
            const initials = u.name
              ? u.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U";
            return {
              name: u.name,
              reputation: u.reputation,
              avatar: initials
            };
          });
          setContributors(parsed);
        }
      } catch (err) {
        console.error("Sidebar data loading failed:", err);
      }
    };
    fetchSidebarData();
  }, [supabase]);

  // Fallbacks for progress details
  const solved = solvedCount;
  const total = totalProblems || 5;
  const progressPercent = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <aside className="flex flex-col gap-5">
      {/* Navigation Card */}
      <div className="pixel-card p-3">
        <nav className="flex flex-col gap-0.5">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary-50 text-primary border-l-3 border-primary"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-zinc-400"}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Weekly Challenge widget */}
      <div className="pixel-card p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-pixel text-[8px] text-zinc-700 uppercase flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>Weekly Challenge</span>
          </h3>
          <span className="text-[10px] font-bold text-primary bg-primary-50 px-2 py-0.5 border border-primary-100">
            Active
          </span>
        </div>

        <p className="text-sm font-bold text-zinc-900 mb-1">
          Batch DSA Sheets
        </p>
        <p className="text-xs text-zinc-500 mb-4">
          Solve curated problems to grow ranking.
        </p>

        {/* Pixel Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-zinc-500">Progress</span>
            <span className="text-zinc-900 font-bold">
              {solved}/{total} Solved
            </span>
          </div>
          <div className="h-3 w-full bg-zinc-100 border-2 border-zinc-200 overflow-hidden">
            <div 
              className="h-full pixel-progress-bar transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Start Solving CTA */}
        <Link
          href="/dsa"
          className="pixel-btn pixel-btn-primary w-full text-[8px]"
        >
          Start Solving
        </Link>
      </div>

      {/* Leaderboard widget */}
      {contributors.length > 0 && (
        <div className="pixel-card p-4">
          <h3 className="font-pixel text-[8px] text-zinc-700 uppercase flex items-center gap-1.5 mb-3">
            <Trophy className="h-4 w-4 text-primary" />
            <span>Top Contributors</span>
          </h3>

          <div className="flex flex-col gap-2.5">
            {contributors.map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-pixel text-zinc-400 w-4">{index + 1}</span>
                  <div className="flex h-7 w-7 items-center justify-center bg-primary-50 text-primary text-[10px] font-bold border border-primary-100">
                    {user.avatar}
                  </div>
                  <p className="text-xs font-semibold text-zinc-900 line-clamp-1 max-w-[100px]">
                    {user.name}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary">
                  {user.reputation} XP
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/profile/me"
            className="mt-3 flex w-full items-center justify-center border-2 border-dashed border-zinc-300 hover:border-primary py-2 text-xs font-semibold text-zinc-500 hover:text-primary transition-all"
          >
            View Leaderboard →
          </Link>
        </div>
      )}
    </aside>
  );
}
