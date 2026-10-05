"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";import SearchBar from "@/components/search/SearchBar";
import CarCard from "@/components/cars/CarCard";
import { CarCardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { ListingCard } from "@/types";
import { BODY_TYPES } from "@/lib/vehicles";
import Reveal from "@/components/shared/Reveal";
import {
  Users,
  Mountain,
  CarTaxiFront,
  Gem,
  Zap,
  Bike,
  ArrowUpRight,
} from "lucide-react";

const MAKES = [
  { name: "Toyota", logo: "https://www.carlogos.org/car-logos/toyota-logo.png" },
  { name: "Nissan", logo: "https://www.carlogos.org/car-logos/nissan-logo.png" },
  { name: "Mazda", logo: "https://www.carlogos.org/car-logos/mazda-logo.png" },
  { name: "Subaru", logo: "https://www.carlogos.org/car-logos/subaru-logo.png" },
  { name: "Honda", logo: "https://www.carlogos.org/car-logos/honda-logo.png" },
  { name: "Tesla", logo: "https://www.carlogos.org/car-logos/tesla-logo-2007.png" },
  { name: "Isuzu", logo: "https://www.carlogos.org/car-logos/isuzu-logo.png" },
  { name: "Mercedes-Benz", logo: "https://www.carlogos.org/car-logos/mercedes-benz-logo.png" },
  // second row
  { name: "Volkswagen", logo: "https://www.carlogos.org/car-logos/volkswagen-logo.png" },
  { name: "BMW", logo: "https://www.carlogos.org/car-logos/bmw-logo.png" },
  { name: "Audi", logo: "https://www.carlogos.org/car-logos/audi-logo.png" },
  { name: "Ford", logo: "https://www.carlogos.org/car-logos/ford-logo.png" },
  { name: "Land Rover", logo: "https://www.carlogos.org/car-logos/land-rover-logo.png" },
  { name: "Suzuki", logo: "https://www.carlogos.org/car-logos/suzuki-logo.png" },
  { name: "Hyundai", logo: "https://www.carlogos.org/car-logos/hyundai-logo.png" },
  { name: "BYD", logo: "https://www.carlogos.org/car-logos/byd-logo.png" },
];

const STEPS = [
  {
    icon: "search" as const,
    title: "Search",
    desc: "Filter by location, make, price and year. Save searches to get updates.",
  },
  {
    icon: "directions_car" as const,
    title: "Compare",
    desc: "View photos, specs and pricing side by side to narrow your choice.",
  },
  {
    icon: "chat_bubble" as const,
    title: "Contact",
    desc: "Message sellers directly and arrange a viewing at a time that suits you.",
  },
];

const ACCOUNT_TYPES = [
  {
    title: "Buying a car",
    desc: "Browse thousands of cars across Kenya. Save the ones you like and message sellers directly to arrange a viewing.",
    cta: "Start browsing",
    href: "/listings",
  },
  {
    title: "Selling your car",
    desc: "Got a car to sell? List it in minutes get verified. Start getting inquiries.",
    cta: "Join as a seller",
    href: "/register?role=seller",
  },
  {
    title: "Running a dealership",
    desc: "Put your whole stock online under your business name. Buyers can find all your cars in one place. Start getting inquiries today.",
    cta: "Join as a dealer",
    href: "/register?role=dealer",
  },
];

const CATEGORIES = [
  {
    title: "Family",
    desc: "Roomy rides for the whole crew.",
    href: "/listings?body_type=Van,SUV",
    icon: Users,
  },
  {
    title: "Off-road",
    desc: "SUVs and pickups built for upcountry trips.",
    href: "/listings?body_type=SUV,Pickup",
    icon: Mountain,
  },
  {
    title: "Uber",
    desc: "Fuel sippers that earn from day one.",
    href: "/listings?body_type=Sedan",
    icon: CarTaxiFront,
  },
  {
    title: "Luxury",
    desc: "Executive rides with all the extras.",
    href: "/listings?sort_by=price_desc",
    icon: Gem,
  },
  {
    title: "Sports cars",
    desc: "Coupes with pace and presence.",
    href: "/listings?body_type=Coupe",
    icon: Zap,
  },
  {
    title: "Bikes",
    desc: "Two wheelers for beating traffic.",
    href: "/listings?search=Bike",
    icon: Bike,
  },
];

const COMPARE_POINTS = [
  {
    title: "Shortlist up to 4 cars",
    desc: "Tap the compare button on any listing to add it to your shortlist.",
  },
  {
    title: "See everything together",
    desc: "Price, year, mileage, fuel and more in one clear table.",
  },
  {
    title: "Spot the better deal",
    desc: "Scan across the row and pick your winner with confidence.",
  },
];

// SectionEdge paints a curved top or bottom edge on the dark bands so they
// flow into the neighbouring white/gray sections instead of butting against
// them. `tone` is the colour of the adjacent section. The top and bottom
// curves use different shapes so the band does not look mirrored.
const WAVE_TOP =
  "M0,74 C260,44 500,102 740,72 C980,42 1220,100 1440,66 L1440,120 L0,120 Z";
const WAVE_BOTTOM =
  "M0,0 L1440,0 L1440,68 C1240,12 1010,108 700,56 C410,8 190,112 0,50 Z";

function SectionEdge({
  tone,
  variant,
}: {
  tone: "white" | "muted";
  variant: "top" | "bottom";
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-x-0 h-14 sm:h-24 pointer-events-none z-10",
        variant === "bottom" ? "bottom-0" : "top-0",
        tone === "white" ? "bg-white" : "bg-neutral-50"
      )}
    >
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-full w-full">
        <path fill="#171717" d={variant === "bottom" ? WAVE_BOTTOM : WAVE_TOP} />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState<ListingCard[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/listings?sort_by=newest&per_page=8");
        setFeatured(res.data.data ?? []);
      } catch {
        // silent
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-36 lg:py-48">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 text-center">
              Find cars for sale in Kenya
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 text-center mt-3">
              Search verified vehicles from trusted dealers and individuals
            </p>

            <div className="mt-12">
              <SearchBar variant="hero" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <span className="text-xs text-neutral-400">Popular</span>
              {["Toyota Premio", "Nissan X Trail", "Subaru Forester", "Toyota Fielder"].map((q) => (
                <Link
                  key={q}
                  href={`/listings?search=${encodeURIComponent(q)}`}
                  className="text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-900 rounded-full px-3 py-1 transition-colors"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest listings */}
      <section className="py-12 sm:py-16 bg-neutral-50 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Latest</h2>
            <Link
              href="/listings"
              className="hidden sm:flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
            >
              View all <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loadingFeatured
              ? Array.from({ length: 8 }).map((_, i) => <CarCardSkeleton key={i} />)
              : featured.map((listing) => <CarCard key={listing.id} listing={listing} />)}
          </div>

          <div className="flex justify-center mt-6 sm:hidden">
            <Link href="/listings">
              <Button variant="secondary" size="sm">
                View all listings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative pt-28 pb-28 sm:pt-40 sm:pb-40 bg-neutral-900">
        <SectionEdge tone="muted" variant="top" />
        <SectionEdge tone="white" variant="bottom" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-white">Whatever moves you.</h2>
            <p className="text-xs text-neutral-500 text-right hidden sm:block">
              City streets or open roads. There is a car for every chapter.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-8 lg:gap-x-12">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.title} delay={Math.min(i * 70, 350)}>
                <Link
                  href={cat.href}
                  className="group flex items-center gap-5 sm:gap-6 py-5 border-b border-white/10 transition-colors duration-200 hover:bg-white/[0.04]"
                >
                  <span className="w-11 h-11 rounded-full bg-black border border-white/15 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:border-white/40">
                    <cat.icon className="w-5 h-5 text-white" strokeWidth={1.75} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-white">
                      {cat.title}
                    </span>
                    <span className="block text-xs text-neutral-400 leading-relaxed mt-0.5">
                      {cat.desc}
                    </span>
                  </span>

                  <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white shrink-0 transition-colors duration-200" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Browse facets: body type + makes */}
      <section className="py-12 sm:py-16 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Body types */}
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Browse by type</h2>
            <Link href="/listings" className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1">
              View all <Icon name="chevron_right" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BODY_TYPES.map((bodyType, i) => (
              <Reveal key={bodyType} delay={Math.min(i * 60, 420)} className="h-full">
                <Link
                  href={`/listings?body_type=${encodeURIComponent(bodyType)}`}
                  className="group flex items-center justify-center py-6 px-3 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:-translate-y-0.5 hover:shadow-card bg-white transition-all duration-200 h-full"
                >
                  <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 text-center">
                    {bodyType}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Makes */}
          <div className="flex items-end justify-between mt-12 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Start with a name you know.</h2>
            <Link href="/listings" className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1">
              View all <Icon name="chevron_right" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {MAKES.map((make, i) => (
              <Reveal key={make.name} delay={Math.min(i * 40, 400)} className="h-full">
                <Link
                  href={`/listings?make=${encodeURIComponent(make.name)}`}
                  className="group flex flex-col items-center gap-2 py-5 px-3 rounded-xl border border-neutral-200 bg-white hover:border-neutral-900 hover:-translate-y-0.5 hover:shadow-card transition-all duration-200 h-full"
                >
                  <span className="w-12 h-12 flex items-center justify-center bg-white rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={make.logo}
                      alt={`${make.name} logo`}
                      className="w-10 h-10 object-contain"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </span>
                  <span className="text-xs font-medium text-neutral-700 group-hover:text-neutral-900 text-center">
                    {make.name}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-12 sm:py-16 bg-neutral-50 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {STEPS.map((item, i) => (
              <Reveal key={item.title} delay={Math.min(i * 90, 270)} className="h-full">
                <div className="relative flex h-full flex-col items-center text-center">
                  {/* Connector between steps */}
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden sm:block absolute top-6 left-1/2 h-px w-[calc(100%+1.5rem)] bg-neutral-200"
                    />
                  )}
                  <span className="relative w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                    <Icon name={item.icon} size={20} className="text-white" />
                  </span>
                  <p className="text-base font-semibold text-neutral-900 mt-4">{item.title}</p>
                  <p className="text-sm text-neutral-500 leading-relaxed mt-1.5 max-w-xs">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Compare feature — dark editorial band, no cards */}
      <section className="relative pt-28 pb-28 sm:pt-40 sm:pb-40 bg-neutral-900">
        <SectionEdge tone="muted" variant="top" />
        <SectionEdge tone="white" variant="bottom" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-10">
            <h2 className="text-lg font-semibold text-white">Compare cars side by side</h2>
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-neutral-900 text-xs font-medium hover:bg-neutral-200 transition-colors duration-150"
            >
              Compare
            </Link>
          </div>

          <div className="relative grid sm:grid-cols-3">
            {/* Column rules drawn explicitly so they always render */}
            <span aria-hidden="true" className="hidden sm:block absolute inset-y-0 left-0 w-px bg-white/25" />
            <span aria-hidden="true" className="hidden sm:block absolute inset-y-0 left-1/3 w-px bg-white/25" />
            <span aria-hidden="true" className="hidden sm:block absolute inset-y-0 left-2/3 w-px bg-white/25" />
            {COMPARE_POINTS.map((point, i) => (
              <Reveal key={point.title} delay={Math.min(i * 90, 270)} className="h-full">
                <div
                  className={cn(
                    "h-full py-6 sm:py-0 sm:px-6",
                    i > 0 && "border-t border-white/15 sm:border-t-0"
                  )}
                >
                  <span className="text-xs font-medium tracking-[0.2em] text-neutral-500">
                    0{i + 1}
                  </span>
                  <p className="text-base font-semibold text-white mt-3">{point.title}</p>
                  <p className="text-sm text-neutral-400 leading-relaxed mt-1.5">{point.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Account types — full-width rows, no cards */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-neutral-900 mb-8">Pick the account that fits you</h2>

          <div className="border-t border-neutral-200">
            {ACCOUNT_TYPES.map((account, i) => (
              <Reveal key={account.title} delay={Math.min(i * 80, 240)}>
                <Link
                  href={account.href}
                  className="group flex items-center gap-5 sm:gap-8 px-2 sm:px-4 py-6 border-b border-neutral-200 transition-colors duration-200 hover:bg-neutral-50"
                >
                  <span className="hidden sm:block w-10 h-10 rounded-full border border-neutral-200 group-hover:border-neutral-900 group-hover:bg-neutral-900 flex items-center justify-center shrink-0 transition-colors duration-200">
                    <span className="text-xs font-medium text-neutral-500 group-hover:text-white transition-colors duration-200">
                      0{i + 1}
                    </span>
                  </span>
                  <span className="text-xs font-medium tracking-[0.2em] text-neutral-400 shrink-0 sm:hidden">
                    0{i + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-neutral-900">
                      {account.title}
                    </span>
                    <span className="block text-sm text-neutral-500 leading-relaxed mt-1 max-w-2xl">
                      {account.desc}
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sell your car — individuals list directly */}
      <section className="py-12 sm:py-16 bg-neutral-50 border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="storefront" size={20} className="text-neutral-700" />
                <h2 className="text-base font-semibold text-neutral-900">Sell your car</h2>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                List straight from your account. Add your vehicle details and upload your NTSA
                e-logbook — our team verifies ownership before your listing goes live.
              </p>

              <ol className="space-y-3 mb-6">
                {[
                  "Add your vehicle details, price, and photos",
                  "Upload your NTSA e-logbook as proof of ownership",
                  "Admin verifies, then your listing is live",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-neutral-700">
                    <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-neutral-900 text-white text-[11px] font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <div className="flex flex-wrap gap-3">
                {user ? (
                  <Link href="/dashboard/listings/new">
                    <Button variant="primary" size="sm">
                      List your car
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Create an account to sell
                    </Button>
                  </Link>
                )}
                <Link href="/register?role=dealer">
                  <Button variant="secondary" size="sm">
                    Register as a dealer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
