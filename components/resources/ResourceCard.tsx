"use client";

import Link from "next/link";
import { ExternalLink, Calendar, BookOpen, GraduationCap } from "lucide-react";
import VoteButton from "@/components/shared/VoteButton";
import Tag from "@/components/shared/Tag";
import Avatar from "@/components/shared/Avatar";

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: "notes" | "pdf" | "placement" | "dsa" | "development" | "system_design" | "interview_exp" | "competitive" | "other";
  semester: number | null;
  subject: string | null;
  tags: string[];
  external_url: string;
  thumbnail_url?: string | null;
  upvotes: number;
  created_at: string;
  users?: {
    name: string;
    avatar_url: string | null;
  } | null;
}

interface ResourceCardProps {
  resource: Resource;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  // Format created date
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Map category to tag variant
  const getCategoryVariant = (cat: string) => {
    const mapping: Record<string, "primary" | "secondary" | "success" | "warning" | "info" | "neutral"> = {
      notes: "info",
      pdf: "neutral",
      placement: "success",
      dsa: "primary",
      development: "warning",
      system_design: "primary",
      interview_exp: "success",
      competitive: "warning",
      other: "neutral",
    };
    return mapping[cat] || "neutral";
  };

  return (
    <div className="pixel-card  p-5 flex flex-col gap-4 relative overflow-hidden group">
      
      {/* Top Bar: Category & Semester */}
      <div className="flex items-center justify-between">
        <Tag 
          label={resource.category.toUpperCase()} 
          variant={getCategoryVariant(resource.category)} 
          size="xs" 
        />
        {resource.semester && (
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            Sem {resource.semester}
          </span>
        )}
      </div>

      {/* Main Title & Description */}
      <div className="flex-1 space-y-1.5">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 leading-snug group-hover:text-primary transition-colors duration-150">
          {resource.title}
        </h4>
        
        {resource.subject && (
          <span className="text-[10px] font-bold text-primary tracking-wide uppercase font-mono">
            {resource.subject}
          </span>
        )}

        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {resource.description || "No description provided."}
        </p>
      </div>

      {/* Tags section */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((t, idx) => (
            <Tag key={idx} label={t} size="xs" variant="secondary" />
          ))}
          {resource.tags.length > 3 && (
            <Tag label={`+${resource.tags.length - 3}`} size="xs" variant="neutral" />
          )}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-zinc-100 zinc-800/60 my-1" />

      {/* Bottom Row: Vote, External URL, Author & Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar 
            name={resource.users?.name || "DevSync Student"} 
            src={resource.users?.avatar_url} 
            size="xs" 
          />
          <div>
            <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
              {resource.users?.name || "Student"}
            </p>
            <p className="text-[9px] text-zinc-400 flex items-center gap-1 font-medium mt-0.5">
              <Calendar className="h-2.5 w-2.5" />
              {formatDate(resource.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Voting */}
          <VoteButton initialScore={resource.upvotes} />
          
          {/* External Action */}
          <a
            href={resource.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-900 shadow-sm transition-all duration-150 scale-100 hover:scale-105"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

    </div>
  );
}
