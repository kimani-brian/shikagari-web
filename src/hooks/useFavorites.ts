"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ListingCard, PaginationMeta } from "@/types";

interface UseFavoritesReturn {
  listings:  ListingCard[];
  meta:      PaginationMeta | null;
  loading:   boolean;
  error:     string | null;
  refetch:   () => void;
  /** Removes a saved car and updates the list optimistically. */
  unsave:    (listingId: string) => Promise<void>;
}

// useFavorites loads the signed-in user's saved cars and exposes an unsave
// helper so the grid and the heart buttons stay in sync.
export function useFavorites(page = 1): UseFavoritesReturn {
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [meta,     setMeta]     = useState<PaginationMeta | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/favorites", { params: { page, per_page: 24 } });
      const rows = res.data.data ?? [];
      // The API nests the listing inside each favourite record.
      setListings(rows.map((row: { listing: ListingCard }) => row.listing).filter(Boolean));
      setMeta(res.data.meta ?? null);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
      setError(data?.message ?? "Failed to load your saved cars.");
      setListings([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const unsave = async (listingId: string) => {
    const previous = listings;
    setListings((prev) => prev.filter((l) => l.id !== listingId));
    try {
      await api.post(`/favorites/${listingId}/toggle`);
      toast.success("Removed from saved cars");
    } catch (err: unknown) {
      setListings(previous);
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
      toast.error(data?.message ?? "Could not remove that car");
    }
  };

  return { listings, meta, loading, error, refetch: fetchFavorites, unsave };
}
