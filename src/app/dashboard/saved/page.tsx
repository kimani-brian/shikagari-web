"use client";

import { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import CarCard from "@/components/cars/CarCard";
import EmptyState from "@/components/shared/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import Icon from "@/components/ui/Icon";

export default function SavedCarsPage() {
  const [page, setPage] = useState(1);
  const { listings, meta, loading, error, refetch, unsave } = useFavorites(page);

  // Each heart on the card toggles the same endpoint, so reload afterwards to
  // stay authoritative rather than guessing what the toggle did.
  const handleToggle = () => refetch();

  if (loading && listings.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-neutral-900">
              Saved cars
            </h1>
          </div>
          {meta && (
            <span className="shrink-0 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white">
              <Icon name="favorite" size={14} filled />
              {meta.total_items} saved
            </span>
          )}
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
          {error}
        </div>
      )}

      {!error && listings.length === 0 && !loading && (
        <EmptyState
          variant="favorites"
          title="No saved cars yet"
          description="Use the heart on any car."
          actionLabel="Browse vehicles"
          actionHref="/listings"
        />
      )}

      {listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <CarCard
              key={listing.id}
              listing={listing}
              isFavorited
              onFavoriteToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {meta && meta.total_pages > 1 && (
        <Pagination
          page={page}
          totalPages={meta.total_pages}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
