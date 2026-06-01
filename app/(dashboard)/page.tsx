"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Trophy, 
  Sparkles, 
  Megaphone, 
  ChevronRight, 
  TrendingUp, 
  ArrowRight,
  Star,
  Compass,
  Loader2
} from "lucide-react";
import Link from "next/link";
import Tag from "@/components/shared/Tag";
import Avatar from "@/components/shared/Avatar";

interface FeaturedItem {
  id: string;
  title: string;
  type: "blog" | "resource";
  author: string;
  upvotes: number;
  category: string;
  link: string;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  type: string;
  expires_at: string | null;
}

export default function HomeDashboard() {
  const supabase = createClient();
  const [userName, setUserName] = useState<string>("Developer");
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch session user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("users")
            .select("name")
            .eq("id", user.id)
            .single();
          if (profile?.name) {
            setUserName(profile.name.split(" ")[0]);
          }
        }

        // Fetch latest active announcement
        const now = new Date().toISOString();
        const { data: annData } = await supabase
          .from("announcements")
          .select("*")
          .or(`expires_at.gt.${now},expires_at.is.null`)
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (annData && annData.length > 0) {
          setAnnouncement(annData[0]);
        }

        // Fetch top upvoted resources
        const { data: resources } = await supabase
          .from("resources")
          .select("*, users(name)")
          .order("upvotes", { ascending: false })
          .limit(2);

        // Fetch top upvoted blog posts
        const { data: blogs } = await supabase
          .from("blog_posts")
          .select("*, users(name)")
          .eq("status", "published")
          .order("upvotes", { ascending: false })
          .limit(2);

        // Merge and sort in memory
        const items: FeaturedItem[] = [];
        if (resources) {
          resources.forEach((r) => {
            items.push({
              id: r.id,
              title: r.title,
              type: "resource",
              author: r.users?.name || "Cohort Member",
              upvotes: r.upvotes,
              category: r.category,
              link: `/resources`,
              created_at: r.created_at,
            });
          });
        }
        if (blogs) {
          blogs.forEach((b) => {
            items.push({
              id: b.id,
              title: b.title,
              type: "blog",
              author: b.users?.name || "Cohort Author",
              upvotes: b.upvotes,
              category: b.tags?.[0] || "Tech",
              link: `/blogs/${b.slug}`,
              created_at: b.created_at,
            });
          });
        }

        setFeaturedItems(items.sort((a, b) => b.upvotes - a.upvotes).slice(0, 3));
      } catch (err) {
        console.error("Error loading dashboard content:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [supabase]);

  // Visual Category Card Config
  const categories = [
    {
      title: "Notes & Resources",
      desc: "Find and share lecture notes, books & materials.",
      href: "/resources",
      icon: BookOpen,
      color: "border-orange-500/25 bg-orange-50/5 dark:bg-orange-950/5 hover:border-orange-500 hover:shadow-orange-500/5",
      iconColor: "text-orange-500 bg-orange-50 dark:bg-orange-950/20"
    },
    {
      title: "Technical Blogs",
      desc: "Read student write-ups & engineering deep-dives.",
      href: "/blogs",
      icon: FileText,
      color: "border-blue-500/25 bg-blue-50/5 dark:bg-blue-950/5 hover:border-blue-500 hover:shadow-blue-500/5",
      iconColor: "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Discussions Board",
      desc: "Ask questions, clear doubts & talk placement prep.",
      href: "/forums",
      icon: MessageSquare,
      color: "border-purple-500/25 bg-purple-50/5 dark:bg-purple-950/5 hover:border-purple-500 hover:shadow-purple-500/5",
      iconColor: "text-purple-500 bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "DSA progression",
      desc: "Curated batch sheets, tracking & challenges.",
      href: "/dsa",
      icon: Trophy,
      color: "border-green-500/25 bg-green-50/5 dark:bg-green-950/5 hover:border-green-500 hover:shadow-green-500/5",
      iconColor: "text-green-500 bg-green-50 dark:bg-green-950/20"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Urgent Announcement Banner */}
      {announcement && (
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 dark:border-red-900/30 dark:bg-red-950/10 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="h-8 w-8 shrink-0 rounded-xl bg-red-500 text-white flex items-center justify-center animate-pulse">
            <Megaphone className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
              <span className="font-black text-red-500 uppercase tracking-widest text-[9px]">
                Urgent Cohort Update
              </span>
              <Link 
                href="/announcements" 
                className="font-bold text-red-500 hover:underline flex items-center gap-0.5 text-[9px] uppercase"
              >
                <span>Read Board</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <h4 className="font-extrabold text-zinc-900 dark:text-white leading-snug">
              {announcement.title}
            </h4>
            <p className="text-zinc-650 dark:text-zinc-400 mt-1 line-clamp-1">
              {announcement.body}
            </p>
          </div>
        </div>
      )}

      {/* Hero Welcome banner */}
      <div className="premium-card rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-center min-h-[160px] border border-zinc-150/80 dark:border-zinc-800/80 bg-linear-to-br from-white to-zinc-50/30 dark:from-zinc-950 dark:to-black">
        {/* Glow vector shapes */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary-100/40 blur-3xl dark:bg-primary-950/20" />
        <div className="absolute -bottom-8 -left-10 h-28 w-28 rounded-full bg-orange-200/20 blur-3xl dark:bg-orange-950/10" />

        <div className="relative space-y-2.5 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/20 border border-primary-100/50 dark:border-primary-900/10 text-[10px] font-black text-primary uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 fill-primary-400 animate-pulse" />
            <span>DevSync batch portal</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-zinc-950 dark:text-white tracking-tight leading-none">
            Hello, <span className="text-primary">{userName}</span>!
          </h1>
          
          <p className="text-xs md:text-sm text-zinc-450 dark:text-zinc-400 font-semibold max-w-md leading-relaxed">
            Welcome to the collaborative cohort workspace. Learn. Share. <span className="text-zinc-700 dark:text-zinc-300 font-black font-mono">{`{`} Grow Together {`}`}</span>. Explore resources or check active problem sheets.
          </p>
        </div>
      </div>

      {/* Category Shortcut Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
          <Compass className="h-4 w-4 text-primary" />
          <span>Explore Workspace</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={i} 
                href={cat.href}
                className={`premium-card rounded-2xl p-5 border flex items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${cat.color}`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${cat.iconColor} shadow-inner`}>
                  <Icon className="h-5.5 w-5.5" />
                </div>
                <div className="space-y-1 mt-0.5">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-white tracking-wide uppercase">
                    {cat.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Highlights Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Top Cohort Activity</span>
        </h3>

        {isLoading ? (
          <div className="flex h-20 items-center justify-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="premium-card rounded-2xl p-6 text-center text-xs text-zinc-400 font-bold border border-zinc-150/80 dark:border-zinc-800/80">
            No active content highlights found. Be the first to contribute notes or write a blog post!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {featuredItems.map((item) => (
              <Link 
                key={item.id} 
                href={item.link}
                className="premium-card rounded-2xl p-4 border border-zinc-150/80 dark:border-zinc-800/80 flex items-center justify-between gap-4 hover:border-primary/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    item.type === "blog" 
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400" 
                      : "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400"
                  }`}>
                    {item.type === "blog" ? <FileText className="h-4.5 w-4.5" /> : <BookOpen className="h-4.5 w-4.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-wider ${
                        item.type === "blog" ? "text-blue-500" : "text-orange-500"
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-zinc-400">• By {item.author}</span>
                    </div>
                    <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white leading-tight mt-0.5 line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-450">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                    <span>{item.upvotes}</span>
                  </span>
                  <div className="h-7 w-7 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
