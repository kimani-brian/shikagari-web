"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Gauge, Fuel, Settings2, Calendar, Palette,
  Eye, Heart, Share2, ChevronLeft, ChevronRight,
  Phone, MessageSquare, ShieldCheck, Car,
  ArrowLeft, CheckCircle2, AlertCircle, X
} from "lucide-react";
import { cn, formatKES, formatMileage, timeAgo } from "@/lib/utils";
import { useListing } from "@/hooks/useListings";
import { useAuth } from "@/contexts/AuthContext";
import { CarDetailSkeleton } from "@/components/ui/Skeleton";
import VerifiedBadge, { VerifiedInline } from "@/components/shared/VerifiedBadge";
import { FuelBadge, ListingStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";
import api from "@/lib/api";
import toast from "react-hot-toast";

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CarDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;

  const { listing, loading, error } = useListing(id);
  const { isLoggedIn, user }        = useAuth();

  const [activeImg,    setActiveImg]    = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isFavorited,  setIsFavorited]  = useState(false);
  const [toggling,     setToggling]     = useState(false);

  // Inquiry modal state
  const [inquiryOpen,   setInquiryOpen]   = useState(false);
  const [message,       setMessage]       = useState("");
  const [sending,       setSending]       = useState(false);
  const [inquirySent,   setInquirySent]   = useState(false);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-muted py-8">
        <PageWrapper>
          <CarDetailSkeleton />
        </PageWrapper>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Car className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 mb-2">
            Listing not found
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            This listing may have been removed or is no longer available.
          </p>
          <Button onClick={() => router.push("/listings")} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to listings
          </Button>
        </div>
      </div>
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const images = listing.images?.length ? listing.images : [];
  const resolveUrl = (url: string) =>
    url.startsWith("http")
      ? url
      : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${url}`;

  const prevImg = () => setActiveImg((i) => (i > 0 ? i - 1 : images.length - 1));
  const nextImg = () => setActiveImg((i) => (i < images.length - 1 ? i + 1 : 0));

  const handleFavorite = async () => {
    if (!isLoggedIn) {
      toast.error("Sign in to save cars");
      router.push("/login");
      return;
    }
    try {
      setToggling(true);
      const res      = await api.post(`/favorites/${listing.id}/toggle`);
      const newSaved = res.data.data.saved as boolean;
      setIsFavorited(newSaved);
      toast.success(newSaved ? "Saved to favourites" : "Removed from favourites");
    } catch {
      toast.error("Failed to update favourites");
    } finally {
      setToggling(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: listing.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleSendInquiry = async () => {
    if (!isLoggedIn) {
      toast.error("Sign in to contact the seller");
      router.push("/login");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    try {
      setSending(true);
      await api.post(`/listings/${listing.id}/inquiries`, { message });
      setInquirySent(true);
      toast.success("Message sent to seller!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const sellerName = listing.dealer_profile?.business_name ?? listing.seller.full_name;
  const sellerPhoto = listing.dealer_profile?.logo_url
    ?? listing.private_seller_profile?.profile_photo_url
    ?? null;
  const isVerified = listing.seller.is_verified;

  // ── Spec items ────────────────────────────────────────────────────────────
  const SPECS = [
    { icon: Calendar,  label: "Year",         value: String(listing.year)                            },
    { icon: Gauge,     label: "Mileage",       value: formatMileage(listing.mileage)                  },
    { icon: Fuel,      label: "Fuel",          value: listing.fuel_type.charAt(0).toUpperCase() + listing.fuel_type.slice(1) },
    { icon: Settings2, label: "Transmission",  value: listing.transmission.charAt(0).toUpperCase() + listing.transmission.slice(1) },
    { icon: Palette,   label: "Color",         value: listing.color || "Not specified"               },
    { icon: Car,       label: "Seller type",   value: listing.seller_type === "dealer" ? "Dealer" : "Private seller" },
  ];

  return (
    <div className="min-h-screen bg-surface-muted pb-16">
      <PageWrapper className="py-6">

        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/"        className="hover:text-slate-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link href="/listings" className="hover:text-slate-900 transition-colors">Listings</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-medium truncate max-w-xs">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Left col (image + specs) ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Image gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-card">

              {/* Main image */}
              <div
                className="relative h-64 sm:h-80 md:h-[420px] bg-slate-100 cursor-pointer group"
                onClick={() => images.length > 0 && setLightboxOpen(true)}
              >
                {images.length > 0 ? (
                  <Image
                    src={resolveUrl(images[activeImg])}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <span className="text-6xl mb-3">🚗</span>
                    <span className="text-sm text-slate-400">No images available</span>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Prev / Next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImg(); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImg(); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {images.length > 0 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold">
                    {activeImg + 1} / {images.length}
                  </div>
                )}

                {/* Status badge */}
                {listing.status !== "active" && (
                  <div className="absolute top-3 left-3">
                    <ListingStatusBadge status={listing.status} />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        "relative w-16 h-14 rounded-lg overflow-hidden shrink-0 transition-all",
                        i === activeImg
                          ? "ring-2 ring-brand-600 ring-offset-1"
                          : "opacity-60 hover:opacity-90"
                      )}
                    >
                      <Image
                        src={resolveUrl(img)}
                        alt={`${listing.title} image ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + price + actions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {isVerified && <VerifiedBadge size="sm" />}
                    <span className="text-xs text-slate-400 capitalize">
                      {listing.seller_type} seller
                    </span>
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {listing.title}
                  </h1>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleFavorite}
                    disabled={toggling}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all border",
                      isFavorited
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} strokeWidth={isFavorited ? 0 : 2} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <p className="font-display text-3xl font-bold text-brand-700 mb-3">
                {formatKES(listing.price_kes)}
              </p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {listing.location}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  {listing.view_count} views
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>Listed {timeAgo(listing.created_at)}</span>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
              <h2 className="font-display text-lg font-bold text-slate-900 mb-5">
                Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {SPECS.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={spec.label}
                      className="flex flex-col gap-1.5 p-4 bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center gap-2 text-slate-400">
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{spec.label}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{spec.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card">
                <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
                  Description
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          {/* ── Right col (seller card + inquiry) ───────────────────── */}
          <div className="space-y-4">

            {/* Seller card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card sticky top-[calc(var(--nav-height)+5rem)]">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                Seller Information
              </h3>

              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl bg-brand-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {sellerPhoto ? (
                    <Image
                      src={resolveUrl(sellerPhoto)}
                      alt={sellerName}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="font-display text-xl font-bold text-white">
                      {sellerName[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-slate-900">{sellerName}</p>
                  {isVerified && (
                    <div className="mt-1">
                      <VerifiedInline />
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5 capitalize">
                    {listing.seller_type === "dealer" ? "Verified Dealer" : "Private Seller"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              
                href={`tel:${listing.seller.phone}`}
                className={cn(
                  "flex items-center justify-center gap-2 w-full",
                  "py-3 rounded-xl border-2 border-brand-200 bg-brand-50",
                  "text-brand-700 font-semibold text-sm",
                  "hover:bg-brand-100 hover:border-brand-300 transition-colors mb-3"
                )}
              >
                <Phone className="w-4 h-4" />
                {listing.seller.phone}
              </a>

              {/* Send message */}
              {inquirySent ? (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Message sent! The seller will respond shortly.
                </div>
              ) : (
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<MessageSquare className="w-4 h-4" />}
                  onClick={() => setInquiryOpen(true)}
                >
                  Send Message
                </Button>
              )}

              {/* Trust note */}
              <div className="mt-4 flex items-start gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <p>Always meet in a safe, public location. Never transfer money before viewing the vehicle.</p>
              </div>
            </div>

            {/* Safety tips */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-800">Safety Tips</span>
              </div>
              <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside">
                <li>Inspect the vehicle in person before buying</li>
                <li>Verify the logbook and NTSA records</li>
                <li>Do not pay in full before delivery</li>
                <li>Use a trusted mechanic for inspection</li>
              </ul>
            </div>
          </div>
        </div>
      </PageWrapper>

      {/* ── Inquiry Modal ──────────────────────────────────────────────────── */}
      {inquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setInquiryOpen(false)}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-up">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-slate-900">Contact Seller</h3>
                <p className="text-xs text-slate-500 mt-0.5">{sellerName}</p>
              </div>
              <button
                onClick={() => setInquiryOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Car reference */}
            <div className="mx-5 mt-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-0.5">Regarding</p>
              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{listing.title}</p>
              <p className="text-sm font-bold text-brand-700">{formatKES(listing.price_kes)}</p>
            </div>

            {/* Message input */}
            <div className="p-5">
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Your Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I'm interested in this car. Is it still available? Can we arrange a viewing?"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
              />
              <p className="text-xs text-slate-400 mt-1.5 text-right">
                {message.length} / 1000
              </p>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setInquiryOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                loading={sending}
                onClick={handleSendInquiry}
                leftIcon={<MessageSquare className="w-4 h-4" />}
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImg(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            className="relative w-full max-w-4xl max-h-[85vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={resolveUrl(images[activeImg])}
              alt={listing.title}
              width={1200}
              height={800}
              className="object-contain w-full max-h-[85vh] rounded-xl"
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); nextImg(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === activeImg ? "bg-white w-6" : "bg-white/40 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}