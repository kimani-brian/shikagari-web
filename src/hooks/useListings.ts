"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { ListingCard, ListingDetail, ListingFilters, PaginationMeta } from "@/types";

// ── All listings (search + filter) ────────────────────────────────────────────
interface UseListingsReturn {
  listings: ListingCard[];
  meta:     PaginationMeta | null;
  loading:  boolean;
  error:    string | null;
  refetch:  () => void;
}

export function useListings(filters: ListingFilters): UseListingsReturn {
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [meta,     setMeta]     = useState<PaginationMeta | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== "" && v !== 0) {
          params.set(k, String(v));
        }
      });

      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data.data ?? []);
      setMeta(res.data.meta    ?? null);
    } catch {
      setError("Failed to load listings. Please try again.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchListings(); }, [fetchListings]);

  return { listings, meta, loading, error, refetch: fetchListings };
}

// ── Single listing ─────────────────────────────────────────────────────────────
interface UseListingReturn {
  listing: ListingDetail | null;
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useListing(id: string): UseListingReturn {
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/listings/${id}`);
      setListing(res.data.data);
    } catch {
      setError("This listing could not be found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchListing(); }, [fetchListing]);

  return { listing, loading, error, refetch: fetchListing };
}

// ── My listings (seller dashboard) ────────────────────────────────────────────
interface UseMyListingsReturn {
  listings: ListingCard[];
  meta:     PaginationMeta | null;
  loading:  boolean;
  error:    string | null;
  refetch:  () => void;
}

export function useMyListings(page = 1, perPage = 20): UseMyListingsReturn {
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [meta,     setMeta]     = useState<PaginationMeta | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/listings/me?page=${page}&per_page=${perPage}`);
      setListings(res.data.data ?? []);
      setMeta(res.data.meta    ?? null);
    } catch {
      setError("Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => { fetch(); }, [fetch]);

  return { listings, meta, loading, error, refetch: fetch };
}