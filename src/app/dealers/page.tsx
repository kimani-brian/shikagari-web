"use client";

import PageWrapper from "@/components/layout/PageWrapper";
import CarGrid from "@/components/cars/CarGrid";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useMemo, type ComponentType } from "react";
import { useListings } from "@/hooks/useListings";
import { ListingFilters } from "@/types";
import { Building2, ShieldCheck, PhoneCall } from "lucide-react";

const HERO_STATS = [
  { label: "Verified dealer groups", value: "180+" },
  { label: "Cities covered", value: "32" },
  { label: "Avg. inquiry response", value: "< 6h" },
];

export default function DealersPage() {
  const filters = useMemo<ListingFilters>(
    () => ({ seller_type: "dealer", sort_by: "newest", per_page: 12 }),
    []
  );
  const { listings, loading, error, refetch } = useListings(filters);

  return (
    <div className="bg-surface-muted">
      <section className="bg-gradient-to-b from-brand-700 via-brand-800 to-navy text-white">
        <PageWrapper className="py-20 flex flex-col gap-10">
          <div className="max-w-3xl space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Dealer network
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              Meet the trusted dealers powering Kenya's used-car economy.
            </h1>
            <p className="text-lg text-blue-100/80">
              Browse inventory straight from vetted franchise and independent dealers. Every showroom is
              verified, geo-tagged, and monitored for response quality, so buyers know they are speaking with the
              real seller.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Become a dealer
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" size="lg" className="text-white border border-white/30">
                  Talk to partnerships
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-5"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-brand-100">{stat.label}</p>
                <p className="text-3xl font-display mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-16 space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Building2}
            title="Dealer CRM tools"
            copy="Reply to buyer inquiries, sync WhatsApp follow-ups, and mark cars as sold from one dashboard."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Verification & compliance"
            copy="Listings stay live only if business documents, KRA PIN, and showroom contact are valid."
          />
          <FeatureCard
            icon={PhoneCall}
            title="High-intent leads"
            copy="We prioritise buyers that share financing readiness and preferred inspection partners."
          />
        </section>

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live inventory</p>
              <h2 className="font-display text-3xl text-slate-900">Latest dealer listings</h2>
              <p className="text-slate-500 mt-1">Fresh stock from franchise groups and boutique showrooms.</p>
            </div>
            <Button variant="outline" onClick={refetch} className="w-full sm:w-auto">
              Refresh inventory
            </Button>
          </div>
          {error ? (
            <div className="p-6 border border-red-200 bg-red-50 rounded-2xl text-sm text-red-700">
              {error}
            </div>
          ) : (
            <CarGrid listings={listings} loading={loading} emptyVariant="listings" />
          )}
        </section>

        <section className="bg-white rounded-3xl border border-slate-100 shadow-card p-8 flex flex-col gap-4">
          <h3 className="font-display text-2xl text-slate-900">Ready to showcase your inventory?</h3>
          <p className="text-slate-500 max-w-3xl">
            Publish unlimited listings, add unlimited staff accounts, and get access to marketing placements
            on the ShikaGari home page. Dealer onboarding takes less than 48 hours once documents are verified.
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
  icon: Icon,
  title,
  copy,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  copy: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-3">
      <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500 leading-relaxed">{copy}</p>
    </div>
  );
}
