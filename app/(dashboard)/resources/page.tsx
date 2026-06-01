"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ResourceFilter from "@/components/resources/ResourceFilter";
import ResourceGrid from "@/components/resources/ResourceGrid";
import SearchBar from "@/components/shared/SearchBar";
import { Plus, BookOpen, Sparkles } from "lucide-react";
import { Resource } from "@/components/resources/ResourceCard";

export default function ResourcesPage() {
  const supabase = createClient();

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    category: "all",
    semester: "all",
    sortBy: "created_at" as "upvotes" | "created_at",
  });

  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from("resources")
          .select("*, users(name, avatar_url)");

        // Apply search keyword filter using Postgres full text search or simple ilike search
        if (searchQuery.trim()) {
          // If searching, we search in search_vector or ilike title/subject
          query = query.or(`title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
        }

        // Apply category filter
        if (filters.category !== "all") {
          query = query.eq("category", filters.category);
        }

        // Apply semester filter
        if (filters.semester !== "all") {
          query = query.eq("semester", parseInt(filters.semester));
        }

        // Apply sorting
        if (filters.sortBy === "upvotes") {
          query = query.order("upvotes", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        setResources((data as any) || []);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [searchQuery, filters, supabase]);

  return (
    <div className="space-y-6">
      {/* Search and Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-primary-50 dark:bg-primary-950/20 text-primary flex items-center justify-center">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">
              Shared Resources
            </h2>
            <p className="text-[11px] text-zinc-400 font-medium">
              Explore shared resources uploaded by cohort cohort members.
            </p>
          </div>
        </div>

        {/* Contribute Button */}
        <Link
          href="/resources/upload"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary hover:bg-primary-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Note</span>
        </Link>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Filters: 4 cols on lg, full on tablet */}
        <div className="lg:col-span-4 space-y-6">
          <SearchBar 
            onSearch={(val) => setSearchQuery(val)} 
            placeholder="Search notes, subjects..." 
          />
          <ResourceFilter 
            filters={filters} 
            onChange={(newFilters) => setFilters(newFilters)} 
          />
        </div>

        {/* Resources Cards Grid: 8 cols on lg */}
        <div className="lg:col-span-8">
          <ResourceGrid resources={resources} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
