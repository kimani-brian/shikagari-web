"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

const CITIES = [
  "All Locations","Nairobi","Mombasa","Kisumu","Nakuru",
  "Eldoret","Thika","Malindi","Nyeri","Machakos",
  "Kisii","Kericho","Garissa","Meru","Kakamega",
];

const BODY_TYPES = [
  "All Types","Sedan","SUV","Hatchback","Pickup / Truck",
  "Van / Minibus","Coupe","Convertible","Station Wagon",
];

interface SearchBarProps {
  variant?:       "hero" | "compact";
  className?:     string;
  initialValues?: { query?: string; location?: string };
}

export default function SearchBar({
  variant = "hero",
  className,
  initialValues,
}: SearchBarProps) {
  const router = useRouter();
  const [query,    setQuery]    = useState(initialValues?.query    ?? "");
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [type,     setType]     = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim())                              params.set("search",   query.trim());
    if (location && location !== "All Locations")  params.set("location", location);
    if (type && type !== "All Types")              params.set("search",   `${params.get("search") ?? ""} ${type}`.trim());
    router.push(`/listings?${params.toString()}`);
  };

  if (variant === "hero") {
    return (
      <form
        onSubmit={handleSearch}
        className={cn(
          "bg-white rounded-2xl shadow-[0_8px_40px_rgb(0_0_0/0.12)]",
          "p-2 flex flex-col sm:flex-row gap-2 border border-white",
          className
        )}
      >
        {/* Keyword */}
        <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search make, model, or keyword..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
          />
        </div>

        <div className="hidden sm:block w-px bg-slate-200 self-stretch my-2" />

        {/* Location */}
        <div className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors min-w-[160px]">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none appearance-none cursor-pointer pr-4"
          >
            {CITIES.map((city) => (
              <option key={city} value={city === "All Locations" ? "" : city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3" />
        </div>

        <div className="hidden sm:block w-px bg-slate-200 self-stretch my-2" />

        {/* Body type */}
        <div className="relative flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors min-w-[140px]">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none appearance-none cursor-pointer pr-4"
          >
            {BODY_TYPES.map((t) => (
              <option key={t} value={t === "All Types" ? "" : t}>{t}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-3" />
        </div>

        <Button type="submit" variant="primary" size="md" leftIcon={<Search className="w-4 h-4" />} className="shrink-0 sm:rounded-xl">
          Search
        </Button>
      </form>
    );
  }

  // Compact
  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-card",
        className
      )}
    >
      <Search className="w-4 h-4 text-slate-400 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cars..."
        className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
      />
      {query && (
        <button type="button" onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 text-lg leading-none">
          ×
        </button>
      )}
    </form>
  );
}