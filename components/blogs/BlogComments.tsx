"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MessageSquare, CornerDownRight, Trash2, ArrowUp, ArrowDown, Send } from "lucide-react";
import Avatar from "@/components/shared/Avatar";

interface CommentItemType {
  id: string;
  blog_id: string;
  parent_id: string | null;
  author_id: string;
  content: string;
  upvotes: number;
  is_deleted: boolean;
  created_at: string;
  depth: number;
  author_name: string;
  author_avatar: string | null;
}

interface CommentNode extends CommentItemType {
  replies: CommentNode[];
}

interface BlogCommentsProps {
  blogId: string;
}

export default function BlogComments({ blogId }: BlogCommentsProps) {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar_url: string | null; role: string } | null>(null);
  
  const [flatComments, setFlatComments] = useState<CommentItemType[]>([]);
  const [commentsTree, setCommentsTree] = useState<CommentNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [rootCommentText, setRootCommentText] = useState("");
  const [isSubmittingRoot, setIsSubmittingRoot] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // States for inline replying
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Keep track of which comments the user has upvoted/downvoted locally
  const [votedComments, setVotedComments] = useState<Record<string, "up" | "down" | null>>({});

  // Fetch current user details
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("id, name, avatar_url, role")
          .eq("id", user.id)
          .single();
        if (profile) {
          setCurrentUser(profile as any);
        }
      }
    };
    fetchUser();
  }, [supabase]);

  // Build the tree representation
  const buildTree = useCallback((flat: CommentItemType[]): CommentNode[] => {
    const map: Record<string, CommentNode> = {};
    const roots: CommentNode[] = [];

    flat.forEach((item) => {
      map[item.id] = { ...item, replies: [] };
    });

    flat.forEach((item) => {
      const node = map[item.id];
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, []);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_blog_comment_tree", {
        blog_id_param: blogId,
      });

      if (error) throw error;

      const flatList = (data as CommentItemType[]) || [];
      setFlatComments(flatList);
      setCommentsTree(buildTree(flatList));
    } catch (err) {
      console.error("Failed to load blog comments:", err);
    } finally {
      setIsLoading(false);
    }
  }, [blogId, supabase, buildTree]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Submit root comment
  const handlePostRootComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setSubmitError("You must be logged in to comment.");
      return;
    }
    if (!rootCommentText.trim()) return;

    setIsSubmittingRoot(true);
    setSubmitError(null);

    try {
      const { error } = await supabase.from("blog_comments").insert({
        blog_id: blogId,
        parent_id: null,
        author_id: currentUser.id,
        content: rootCommentText.trim(),
        upvotes: 0,
      });

      if (error) throw error;

      setRootCommentText("");
      fetchComments();
    } catch (err: any) {
      console.error("Error posting root comment:", err);
      setSubmitError(err.message || "Failed to post comment.");
    } finally {
      setIsSubmittingRoot(false);
    }
  };

  // Submit inline reply
  const handlePostReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!currentUser) {
      setReplyError("You must be logged in to comment.");
      return;
    }
    if (!replyText.trim()) return;

    setIsSubmittingReply(true);
    setReplyError(null);

    try {
      const { error } = await supabase.from("blog_comments").insert({
        blog_id: blogId,
        parent_id: parentId,
        author_id: currentUser.id,
        content: replyText.trim(),
        upvotes: 0,
      });

      if (error) throw error;

      setReplyText("");
      setReplyingToId(null);
      fetchComments();
    } catch (err: any) {
      console.error("Error posting reply:", err);
      setReplyError(err.message || "Failed to post reply.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Deletion
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const { error } = await supabase.from("blog_comments").delete().eq("id", commentId);
      if (error) throw error;
      fetchComments();
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Upvote handling
  const handleVote = async (commentId: string, currentScore: number, voteType: "up" | "down") => {
    if (!currentUser) return;

    const previousVote = votedComments[commentId] || null;
    let offset = 0;
    let newVote: "up" | "down" | null = null;

    if (voteType === "up") {
      if (previousVote === "up") {
        offset = -1;
        newVote = null;
      } else if (previousVote === "down") {
        offset = 2;
        newVote = "up";
      } else {
        offset = 1;
        newVote = "up";
      }
    } else {
      if (previousVote === "down") {
        offset = 1;
        newVote = null;
      } else if (previousVote === "up") {
        offset = -2;
        newVote = "down";
      } else {
        offset = -1;
        newVote = "down";
      }
    }

    // Optimistic UI update
    setFlatComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, upvotes: c.upvotes + offset } : c))
    );
    setCommentsTree((prev) => {
      const updateScoreRecursive = (nodes: CommentNode[]): CommentNode[] => {
        return nodes.map((n) => {
          if (n.id === commentId) {
            return { ...n, upvotes: n.upvotes + offset };
          }
          return { ...n, replies: updateScoreRecursive(n.replies) };
        });
      };
      return updateScoreRecursive(prev);
    });
    setVotedComments((prev) => ({ ...prev, [commentId]: newVote }));

    try {
      const { data, error } = await supabase.rpc("upvote_blog_comment", {
        comment_id_param: commentId,
        score_offset: offset,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Failed to register comment vote:", err);
      // Revert optimistic update
      setFlatComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, upvotes: c.upvotes - offset } : c))
      );
      setCommentsTree((prev) => {
        const revertScoreRecursive = (nodes: CommentNode[]): CommentNode[] => {
          return nodes.map((n) => {
            if (n.id === commentId) {
              return { ...n, upvotes: n.upvotes - offset };
            }
            return { ...n, replies: revertScoreRecursive(n.replies) };
          });
        };
        return revertScoreRecursive(prev);
      });
      setVotedComments((prev) => ({ ...prev, [commentId]: previousVote }));
    }
  };

  // Helper component to render each comment item recursively
  const CommentItem = ({ comment }: { comment: CommentNode }) => {
    const isAuthor = currentUser?.id === comment.author_id;
    const isStaff = currentUser?.role === "admin" || currentUser?.role === "moderator";
    const userVote = votedComments[comment.id] || null;

    return (
      <div className="space-y-3">
        <div className="premium-card rounded-2xl p-4 border border-zinc-150 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all hover:border-zinc-200 dark:hover:border-zinc-750">
          
          {/* Comment Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar name={comment.author_name} src={comment.author_avatar} size="xs" />
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {comment.author_name}
                </span>
                <span className="text-[9px] text-zinc-400 font-semibold block mt-0.5">
                  {new Date(comment.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Deletion (only author or admin/moderator) */}
            {(isAuthor || isStaff) && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-zinc-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                title="Delete comment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Comment Body */}
          <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pl-1 pt-2">
            {comment.content}
          </div>

          {/* Comment Footer / Actions */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/40 text-[10px] font-bold text-zinc-500">
            {/* Upvoting */}
            <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-850 p-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-800">
              <button
                onClick={() => handleVote(comment.id, comment.upvotes, "up")}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  userVote === "up" ? "text-primary bg-primary-50 dark:bg-primary-950/20" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                }`}
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <span className={`px-1 font-mono text-[9px] ${userVote === "up" ? "text-primary" : userVote === "down" ? "text-blue-500" : "text-zinc-600 dark:text-zinc-450"}`}>
                {comment.upvotes}
              </span>
              <button
                onClick={() => handleVote(comment.id, comment.upvotes, "down")}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  userVote === "down" ? "text-blue-500 bg-blue-50 dark:bg-blue-950/20" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                }`}
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            </div>

            {/* Reply toggle */}
            {currentUser && comment.depth === 0 && (
              <button
                onClick={() => {
                  setReplyError(null);
                  setReplyText("");
                  setReplyingToId(replyingToId === comment.id ? null : comment.id);
                }}
                className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
              >
                <CornerDownRight className="h-3.5 w-3.5" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingToId === comment.id && (
            <form
              onSubmit={(e) => handlePostReply(e, comment.id)}
              className="mt-3 space-y-2 border-t border-zinc-100 dark:border-zinc-800/40 pt-3 animate-in slide-in-from-top-2 duration-150"
            >
              {replyError && (
                <div className="text-[10px] text-red-500 font-semibold">{replyError}</div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  disabled={isSubmittingReply}
                  className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50/50 py-1.5 px-3 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white transition-all font-semibold"
                />
                <button
                  type="submit"
                  disabled={isSubmittingReply || !replyText.trim()}
                  className="px-3 bg-primary hover:bg-primary-900 rounded-xl text-white flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReply ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sub-Replies rendering */}
        {comment.replies.length > 0 && (
          <div className="pl-6 border-l border-zinc-200 dark:border-zinc-800 space-y-3">
            {comment.replies.map((subReply) => (
              <CommentItem key={subReply.id} comment={subReply} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 mt-8 pt-8 border-t border-zinc-150 dark:border-zinc-800">
      
      {/* Comments Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4.5 w-4.5 text-primary" />
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          Discussions ({flatComments.length})
        </h3>
      </div>

      {/* Main Comment input form */}
      {currentUser ? (
        <form onSubmit={handlePostRootComment} className="space-y-3">
          {submitError && (
            <div className="text-xs text-red-500 font-semibold">{submitError}</div>
          )}
          <div className="flex gap-3 items-start">
            <Avatar name={currentUser.name} src={currentUser.avatar_url} size="sm" />
            <div className="flex-1 relative">
              <textarea
                value={rootCommentText}
                onChange={(e) => setRootCommentText(e.target.value)}
                placeholder="Share your thoughts or ask a question on this article..."
                rows={3}
                disabled={isSubmittingRoot}
                className="w-full rounded-2xl border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white transition-all resize-none font-semibold leading-relaxed"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={isSubmittingRoot || !rootCommentText.trim()}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-900 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isSubmittingRoot ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Comment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="premium-card rounded-2xl p-4 text-center border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <p className="text-xs text-zinc-400 font-semibold">
            Please{" "}
            <a href="/auth/login" className="text-primary hover:underline font-bold">
              sign in
            </a>{" "}
            to join the discussion and post comments.
          </p>
        </div>
      )}

      {/* Comment tree listing */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : commentsTree.length === 0 ? (
        <div className="text-center py-8 text-xs text-zinc-400 font-medium">
          Be the first to share a thought on this post!
        </div>
      ) : (
        <div className="space-y-4">
          {commentsTree.map((item) => (
            <CommentItem key={item.id} comment={item} />
          ))}
        </div>
      )}

    </div>
  );
}
