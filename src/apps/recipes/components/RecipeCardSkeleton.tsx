import { Skeleton } from "@/src/components/ui/skeleton";

export function RecipeCardSkeleton({
  showBookmark = false
}: {
  showBookmark?: boolean;
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="relative h-[160px] w-full">
        <Skeleton className="h-full w-full" />
        {showBookmark && (
          <Skeleton className="absolute left-3 top-3 h-4 w-4 rounded-sm" />
        )}
        <Skeleton className="absolute right-3 top-3 h-6 w-24 rounded-full" />
      </div>
      <div className="space-y-2 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
