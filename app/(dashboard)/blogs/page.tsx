"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import BlogCard, { BlogPost } from "@/components/blogs/BlogCard";
import SearchBar from "@/components/shared/SearchBar";
import Skeleton from "@/components/shared/Skeleton";
import { Plus, Sparkles, FileText } from "lucide-react";

export default function BlogsPage() {
  const supabase = createClient();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("blog_posts")
          .select("*, users(name, avatar_url, batch)")
          .eq("status", "published");

        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`);
        }

        query = query.order("created_at", { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        setPosts((data as any) || []);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [searchQuery, supabase]);

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">
              Technical Blogs
            </h2>
            <p className="text-[11px] text-zinc-400 font-medium">
              Read in-depth tech tutorials, experience reports, and batch journals.
            </p>
          </div>
        </div>

        {/* Quick Write Blog Button */}
        <Link
          href="/blogs/write"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary hover:bg-primary-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Write Blog</span>
        </Link>
      </div>

      {/* Search Input bar */}
      <div className="max-w-md">
        <SearchBar 
          onSearch={(val) => setSearchQuery(val)} 
          placeholder="Search articles, tags, authors..." 
        />
      </div>

      {/* Main Grid/Feed */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="premium-card rounded-3xl p-6 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-2/3 rounded-md" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 my-1" />
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-7 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="premium-card rounded-3xl p-10 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">
            No articles found
          </p>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-xs">
            Try adjusting your search criteria, or be the first to publish a technical blog!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
