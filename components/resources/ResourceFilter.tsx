"use client";

import { SlidersHorizontal, BookOpen, GraduationCap, ArrowUpDown } from "lucide-react";

interface FilterState {
  category: string;
  semester: string;
  sortBy: "upvotes" | "created_at";
}

interface ResourceFilterProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
}

export default function ResourceFilter({ filters, onChange }: ResourceFilterProps) {
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "notes", label: "Notes" },
    { value: "pdf", label: "PDF Documents" },
    { value: "placement", label: "Placement Sheets" },
    { value: "dsa", label: "DSA Practice" },
    { value: "development", label: "Web/App Dev" },
    { value: "system_design", label: "System Design" },
    { value: "interview_exp", label: "Interview Prep" },
    { value: "competitive", label: "Competitive Coding" },
  ];

  const semesters = [
    { value: "all", label: "All Semesters" },
    { value: "1", label: "Semester 1" },
    { value: "2", label: "Semester 2" },
    { value: "3", label: "Semester 3" },
    { value: "4", label: "Semester 4" },
    { value: "5", label: "Semester 5" },
    { value: "6", label: "Semester 6" },
    { value: "7", label: "Semester 7" },
    { value: "8", label: "Semester 8" },
  ];

  const sortOptions = [
    { value: "created_at", label: "Newest First" },
    { value: "upvotes", label: "Most Popular" },
  ];

  const setFilter = (key: keyof FilterState, val: string) => {
    onChange({
      ...filters,
      [key]: val,
    });
  };

  return (
    <div className="premium-card rounded-3xl p-5 flex flex-col gap-5">
      
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
          Filter Resources
        </h3>
      </div>

      {/* Category Select */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Category</span>
        </label>
        <select
          value={filters.category}
          onChange={(e) => setFilter("category", e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all cursor-pointer"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value} className="zinc-950">
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Semester Select */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Semester</span>
        </label>
        <select
          value={filters.semester}
          onChange={(e) => setFilter("semester", e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all cursor-pointer"
        >
          {semesters.map((sem) => (
            <option key={sem.value} value={sem.value} className="zinc-950">
              {sem.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Select */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>Sort By</span>
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilter("sortBy", e.target.value)}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="zinc-950">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}
