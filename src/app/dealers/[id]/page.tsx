"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { useDealer } from "@/hooks/useDealers";
import { useListings } from "@/hooks/useListings";
import CarGrid from "@/components/cars/CarGrid";
import Pagination from "@/components/ui/Pagination";
import Skeleton from "@/components/ui/Skeleton";
import { API_ORIGIN } from "@/lib/config";
import { timeAgo } from "@/lib/utils";

export default function DealerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { dealer, loading: dealerLoading, error: dealerError } = useDealer(id);

  const [page, setPage] = useState(1);
  const filters = useMemo(() => ({ dealer_id: id, page, per_page: 12, sort_by: "newest" as const }), [id, page]);
  const { listings, meta, loading: listingsLoading, error: listingsError } = useListings(filters);

  if (dealerLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <PageWrapper>
          <DealerDetailSkeleton />
        </PageWrapper>
      </div>
    );
  }

  if (dealerError || !dealer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="storefront" size={28} className="text-neutral-300" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">Dealer not found</h2>
          <p className="text-neutral-500 text-sm mb-6">
            {dealerError ?? "This dealer profile may have been removed or does not exist."}
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => router.push("/dealers")} leftIcon={<Icon name="arrow_back" size={18} />}>
              Back to dealers
            </Button>
            <Link href="/listings?seller_type=dealer">
              <Button variant="secondary">Browse dealer cars</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const logoUrl = dealer.logo_url
    ? dealer.logo_url.startsWith("http")
      ? dealer.logo_url
      : `${API_ORIGIN}${dealer.logo_url.startsWith("/") ? "" : "/"}${dealer.logo_url}`
    : null;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white pb-12">
      <PageWrapper className="py-6">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link href="/" className="hover:text-neutral-900">
            Home
          </Link>
          <Icon name="chevron_right" size={16} className="text-neutral-300" />
          <Link href="/dealers" className="hover:text-neutral-900">
            Dealers
          </Link>
          <Icon name="chevron_right" size={16} className="text-neutral-300" />
          <span className="text-neutral-900 font-medium truncate max-w-xs">{dealer.business_name}</span>
        </nav>

        {/* Dealer header */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="h-24 sm:h-32 bg-neutral-50 border-b border-neutral-200" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8 sm:-mt-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-neutral-200 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-card">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={dealer.business_name} className="w-full h-full object-cover" />
                ) : (
                  <Icon name="storefront" size={32} className="text-neutral-300" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">{dealer.business_name}</h1>
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-900 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    Verified dealer
                  </span>
                </div>
                <p className="text-sm text-neutral-500 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Icon name="location_on" size={14} className="text-neutral-400" />
                    {dealer.location}
                  </span>
                  {dealer.address && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-neutral-300 hidden sm:inline-block" />
                      <span className="flex items-center gap-1">
                        <Icon name="location_on" size={14} className="text-neutral-400" />
                        {dealer.address}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  href={`tel:${dealer.user.phone}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
                >
                  <Icon name="phone" size={16} />
                  {dealer.user.phone}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2 space-y-4">
                {dealer.description && (
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 tracking-wide uppercase mb-2">About showroom</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{dealer.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <InfoCard icon="storefront" label="Business name" value={dealer.business_name} />
                  <InfoCard icon="shield" label="Reg. number" value={dealer.business_reg_no || "—"} />
                  <InfoCard icon="location_on" label="Location" value={dealer.location} />
                  <InfoCard icon="person" label="Contact" value={dealer.user.full_name} />
                  <InfoCard icon="schedule" label="Member since" value={timeAgo(dealer.created_at)} />
                  <InfoCard icon="check_circle" label="Approved" value={dealer.approved_at ? timeAgo(dealer.approved_at) : "Pending"} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50">
                  <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Contact dealer</h4>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-neutral-900">{dealer.user.full_name}</p>
                    <a href={`tel:${dealer.user.phone}`} className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900">
                      <Icon name="phone" size={16} className="text-neutral-400" />
                      {dealer.user.phone}
                    </a>
                    <p className="text-xs text-neutral-500">
                      Visit showroom at {dealer.address ? `${dealer.address}, ${dealer.location}` : dealer.location}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-neutral-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="info" size={14} className="text-neutral-400" />
                    <span className="text-xs font-medium text-neutral-700">Safety tip</span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Meet at the showroom, verify logbook and service history before payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <section className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-neutral-500">Inventory</p>
              <h2 className="text-lg font-semibold text-neutral-900">Cars from {dealer.business_name}</h2>
              <p className="text-xs text-neutral-500 mt-1">
                {meta ? `${meta.total_items.toLocaleString()} car${meta.total_items === 1 ? "" : "s"} available` : "Browse this dealer's listings."}
              </p>
            </div>
            <Link href={`/listings?dealer_id=${dealer.id}`}>
              <Button variant="secondary" size="sm">
                View with filters
              </Button>
            </Link>
          </div>

          {listingsError ? (
            <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-xl text-sm text-neutral-700">{listingsError}</div>
          ) : (
            <CarGrid listings={listings} loading={listingsLoading} emptyVariant="listings" />
          )}

          {!listingsLoading && listings.length === 0 && !listingsError && (
            <div className="rounded-xl border border-dashed border-neutral-200 p-12 text-center">
              <Icon name="directions_car" size={32} className="text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-900">No cars listed yet</p>
              <p className="text-xs text-neutral-500 mt-1">This dealer has not published any active listings.</p>
              <Link href="/dealers" className="inline-flex mt-4">
                <Button variant="secondary" size="sm">
                  Back to dealers
                </Button>
              </Link>
            </div>
          )}

          {meta && meta.total_pages > 1 && (
            <div className="pt-2">
              <Pagination page={meta.page} totalPages={meta.total_pages} onPageChange={handlePageChange} />
              <p className="text-center text-xs text-neutral-400 mt-3">
                Page {meta.page} of {meta.total_pages} — {meta.total_items.toLocaleString()} total
              </p>
            </div>
          )}
        </section>
      </PageWrapper>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ComponentProps<typeof Icon>["name"]; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
        <Icon name={icon} size={14} />
        <span className="text-[11px] font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="text-sm font-medium text-neutral-900 truncate">{value}</p>
    </div>
  );
}

function DealerDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-4 w-48" />
      <div className="rounded-xl border border-neutral-200 overflow-hidden">
        <Skeleton className="h-24 sm:h-32 w-full" rounded="sm" />
        <div className="px-6 pb-6 space-y-4">
          <div className="flex gap-4 -mt-8">
            <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2 pt-8">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
