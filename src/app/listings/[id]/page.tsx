"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn, formatKES, formatMileage, timeAgo } from "@/lib/utils";
import { useListing } from "@/hooks/useListings";
import { useAuth } from "@/contexts/AuthContext";
import { CarDetailSkeleton } from "@/components/ui/Skeleton";
import { FuelBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";
import Icon from "@/components/ui/Icon";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { listing, loading, error } = useListing(id);
  const { isLoggedIn } = useAuth();

  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toggling, setToggling] = useState(false);

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <PageWrapper>
          <CarDetailSkeleton />
        </PageWrapper>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="directions_car" size={28} className="text-neutral-300" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">Listing not found</h2>
          <p className="text-neutral-500 text-sm mb-6">
            This listing may have been removed or is no longer available.
          </p>
          <Button onClick={() => router.push("/listings")} leftIcon={<Icon name="arrow_back" size={18} />}>
            Back to listings
          </Button>
        </div>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : [];
  const resolveUrl = (url: string) =>
    url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${url}`;

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
      const res = await api.post(`/favorites/${listing.id}/toggle`);
      const newSaved = res.data.data.saved as boolean;
      setIsFavorited(newSaved);
      toast.success(newSaved ? "Saved" : "Removed");
    } catch {
      toast.error("Could not update saved cars");
    } finally {
      setToggling(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: listing.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
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
      toast.success("Message sent");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not send message");
    } finally {
      setSending(false);
    }
  };

  const sellerName = listing.dealer_profile?.business_name ?? listing.seller.full_name;
  const sellerPhoto =
    listing.dealer_profile?.logo_url ?? listing.private_seller_profile?.profile_photo_url ?? null;

  const SPECS = [
    { icon: "calendar_today" as const, label: "Year", value: String(listing.year) },
    { icon: "speed" as const, label: "Mileage", value: formatMileage(listing.mileage) },
    { icon: "local_gas_station" as const, label: "Fuel", value: listing.fuel_type.charAt(0).toUpperCase() + listing.fuel_type.slice(1) },
    { icon: "settings" as const, label: "Transmission", value: listing.transmission.charAt(0).toUpperCase() + listing.transmission.slice(1) },
    { icon: "palette" as const, label: "Color", value: listing.color || "Not specified" },
    { icon: "storefront" as const, label: "Seller", value: listing.seller_type === "dealer" ? "Dealer" : "Private seller" },
  ];

  return (
    <div className="min-h-screen bg-white pb-12">
      <PageWrapper className="py-6">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link href="/" className="hover:text-neutral-900">
            Home
          </Link>
          <Icon name="chevron_right" size={16} className="text-neutral-300" />
          <Link href="/listings" className="hover:text-neutral-900">
            Listings
          </Link>
          <Icon name="chevron_right" size={16} className="text-neutral-300" />
          <span className="text-neutral-900 font-medium truncate max-w-xs">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl overflow-hidden border border-neutral-200">
              <div
                className="relative h-64 sm:h-80 md:h-[420px] bg-neutral-100 cursor-pointer group"
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100">
                    <Icon name="directions_car" size={48} className="text-neutral-300 mb-2" />
                    <span className="text-sm text-neutral-400">No images available</span>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImg();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center hover:border-neutral-900 transition-colors"
                    >
                      <Icon name="chevron_left" size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImg();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center hover:border-neutral-900 transition-colors"
                    >
                      <Icon name="chevron_right" size={18} />
                    </button>
                  </>
                )}

                {images.length > 0 && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-neutral-900 text-white text-xs font-medium">
                    {activeImg + 1} / {images.length}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={cn(
                        "relative w-16 h-14 rounded-lg overflow-hidden shrink-0 border",
                        i === activeImg
                          ? "border-neutral-900"
                          : "border-transparent opacity-60 hover:opacity-90"
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

            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-neutral-500 capitalize">{listing.seller_type} seller</p>
                  <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 leading-tight mt-1">
                    {listing.title}
                  </h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleFavorite}
                    disabled={toggling}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center border transition-colors",
                      isFavorited
                        ? "bg-neutral-900 border-neutral-900 text-white"
                        : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
                    )}
                  >
                    <Icon name="favorite" size={18} filled={isFavorited} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                  >
                    <Icon name="share" size={18} />
                  </button>
                </div>
              </div>

              <p className="text-xl font-semibold text-neutral-900 mb-3">{formatKES(listing.price_kes)}</p>

              <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Icon name="location_on" size={16} className="text-neutral-400" />
                  {listing.location}
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span className="flex items-center gap-1.5">
                  <Icon name="visibility" size={16} className="text-neutral-400" />
                  {listing.view_count} views
                </span>
                <span className="w-1 h-1 rounded-full bg-neutral-300" />
                <span>Listed {timeAgo(listing.created_at)}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <h2 className="text-sm font-semibold text-neutral-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SPECS.map((spec) => (
                  <div key={spec.label} className="flex flex-col gap-1.5 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Icon name={spec.icon} size={16} />
                      <span className="text-xs font-medium">{spec.label}</span>
                    </div>
                    <p className="text-sm font-medium text-neutral-900">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {listing.description && (
              <div className="bg-white rounded-xl p-6 border border-neutral-200">
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">Description</h2>
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <h3 className="text-xs font-medium text-neutral-500 tracking-wide mb-4">Seller</h3>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200">
                <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center shrink-0 overflow-hidden">
                  {sellerPhoto ? (
                    <Image
                      src={resolveUrl(sellerPhoto)}
                      alt={sellerName}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-sm font-medium text-white">{sellerName[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{sellerName}</p>
                  <p className="text-xs text-neutral-500 capitalize">
                    {listing.seller_type === "dealer" ? "Dealer" : "Private seller"}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${listing.seller.phone}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full border border-neutral-900 bg-white text-neutral-900 font-medium text-sm hover:bg-neutral-50 transition-colors mb-3"
              >
                <Icon name="phone" size={18} />
                {listing.seller.phone}
              </a>

              {inquirySent ? (
                <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-700 text-sm">
                  <Icon name="check_circle" size={18} />
                  Message sent
                </div>
              ) : (
                <Button variant="primary" fullWidth leftIcon={<Icon name="chat_bubble" size={18} />} onClick={() => setInquiryOpen(true)}>
                  Send message
                </Button>
              )}

              <div className="mt-4 flex items-start gap-2 text-xs text-neutral-500">
                <Icon name="info" size={16} className="text-neutral-400 mt-0.5 shrink-0" />
                <p>Meet in a public place. Do not transfer money before viewing the vehicle.</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="warning" size={16} className="text-neutral-600" />
                <span className="text-xs font-medium text-neutral-900">Safety tips</span>
              </div>
              <ul className="text-xs text-neutral-600 space-y-1.5 list-disc list-inside">
                <li>Inspect the vehicle in person</li>
                <li>Check logbook and records</li>
                <li>Use a trusted mechanic</li>
                <li>Do not pay in full before delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </PageWrapper>

      {inquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/30" onClick={() => setInquiryOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-md border border-neutral-200">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Contact seller</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{sellerName}</p>
              </div>
              <button
                onClick={() => setInquiryOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="mx-5 mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <p className="text-xs text-neutral-500 mb-0.5">Regarding</p>
              <p className="text-sm font-medium text-neutral-900 line-clamp-1">{listing.title}</p>
              <p className="text-sm font-semibold text-neutral-900">{formatKES(listing.price_kes)}</p>
            </div>

            <div className="p-5">
              <label className="text-sm font-medium text-neutral-700 block mb-2">
                Your message
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, is this car still available? Can we arrange a viewing?"
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 resize-none"
              />
              <p className="text-xs text-neutral-400 mt-1.5 text-right">{message.length} / 1000</p>
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setInquiryOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" fullWidth loading={sending} onClick={handleSendInquiry} leftIcon={<Icon name="chat_bubble" size={18} />}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
          >
            <Icon name="close" size={20} className="text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImg();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-white hover:bg-white/20"
          >
            <Icon name="chevron_left" size={24} className="text-white" />
          </button>

          <div className="relative w-full max-w-4xl max-h-[85vh] mx-16" onClick={(e) => e.stopPropagation()}>
            <Image
              src={resolveUrl(images[activeImg])}
              alt={listing.title}
              width={1200}
              height={800}
              className="object-contain w-full max-h-[85vh] rounded-xl"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImg();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-white hover:bg-white/20"
          >
            <Icon name="chevron_right" size={24} className="text-white" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImg(i);
                }}
                className={cn("w-2 h-2 rounded-full", i === activeImg ? "bg-white w-6" : "bg-white/40")}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
