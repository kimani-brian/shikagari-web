"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";
import { useDealers } from "@/hooks/useDealers";
import { DealerProfile } from "@/types";
import Icon from "@/components/ui/Icon";
import { API_ORIGIN } from "@/lib/config";
import Pagination from "@/components/ui/Pagination";
import Skeleton from "@/components/ui/Skeleton";

export default function DealersPage() {
  const [page, setPage] = useState(1);
  const { dealers, meta, loading, error, refetch } = useDealers(page, 12);

  return (
    <div className="bg-white">
      <section className="border-b border-neutral-200">
        <PageWrapper className="py-14 flex flex-col gap-8">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-neutral-900">
              Showrooms
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Connect with verified car dealers across Kenya. Find your next car today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button variant="primary" size="md">
                  Become a dealer
                </Button>
              </Link>
            </div>
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-10 space-y-10">
        {/* Approved dealers grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Approved partners</h2>
            </div>
            <Button variant="secondary" onClick={refetch} className="w-full sm:w-auto">
              Refresh
            </Button>
          </div>

          {error ? (
            <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-xl text-sm text-neutral-700">{error}</div>
          ) : loading ? (
            <DealerGridSkeleton count={8} />
          ) : dealers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                <Icon name="storefront" size={20} className="text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-900">No approved dealers yet</p>
              <p className="text-xs text-neutral-500 mt-1">Dealer profiles appear here after admin approval.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {dealers.map((dealer) => (
                  <DealerCard key={dealer.id} dealer={dealer} />
                ))}
              </div>
              {meta && meta.total_pages > 1 && (
                <div className="pt-2">
                  <Pagination page={meta.page} totalPages={meta.total_pages} onPageChange={setPage} />
                  <p className="text-center text-xs text-neutral-400 mt-3">
                    Page {meta.page} of {meta.total_pages} — {meta.total_items.toLocaleString()} total
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FeatureCard icon="storefront" title="Manage listings" copy="Reply to inquiries and update inventory from one place." />
          <FeatureCard icon="shield" title="Business details" copy="Listings include dealer information and contact details." />
          <FeatureCard icon="chat_bubble" title="Direct leads" copy="Buyers contact you directly to ask questions and arrange viewing." />
        </section>

        <section className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 flex flex-col gap-4">
          <h3 className="text-base font-semibold text-neutral-900">Show your inventory</h3>
          <p className="text-sm text-neutral-500 max-w-3xl">
            Publish listings and manage inquiries. Dealer onboarding is completed after document review.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register">
              <Button variant="primary">Start selling</Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary">Book a demo</Button>
            </Link>
          </div>
        </section>
      </PageWrapper>
    </div>
  );
}

function DealerCard({ dealer }: { dealer: DealerProfile }) {
  const logoUrl = dealer.logo_url
    ? dealer.logo_url.startsWith("http")
      ? dealer.logo_url
      : `${API_ORIGIN}${dealer.logo_url.startsWith("/") ? "" : "/"}${dealer.logo_url}`
    : null;

  return (
    <Link
      href={`/dealers/${dealer.id}`}
      className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-900 transition-colors flex flex-col"
    >
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center shrink-0 overflow-hidden">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={dealer.business_name} className="w-full h-full object-cover" />
            ) : (
              <Icon name="storefront" size={20} className="text-neutral-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-neutral-900 truncate group-hover:text-black">
              {dealer.business_name}
            </h3>
            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
              <Icon name="location_on" size={12} className="text-neutral-400" />
              <span className="truncate">{dealer.location}</span>
            </p>
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-900 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Verified dealer
            </span>
          </div>
        </div>

        {dealer.address && (
          <p className="text-xs text-neutral-500 line-clamp-1 flex items-center gap-1.5">
            <Icon name="location_on" size={12} className="text-neutral-400 shrink-0" />
            {dealer.address}
          </p>
        )}

        {dealer.description ? (
          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{dealer.description}</p>
        ) : (
          <p className="text-xs text-neutral-400 italic">No showroom description.</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-100">
          <span className="text-xs text-neutral-500 truncate pr-2">{dealer.user.full_name}</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-900 group-hover:gap-1.5 transition-all shrink-0">
            View cars
            <Icon name="chevron_right" size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function DealerGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4 animate-pulse">
          <div className="flex gap-3">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex justify-between pt-3 border-t border-neutral-100">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  copy,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  copy: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-3">
      <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center">
        <Icon name={icon} size={18} className="text-white" />
      </div>
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      <p className="text-xs text-neutral-500 leading-relaxed">{copy}</p>
    </div>
  );
}
