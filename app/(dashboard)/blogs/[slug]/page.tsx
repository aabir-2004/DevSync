import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, Sparkles } from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import Tag from "@/components/shared/Tag";
import VoteButton from "@/components/shared/VoteButton";
import BlogComments from "@/components/blogs/BlogComments";

interface BlogReaderPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogReaderPage({ params }: BlogReaderPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch blog post details
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*, users(name, avatar_url, batch)")
    .eq("slug", slug)
    .single();

  if (error || !post) {
    notFound();
  }

  // Increment views count (server side update)
  await supabase
    .from("blog_posts")
    .update({ views: post.views + 1 })
    .eq("id", post.id);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <article className="space-y-6">
      {/* Back Button */}
      <Link
        href="/blogs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blogs
      </Link>

      {/* Hero Header */}
      <div className="premium-card rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/60 shadow-md">
        <div className="space-y-4">
          
          {/* Category/Meta */}
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold tracking-wide uppercase">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              Technical Post
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Eye className="h-4 w-4" />
              {post.views + 1} views
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t: string) => (
                <Tag key={t} label={t} size="xs" variant="secondary" />
              ))}
            </div>
          )}

          <div className="h-px bg-zinc-150 dark:bg-zinc-800 my-2" />

          {/* Author Meta Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <Avatar 
                name={post.users?.name || "Student"} 
                src={post.users?.avatar_url} 
                size="sm" 
              />
              <div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {post.users?.name || "Student"}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                  Cohort: {post.users?.batch || "DecSync Cohort"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.created_at)}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/forums/new?blog_id=${post.id}`}
                  className="pixel-btn text-[8px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:text-primary transition-all flex items-center gap-1 py-1.5 px-3 uppercase tracking-wider"
                >
                  PULL TO DISCUSS
                </Link>
                <VoteButton initialScore={post.upvotes} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Rich text Content */}
      <div className="premium-card rounded-3xl p-6 md:p-8 bg-white dark:bg-zinc-900 shadow-md">
        <div 
          className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 space-y-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Blog Comments Section */}
      <BlogComments blogId={post.id} />

    </article>
  );
}
