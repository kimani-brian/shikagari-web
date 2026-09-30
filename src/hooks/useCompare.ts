"use client";

// Re-exported from the compare context so every consumer shares one
// live shortlist. Import from here or from "@/contexts/CompareContext".
export { useCompare } from "@/contexts/CompareContext";
export type { CompareToggleResult } from "@/contexts/CompareContext";
