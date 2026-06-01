"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface VoteButtonProps {
  initialScore: number;
  initialUserVote?: "up" | "down" | null;
  onVoteChange?: (newVote: "up" | "down" | null, newScore: number) => void;
  vertical?: boolean;
}

export default function VoteButton({
  initialScore,
  initialUserVote = null,
  onVoteChange,
  vertical = false,
}: VoteButtonProps) {
  const [userVote, setUserVote] = useState<"up" | "down" | null>(initialUserVote);
  const [score, setScore] = useState(initialScore);

  const handleVote = (type: "up" | "down") => {
    let newVote: "up" | "down" | null = null;
    let scoreOffset = 0;

    if (type === "up") {
      if (userVote === "up") {
        // Undo upvote
        newVote = null;
        scoreOffset = -1;
      } else if (userVote === "down") {
        // Switch from down to up
        newVote = "up";
        scoreOffset = 2;
      } else {
        // Upvote
        newVote = "up";
        scoreOffset = 1;
      }
    } else {
      if (userVote === "down") {
        // Undo downvote
        newVote = null;
        scoreOffset = 1;
      } else if (userVote === "up") {
        // Switch from up to down
        newVote = "down";
        scoreOffset = -2;
      } else {
        // Downvote
        newVote = "down";
        scoreOffset = -1;
      }
    }

    const newScore = score + scoreOffset;
    setUserVote(newVote);
    setScore(newScore);

    if (onVoteChange) {
      onVoteChange(newVote, newScore);
    }
  };

  const containerClasses = vertical
    ? "flex flex-col items-center gap-1.5 p-1 rounded-xl bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-900/40 dark:border-zinc-800"
    : "flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-900/40 dark:border-zinc-800";

  return (
    <div className={containerClasses}>
      {/* Upvote Button */}
      <button
        onClick={() => handleVote("up")}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 ${
          userVote === "up"
            ? "bg-primary-50 text-primary dark:bg-primary-950/40 scale-105"
            : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        <ArrowUp className="h-4 w-4 stroke-[2.5]" />
      </button>

      {/* Vote Count */}
      <span
        className={`text-xs font-bold font-mono min-w-[16px] text-center ${
          userVote === "up"
            ? "text-primary"
            : userVote === "down"
            ? "text-blue-500"
            : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {score}
      </span>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote("down")}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 ${
          userVote === "down"
            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 scale-105"
            : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        <ArrowDown className="h-4 w-4 stroke-[2.5]" />
      </button>
    </div>
  );
}
