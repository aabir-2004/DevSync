"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, MessageSquare, Pin, Lock, Calendar, Eye, Sparkles, Loader2 } from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import Tag from "@/components/shared/Tag";
import VoteButton from "@/components/shared/VoteButton";
import CommentForm from "@/components/forums/CommentForm";
import CommentTree from "@/components/forums/CommentTree";
import { ForumThread } from "@/components/forums/ThreadCard";
import { CommentNode } from "@/components/forums/CommentItem";

interface ThreadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ThreadDetailPage({ params }: ThreadDetailPageProps) {
  const router = useRouter();
  const supabase = createClient();
  const { id } = use(params);

  const [thread, setThread] = useState<ForumThread | null>(null);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // Fetch Auth User
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, [supabase]);

  // Fetch Thread Details and Comment Tree
  useEffect(() => {
    const fetchThreadDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch Thread details
        const { data: threadData, error: threadError } = await supabase
          .from("forum_threads")
          .select("*, users(name, avatar_url, batch)")
          .eq("id", id)
          .single();

        if (threadError || !threadData) {
          throw new Error("Thread not found.");
        }

        setThread(threadData as any);

        // Fetch comments tree using our recursive CTE RPC database function!
        const { data: commentData, error: commentError } = await supabase.rpc(
          "get_comment_tree",
          { thread_id_param: id }
        );

        if (commentError) throw commentError;
        setComments((commentData as any) || []);

        // Increment Views count (non-blocking)
        await supabase
          .from("forum_threads")
          .update({ views: threadData.views + 1 })
          .eq("id", id);

      } catch (err) {
        console.error("Error fetching thread details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadDetails();
  }, [id, refreshTrigger, supabase]);

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="premium-card rounded-3xl p-10 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-bold text-zinc-900 dark:text-white">
          Thread not found
        </p>
        <Link href="/forums" className="text-xs text-primary font-bold hover:underline mt-2">
          Back to Forums
        </Link>
      </div>
    );
  }

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
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/forums"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discussions
      </Link>

      {/* Main Discussion Thread card */}
      <div className="premium-card rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/60 shadow-md relative overflow-hidden">
        
        {/* Glow background decoration */}
        <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary-100/50 blur-2xl dark:bg-primary-950/20" />

        <div className="space-y-4 relative">
          {/* Thread Header Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag 
                label={thread.category.toUpperCase()} 
                variant={getCategoryVariant(thread.category)} 
                size="xs" 
              />
              {thread.is_pinned && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/10">
                  <Pin className="h-3 w-3 fill-current" />
                  Pinned
                </span>
              )}
              {thread.is_locked && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/10">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              )}
            </div>
            
            <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {thread.views + 1} views
            </span>
          </div>

          {/* Thread Title */}
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
            {thread.title}
          </h1>

          {/* Thread Author info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-b border-zinc-100/60 dark:border-zinc-800/40 py-3 text-xs">
            <div className="flex items-center gap-3">
              <Avatar 
                name={thread.users?.name || "Student"} 
                src={thread.users?.avatar_url} 
                size="sm" 
              />
              <div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {thread.users?.name || "Student"}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                  Cohort: {thread.users?.batch || "DecSync Cohort"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(thread.created_at)}
              </span>
              <VoteButton initialScore={thread.upvotes} />
            </div>
          </div>

          {/* Thread Body Content */}
          {thread.body && (
            <p className="text-xs md:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pt-2 whitespace-pre-line">
              {thread.body}
            </p>
          )}

        </div>
      </div>

      {/* Discussion comments area */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
          <MessageSquare className="h-4.5 w-4.5 text-primary" />
          <span>Responses ({comments.length})</span>
        </h3>

        {/* Reply Editor Form on Thread (if unlocked) */}
        {!thread.is_locked ? (
          <div className="premium-card rounded-3xl p-5">
            <CommentForm
              threadId={thread.id}
              placeholder="Start the discussion, share hints or answers..."
              onSuccess={triggerRefresh}
            />
          </div>
        ) : (
          <div className="premium-card rounded-3xl p-5 text-center text-xs text-red-500 bg-red-50/50 border-red-100 dark:bg-red-950/20 dark:border-red-900/10">
            This discussion thread has been locked by a moderator. No further comments can be posted.
          </div>
        )}

        {/* Comment tree structure */}
        <div className="premium-card rounded-3xl p-6 bg-white dark:bg-zinc-900 shadow-md">
          <CommentTree
            comments={comments}
            currentUser={currentUser}
            onRefresh={triggerRefresh}
          />
        </div>

      </div>

    </div>
  );
}
