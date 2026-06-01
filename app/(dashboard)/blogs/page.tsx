"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import BlogCard, { BlogPost } from "@/components/blogs/BlogCard";
import SearchBar from "@/components/shared/SearchBar";
import Skeleton from "@/components/shared/Skeleton";
import { Plus, FileText } from "lucide-react";

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
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-primary-50 text-primary flex items-center justify-center border-2 border-primary-100">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900">
              Technical Blogs
            </h2>
            <p className="text-[11px] text-zinc-400 font-medium">
              Read in-depth tech tutorials, experience reports, and batch journals.
            </p>
          </div>
        </div>

        <Link
          href="/blogs/write"
          className="pixel-btn pixel-btn-primary text-[8px]"
        >
          <Plus className="h-3.5 w-3.5" />
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
        <div className="grid grid-cols-1 gap-5">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="pixel-card p-5 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-12 w-full" />
              <div className="pixel-divider my-2" />
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="pixel-card p-10 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-zinc-900">
            No articles found
          </p>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-xs">
            Try adjusting your search criteria, or be the first to publish a technical blog!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
