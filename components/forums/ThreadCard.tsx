"use client";

import Link from "next/link";
import { MessageSquare, Eye, Pin, Lock } from "lucide-react";
import Tag from "@/components/shared/Tag";
import VoteButton from "@/components/shared/VoteButton";
import Avatar from "@/components/shared/Avatar";

export interface ForumThread {
  id: string;
  title: string;
  category: "dsa" | "development" | "placements" | "projects" | "college" | "research" | "general";
  body: string | null;
  upvotes: number;
  is_locked: boolean;
  is_pinned: boolean;
  views: number;
  created_at: string;
  comment_count?: number;
  users?: {
    name: string;
    avatar_url: string | null;
    batch: string | null;
  } | null;
}

interface ThreadCardProps {
  thread: ForumThread;
}

export default function ThreadCard({ thread }: ThreadCardProps) {
  const getCategoryVariant = (cat: string) => {
    const mapping: Record<string, "primary" | "secondary" | "success" | "warning" | "info" | "neutral"> = {
      dsa: "primary",
      development: "warning",
      placements: "success",
      projects: "info",
      college: "neutral",
      research: "info",
      general: "neutral",
    };
    return mapping[cat] || "neutral";
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="pixel-card  p-5 flex flex-col gap-4 relative overflow-hidden group">
      
      {/* Top Bar: Category & Pinned/Locked Indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag 
            label={thread.category.toUpperCase()} 
            variant={getCategoryVariant(thread.category)} 
            size="xs" 
          />
          {thread.is_pinned && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 amber-950/20 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/10">
              <Pin className="h-3 w-3 fill-current" />
              Pinned
            </span>
          )}
          {thread.is_locked && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/10">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          )}
        </div>
        
        <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          {thread.views} views
        </span>
      </div>

      {/* Title & Body Teaser */}
      <div className="flex-1 space-y-2">
        <Link href={`/forums/${thread.id}`} className="block">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-primary transition-colors duration-150 line-clamp-1">
            {thread.title}
          </h4>
        </Link>
        
        {thread.body && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {thread.body}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-100 zinc-800/60 my-1" />

      {/* Bottom Bar: Author, Votes, Comments */}
      <div className="flex items-center justify-between">
        
        {/* Author details */}
        <div className="flex items-center gap-2.5">
          <Avatar 
            name={thread.users?.name || "Student"} 
            src={thread.users?.avatar_url} 
            size="xs" 
          />
          <div>
            <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
              {thread.users?.name || "Student"}
            </p>
            <p className="text-[8px] text-zinc-400 font-medium">
              {thread.users?.batch || "DecSync Cohort"} • {formatDate(thread.created_at)}
            </p>
          </div>
        </div>

        {/* Voting & Comments count */}
        <div className="flex items-center gap-3">
          <VoteButton initialScore={thread.upvotes} />
          
          <Link
            href={`/forums/${thread.id}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/60 text-[10px] font-bold text-zinc-600 dark:border-zinc-800 dark:text-zinc-300 hover:text-primary hover:border-primary-100 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
            <span>{thread.comment_count ?? 0}</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
