"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ThreadCard, { ForumThread } from "@/components/forums/ThreadCard";
import SearchBar from "@/components/shared/SearchBar";
import Skeleton from "@/components/shared/Skeleton";
import Tag from "@/components/shared/Tag";
import { Plus, MessageSquare, Flame, Filter, HelpCircle, Trophy } from "lucide-react";

export default function ForumsPage() {
  const supabase = createClient();

  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"created_at" | "upvotes">("created_at");

  const categories = [
    { value: "all", label: "All Topics" },
    { value: "dsa", label: "DSA" },
    { value: "development", label: "Development" },
    { value: "placements", label: "Placements" },
    { value: "projects", label: "Projects" },
    { value: "college", label: "College" },
    { value: "research", label: "Research" },
    { value: "general", label: "General" },
  ];

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        // Fetch threads with author info
        let query = supabase
          .from("forum_threads")
          .select("*, users(name, avatar_url, batch)");

        // Category Filter
        if (activeCategory !== "all") {
          query = query.eq("category", activeCategory);
        }

        // Search Filter
        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`);
        }

        // Sorting (Pinning overrides standard sorting, matching premium behavior!)
        query = query.order("is_pinned", { ascending: false });
        
        if (sortBy === "upvotes") {
          query = query.order("upvotes", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data: threadData, error: threadError } = await query;
        if (threadError) throw threadError;

        // Fetch comments count for each thread to display count badge
        const threadsWithCounts = await Promise.all(
          (threadData || []).map(async (t: any) => {
            const { count, error: countError } = await supabase
              .from("forum_comments")
              .select("*", { count: "exact", head: true })
              .eq("thread_id", t.id);
            
            return {
              ...t,
              comment_count: countError ? 0 : count || 0,
            };
          })
        );

        setThreads(threadsWithCounts);
      } catch (err) {
        console.error("Error fetching forum threads:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [searchQuery, activeCategory, sortBy, supabase]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">
              Discussion Forums
            </h2>
            <p className="text-[11px] text-zinc-400 font-medium">
              Ask questions, discuss topics, share project feedback, and grow together.
            </p>
          </div>
        </div>

        {/* Start Thread Button */}
        <Link
          href="/forums/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary hover:bg-primary-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Discussion</span>
        </Link>
      </div>

      {/* Categories & Search Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="lg:col-span-4">
          <SearchBar 
            onSearch={(val) => setSearchQuery(val)} 
            placeholder="Search discussion threads..." 
          />
        </div>

        {/* Sorting & Filter buttons */}
        <div className="lg:col-span-8 flex flex-wrap gap-2 justify-start lg:justify-end text-xs font-semibold">
          <button
            onClick={() => setSortBy("created_at")}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              sortBy === "created_at"
                ? "bg-primary text-white border-primary"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy("upvotes")}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              sortBy === "upvotes"
                ? "bg-primary text-white border-primary"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850"
            }`}
          >
            Trending 🔥
          </button>
        </div>
      </div>

      {/* Horizontal Category filter pills */}
      <div className="flex flex-wrap gap-1.5 pb-2 border-b border-zinc-100/60 dark:border-zinc-800/40">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className="cursor-pointer"
          >
            <Tag
              label={cat.label}
              variant={activeCategory === cat.value ? "primary" : "neutral"}
              size="xs"
              clickable
            />
          </button>
        ))}
      </div>

      {/* Thread Grid/Feed */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="premium-card rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 my-1" />
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-12 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="premium-card rounded-3xl p-10 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">
            No discussions found
          </p>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-xs">
            Try choosing a different topic or adjust search terms, or trigger the first cohort question!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}
    </div>
  );
}
