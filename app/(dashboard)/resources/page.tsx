"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ResourceFilter from "@/components/resources/ResourceFilter";
import ResourceGrid from "@/components/resources/ResourceGrid";
import SearchBar from "@/components/shared/SearchBar";
import { Plus, BookOpen } from "lucide-react";
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

        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
        }

        if (filters.category !== "all") {
          query = query.eq("category", filters.category);
        }

        if (filters.semester !== "all") {
          query = query.eq("semester", parseInt(filters.semester));
        }

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-primary-50 text-primary flex items-center justify-center border-2 border-primary-100">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900">
              Shared Resources
            </h2>
            <p className="text-[11px] text-zinc-400 font-medium">
              Explore shared resources uploaded by cohort members.
            </p>
          </div>
        </div>

        <Link
          href="/resources/upload"
          className="pixel-btn pixel-btn-primary text-[8px]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Upload Note</span>
        </Link>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Filters */}
        <div className="lg:col-span-4 space-y-4">
          <SearchBar 
            onSearch={(val) => setSearchQuery(val)} 
            placeholder="Search notes, subjects..." 
          />
          <ResourceFilter 
            filters={filters} 
            onChange={(newFilters) => setFilters(newFilters)} 
          />
        </div>

        {/* Resources Cards Grid */}
        <div className="lg:col-span-8">
          <ResourceGrid resources={resources} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
