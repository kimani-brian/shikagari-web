"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { BODY_TYPES } from "@/lib/vehicles";

interface SearchBarProps {
  variant?: "hero" | "compact";
  className?: string;
  initialValues?: { query?: string; location?: string };
}

export default function SearchBar({
  variant = "hero",
  className,
  initialValues,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValues?.query ?? "");
  const [type, setType] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    // A location passed in (e.g. from a county link) is preserved
    if (initialValues?.location) params.set("location", initialValues.location);
    if (type) params.set("body_type", type);
    router.push(`/listings?${params.toString()}`);
  };

  if (variant === "hero") {
    return (
      <form
        onSubmit={handleSearch}
        className={cn(
          "bg-white rounded-full border border-neutral-300",
          "p-1.5 flex flex-col sm:flex-row gap-1.5",
          "focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900",
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1 px-4 py-2">
          <Icon name="search" size={20} className="text-neutral-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search make, model, or keyword"
            className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
          />
        </div>

        <div className="hidden sm:block w-px bg-neutral-200 self-stretch my-2" />

        <div className="relative flex items-center gap-2 px-3 py-2 min-w-[140px]">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 bg-transparent text-sm text-neutral-700 outline-none appearance-none cursor-pointer pr-6"
          >
            <option value="">All Types</option>
            {BODY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Icon
            name="expand_more"
            size={18}
            className="text-neutral-400 pointer-events-none absolute right-2"
          />
        </div>

        <Button type="submit" variant="primary" size="md" className="shrink-0">
          <Icon name="search" size={18} className="text-white" />
          Search
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "flex items-center gap-2 bg-white rounded-full border border-neutral-300 px-4 py-2",
        className
      )}
    >
      <Icon name="search" size={18} className="text-neutral-400 shrink-0" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cars"
        className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="w-6 h-6 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </form>
  );
}
