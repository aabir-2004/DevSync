"use client";

import { useState } from "react";
import { MessageSquare, Calendar, Trash2 } from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import VoteButton from "@/components/shared/VoteButton";
import CommentForm from "./CommentForm";
import { createClient } from "@/lib/supabase/client";

export interface CommentNode {
  id: string;
  thread_id: string;
  parent_id: string | null;
  author_id: string;
  content: string;
  upvotes: number;
  is_deleted: boolean;
  created_at: string;
  depth: number;
  author_name: string;
  author_avatar: string | null;
  replies?: CommentNode[];
}

interface CommentItemProps {
  comment: CommentNode;
  currentUser: any;
  onRefresh: () => void;
}

export default function CommentItem({ comment, currentUser, onRefresh }: CommentItemProps) {
  const supabase = createClient();
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    setIsDeleting(true);

    try {
      // Hard delete or set is_deleted trigger flag
      const { error } = await supabase
        .from("forum_comments")
        .update({ is_deleted: true, content: "[This comment has been deleted]" })
        .eq("id", comment.id);

      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = currentUser?.id === comment.author_id;

  return (
    <div className={`flex gap-3 text-xs leading-relaxed py-4 border-b border-zinc-100/60 dark:border-zinc-800/40 last:border-0 ${comment.depth > 0 ? "pl-8 border-l border-zinc-100 dark:border-zinc-800" : ""}`}>
      {/* Avatar column */}
      <div className="flex-shrink-0">
        <Avatar 
          name={comment.author_name} 
          src={comment.author_avatar} 
          size={comment.depth > 0 ? "xs" : "sm"} 
        />
      </div>

      {/* Main Comment Area */}
      <div className="flex-1 space-y-2">
        {/* Comment Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {comment.author_name}
            </span>
            <span className="text-[9px] text-zinc-400 font-medium">
              {formatDate(comment.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Delete button (Owner only, and if not already deleted) */}
            {isAuthor && !comment.is_deleted && (
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-50 hover:text-red-500 dark:hover:bg-zinc-850 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <p className={`text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed ${comment.is_deleted ? "italic text-zinc-400" : ""}`}>
          {comment.content}
        </p>

        {/* Comment Footer Actions */}
        {!comment.is_deleted && (
          <div className="flex items-center gap-4 pt-1">
            <VoteButton initialScore={comment.upvotes} />

            {/* Reply action (Only allowed on top-level comments, depth = 0) */}
            {comment.depth === 0 && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-primary transition-colors cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                Reply
              </button>
            )}
          </div>
        )}

        {/* Inline Reply Form (when replying) */}
        {isReplying && (
          <div className="mt-3 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100 dark:bg-zinc-900/30 dark:border-zinc-800">
            <CommentForm
              threadId={comment.thread_id}
              parentId={comment.id}
              placeholder={`Replying to ${comment.author_name}...`}
              onSuccess={() => {
                setIsReplying(false);
                onRefresh();
              }}
              onCancel={() => setIsReplying(false)}
              autoFocus
            />
          </div>
        )}

        {/* Recursive Sub-replies rendering */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-t border-zinc-100/60 dark:border-zinc-800/40 pt-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUser={currentUser}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
