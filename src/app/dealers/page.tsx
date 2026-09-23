"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import CarGrid from "@/components/cars/CarGrid";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useMemo } from "react";
import { useListings } from "@/hooks/useListings";
import { ListingFilters } from "@/types";
import Icon from "@/components/ui/Icon";

const HERO_STATS = [
  { label: "Dealer groups", value: "180+" },
  { label: "Cities covered", value: "32" },
  { label: "Avg response", value: "6h" },
];

export default function DealersPage() {
  const filters = useMemo<ListingFilters>(() => ({ seller_type: "dealer", sort_by: "newest", per_page: 12 }), []);
  const { listings, loading, error, refetch } = useListings(filters);

  return (
    <div className="bg-white">
      <section className="border-b border-neutral-200">
        <PageWrapper className="py-14 flex flex-col gap-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-medium text-neutral-500 flex items-center gap-2">
              <Icon name="storefront" size={16} />
              Dealer network
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-neutral-900">
              Dealers across Kenya
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Browse inventory from dealers. Each showroom is listed with contact details so you can reach the seller directly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button variant="primary" size="md">
                  Become a dealer
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="md">
                  Talk to partnerships
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
                <p className="text-xl font-semibold text-neutral-900 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-10 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FeatureCard icon="storefront" title="Manage listings" copy="Reply to inquiries and update inventory from one place." />
          <FeatureCard icon="shield" title="Business details" copy="Listings include dealer information and contact details." />
          <FeatureCard icon="chat_bubble" title="Direct leads" copy="Buyers contact you directly to ask questions and arrange viewing." />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-neutral-500">Live inventory</p>
              <h2 className="text-lg font-semibold text-neutral-900">Latest dealer listings</h2>
              <p className="text-xs text-neutral-500 mt-1">Recent stock from dealers.</p>
            </div>
            <Button variant="secondary" onClick={refetch} className="w-full sm:w-auto">
              Refresh
            </Button>
          </div>
          {error ? (
            <div className="p-4 border border-neutral-200 bg-neutral-50 rounded-xl text-sm text-neutral-700">{error}</div>
          ) : (
            <CarGrid listings={listings} loading={loading} emptyVariant="listings" />
          )}
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
