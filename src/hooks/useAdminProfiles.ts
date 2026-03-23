"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { DealerProfile, PrivateSellerProfile } from "@/types";

interface UseAdminProfilesReturn<T> {
  profiles: T[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => void;
}

function useAdminProfiles<T>(endpoint: string, status: string): UseAdminProfilesReturn<T> {
  const [profiles, setProfiles] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = status ? { status } : undefined;
      const res = await api.get(endpoint, { params });
      setProfiles(res.data.data ?? []);
      const totalItems = res.data.meta?.total_items ?? (res.data.data?.length ?? 0);
      setTotal(totalItems);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? "Failed to load profiles";
      setError(message);
      setProfiles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [endpoint, status]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, error, total, refetch: fetchProfiles };
}

export function useAdminDealerProfiles(status = "pending") {
  return useAdminProfiles<DealerProfile>("/admin/dealers", status);
}

export function useAdminPrivateSellerProfiles(status = "pending") {
  return useAdminProfiles<PrivateSellerProfile>("/admin/sellers", status);
}
