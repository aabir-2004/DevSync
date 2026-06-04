"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Trophy, 
  Megaphone, 
  ChevronRight, 
  TrendingUp, 
  ArrowRight,
  Star,
  Compass,
  Loader2
} from "lucide-react";
import Link from "next/link";
import PixelCharacter from "@/components/shared/PixelCharacter";

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
  const [counts, setCounts] = useState({
    resources: 0,
    blogs: 0,
    threads: 0,
    dsa: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch session user
        const { data: { user } } = await supabase.auth.getUser();
        let ignoreDate: string | null = null;
        if (user) {
          const { data: profile } = await supabase
            .from("users")
            .select("name, alert_ignore_date")
            .eq("id", user.id)
            .single();
          if (profile?.name) {
            setUserName(profile.name.split(" ")[0]);
          }
          if (profile?.alert_ignore_date) {
            ignoreDate = profile.alert_ignore_date;
          }
        }

        // Check local storage fallback
        const localDate = localStorage.getItem("devsync:alert_ignore_date");
        if (localDate) {
          ignoreDate = localDate;
        }

        // Fetch counts for categories
        const [resCount, blogCount, threadCount, dsaCount] = await Promise.all([
          supabase.from("resources").select("*", { count: "exact", head: true }),
          supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "published"),
          supabase.from("forum_threads").select("*", { count: "exact", head: true }),
          supabase.from("dsa_problems").select("*", { count: "exact", head: true })
        ]);

        setCounts({
          resources: resCount.count || 0,
          blogs: blogCount.count || 0,
          threads: threadCount.count || 0,
          dsa: dsaCount.count || 0
        });

        // Fetch latest active announcement
        const now = new Date().toISOString();
        let annQuery = supabase
          .from("announcements")
          .select("*")
          .or(`expires_at.gt.${now},expires_at.is.null`);

        if (ignoreDate) {
          annQuery = annQuery.gt("created_at", ignoreDate);
        }

        const { data: annData } = await annQuery
          .order("created_at", { ascending: false })
          .limit(1);
        
        if (annData && annData.length > 0) {
          setAnnouncement(annData[0]);
        } else {
          setAnnouncement(null);
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
      title: "Resources",
      desc: "Notes, PDFs, roadmaps, interview prep and more.",
      href: "/resources",
      icon: BookOpen,
      stat: `${counts.resources} item${counts.resources === 1 ? "" : "s"}`,
      statColor: "text-orange-600",
    },
    {
      title: "Blogs",
      desc: "Write technical articles, share projects and experiences.",
      href: "/blogs",
      icon: FileText,
      stat: `${counts.blogs} post${counts.blogs === 1 ? "" : "s"}`,
      statColor: "text-orange-600",
    },
    {
      title: "Discussions",
      desc: "Ask questions, debate ideas, and help each other learn.",
      href: "/forums",
      icon: MessageSquare,
      stat: `${counts.threads} thread${counts.threads === 1 ? "" : "s"}`,
      statColor: "text-orange-600",
    },
    {
      title: "DSA",
      desc: "Curated problem lists, roadmaps and solutions.",
      href: "/dsa",
      icon: Trophy,
      stat: `${counts.dsa} problem${counts.dsa === 1 ? "" : "s"}`,
      statColor: "text-orange-600",
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Dynamic Urgent Announcement Banner */}
      {announcement && (
        <div className="pixel-card p-3.5 border-primary bg-primary-50/40 flex items-start gap-3">
          <div className="h-8 w-8 shrink-0 bg-primary text-white flex items-center justify-center">
            <Megaphone className="h-4 w-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-1 mb-1">
              <span className="font-pixel text-[7px] text-primary uppercase tracking-widest">
                Announcement
              </span>
              <Link 
                href="/announcements" 
                className="font-bold text-primary hover:underline flex items-center gap-0.5 text-[9px]"
              >
                <span>View details</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <h4 className="font-bold text-zinc-900 leading-snug">
              {announcement.title}
            </h4>
            <p className="text-zinc-500 mt-0.5 line-clamp-1">
              {announcement.body}
            </p>
          </div>
        </div>
      )}

      {/* ═══ PIXEL ART HERO BANNER ═══ */}
      <div className="pixel-card p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Left Content */}
          <div className="flex-1 space-y-4 z-10">
            <p className="text-[10px] font-pixel text-primary uppercase tracking-wider">Welcome back, {userName}!</p>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-tight">
              Learn. Share.{" "}
              <span className="text-primary font-pixel text-lg md:text-xl">Grow Together.</span>
            </h1>
            
            <p className="text-sm text-zinc-500 font-medium max-w-md leading-relaxed">
              A collaborative learning space for the DevSync batch.
              Share resources, write blogs, discuss ideas,
              and grow together.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <Link href="/resources" className="pixel-btn pixel-btn-primary text-[8px]">
                Enter Community
              </Link>
              <Link href="/resources" className="pixel-btn pixel-btn-outline text-[8px]">
                Browse Resources
              </Link>
            </div>
          </div>

          {/* Right: Pixel Art Scene */}
          <div className="relative flex-shrink-0 w-64 h-40 md:w-72 md:h-44">
            {/* Pixel terrain hills */}
            <div className="absolute bottom-0 left-0 right-0">
              {/* Hill 1 - left */}
              <div className="absolute bottom-0 left-2 w-16 h-8 bg-zinc-300" />
              <div className="absolute bottom-8 left-4 w-12 h-4 bg-zinc-300" />
              <div className="absolute bottom-12 left-6 w-8 h-4 bg-zinc-400" />
              
              {/* Ground */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-zinc-200 border-t-2 border-zinc-300" />
              
              {/* Hill 2 - center-right (taller) */}
              <div className="absolute bottom-4 right-8 w-20 h-12 bg-zinc-300" />
              <div className="absolute bottom-16 right-10 w-16 h-6 bg-zinc-400" />
              <div className="absolute bottom-22 right-12 w-12 h-4 bg-zinc-500" />
              <div className="absolute bottom-26 right-14 w-8 h-4 bg-zinc-500" />
              
              {/* Pixel flag on top of right hill */}
              <div className="absolute bottom-30 right-16 w-0.5 h-10 bg-zinc-700" />
              <div className="absolute bottom-36 right-12 w-6 h-4 bg-primary" />
              
              {/* Small blocks / details */}
              <div className="absolute bottom-4 left-24 w-4 h-4 bg-zinc-200 border border-zinc-300" />
              <div className="absolute bottom-4 left-32 w-3 h-3 bg-zinc-200 border border-zinc-300" />
            </div>

            {/* Interactive Pixel Characters */}
            <div className="absolute bottom-6 left-20">
              <PixelCharacter size={40} />
            </div>
            <div className="absolute bottom-16 right-24">
              <PixelCharacter size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Shortcut Grid — "Explore by Category" */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-pixel text-[8px] text-zinc-700 uppercase flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-primary" />
            <span>Explore by Category</span>
          </h3>
          <Link href="/search" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={i} 
                href={cat.href}
                className="pixel-card p-4 flex flex-col items-center text-center gap-2 cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center bg-zinc-50 border-2 border-zinc-200">
                  <Icon className="h-5 w-5 text-zinc-600" />
                </div>
                <h4 className="text-xs font-bold text-zinc-900">
                  {cat.title}
                </h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed hidden sm:block">
                  {cat.desc}
                </p>
                <span className={`font-pixel text-[7px] ${cat.statColor}`}>
                  {cat.stat}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Highlights Section */}
      <div className="space-y-3">
        <h3 className="font-pixel text-[8px] text-zinc-700 uppercase flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Featured Content</span>
        </h3>

        {isLoading ? (
          <div className="flex h-20 items-center justify-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="pixel-card p-6 text-center text-xs text-zinc-400 font-bold">
            No active content highlights found. Be the first to contribute notes or write a blog post!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {featuredItems.map((item) => (
              <Link 
                key={item.id} 
                href={item.link}
                className="pixel-card p-3.5 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center border-2 ${
                    item.type === "blog" 
                      ? "bg-blue-50 text-blue-600 border-blue-200" 
                      : "bg-orange-50 text-orange-600 border-orange-200"
                  }`}>
                    {item.type === "blog" ? <FileText className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`pixel-tag text-[8px] ${
                        item.type === "blog" 
                          ? "text-blue-600 border-blue-200 bg-blue-50" 
                          : "text-orange-600 border-orange-200 bg-orange-50"
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] text-zinc-400">By {item.author}</span>
                    </div>
                    <h4 className="text-xs font-bold text-zinc-900 leading-tight mt-0.5 line-clamp-1">
                      {item.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                    <span>{item.upvotes}</span>
                  </span>
                  <div className="h-7 w-7 border-2 border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-primary hover:text-primary transition-all">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Hackathon banner */}
      <div className="pixel-card p-4 flex items-center justify-between gap-4 bg-zinc-50 border-zinc-300">
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[7px] text-primary">🏆</span>
          <p className="text-xs font-bold text-zinc-700">
            <span className="font-pixel text-[7px] text-primary mr-1">Weekly Hackathon Registration closes in 3 days.</span>
            Join now and showcase your skills!
          </p>
        </div>
        <Link href="/announcements" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 shrink-0">
          View details →
        </Link>
      </div>
    </div>
  );
}
