"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ArrowRight, ShieldCheck, Zap, Users, Star,
  TrendingUp, MapPin, ChevronRight, Car,
  Truck, Bike, AlertCircle, CheckCircle2, Clock
} from "lucide-react";
import { cn, formatKES } from "@/lib/utils";
import SearchBar from "@/components/search/SearchBar";
import CarCard from "@/components/cars/CarCard";
import { CarCardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import Input, { SelectField, Textarea } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ListingCard, PrivateSellerProfile } from "@/types";

// ── Static data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "Sedans",        icon: "🚗", query: "Sedan",          count: "240+" },
  { label: "SUVs",          icon: "🚙", query: "SUV",            count: "180+" },
  { label: "Pickups",       icon: "🛻", query: "Pickup",         count: "95+"  },
  { label: "Hatchbacks",    icon: "🚘", query: "Hatchback",      count: "120+" },
  { label: "Vans",          icon: "🚐", query: "Van",            count: "60+"  },
  { label: "Station Wagons",icon: "🚗", query: "Station Wagon",  count: "75+"  },
];

const POPULAR_MAKES = [
  { name: "Toyota",      logo: "🚗", color: "bg-red-50    border-red-100"    },
  { name: "Nissan",      logo: "🚙", color: "bg-blue-50   border-blue-100"   },
  { name: "Mazda",       logo: "🚘", color: "bg-purple-50 border-purple-100" },
  { name: "Subaru",      logo: "🚗", color: "bg-amber-50  border-amber-100"  },
  { name: "Honda",       logo: "🚙", color: "bg-green-50  border-green-100"  },
  { name: "Mitsubishi",  logo: "🚘", color: "bg-slate-50  border-slate-200"  },
  { name: "Isuzu",       logo: "🛻", color: "bg-orange-50 border-orange-100" },
  { name: "Mercedes",    logo: "🚗", color: "bg-zinc-50   border-zinc-200"   },
];

const WHY_US = [
  {
    icon:  ShieldCheck,
    color: "bg-blue-50 text-blue-600",
    title: "Verified Sellers",
    desc:  "Every dealer and private seller is manually reviewed and approved by our team before listing.",
  },
  {
    icon:  Zap,
    color: "bg-amber-50 text-amber-600",
    title: "Fast & Easy",
    desc:  "Browse thousands of listings, filter by location, price, and specs — find your car in minutes.",
  },
  {
    icon:  Users,
    color: "bg-emerald-50 text-emerald-600",
    title: "Direct Contact",
    desc:  "Message sellers directly. No middlemen, no hidden fees. Deal confidently.",
  },
  {
    icon:  Star,
    color: "bg-purple-50 text-purple-600",
    title: "Trusted Platform",
    desc:  "Thousands of Kenyans have found their perfect car on ShikaGari. Join the community.",
  },
];

const STATS = [
  { value: "12,000+", label: "Cars Listed"    },
  { value: "4,500+",  label: "Happy Buyers"   },
  { value: "850+",    label: "Verified Dealers"},
  { value: "47",      label: "Counties Covered"},
];

const KENYAN_CITIES = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru",
  "Eldoret", "Thika", "Malindi", "Nyeri",
];

const SELLER_LOCATIONS = [
  "Nairobi", "Mombasa", "Kisumu", "Nakuru",
  "Eldoret", "Thika", "Malindi", "Nyeri",
  "Machakos", "Kisii", "Kericho", "Garissa",
  "Meru", "Kakamega", "Other",
].map((city) => ({ value: city, label: city === "Other" ? "Other (Kenya)" : city }));

