import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price in KES
export function formatKES(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style:    "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format mileage with commas
export function formatMileage(km: number): string {
  return `${new Intl.NumberFormat("en-KE").format(km)} km`;
}

// Relative time (e.g. "2 days ago")
export function timeAgo(dateString: string): string {
  const date  = new Date(dateString);
  const now   = new Date();
  const diff  = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}