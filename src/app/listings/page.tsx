"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, Grid3X3, List } from "lucide-react";
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
    <div className="min-h-screen bg-surface-muted">

      {/* Sticky search bar */}
      <div className="bg-white border-b border-slate-100 sticky top-[var(--nav-height)] z-30">
        <PageWrapper className="py-4">
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
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden shrink-0 relative"
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-700 text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <div className="hidden sm:flex items-center border border-slate-200 rounded-xl overflow-hidden">
              <ViewToggleBtn active={viewMode === "grid"} onClick={() => setViewMode("grid")} icon={<Grid3X3 className="w-4 h-4" />} />
              <ViewToggleBtn active={viewMode === "list"} onClick={() => setViewMode("list")} icon={<List className="w-4 h-4" />} />
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

            {/* Results bar */}
            <div className="flex items-center justify-between mb-5">
              <div>
                {!loading && (
                  <p className="text-sm text-slate-600">
                    {meta?.total_items !== undefined ? (
                      <>
                        <span className="font-bold text-slate-900">
                          {meta.total_items.toLocaleString()}
                        </span>{" "}
                        {meta.total_items === 1 ? "car" : "cars"} found
                        {filters.location && (
                          <span className="text-slate-400"> in {filters.location}</span>
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
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price ↑</option>
                  <option value="price_desc">Price ↓</option>
                  <option value="year_desc">Year ↓</option>
                </select>
              </div>
            </div>

            {/* Active filter pills */}
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
                    label={`KES ${filters.min_price?.toLocaleString() ?? "0"} – ${filters.max_price?.toLocaleString() ?? "any"}`}
                    onRemove={() => setFilters((p) => ({ ...p, min_price: undefined, max_price: undefined, page: 1 }))}
                  />
                )}
                {(filters.min_year || filters.max_year) && (
                  <FilterPill
                    label={`${filters.min_year ?? "any"} – ${filters.max_year ?? "any"}`}
                    onRemove={() => setFilters((p) => ({ ...p, min_year: undefined, max_year: undefined, page: 1 }))}
                  />
                )}
                <button
                  onClick={() => setFilters({ page: 1, per_page: 20, sort_by: "newest" })}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm">
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
              <div className="space-y-4">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <ListCardSkeleton key={i} />)
                  : listings.length === 0
                  ? <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center"><p className="text-slate-400 text-sm">No listings found</p></div>
                  : listings.map((listing, i) => (
                      <div key={listing.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                        <CarCard listing={listing} />
                      </div>
                    ))
                }
              </div>
            )}

            {meta && meta.total_pages > 1 && (
              <div className="mt-10">
                <Pagination
                  page={meta.page}
                  totalPages={meta.total_pages}
                  onPageChange={handlePageChange}
                />
                <p className="text-center text-xs text-slate-400 mt-3">
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

// ── Active filter pill ─────────────────────────────────────────────────────────
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold">
      {label}
      <button onClick={onRemove} className="hover:text-brand-900 transition-colors ml-0.5">×</button>
    </span>
  );
}

function ViewToggleBtn({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn("p-2 transition-colors", active ? "bg-brand-700 text-white" : "bg-white text-slate-400 hover:text-slate-600")}
    >
      {icon}
    </button>
  );
}

function ListCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 animate-pulse">
      <div className="w-40 h-28 rounded-xl bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-5 bg-slate-200 rounded w-1/3" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-16 bg-slate-200 rounded-md" />
          <div className="h-5 w-16 bg-slate-200 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-muted py-10">
        <div className="mx-auto max-w-7xl px-4">
          <CarGridSkeleton count={8} />
        </div>
      </div>
    }>
      <ListingsPageInner />
    </Suspense>
  );
}
