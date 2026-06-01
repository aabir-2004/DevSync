"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SearchBar from "@/components/shared/SearchBar";
import Skeleton from "@/components/shared/Skeleton";
import Tag from "@/components/shared/Tag";
import { Search, BookOpen, FileText, MessageSquare, ArrowRight, Loader2 } from "lucide-react";

interface SearchResult {
  type: "blog" | "resource" | "forum";
  id: string;
  title: string;
  ref: string;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "blog" | "resource" | "forum">("all");

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        // Invoke unified global_search RPC function!
        const { data, error } = await supabase.rpc("global_search", {
          query_param: query,
        });

        if (error) throw error;
        setResults((data as any) || []);
      } catch (err) {
        console.error("Error executing global search:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      performSearch();
    }, 300); // Debounce input search queries

    return () => clearTimeout(timer);
  }, [query, supabase]);

  const handleSearch = (val: string) => {
    setQuery(val);
    const params = new URLSearchParams(window.location.search);
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };

  const filteredResults = activeTab === "all" 
    ? results 
    : results.filter((r) => r.type === activeTab);

  const getIcon = (type: string) => {
    switch (type) {
      case "blog":
        return <FileText className="h-4 w-4 text-primary" />;
      case "resource":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case "forum":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getLink = (result: SearchResult) => {
    switch (result.type) {
      case "blog":
        return `/blogs/${result.ref}`;
      case "resource":
        return `/resources/${result.id}`;
      case "forum":
        return `/forums/${result.id}`;
      default:
        return "/";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="h-9 w-9  bg-primary-50 primary-950/20 text-primary flex items-center justify-center">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white">
            Global Search
          </h2>
          <p className="text-[11px] text-zinc-400 font-medium">
            Search unified results across shared resources, blogs, and discussions.
          </p>
        </div>
      </div>

      {/* Reusable Search Bar input */}
      <div className="max-w-xl">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Type keywords to search entire workspace..."
          className="w-full"
        />
      </div>

      {/* Tabs list filter */}
      {results.length > 0 && (
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100/60 dark:border-zinc-800/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5  border transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-primary text-white border-primary"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850"
            }`}
          >
            All Results ({results.length})
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`px-3.5 py-1.5  border transition-all cursor-pointer ${
              activeTab === "blog"
                ? "bg-primary text-white border-primary"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850"
            }`}
          >
            Blogs ({results.filter(r => r.type === 'blog').length})
          </button>
          <button
            onClick={() => setActiveTab("resource")}
            className={`px-3.5 py-1.5  border transition-all cursor-pointer ${
              activeTab === "resource"
                ? "bg-primary text-white border-primary"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850"
            }`}
          >
            Resources ({results.filter(r => r.type === 'resource').length})
          </button>
          <button
            onClick={() => setActiveTab("forum")}
            className={`px-3.5 py-1.5  border transition-all cursor-pointer ${
              activeTab === "forum"
                ? "bg-primary text-white border-primary"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850"
            }`}
          >
            Forums ({results.filter(r => r.type === 'forum').length})
          </button>
        </div>
      )}

      {/* Search results list */}
      {isLoading ? (
        <div className="flex h-[200px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="pixel-card  p-10 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">
            {query.trim() ? "No matches found" : "Start searching..."}
          </p>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-xs">
            {query.trim() 
              ? "We couldn't find matches for your keywords. Try widening your criteria." 
              : "Search the unified cohort indexes to find answers instantly."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredResults.map((res) => (
            <Link key={res.id} href={getLink(res)} className="block group">
              <div className="pixel-card  p-4 flex items-center justify-between hover:border-primary-100 transition-all duration-150">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center  bg-zinc-50 border border-zinc-150/80 dark:border-zinc-800">
                    {getIcon(res.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-primary transition-colors duration-100 line-clamp-1">
                      {res.title}
                    </h4>
                    <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 mt-0.5 tracking-wider uppercase font-mono">
                      {res.type}
                    </p>
                  </div>
                </div>
                
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-[300px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
