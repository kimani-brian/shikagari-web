"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export const DEALER_PROFILE_UPDATED_EVENT = "dealer-profile-updated";

// Fetches the current user's dealer profile business name (dealers only).
// Returns null for non-dealers, missing profiles, or fetch failures.
// Refetches when the profile is saved (DEALER_PROFILE_UPDATED_EVENT)
// or when the window regains focus, so edits propagate everywhere
// the name is shown without needing a page reload.
export function useMyDealerBusinessName(role?: string): string | null {
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "dealer") {
      setBusinessName(null);
      return;
    }
    let cancelled = false;
    const fetchName = () => {
      api
        .get("/dealers/profile")
        .then((res) => {
          if (!cancelled) setBusinessName(res.data.data?.business_name ?? null);
        })
        .catch(() => {
          if (!cancelled) setBusinessName(null);
        });
    };
    fetchName();
    window.addEventListener("focus", fetchName);
    window.addEventListener(DEALER_PROFILE_UPDATED_EVENT, fetchName);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", fetchName);
      window.removeEventListener(DEALER_PROFILE_UPDATED_EVENT, fetchName);
    };
  }, [role]);

  return businessName;
}

// Label for the account pill under the user card.
// Dealers see their dealership name; everyone else sees their role.
// Returns null when the label would repeat the user's full name,
// so callers can hide the pill instead of duplicating text.
export function accountPillLabel(
  role: string | undefined,
  fullName: string | undefined,
  dealerBusinessName: string | null
): string | null {
  if (role === "dealer") {
    if (
      dealerBusinessName &&
      fullName &&
      dealerBusinessName.trim().toLowerCase() === fullName.trim().toLowerCase()
    ) {
      return null;
    }
    return dealerBusinessName?.trim() ? dealerBusinessName : "Dealer";
  }
  return role ?? null;
}
