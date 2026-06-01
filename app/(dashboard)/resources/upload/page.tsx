import ResourceUploadForm from "@/components/resources/ResourceUploadForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share a Resource",
  description: "Contribute learning materials to the DecSync community.",
};

export default function ResourceUploadPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="premium-card rounded-3xl p-8 bg-white dark:bg-zinc-900 shadow-lg border border-zinc-150/80 dark:border-zinc-800/80">
        <ResourceUploadForm />
      </div>
    </div>
  );
}
