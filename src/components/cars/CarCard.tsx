"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, MapPin, Gauge, Settings2, Eye } from "lucide-react";
import { cn, formatKES, formatMileage, timeAgo } from "@/lib/utils";
import { ListingCard } from "@/types";
import VerifiedBadge from "@/components/shared/VerifiedBadge";
import { FuelBadge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface CarCardProps {
  listing:           ListingCard;
  isFavorited?:      boolean;
  onFavoriteToggle?: (id: string, saved: boolean) => void;
  className?:        string;
}

export default function CarCard({
  listing,
  isFavorited = false,
  onFavoriteToggle,
  className,
}: CarCardProps) {
  const { isLoggedIn } = useAuth();
  const [saved,    setSaved]    = useState(isFavorited);
  const [toggling, setToggling] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Sign in to save cars to your favourites");
      return;
    }

    try {
      setToggling(true);
      const res     = await api.post(`/favorites/${listing.id}/toggle`);
      const newSaved = res.data.data.saved as boolean;
      setSaved(newSaved);
      onFavoriteToggle?.(listing.id, newSaved);
      toast.success(newSaved ? "Saved to favourites" : "Removed from favourites");
    } catch {
      toast.error("Failed to update favourites");
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
      <article className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card h-full flex flex-col">

        {/* Image */}
        <div className="relative h-48 bg-slate-100 overflow-hidden shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <span className="text-4xl mb-1">🚗</span>
              <span className="text-xs text-slate-400">{listing.make} {listing.model}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {/* Favourite button */}
          <button
            onClick={handleFavorite}
            disabled={toggling}
            aria-label={saved ? "Remove from favourites" : "Save to favourites"}
            className={cn(
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
              "backdrop-blur-sm transition-all duration-200",
              saved
                ? "bg-red-500 text-white"
                : "bg-white/80 text-slate-600 hover:bg-white hover:text-red-500"
            )}
          >
            <Heart
              className={cn("w-4 h-4", saved && "fill-current")}
              strokeWidth={saved ? 0 : 2}
            />
          </button>

          {/* Verified badge */}
          {listing.is_verified && (
            <div className="absolute top-3 left-3">
              <VerifiedBadge size="xs" />
            </div>
          )}

          {/* Year pill */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-semibold">
              {listing.year}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-brand-700 transition-colors">
              {listing.title}
            </h3>
            <p className="mt-1.5 text-lg font-bold text-brand-700 font-display">
              {formatKES(listing.price_kes)}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <SpecChip icon={<Gauge className="w-3 h-3" />} label={formatMileage(listing.mileage)} />
            <FuelBadge type={listing.fuel_type} />
            <SpecChip
              icon={<Settings2 className="w-3 h-3" />}
              label={listing.transmission === "automatic" ? "Auto" : "Manual"}
            />
          </div>

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3 shrink-0" />
              {listing.location}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Eye className="w-3 h-3" />
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
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
      {icon}
      {label}
    </span>
  );
}