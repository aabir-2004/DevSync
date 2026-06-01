"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slugify";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code as CodeIcon, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Sparkles,
  Loader2,
  Tag as TagIcon
} from "lucide-react";

export default function BlogEditor() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your technical blog post here...</p>",
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed",
      },
    },
  });

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase();
      if (val && !tags.includes(val)) {
        setTags((prev) => [...prev, val]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const htmlContent = editor?.getHTML() || "";
    if (!htmlContent || htmlContent === "<p></p>" || htmlContent === "<p>Start writing your technical blog post here...</p>") {
      setError("Blog content is required");
      return;
    }

    setIsLoading(true);

    try {
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to publish a blog post.");
      }

      // Generate slug
      let generatedSlug = slugify(title);

      // Verify slug uniqueness (in case of duplicates, append a numeric suffix)
      const { data: existingPost } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", generatedSlug)
        .maybeSingle();

      if (existingPost) {
        generatedSlug = `${generatedSlug}-${Math.floor(Date.now() / 1000).toString().slice(-4)}`;
      }

      // Insert blog post
      const { error: insertError } = await supabase.from("blog_posts").insert({
        title,
        slug: generatedSlug,
        content: htmlContent,
        excerpt: excerpt || null,
        tags,
        status,
        author_id: user.id,
        views: 0,
        upvotes: 0,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      router.push("/blogs");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center sm:text-left mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            Write a Tech Blog
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Publish technical posts, tutorials, or dev journals for the community.
          </p>
        </div>

        {/* Action Toggle Draft/Publish */}
        <div className="flex items-center justify-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="rounded-2xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 focus:outline-none dark:border-zinc-800 dark:text-white cursor-pointer"
          >
            <option value="published">Publish Now</option>
            <option value="draft">Save Draft</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
          {error}
        </div>
      )}

      {/* Blog Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Blog Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. In-depth Guide to React Server Components"
          disabled={isLoading}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all font-semibold"
        />
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Brief Excerpt (Optional)
        </label>
        <input
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A quick one-sentence summary for the preview feed..."
          disabled={isLoading}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all"
        />
      </div>

      {/* rich text editor toolbar */}
      {editor && (
        <div className="border border-zinc-200 rounded-3xl dark:border-zinc-800 bg-zinc-50/20 overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 ${editor.isActive("bold") ? "text-primary bg-primary-50 primary-950/20" : "text-zinc-400"}`}
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 ${editor.isActive("italic") ? "text-primary bg-primary-50 primary-950/20" : "text-zinc-400"}`}
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 ${editor.isActive("strike") ? "text-primary bg-primary-50 primary-950/20" : "text-zinc-400"}`}
            >
              <Strikethrough className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 ${editor.isActive("code") ? "text-primary bg-primary-50 primary-950/20" : "text-zinc-400"}`}
            >
              <CodeIcon className="h-4 w-4" />
            </button>
            <div className="w-px bg-zinc-200 zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 ${editor.isActive("heading", { level: 1 }) ? "text-primary bg-primary-50 primary-950/20" : "text-zinc-400"}`}
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 ${editor.isActive("heading", { level: 2 }) ? "text-primary bg-primary-50 primary-950/20" : "text-zinc-400"}`}
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <div className="w-px bg-zinc-200 zinc-800 mx-1" />
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 ${editor.isActive("bulletList") ? "text-primary bg-primary-50 primary-950/20" : "text-zinc-400"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 ${editor.isActive("orderedList") ? "text-primary bg-primary-50 primary-950/20" : "text-zinc-400"}`}
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 ${editor.isActive("blockquote") ? "text-primary bg-primary-50 primary-950/20" : "text-zinc-400"}`}
            >
              <Quote className="h-4 w-4" />
            </button>
          </div>

          {/* Editor Area */}
          <div className="p-4 bg-white zinc-950 min-h-[300px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
          <TagIcon className="h-3.5 w-3.5 text-zinc-400" />
          Tags (Press Enter or Comma to add)
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="e.g. nextjs, frontend, optimization"
          disabled={isLoading}
          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 py-2.5 px-4 text-xs text-zinc-900 focus:border-primary focus:bg-white focus:outline-none dark:border-zinc-800 dark:text-white transition-all"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 zinc-800 dark:text-zinc-200 text-xs px-2.5 py-0.5 rounded-full">
                {t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="text-zinc-400 hover:text-zinc-600 font-bold ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-900 py-3 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>{status === "published" ? "Publish Blog Post" : "Save as Draft"}</span>
        )}
      </button>
    </form>
  );
}
