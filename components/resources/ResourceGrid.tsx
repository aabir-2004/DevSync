"use client";

import ResourceCard, { Resource } from "./ResourceCard";
import Skeleton from "@/components/shared/Skeleton";

interface ResourceGridProps {
  resources: Resource[];
  isLoading: boolean;
}

export default function ResourceGrid({ resources, isLoading }: ResourceGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="premium-card rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-12 rounded" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 my-1" />
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-7 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="premium-card rounded-3xl p-10 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-bold text-zinc-900 dark:text-white">
          No resources found
        </p>
        <p className="text-xs text-zinc-500 mt-1.5 max-w-xs">
          Try adjusting your filters or search keywords, or be the first to contribute a resource!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {resources.map((res) => (
        <ResourceCard key={res.id} resource={res} />
      ))}
    </div>
  );
}
