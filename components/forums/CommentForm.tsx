"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Send } from "lucide-react";

interface CommentFormProps {
  threadId: string;
  parentId?: string | null;
  placeholder?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export default function CommentForm({
  threadId,
  parentId = null,
  placeholder = "Write a constructive reply...",
  onSuccess,
  onCancel,
  autoFocus = false,
}: CommentFormProps) {
  const supabase = createClient();
  
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (!trimmed) return;

    setIsLoading(true);

    try {
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("You must be logged in to reply.");
      }

      // Insert comment
      const { error: insertError } = await supabase.from("forum_comments").insert({
        thread_id: threadId,
        parent_id: parentId,
        author_id: user.id,
        content: trimmed,
        upvotes: 0,
        is_deleted: false,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setContent("");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-[10px] font-semibold text-red-500 bg-red-50 p-2 rounded-lg dark:text-red-400 border border-red-100 dark:border-red-900/10">
          {error}
        </p>
      )}

      <div className="relative">
        <textarea
          autoFocus={autoFocus}
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 p-3.5 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all resize-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-xl border border-zinc-200 text-[10px] font-bold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-900 text-[10px] font-bold text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-3 w-3" />
              <span>Reply</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
