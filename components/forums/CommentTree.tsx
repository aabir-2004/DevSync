"use client";

import CommentItem, { CommentNode } from "./CommentItem";

interface CommentTreeProps {
  comments: CommentNode[];
  currentUser: any;
  onRefresh: () => void;
}

export default function CommentTree({ comments, currentUser, onRefresh }: CommentTreeProps) {
  // Build tree from flat recursive CTE array
  const buildCommentTree = (flatComments: CommentNode[]): CommentNode[] => {
    const roots: CommentNode[] = [];
    const childrenMap: Record<string, CommentNode[]> = {};

    flatComments.forEach((c) => {
      if (c.parent_id === null) {
        roots.push({ ...c, replies: [] });
      } else {
        if (!childrenMap[c.parent_id]) {
          childrenMap[c.parent_id] = [];
        }
        childrenMap[c.parent_id].push({ ...c, replies: [] });
      }
    });

    const addReplies = (node: CommentNode) => {
      const replies = childrenMap[node.id];
      if (replies) {
        node.replies = replies;
        replies.forEach(addReplies); // handles deeper if allowed, currently depth < 1
      }
    };

    roots.forEach(addReplies);
    return roots;
  };

  const commentTree = buildCommentTree(comments);

  if (commentTree.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          No replies yet. Be the first to start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {commentTree.map((rootComment) => (
        <CommentItem
          key={rootComment.id}
          comment={rootComment}
          currentUser={currentUser}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
