"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn, formatKES, formatMileage } from "@/lib/utils";
import { ListingCard } from "@/types";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCompare } from "@/hooks/useCompare";
import InquiryModal from "@/components/shared/InquiryModal";
import toast from "react-hot-toast";

interface CarCardProps {
  listing: ListingCard;
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string, saved: boolean) => void;
  className?: string;
}

const STATUS_META: Record<string, { label: string; dot: string }> = {
  active:   { label: "IN STOCK",   dot: "bg-emerald-500"  },
  sold:     { label: "SOLD",       dot: "bg-red-500"      },
  inactive: { label: "OFF MARKET", dot: "bg-neutral-400"  },
};

export default function CarCard({
  listing,
  isFavorited = false,
  onFavoriteToggle,
  className,
}: CarCardProps) {
  const { isLoggedIn } = useAuth();
  const [saved, setSaved] = useState(isFavorited);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { has: inCompare, toggle: toggleCompare } = useCompare();
  const compared = inCompare(listing.id);

  const stockCode = `STOCK ${listing.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  const status = STATUS_META[listing.status] ?? STATUS_META.active;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Sign in to save cars");
      return;
    }

    try {
      setToggling(true);
      const res = await api.post(`/favorites/${listing.id}/toggle`);
      const newSaved = res.data.data.saved as boolean;
      setSaved(newSaved);
      onFavoriteToggle?.(listing.id, newSaved);
      toast.success(newSaved ? "Saved" : "Removed");
    } catch {
      toast.error("Could not update saved cars");
    } finally {
      setToggling(false);
    }
  };

  // Stops the click from bubbling up to the card's Link, then opens the
  // contact popup in place instead of navigating away.
  const handleInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInquiryOpen(true);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleCompare(listing.id);
    if (result === "added")   toast.success("Added to compare");
    if (result === "removed") toast.success("Removed from compare");
    if (result === "full")    toast.error("Compare list is full (4 max)");
  };

  const imageUrl =
    !imgError && listing.thumbnail_url
      ? listing.thumbnail_url.startsWith("http")
        ? listing.thumbnail_url
        : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${listing.thumbnail_url}`
      : null;

  return (
    <>
    <Link href={`/listings/${listing.id}`} className={cn("group block car-card h-full", className)}>
      <article className="bg-white rounded-2xl border border-neutral-200 overflow-hidden h-full flex flex-col shadow-card hover:shadow-nav hover:-translate-y-0.5 transition-all duration-200">

        {/* ── Media ─────────────────────────────────────────── */}
        <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${listing.make} ${listing.model}`}
              fill
              unoptimized
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100">
              <Icon name="directions_car" size={36} className="text-neutral-300 mb-1" />
              <span className="text-xs text-neutral-400">
                {listing.make} {listing.model}
              </span>
            </div>
          )}

          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-neutral-900/85 text-white text-[10px] font-semibold tracking-wide backdrop-blur-sm">
            {stockCode}
          </span>

          <button
            onClick={handleFavorite}
            disabled={toggling}
            aria-label={saved ? "Remove from saved" : "Save this car"}
            className={cn(
              "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center",
              "border shadow-card transition-colors",
              saved
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-900 hover:text-neutral-900"
            )}
          >
            <Icon name="favorite" size={16} filled={saved} />
          </button>

          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-900/70 text-white text-[10px] font-semibold tracking-wide uppercase backdrop-blur-sm">
            <Icon name="map_pin" size={12} />
            {listing.location}
          </span>

          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-[10px] font-semibold tracking-wide shadow-card">
            <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        </div>

        {/* ── Details ───────────────────────────────────────── */}
        <div className="p-4 flex flex-col flex-1 gap-3">

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                {listing.make}
              </p>
              <h3 className="text-lg font-semibold text-neutral-900 leading-tight truncate">
                {listing.model}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-medium tracking-wider text-neutral-400">PRICE</p>
              <p className="text-base font-semibold text-neutral-900 whitespace-nowrap">
                {formatKES(listing.price_kes)}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-4 divide-x divide-neutral-100 rounded-xl bg-neutral-50 py-2.5">
            <SpecCell icon="calendar_today" label="Year" value={String(listing.year)} />
            <SpecCell icon="speed" label="Mileage" value={formatMileage(listing.mileage)} />
            <SpecCell icon="settings" label="Drive" value={listing.drivetrain || "—"} />
            <SpecCell icon="local_gas_station" label="Fuel" value={listing.fuel_type.toUpperCase()} />
          </dl>

          <div className="mt-auto flex items-center gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={handleInquiry}
              leftIcon={<Icon name="chat_bubble" size={16} className="text-white" />}
              className="flex-1"
            >
              Send Inquiry
            </Button>
            <button
              onClick={handleCompare}
              aria-label={compared ? "Remove from compare" : "Add to compare"}
              title={compared ? "Remove from compare" : "Add to compare"}
              className={cn(
                "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors",
                compared
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-500 border-neutral-300 hover:border-neutral-900 hover:text-neutral-900"
              )}
            >
              <Icon name="swap_horiz" size={18} />
            </button>
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-neutral-700 shrink-0 px-1">
              OPEN
              <Icon name="arrow_forward" size={14} />
            </span>
          </div>
        </div>
      </article>
    </Link>

    {inquiryOpen && (
      <InquiryModal
        listingId={listing.id}
        vehicle={{
          title: `${listing.year} ${listing.make} ${listing.model}`,
          priceKES: listing.price_kes,
        }}
        onClose={() => setInquiryOpen(false)}
      />
    )}
    </>
  );
}

function SpecCell({ icon, label, value }: {
  icon: "calendar_today" | "speed" | "settings" | "local_gas_station";
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-1 text-center">
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-400">
        <Icon name={icon} size={12} />
        {label}
      </span>
      <dd className="text-xs font-semibold text-neutral-900 truncate max-w-full">{value}</dd>
    </div>
  );
}
