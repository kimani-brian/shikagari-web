import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  rounded?:   "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export default function Skeleton({ className, rounded = "lg" }: SkeletonProps) {
  const roundedMap = {
    sm:   "rounded-sm",
    md:   "rounded-md",
    lg:   "rounded-lg",
    xl:   "rounded-xl",
    "2xl":"rounded-2xl",
    full: "rounded-full",
  };

  return (
    <div className={cn("skeleton", roundedMap[rounded], className)} />
  );
}

export function CarCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card">
      <Skeleton className="w-full h-48" rounded="sm" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16" rounded="md" />
          <Skeleton className="h-6 w-16" rounded="md" />
          <Skeleton className="h-6 w-16" rounded="md" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function CarGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CarCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CarDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="w-full h-80 md:h-[480px]" rounded="2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16" rounded="xl" />
            ))}
          </div>
          <Skeleton className="h-32" rounded="xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40" rounded="2xl" />
          <Skeleton className="h-12" rounded="xl" />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11" rounded="xl" />
        </div>
      ))}
      <Skeleton className="h-11 w-32 mt-4" rounded="xl" />
    </div>
  );
}