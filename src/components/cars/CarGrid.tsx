import { cn } from "@/lib/utils";
import { ListingCard } from "@/types";
import CarCard from "./CarCard";
import EmptyState from "@/components/shared/EmptyState";
import { CarGridSkeleton } from "@/components/ui/Skeleton";

interface CarGridProps {
  listings:          ListingCard[];
  loading?:          boolean;
  favoritedIds?:     Set<string>;
  onFavoriteToggle?: (id: string, saved: boolean) => void;
  className?:        string;
  emptyVariant?:     "listings" | "search";
}

export default function CarGrid({
  listings,
  loading         = false,
  favoritedIds    = new Set(),
  onFavoriteToggle,
  className,
  emptyVariant    = "listings",
}: CarGridProps) {
  if (loading) {
    return <CarGridSkeleton count={8} />;
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        variant={emptyVariant}
        actionLabel="Clear filters"
        className="col-span-full"
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5",
        className
      )}
    >
      {listings.map((listing, i) => (
        <div
          key={listing.id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
        >
          <CarCard
            listing={listing}
            isFavorited={favoritedIds.has(listing.id)}
            onFavoriteToggle={onFavoriteToggle}
          />
        </div>
      ))}
    </div>
  );
}