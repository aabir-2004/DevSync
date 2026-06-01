import BlogEditor from "@/components/blogs/BlogEditor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write Blog",
  description: "Compose and publish a technical post for the community.",
};

export default function BlogWritePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="premium-card rounded-3xl p-8 bg-white dark:bg-zinc-900 shadow-lg border border-zinc-150/80 dark:border-zinc-800/80">
        <BlogEditor />
      </div>
    </div>
  );
}
