"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { DealerProfile, PaginationMeta } from "@/types";

interface UseDealersReturn {
  dealers: DealerProfile[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDealers(page = 1, perPage = 20): UseDealersReturn {
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDealers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/dealers", { params: { page, per_page: perPage } });
      setDealers(res.data.data ?? []);
      setMeta(res.data.meta ?? null);
    } catch (err: unknown) {
      const message =
        err != null && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message ?? "Failed to load dealers. Please try again.");
      setDealers([]);
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  return { dealers, meta, loading, error, refetch: fetchDealers };
}

interface UseDealerReturn {
  dealer: DealerProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDealer(id: string): UseDealerReturn {
  const [dealer, setDealer] = useState<DealerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDealer = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/dealers/${id}`);
      setDealer(res.data.data);
    } catch (err: unknown) {
      const message =
        err != null && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message ?? "This dealer could not be found.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDealer();
  }, [fetchDealer]);

  return { dealer, loading, error, refetch: fetchDealer };
}
