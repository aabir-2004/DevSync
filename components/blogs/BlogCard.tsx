"use client";

import Link from "next/link";
import { BookOpen, Calendar, ArrowUpRight, Eye } from "lucide-react";
import Tag from "@/components/shared/Tag";
import VoteButton from "@/components/shared/VoteButton";
import Avatar from "@/components/shared/Avatar";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  status: "draft" | "published";
  views: number;
  upvotes: number;
  created_at: string;
  users?: {
    name: string;
    avatar_url: string | null;
    batch: string | null;
  } | null;
}

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  // Calculate reading time estimate
  const getReadingTime = (html: string) => {
    const text = html.replace(/<[^>]+>/g, ""); // strip html
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / 200); // 200 wpm average
    return `${time} min read`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="pixel-card  p-6 flex flex-col gap-4 relative overflow-hidden group">
      
      {/* Excerpt image/illustration placeholder on top if any, else text */}
      <div className="flex-1 space-y-2">
        {/* Meta Row */}
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold tracking-wide uppercase">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 text-primary" />
            {getReadingTime(post.content)}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Eye className="h-3.5 w-3.5" />
            {post.views} views
          </span>
        </div>

        {/* Title */}
        <Link href={`/blogs/${post.slug}`} className="block">
          <h4 className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug group-hover:text-primary transition-colors duration-150 line-clamp-2">
            {post.title}
          </h4>
        </Link>

        {/* Excerpt Teaser */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {post.excerpt || "Dive deep into this technical post written by our community cohort developer."}
        </p>
      </div>

      {/* Tags section */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 3).map((t) => (
            <Tag key={t} label={t} size="xs" variant="neutral" />
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-zinc-100 zinc-800/60 my-1" />

      {/* Bottom Row */}
      <div className="flex items-center justify-between">
        {/* Author Details */}
        <div className="flex items-center gap-3">
          <Avatar 
            name={post.users?.name || "DevSync Student"} 
            src={post.users?.avatar_url} 
            size="xs" 
          />
          <div>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {post.users?.name || "Student"}
            </p>
            <p className="text-[9px] text-zinc-400 font-medium">
              {post.users?.batch || "DecSync Cohort"} • {formatDate(post.created_at)}
            </p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3">
          <VoteButton initialScore={post.upvotes} />
          
          <Link
            href={`/blogs/${post.slug}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 hover:bg-primary-100 text-primary primary-950/20 dark:hover:bg-primary-950/40 transition-colors"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