// ── Page component ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured]   = useState<ListingCard[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [sellerProfile, setSellerProfile] = useState<PrivateSellerProfile | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [nationalId, setNationalId] = useState("");
  const [sellerLocation, setSellerLocation] = useState("");
  const [sellerBio, setSellerBio] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isBuyer = user?.role === "buyer";
  const sellerStatus = sellerProfile?.approval_status;

  const loadSellerProfile = useCallback(async () => {
    if (!isBuyer) {
      setSellerProfile(null);
      setCheckingProfile(false);
      return;
    }
    setCheckingProfile(true);
    setProfileLoadError(null);
    try {
      const res = await api.get("/sellers/profile");
      setSellerProfile(res.data.data ?? null);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setSellerProfile(null);
      } else {
        const message = err?.response?.data?.message ?? "Unable to load seller profile status";
        setProfileLoadError(message);
      }
    } finally {
      setCheckingProfile(false);
    }
  }, [isBuyer]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/listings?sort_by=newest&per_page=8");
        setFeatured(res.data.data ?? []);
      } catch {
        // Silently fail — show empty state
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    loadSellerProfile();
  }, [loadSellerProfile]);

  const handleRequestApproval = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isBuyer) {
      toast.error("You need a buyer account to request private selling.");
      return;
    }

    if (!nationalId.trim() || !sellerLocation) {
      setFormError("National ID and county are required.");
      return;
    }

    setFormError(null);
    setRequestLoading(true);
    try {
      const payload = {
        national_id_no: nationalId.trim(),
        location: sellerLocation,
        bio: sellerBio.trim() || undefined,
      };
      const res = await api.post("/sellers/profile", payload);
      setSellerProfile(res.data.data ?? null);
      toast.success("Request submitted for admin review.");
      setNationalId("");
      setSellerLocation("");
      setSellerBio("");
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Failed to submit request";
      setFormError(message);
      toast.error(message);
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="bg-white">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-brand-800 text-white">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-brand-800/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-700/10 blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Kenya's #1 Car Marketplace
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-up">
              Find Your Perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-blue-300">
                Car in Kenya
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl text-blue-100/80 mb-10 leading-relaxed animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              Browse thousands of verified vehicles from trusted dealers and
              private sellers across Nairobi, Mombasa, Kisumu and beyond.
            </p>

            {/* Search bar */}
            <div
              className="animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              <SearchBar variant="hero" />
            </div>

            {/* Quick links */}
            <div
              className="flex flex-wrap items-center justify-center gap-3 mt-6 animate-fade-up"
              style={{ animationDelay: "300ms" }}
            >
              <span className="text-sm text-blue-200/60">Popular:</span>
              {["Toyota Premio", "Nissan X-Trail", "Subaru Forester", "Toyota Fielder"].map((q) => (
                <Link
                  key={q}
                  href={`/listings?search=${encodeURIComponent(q)}`}
                  className="text-sm text-blue-200 hover:text-white underline underline-offset-2 transition-colors"
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="py-12 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className="font-display text-3xl font-bold text-navy mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Browse by type"
            title="Find the right body style"
            subtitle="Whether you need a family car, a workhorse, or something sporty — we have it."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-10">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.label}
                href={`/listings?search=${encodeURIComponent(cat.query)}`}
                className={cn(
                  "group flex flex-col items-center gap-3 p-5 rounded-2xl",
                  "border border-slate-100 bg-white hover:border-brand-200 hover:bg-brand-50",
                  "transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover",
                  "animate-fade-up"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="text-3xl">{cat.icon}</span>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition-colors">
                    {cat.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ─────────────────────────────────────────────── */}
      <section className="py-16 bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <SectionHeader
              eyebrow="Just listed"
              title="Latest arrivals"
              subtitle="Fresh listings from verified sellers across Kenya."
              className="mb-0"
            />
            <Link href="/listings" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 transition-colors shrink-0">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {loadingFeatured
              ? Array.from({ length: 8 }).map((_, i) => <CarCardSkeleton key={i} />)
              : featured.map((listing, i) => (
                  <div
                    key={listing.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <CarCard listing={listing} />
                  </div>
                ))}
          </div>

          {/* Mobile view all */}
          <div className="flex justify-center mt-8 sm:hidden">
            <Link href="/listings">
              <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View all listings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── POPULAR MAKES ─────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Top brands"
            title="Shop by make"
            subtitle="Browse the most popular car brands available in Kenya."
          />

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mt-10">
            {POPULAR_MAKES.map((make, i) => (
              <Link
                key={make.name}
                href={`/listings?make=${encodeURIComponent(make.name)}`}
                className={cn(
                  "group flex flex-col items-center gap-2 p-4 rounded-xl",
                  "border hover:-translate-y-0.5 hover:shadow-md",
                  "transition-all duration-200 animate-fade-up",
                  make.color
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="text-2xl">{make.logo}</span>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-brand-700 transition-colors text-center">
                  {make.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why ShikaGari"
            title="The smarter way to buy & sell cars"
            subtitle="We've built a platform that puts trust, speed, and simplicity first."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {WHY_US.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={cn(
                    "bg-white rounded-2xl p-6 border border-slate-100 shadow-card",
                    "animate-fade-up"
                  )}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", item.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BROWSE BY CITY ────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Your city"
            title="Cars near you"
            subtitle="Find listings in your city across Kenya."
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {KENYAN_CITIES.map((city, i) => (
              <Link
                key={city}
                href={`/listings?location=${city}`}
                className={cn(
                  "group relative overflow-hidden rounded-2xl p-6",
                  "bg-gradient-to-br from-navy to-brand-800 text-white",
                  "hover:from-brand-700 hover:to-brand-900",
                  "transition-all duration-300 hover:-translate-y-1 hover:shadow-blue",
                  "animate-fade-up"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="absolute top-2 right-2 opacity-10 text-5xl">🏙️</div>
                <MapPin className="w-5 h-5 mb-3 text-brand-300" />
                <p className="font-display font-bold text-lg">{city}</p>
                <p className="text-xs text-blue-200/70 mt-1 flex items-center gap-1">
                  Browse cars
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER (buyers only) ─────────────────────────────────────── */}
      {isBuyer && (
        <section className="py-16 bg-surface-muted">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-brand-700 rounded-3xl p-10 md:p-16 text-white text-center">
              {/* BG decorations */}
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-blue-800/20 blur-3xl pointer-events-none" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6">
                  <TrendingUp className="w-4 h-4 text-brand-300" />
                  Sell your car privately
                </div>

                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
                  Sell your car — no dealer lot required
                </h2>
                <p className="text-blue-100/80 text-lg mb-3 max-w-2xl mx-auto">
                  Turn your buyer account into a private seller profile, upload your documents, and let our admins approve you. Once verified, you can publish listings directly to thousands of serious buyers across Kenya.
                </p>
                <p className="text-sm text-blue-100/70 max-w-2xl mx-auto">
                  We review every private seller for safety. Submit your request below and we'll email you as soon as you're cleared to list.
                </p>

                <div className="mt-10 max-w-2xl mx-auto text-left">
                  {checkingProfile ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-3 text-blue-100/80">
                      <Clock className="w-5 h-5" />
                      Checking your seller status...
                    </div>
                  ) : profileLoadError ? (
                    <div className="bg-white/5 border border-red-400/40 rounded-2xl p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-300" />
                        <div>
                          <p className="font-semibold text-white mb-1">Couldn't load status</p>
                          <p className="text-sm text-blue-100/80 mb-4">{profileLoadError}</p>
                          <Button variant="ghost" size="sm" onClick={() => loadSellerProfile()}>
                            Retry lookup
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : sellerProfile ? (
                    sellerStatus === "approved" ? (
                      <div className="bg-white/5 border border-emerald-400/40 rounded-2xl p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-full bg-emerald-500/30 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">You're approved to list!</p>
                            <p className="text-sm text-blue-100/80">Publish your first car listing now.</p>
                          </div>
                        </div>
                        <Link href="/dashboard/listings/new" className="w-full sm:w-auto">
                          <Button variant="navy" size="md" className="w-full bg-white text-navy hover:bg-blue-50">
                            Create a listing
                          </Button>
                        </Link>
                      </div>
                    ) : sellerStatus === "pending" ? (
                      <div className="bg-white/5 border border-blue-400/40 rounded-2xl p-6 flex items-start gap-3">
                        <div className="w-11 h-11 rounded-full bg-blue-500/30 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-blue-100" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Request under review</p>
                          <p className="text-sm text-blue-100/80 mb-3">
                            Our admin team is validating your information. We will email you and unlock listings once you're approved.
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => loadSellerProfile()}>
                            Refresh status
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-red-400/40 rounded-2xl p-6 flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-full bg-red-500/30 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-red-100" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">Profile not approved</p>
                            <p className="text-sm text-blue-100/80">
                              Please update your private seller profile with complete information and resubmit for review.
                            </p>
                          </div>
                        </div>
                        <div>
                          <Link href="/sellers/profile/new">
                            <Button size="sm" variant="navy" className="bg-white text-navy hover:bg-blue-50">
                              Update seller details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  ) : (
                    <form onSubmit={handleRequestApproval} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur">
                      <p className="text-sm text-blue-100/80">
                        Share a few details to verify you as a private seller. Admin approval usually takes less than one business day.
                      </p>
                      <Input
                        label="National ID number"
                        placeholder="Enter your ID number"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        required
                      />
                      <SelectField
                        label="County"
                        placeholder="Select county"
                        options={SELLER_LOCATIONS}
                        value={sellerLocation}
                        onChange={(e) => setSellerLocation(e.target.value)}
                        required
                      />
                      <Textarea
                        label="About you (optional)"
                        placeholder="Tell buyers what makes your car special"
                        rows={4}
                        maxLength={500}
                        value={sellerBio}
                        onChange={(e) => setSellerBio(e.target.value)}
                        hint="Up to 500 characters"
                      />
                      {formError && (
                        <p className="text-sm text-red-200">{formError}</p>
                      )}
                      <Button
                        type="submit"
                        variant="navy"
                        size="lg"
                        className="bg-white text-navy hover:bg-blue-50 w-full sm:w-auto"
                        rightIcon={<ArrowRight className="w-5 h-5" />}
                        loading={requestLoading}
                      >
                        Send request for approval
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow?:  string;
  title:     string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && (
        <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-slate-500 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}