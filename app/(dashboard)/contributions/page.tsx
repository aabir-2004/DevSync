"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Award, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Search, 
  ArrowUpDown, 
  Loader2, 
  ExternalLink,
  Trash2
} from "lucide-react";

interface ContributionItem {
  id: string;
  title: string;
  type: "resource" | "blog" | "thread";
  created_at: string;
  category?: string | null;
  subject?: string | null;
  external_url?: string | null;
  slug?: string | null;
}

export default function ContributionsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "resources" | "blogs" | "threads">("all");
  
  // Data States
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  useEffect(() => {
    const fetchContributions = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/login");
          return;
        }
        setUserId(user.id);

        // Fetch Resources, Blogs, and Threads created by user
        const [resData, blogData, threadData] = await Promise.all([
          supabase.from("resources").select("id, title, category, subject, external_url, created_at").eq("author_id", user.id),
          supabase.from("blog_posts").select("id, title, status, slug, created_at").eq("author_id", user.id),
          supabase.from("forum_threads").select("id, title, category, created_at").eq("author_id", user.id)
        ]);

        const items: ContributionItem[] = [];

        if (resData.data) {
          resData.data.forEach(r => {
            items.push({
              id: r.id,
              title: r.title,
              type: "resource",
              created_at: r.created_at,
              category: r.category,
              subject: r.subject,
              external_url: r.external_url
            });
          });
        }

        if (blogData.data) {
          blogData.data.forEach(b => {
            items.push({
              id: b.id,
              title: b.title,
              type: "blog",
              created_at: b.created_at,
              slug: b.slug,
              category: b.status
            });
          });
        }

        if (threadData.data) {
          threadData.data.forEach(t => {
            items.push({
              id: t.id,
              title: t.title,
              type: "thread",
              created_at: t.created_at,
              category: t.category
            });
          });
        }

        setContributions(items);
      } catch (err) {
        console.error("Failed to load contributions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributions();
  }, [supabase, router]);

  // Delete/Remove Contribution Handler
  const handleDeleteContribution = async (id: string, type: "resource" | "blog" | "thread") => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      let table = "";
      if (type === "resource") table = "resources";
      else if (type === "blog") table = "blog_posts";
      else if (type === "thread") table = "forum_threads";

      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", id);

      if (error) throw error;

      setContributions(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(`Failed to delete ${type}:`, err);
    }
  };

  const getFilteredAndSorted = () => {
    const q = searchQuery.toLowerCase().trim();
    
    // Filter by search query
    let filtered = contributions.filter(c => 
      c.title.toLowerCase().includes(q) || 
      (c.subject && c.subject.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))
    );

    // Filter by tab
    if (activeTab === "resources") {
      filtered = filtered.filter(c => c.type === "resource");
    } else if (activeTab === "blogs") {
      filtered = filtered.filter(c => c.type === "blog");
    } else if (activeTab === "threads") {
      filtered = filtered.filter(c => c.type === "thread");
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  };

  const processedList = getFilteredAndSorted();
  const resourcesCount = contributions.filter(c => c.type === "resource").length;
  const blogsCount = contributions.filter(c => c.type === "blog").length;
  const threadsCount = contributions.filter(c => c.type === "thread").length;

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 bg-primary-50 text-primary flex items-center justify-center border-2 border-primary-100 shadow-inner animate-in fade-in duration-200">
          <Award className="h-5.5 w-5.5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white">
            My Contributions
          </h2>
          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
            Track and manage study files, technical blog posts, and discussion topics you shared.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="pixel-card p-4 border border-zinc-150 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-zinc-50/50 dark:bg-zinc-850/50 p-1 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-650">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white dark:bg-zinc-900 text-primary shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                : "hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            All ({contributions.length})
          </button>
          <button
            onClick={() => setActiveTab("resources")}
            className={`px-3.5 py-1.5 transition-all cursor-pointer ${
              activeTab === "resources"
                ? "bg-white dark:bg-zinc-900 text-primary shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                : "hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Resources ({resourcesCount})
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`px-3.5 py-1.5 transition-all cursor-pointer ${
              activeTab === "blogs"
                ? "bg-white dark:bg-zinc-900 text-primary shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                : "hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Blogs ({blogsCount})
          </button>
          <button
            onClick={() => setActiveTab("threads")}
            className={`px-3.5 py-1.5 transition-all cursor-pointer ${
              activeTab === "threads"
                ? "bg-white dark:bg-zinc-900 text-primary shadow-sm border border-zinc-200/50 dark:border-zinc-800"
                : "hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Discussions ({threadsCount})
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 flex-1 md:justify-end">
          <div className="relative w-full max-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contributions..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-primary dark:border-zinc-800 dark:text-white transition-all font-semibold"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold shrink-0">
            <ArrowUpDown className="h-4 w-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-primary dark:border-zinc-800 dark:text-white transition-all cursor-pointer"
            >
              <option value="newest">Created Newest</option>
              <option value="oldest">Created Oldest</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contributions List */}
      {isLoading ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
        </div>
      ) : processedList.length === 0 ? (
        <div className="pixel-card p-12 text-center border border-zinc-150 dark:border-zinc-800">
          <Award className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
            No contributions found
          </h3>
          <p className="text-xs text-zinc-400 font-semibold max-w-sm mx-auto">
            {searchQuery ? "No matches for your search." : "You haven't contributed any content yet. Start by sharing a resource, writing a blog post, or starting a discussion!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {processedList.map((item) => {
            const dateStr = new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            
            // Icon selection
            const Icon = item.type === "resource" ? BookOpen : item.type === "blog" ? FileText : MessageSquare;
            const colorClass = item.type === "resource" ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/10" : item.type === "blog" ? "bg-primary-50 text-primary border-primary-100 dark:bg-primary-950/20 dark:text-primary-300 dark:border-primary-900/10" : "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/10";
            
            // Navigation link target
            const viewHref = item.type === "resource" ? (item.external_url ?? `/resources`) : item.type === "blog" ? `/blogs/${item.slug}` : `/forums/${item.id}`;
            const isExternal = item.type === "resource";

            return (
              <div 
                key={item.id}
                className="pixel-card p-4 border border-zinc-150 dark:border-zinc-800 flex items-center justify-between gap-4 animate-in fade-in duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-9 w-9 border flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide">
                      {item.type.toUpperCase()} • {item.category || "GENERAL"} • {dateStr}
                    </span>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight truncate">
                      {item.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={viewHref}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-250 hover:border-primary text-zinc-400 hover:text-primary transition-all cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleDeleteContribution(item.id, item.type)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-250 hover:border-red-500 hover:bg-red-50 text-zinc-450 hover:text-red-500 transition-all cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
