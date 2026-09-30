"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { isServer } from "@/lib/config";

const STORAGE_KEY = "shikagari_compare";
const MAX_COMPARE = 4;

export type CompareToggleResult = "added" | "removed" | "full";

interface CompareContextValue {
  ids:    string[];
  count:  number;
  max:    number;
  has:    (id: string) => boolean;
  toggle: (id: string) => CompareToggleResult;
  remove: (id: string) => void;
  clear:  () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

function readStored(): string[] {
  if (isServer) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

// CompareProvider holds the shortlist in one place so every compare button
// on the page (cards, toolbar, compare page) updates instantly.
export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readStored());
  }, []);

  const persist = (next: string[]) => {
    setIds(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable — in-memory list still works for the session
    }
  };

  const value: CompareContextValue = {
    ids,
    count: ids.length,
    max: MAX_COMPARE,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => {
      if (ids.includes(id)) {
        persist(ids.filter((saved) => saved !== id));
        return "removed";
      }
      if (ids.length >= MAX_COMPARE) return "full";
      persist([...ids, id]);
      return "added";
    },
    remove: (id: string) => persist(ids.filter((saved) => saved !== id)),
    clear: () => persist([]),
  };

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
