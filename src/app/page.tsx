"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/search/SearchBar";
import CarCard from "@/components/cars/CarCard";
import { CarCardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import api from "@/lib/api";
import Input, { SelectField, Textarea } from "@/components/ui/Input";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ListingCard, PrivateSellerProfile } from "@/types";

const BODY_TYPES = [
  { label: "Sedan", icon: "directions_car" as const, query: "Sedan" },
  { label: "SUV", icon: "directions_car" as const, query: "SUV" },
  { label: "Pickup", icon: "local_shipping" as const, query: "Pickup" },
  { label: "Hatchback", icon: "directions_car" as const, query: "Hatchback" },
  { label: "Van", icon: "airport_shuttle" as const, query: "Van" },
  { label: "Wagon", icon: "directions_car" as const, query: "Station Wagon" },
];

const MAKES = ["Toyota", "Nissan", "Mazda", "Subaru", "Honda", "Mitsubishi", "Isuzu", "Mercedes"];

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

const CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Nyeri"];

const SELLER_LOCATIONS = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Nyeri",
  "Machakos",
  "Kisii",
  "Kericho",
  "Garissa",
  "Meru",
  "Kakamega",
  "Other",
].map((city) => ({ value: city, label: city }));

export default function HomePage() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState<ListingCard[]>([]);
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
        const message = err?.response?.data?.message ?? "Could not load profile";
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
        // silent
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
      toast.error("You need a buyer account to apply as seller");
      return;
    }
    if (!nationalId.trim() || !sellerLocation) {
      setFormError("National ID and location are required");
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
      toast.success("Request sent");
      setNationalId("");
      setSellerLocation("");
      setSellerBio("");
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Could not submit request";
      setFormError(message);
      toast.error(message);
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-neutral-900 text-center">
              Find cars for sale in Kenya
            </h1>
            <p className="text-sm sm:text-base text-neutral-500 text-center mt-3">
              Search listings from dealers and private sellers
            </p>

            <div className="mt-8">
              <SearchBar variant="hero" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
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

      {/* Steps */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 py-2"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">{item.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by type */}
      <section className="py-10 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-base font-semibold text-neutral-900">Browse by type</h2>
            <Link href="/listings" className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1">
              View all <Icon name="chevron_right" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {BODY_TYPES.map((cat) => (
              <Link
                key={cat.label}
                href={`/listings?search=${encodeURIComponent(cat.query)}`}
                className="group flex flex-col items-center gap-2 py-6 px-3 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-white transition-colors"
              >
                <Icon name={cat.icon} size={28} className="text-neutral-700 group-hover:text-neutral-900" />
                <span className="text-xs font-medium text-neutral-700 group-hover:text-neutral-900">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest listings */}
      <section className="py-10 bg-neutral-50 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-base font-semibold text-neutral-900">Latest listings</h2>
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

      {/* Browse by make */}
      <section className="py-10 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base font-semibold text-neutral-900 mb-6">Browse by make</h2>
          <div className="flex flex-wrap gap-2">
            {MAKES.map((make) => (
              <Link
                key={make}
                href={`/listings?make=${encodeURIComponent(make)}`}
                className="px-4 py-2 rounded-full border border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
              >
                {make}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by location */}
      <section className="py-10 border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-base font-semibold text-neutral-900 mb-2">Browse by location</h2>
          <p className="text-xs text-neutral-500 mb-6">Find cars near you</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CITIES.map((city) => (
              <Link
                key={city}
                href={`/listings?location=${city}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-neutral-200 bg-white hover:border-neutral-900 transition-colors group"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-neutral-700 group-hover:text-neutral-900">
                  <Icon name="location_on" size={18} className="text-neutral-400 group-hover:text-neutral-700" />
                  {city}
                </span>
                <Icon name="chevron_right" size={16} className="text-neutral-300 group-hover:text-neutral-700" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seller section for buyers */}
      {isBuyer && (
        <section className="py-10 bg-neutral-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="storefront" size={20} className="text-neutral-700" />
                  <h2 className="text-base font-semibold text-neutral-900">Sell your car</h2>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                  Apply for a private seller account to list your car. Admin review is required before you can publish.
                </p>

                {checkingProfile ? (
                  <div className="border border-neutral-200 rounded-xl p-4 flex items-center gap-3 text-sm text-neutral-500">
                    <Icon name="schedule" size={18} />
                    Checking status
                  </div>
                ) : profileLoadError ? (
                  <div className="border border-neutral-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-neutral-900">Could not load status</p>
                    <p className="text-xs text-neutral-500 mt-1 mb-3">{profileLoadError}</p>
                    <Button variant="secondary" size="sm" onClick={() => loadSellerProfile()}>
                      Try again
                    </Button>
                  </div>
                ) : sellerProfile ? (
                  sellerStatus === "approved" ? (
                    <div className="border border-neutral-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Icon name="check_circle" size={20} className="text-neutral-900 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900">Approved to list</p>
                          <p className="text-xs text-neutral-500">You can now create listings</p>
                        </div>
                      </div>
                      <Link href="/dashboard/listings/new">
                        <Button variant="primary" size="sm">
                          Create listing
                        </Button>
                      </Link>
                    </div>
                  ) : sellerStatus === "pending" ? (
                    <div className="border border-neutral-200 rounded-xl p-4 flex items-start gap-3">
                      <Icon name="schedule" size={20} className="text-neutral-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Under review</p>
                        <p className="text-xs text-neutral-500 mt-1 mb-3">
                          Your request is being reviewed. You will be notified once approved.
                        </p>
                        <Button variant="secondary" size="sm" onClick={() => loadSellerProfile()}>
                          Refresh
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-neutral-200 rounded-xl p-4">
                      <p className="text-sm font-medium text-neutral-900">Not approved</p>
                      <p className="text-xs text-neutral-500 mt-1 mb-3">
                        Update your profile and resubmit for review.
                      </p>
                      <Link href="/sellers/profile/new">
                        <Button size="sm" variant="secondary">
                          Update details
                        </Button>
                      </Link>
                    </div>
                  )
                ) : (
                  <form onSubmit={handleRequestApproval} className="space-y-4">
                    <p className="text-xs text-neutral-500">
                      Share a few details to apply. Review usually takes less than one business day.
                    </p>
                    <Input
                      label="National ID number"
                      placeholder="Enter ID number"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      required
                    />
                    <SelectField
                      label="Location"
                      placeholder="Select location"
                      options={SELLER_LOCATIONS}
                      value={sellerLocation}
                      onChange={(e) => setSellerLocation(e.target.value)}
                      required
                    />
                    <Textarea
                      label="About you"
                      placeholder="Tell buyers about your car"
                      rows={3}
                      maxLength={500}
                      value={sellerBio}
                      onChange={(e) => setSellerBio(e.target.value)}
                      hint="Up to 500 characters"
                    />
                    {formError && <p className="text-xs text-neutral-900">{formError}</p>}
                    <Button type="submit" variant="primary" loading={requestLoading}>
                      Submit request
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
