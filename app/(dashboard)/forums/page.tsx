"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ThreadCard, { ForumThread } from "@/components/forums/ThreadCard";
import SearchBar from "@/components/shared/SearchBar";
import Skeleton from "@/components/shared/Skeleton";
import Tag from "@/components/shared/Tag";
import { Plus, MessageSquare } from "lucide-react";

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
        let query = supabase
          .from("forum_threads")
          .select("*, users(name, avatar_url, batch)");

        if (activeCategory !== "all") {
          query = query.eq("category", activeCategory);
        }

        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`);
        }

        query = query.order("is_pinned", { ascending: false });
        
        if (sortBy === "upvotes") {
          query = query.order("upvotes", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data: threadData, error: threadError } = await query;
        if (threadError) throw threadError;

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
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-primary-50 text-primary flex items-center justify-center border-2 border-primary-100">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900">
              Discussion Forums
            </h2>
            <p className="text-[11px] text-zinc-400 font-medium">
              Ask questions, discuss topics, share project feedback, and grow together.
            </p>
          </div>
        </div>

        <Link
          href="/forums/new"
          className="pixel-btn pixel-btn-primary text-[8px]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Discussion</span>
        </Link>
      </div>

      {/* Categories & Search Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-4">
          <SearchBar 
            onSearch={(val) => setSearchQuery(val)} 
            placeholder="Search discussion threads..." 
          />
        </div>

        <div className="lg:col-span-8 flex flex-wrap gap-2 justify-start lg:justify-end text-xs font-semibold">
          <button
            onClick={() => setSortBy("created_at")}
            className={`px-3 py-1.5 border-2 transition-all cursor-pointer ${
              sortBy === "created_at"
                ? "bg-primary text-white border-primary"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSortBy("upvotes")}
            className={`px-3 py-1.5 border-2 transition-all cursor-pointer ${
              sortBy === "upvotes"
                ? "bg-primary text-white border-primary"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Trending 🔥
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5 pb-2 border-b-2 border-dashed border-zinc-200">
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
            <div key={idx} className="pixel-card p-5 space-y-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <div className="pixel-divider my-2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="pixel-card p-10 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-zinc-900">
            No discussions found
          </p>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-xs">
            Try choosing a different topic or adjust search terms, or start the first cohort question!
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
