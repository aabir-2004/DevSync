"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Bookmark, 
  BookOpen, 
  Trophy, 
  Search, 
  ArrowUpDown, 
  Loader2, 
  ExternalLink,
  CheckCircle2,
  Trash2
} from "lucide-react";
import ResourceCard, { Resource } from "@/components/resources/ResourceCard";
import Link from "next/link";

interface BookmarkRecord {
  id: string;
  target_id: string;
  target_type: "resource" | "dsa";
  created_at: string;
}

interface BookmarkedDSAProblem {
  id: string;
  title: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  platform: "leetcode" | "codeforces" | "codechef" | "gfg" | "other";
  external_url: string;
  week_number: number;
  bookmark_created_at: string;
  progress_status?: "attempted" | "solved" | "unsolved";
}

export default function BookmarksPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "resources" | "dsa">("all");
  
  // Data States
  const [resources, setResources] = useState<(Resource & { bookmark_created_at: string })[]>([]);
  const [dsaProblems, setDsaProblems] = useState<BookmarkedDSAProblem[]>([]);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  useEffect(() => {
    const fetchBookmarks = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }
        setUserId(user.id);

        // 1. Fetch user bookmarks
        const { data: bookmarksData, error: bookmarksErr } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id);

        if (bookmarksErr) throw bookmarksErr;

        const records = (bookmarksData || []) as BookmarkRecord[];
        const resourceIds = records.filter(r => r.target_type === "resource").map(r => r.target_id);
        const dsaIds = records.filter(r => r.target_type === "dsa").map(r => r.target_id);

        // 2. Fetch Resources
        let fetchedResources: (Resource & { bookmark_created_at: string })[] = [];
        if (resourceIds.length > 0) {
          const { data: resData } = await supabase
            .from("resources")
            .select("*, users(name, avatar_url)")
            .in("id", resourceIds);

          if (resData) {
            fetchedResources = resData.map(r => ({
              ...r,
              bookmark_created_at: records.find(rec => rec.target_id === r.id)?.created_at || ""
            }));
          }
        }
        setResources(fetchedResources);

        // 3. Fetch DSA Problems & User Progress
        let fetchedDSA: BookmarkedDSAProblem[] = [];
        if (dsaIds.length > 0) {
          const [problemsRes, progressRes] = await Promise.all([
            supabase.from("dsa_problems").select("*").in("id", dsaIds),
            supabase.from("dsa_progress").select("problem_id, status").eq("user_id", user.id)
          ]);

          if (problemsRes.data) {
            const progressMap: Record<string, "attempted" | "solved"> = {};
            if (progressRes.data) {
              progressRes.data.forEach(p => {
                progressMap[p.problem_id] = p.status as "attempted" | "solved";
              });
            }

            fetchedDSA = problemsRes.data.map(p => ({
              ...p,
              bookmark_created_at: records.find(rec => rec.target_id === p.id)?.created_at || "",
              progress_status: progressMap[p.id] || "unsolved"
            }));
          }
        }
        setDsaProblems(fetchedDSA);

      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarks();
  }, [supabase, router]);

  // Remove Bookmark Handler
  const handleRemoveBookmark = async (id: string, type: "resource" | "dsa") => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("target_id", id)
        .eq("target_type", type);

      if (error) throw error;

      if (type === "resource") {
        setResources(prev => prev.filter(r => r.id !== id));
      } else {
        setDsaProblems(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  // filter & sort items
  const getFilteredAndSorted = () => {
    const q = searchQuery.toLowerCase().trim();
    
    // Filter
    let filteredRes = resources.filter(r => r.title.toLowerCase().includes(q) || (r.subject && r.subject.toLowerCase().includes(q)));
    let filteredDSA = dsaProblems.filter(p => p.title.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q));

    let items: (
      | { type: "resource"; id: string; title: string; date: string; payload: Resource & { bookmark_created_at: string } }
      | { type: "dsa"; id: string; title: string; date: string; payload: BookmarkedDSAProblem }
    )[] = [];

    if (activeTab === "all" || activeTab === "resources") {
      items = [...items, ...filteredRes.map(r => ({ type: "resource" as const, id: r.id, title: r.title, date: r.bookmark_created_at, payload: r }))];
    }
    if (activeTab === "all" || activeTab === "dsa") {
      items = [...items, ...filteredDSA.map(p => ({ type: "dsa" as const, id: p.id, title: p.title, date: p.bookmark_created_at, payload: p }))];
    }

    // Sort
    items.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return items;
  };

  const processedList = getFilteredAndSorted();

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 bg-primary-50 text-primary flex items-center justify-center border-2 border-primary-100 shadow-inner">
          <Bookmark className="h-5.5 w-5.5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white">
            My Bookmarks
          </h2>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
            Quick access to saved technical resources, sheets, and DSA practice problems.
          </p>
        </div>
      </div>

      {/* Control Bar: Tabs, Search, Sort */}
      <div className="pixel-card p-4 border border-zinc-150 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-850/50 p-1 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-650">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white dark:bg-zinc-900 text-primary shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                : "hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            All ({resources.length + dsaProblems.length})
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`px-3.5 py-1.5 transition-all cursor-pointer ${
              activeTab === "resources"
                ? "bg-white dark:bg-zinc-900 text-primary shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                : "hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Resources ({resources.length})
          </button>
          <button
            onClick={() => setActiveTab("dsa")}
            className={`px-3.5 py-1.5 transition-all cursor-pointer ${
              activeTab === "dsa"
                ? "bg-white dark:bg-zinc-900 text-primary shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                : "hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            DSA Problems ({dsaProblems.length})
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 flex-1 md:justify-end">
          <div className="relative w-full max-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-primary dark:border-zinc-800 dark:text-white transition-all font-semibold"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold shrink-0">
            <ArrowUpDown className="h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-primary dark:border-zinc-800 dark:text-white transition-all cursor-pointer"
            >
              <option value="newest">Saved Newest</option>
              <option value="oldest">Saved Oldest</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Results Listing */}
      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
        </div>
      ) : processedList.length === 0 ? (
        <div className="pixel-card p-12 text-center border border-zinc-150 dark:border-zinc-800">
          <Bookmark className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            No bookmarks found
          </h3>
          <p className="text-xs text-zinc-400 font-semibold max-w-sm mx-auto">
            {searchQuery ? "No bookmarked items match your query." : "Bookmark resources or DSA practice sheets to access them quickly here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Render mixed items dynamically */}
          {activeTab === "resources" ? (
            /* Resources Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processedList.map((item) => (
                <div key={item.id} className="relative">
                  <ResourceCard resource={item.payload as Resource} />
                </div>
              ))}
            </div>
          ) : (
            /* List View for DSA or All bookmarks mixed */
            <div className="space-y-3">
              {processedList.map((item) => {
                if (item.type === "resource") {
                  const r = item.payload as Resource;
                  return (
                    <div 
                      key={item.id}
                      className="pixel-card p-4 border border-zinc-150 dark:border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                          <BookOpen className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wide">
                            Resource {r.subject ? `• ${r.subject}` : ""}
                          </span>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                            {r.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={r.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-250 hover:border-primary text-zinc-400 hover:text-primary transition-all"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleRemoveBookmark(r.id, "resource")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 hover:border-red-500 hover:bg-red-50 text-zinc-450 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  const p = item.payload as BookmarkedDSAProblem;
                  
                  const diffColor = p.difficulty === "easy" 
                    ? "bg-green-50 text-green-700 dark:text-green-400" 
                    : p.difficulty === "medium"
                    ? "bg-amber-50 text-amber-700 dark:text-amber-400"
                    : "bg-red-50 text-red-600 dark:text-red-400";

                  return (
                    <div 
                      key={item.id}
                      className="pixel-card p-4 border border-zinc-150 dark:border-zinc-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
                          <Trophy className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wide">
                              DSA Problem • {p.topic}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${diffColor}`}>
                              {p.difficulty}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                            {p.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.progress_status === "solved" && (
                          <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 border border-green-100">
                            <CheckCircle2 className="h-3 w-3" />
                            Solved
                          </span>
                        )}
                        {p.progress_status === "attempted" && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 border border-amber-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Attempted
                          </span>
                        )}
                        <a
                          href={p.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-250 hover:border-primary text-zinc-400 hover:text-primary transition-all"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleRemoveBookmark(p.id, "dsa")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-250 hover:border-red-500 hover:bg-red-50 text-zinc-450 hover:text-red-500 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
