import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

interface ResourcePageProps {
  params: Promise<{ id: string }>;
}

export default async function ResourceDetailPage({ params }: ResourcePageProps) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: resource } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .single();

  if (!resource) {
    notFound();
  }

  // Seamless UX redirect straight to the resource (Drive/YouTube)
  redirect(resource.external_url);
}
