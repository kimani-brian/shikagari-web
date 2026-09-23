"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ListingFilters } from "@/types";
import { useListings } from "@/hooks/useListings";
import CarGrid from "@/components/cars/CarGrid";
import CarCard from "@/components/cars/CarCard";
import FilterSidebar from "@/components/search/FilterSidebar";
import SearchBar from "@/components/search/SearchBar";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";
import Icon from "@/components/ui/Icon";
import { CarGridSkeleton } from "@/components/ui/Skeleton";

function parseFiltersFromURL(params: URLSearchParams): ListingFilters {
  return {
    search:       params.get("search")       || undefined,
    location:     params.get("location")     || undefined,
    make:         params.get("make")         || undefined,
    model:        params.get("model")        || undefined,
    min_year:     params.get("min_year")     ? Number(params.get("min_year"))  : undefined,
    max_year:     params.get("max_year")     ? Number(params.get("max_year"))  : undefined,
    min_price:    params.get("min_price")    ? Number(params.get("min_price")) : undefined,
    max_price:    params.get("max_price")    ? Number(params.get("max_price")) : undefined,
    fuel_type:    (params.get("fuel_type")   as ListingFilters["fuel_type"])   || undefined,
    transmission: (params.get("transmission") as ListingFilters["transmission"]) || undefined,
    seller_type:  (params.get("seller_type") as ListingFilters["seller_type"]) || undefined,
    sort_by:      params.get("sort_by")      || "newest",
    page:         params.get("page")         ? Number(params.get("page"))      : 1,
    per_page:     20,
  };
}

function filtersToURL(filters: ListingFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && k !== "per_page") {
      params.set(k, String(v));
    }
  });
  return params.toString();
}

function ListingsPageInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [filters,          setFilters]          = useState<ListingFilters>(() =>
    parseFiltersFromURL(searchParams)
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode,         setViewMode]         = useState<"grid" | "list">("grid");

  const { listings, meta, loading, error } = useListings(filters);

  useEffect(() => {
    router.push(`/listings?${filtersToURL(filters)}`, { scroll: false });
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFilters(parseFiltersFromURL(searchParams));
  }, [searchParams.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiltersChange = useCallback((newFilters: ListingFilters) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => !["page", "per_page", "sort_by"].includes(k) && v !== undefined && v !== ""
  ).length;

  return (
    <div className="min-h-screen bg-white">

      <div className="bg-white border-b border-neutral-200 sticky top-[var(--nav-height)] z-30">
        <PageWrapper className="py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar
                variant="compact"
                initialValues={{ query: filters.search }}
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="tune" size={18} />}
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden shrink-0 relative"
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-neutral-900 text-white text-[9px] font-medium flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <div className="hidden sm:flex items-center border border-neutral-200 rounded-full overflow-hidden">
              <ViewToggleBtn active={viewMode === "grid"} onClick={() => setViewMode("grid")} icon={<Icon name="grid_view" size={18} />} />
              <ViewToggleBtn active={viewMode === "list"} onClick={() => setViewMode("list")} icon={<Icon name="view_list" size={18} />} />
            </div>
          </div>
        </PageWrapper>
      </div>

      <PageWrapper className="py-6">
        <div className="flex gap-6">

          <FilterSidebar
            activeFilters={filters}
            onFiltersChange={handleFiltersChange}
            totalResults={meta?.total_items}
            isMobileOpen={mobileFilterOpen}
            onMobileClose={() => setMobileFilterOpen(false)}
          />

          <div className="flex-1 min-w-0">

            <div className="flex items-center justify-between mb-5">
              <div>
                {!loading && (
                  <p className="text-sm text-neutral-600">
                    {meta?.total_items !== undefined ? (
                      <>
                        <span className="font-semibold text-neutral-900">
                          {meta.total_items.toLocaleString()}
                        </span>{" "}
                        {meta.total_items === 1 ? "car" : "cars"} found
                        {filters.location && (
                          <span className="text-neutral-400"> in {filters.location}</span>
                        )}
                      </>
                    ) : "Searching..."}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <select
                  value={filters.sort_by ?? "newest"}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort_by: e.target.value, page: 1 }))}
                  className="text-xs border border-neutral-200 rounded-full px-3 py-1.5 bg-white text-neutral-700 focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price low to high</option>
                  <option value="price_desc">Price high to low</option>
                  <option value="year_desc">Year newest</option>
                </select>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.search      && <FilterPill label={`"${filters.search}"`}            onRemove={() => setFilters((p) => ({ ...p, search: undefined,       page: 1 }))} />}
                {filters.location    && <FilterPill label={filters.location}                  onRemove={() => setFilters((p) => ({ ...p, location: undefined,     page: 1 }))} />}
                {filters.make        && <FilterPill label={filters.make}                      onRemove={() => setFilters((p) => ({ ...p, make: undefined,         page: 1 }))} />}
                {filters.fuel_type   && <FilterPill label={filters.fuel_type}                 onRemove={() => setFilters((p) => ({ ...p, fuel_type: undefined,    page: 1 }))} />}
                {filters.transmission && <FilterPill label={filters.transmission}             onRemove={() => setFilters((p) => ({ ...p, transmission: undefined, page: 1 }))} />}
                {filters.seller_type  && <FilterPill label={`${filters.seller_type} seller`}  onRemove={() => setFilters((p) => ({ ...p, seller_type: undefined,  page: 1 }))} />}
                {(filters.min_price || filters.max_price) && (
                  <FilterPill
                    label={`KES ${filters.min_price?.toLocaleString() ?? "0"} to ${filters.max_price?.toLocaleString() ?? "any"}`}
                    onRemove={() => setFilters((p) => ({ ...p, min_price: undefined, max_price: undefined, page: 1 }))}
                  />
                )}
                {(filters.min_year || filters.max_year) && (
                  <FilterPill
                    label={`${filters.min_year ?? "any"} to ${filters.max_year ?? "any"}`}
                    onRemove={() => setFilters((p) => ({ ...p, min_year: undefined, max_year: undefined, page: 1 }))}
                  />
                )}
                <button
                  onClick={() => setFilters({ page: 1, per_page: 20, sort_by: "newest" })}
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-900 px-2 py-1 rounded-full hover:bg-neutral-100 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {error && (
              <div className="bg-neutral-50 border border-neutral-200 text-neutral-700 rounded-xl p-4 mb-5 text-sm">
                {error}
              </div>
            )}

            {viewMode === "grid" ? (
              <CarGrid
                listings={listings}
                loading={loading}
                emptyVariant={activeFilterCount > 0 ? "search" : "listings"}
              />
            ) : (
              <div className="space-y-3">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <ListCardSkeleton key={i} />)
                  : listings.length === 0
                  ? <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center"><p className="text-neutral-500 text-sm">No listings found</p></div>
                  : listings.map((listing) => (
                      <CarCard key={listing.id} listing={listing} />
                    ))
                }
              </div>
            )}

            {meta && meta.total_pages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={meta.page}
                  totalPages={meta.total_pages}
                  onPageChange={handlePageChange}
                />
                <p className="text-center text-xs text-neutral-400 mt-3">
                  Page {meta.page} of {meta.total_pages} — {meta.total_items.toLocaleString()} total
                </p>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-neutral-300 transition-colors ml-0.5">×</button>
    </span>
  );
}

function ViewToggleBtn({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn("p-2 transition-colors", active ? "bg-neutral-900 text-white" : "bg-white text-neutral-400 hover:text-neutral-600")}
    >
      {icon}
    </button>
  );
}

function ListCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 flex gap-4 animate-pulse">
      <div className="w-40 h-28 rounded-xl bg-neutral-100 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-neutral-100 rounded w-3/4" />
        <div className="h-5 bg-neutral-100 rounded w-1/3" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-16 bg-neutral-100 rounded-full" />
          <div className="h-5 w-16 bg-neutral-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white py-10">
        <div className="mx-auto max-w-7xl px-4">
          <CarGridSkeleton count={8} />
        </div>
      </div>
    }>
      <ListingsPageInner />
    </Suspense>
  );
}
