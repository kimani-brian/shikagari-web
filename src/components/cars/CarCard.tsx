"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn, formatKES, formatMileage, timeAgo } from "@/lib/utils";
import { ListingCard } from "@/types";
import { FuelBadge } from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface CarCardProps {
  listing: ListingCard;
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string, saved: boolean) => void;
  className?: string;
}

export default function CarCard({
  listing,
  isFavorited = false,
  onFavoriteToggle,
  className,
}: CarCardProps) {
  const { isLoggedIn } = useAuth();
  const [saved, setSaved] = useState(isFavorited);
  const [toggling, setToggling] = useState(false);
  const [imgError, setImgError] = useState(false);

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

  const imageUrl =
    !imgError && listing.thumbnail_url
      ? listing.thumbnail_url.startsWith("http")
        ? listing.thumbnail_url
        : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${listing.thumbnail_url}`
      : null;

  return (
    <Link href={`/listings/${listing.id}`} className={cn("group block car-card", className)}>
      <article className="bg-white rounded-xl border border-neutral-200 overflow-hidden h-full flex flex-col hover:border-neutral-300 transition-colors">
        <div className="relative h-48 bg-neutral-100 overflow-hidden shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover"
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

          <button
            onClick={handleFavorite}
            disabled={toggling}
            aria-label={saved ? "Remove from saved" : "Save"}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
              "border transition-colors",
              saved
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-900 hover:text-neutral-900"
            )}
          >
            <Icon name="favorite" size={16} filled={saved} className={saved ? "text-white" : ""} />
          </button>

          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs font-medium">
              {listing.year}
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-1 gap-3">
          <div>
            <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 leading-snug group-hover:text-black">
              {listing.title}
            </h3>
            <p className="mt-1.5 text-base font-semibold text-neutral-900">
              {formatKES(listing.price_kes)}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <SpecChip icon={<Icon name="speed" size={14} />} label={formatMileage(listing.mileage)} />
            <FuelBadge type={listing.fuel_type} />
            <SpecChip
              icon={<Icon name="settings" size={14} />}
              label={listing.transmission === "automatic" ? "Auto" : "Manual"}
            />
          </div>

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-100">
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <Icon name="location_on" size={14} className="text-neutral-400" />
              {listing.location}
            </span>
            <span className="flex items-center gap-1 text-xs text-neutral-400">
              <Icon name="schedule" size={14} />
              {timeAgo(listing.created_at)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SpecChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-neutral-200 text-neutral-600 text-xs font-medium">
      {icon}
      {label}
    </span>
  );
}
