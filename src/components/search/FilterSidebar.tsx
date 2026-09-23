"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { ListingFilters } from "@/types";

const LOCATIONS = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Eldoret",
  "Thika","Malindi","Nyeri","Machakos","Kisii",
  "Kericho","Garissa","Meru","Kakamega","Other",
];

const MAKES = [
  "Toyota","Nissan","Honda","Mazda","Subaru","Mitsubishi",
  "Isuzu","Mercedes-Benz","BMW","Volkswagen","Ford",
  "Hyundai","Kia","Land Rover","Jeep",
];

const FUEL_TYPES    = ["petrol","diesel","hybrid","electric"];
const TRANSMISSIONS = ["automatic","manual"];
const SELLER_TYPES  = ["dealer","private"];

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest first"     },
  { value: "price_asc",  label: "Price low to high" },
  { value: "price_desc", label: "Price high to low" },
  { value: "year_desc",  label: "Year newest"      },
  { value: "year_asc",   label: "Year oldest"      },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

interface FilterSidebarProps {
  activeFilters:   ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
  totalResults?:   number;
  isMobileOpen?:   boolean;
  onMobileClose?:  () => void;
}

export default function FilterSidebar({
  activeFilters,
  onFiltersChange,
  totalResults,
  isMobileOpen  = false,
  onMobileClose,
}: FilterSidebarProps) {
  const [local, setLocal] = useState<ListingFilters>(activeFilters);

  const update = (key: keyof ListingFilters, value: unknown) => {
    setLocal((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const applyFilters = () => {
    onFiltersChange({ ...local, page: 1 });
    onMobileClose?.();
  };

  const clearAll = () => {
    const cleared: ListingFilters = { page: 1, per_page: local.per_page };
    setLocal(cleared);
    onFiltersChange(cleared);
    onMobileClose?.();
  };

  const activeCount = Object.entries(local).filter(
    ([k, v]) => !["page","per_page"].includes(k) && v !== undefined && v !== ""
  ).length;

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Icon name="tune" size={18} className="text-neutral-600" />
          <span className="font-medium text-neutral-900 text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-medium flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <FilterSection title="Sort by">
          <select value={local.sort_by ?? "newest"} onChange={(e) => update("sort_by", e.target.value)} className={selectCls}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </FilterSection>

        <FilterSection title="Location">
          <select value={local.location ?? ""} onChange={(e) => update("location", e.target.value)} className={selectCls}>
            <option value="">All locations</option>
            {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </FilterSection>

        <FilterSection title="Price range KES">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-500 font-medium mb-1 block">Min</label>
              <input type="number" placeholder="0" value={local.min_price ?? ""} onChange={(e) => update("min_price", e.target.value ? Number(e.target.value) : undefined)} className={inputCls} min={0} step={50000} />
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 font-medium mb-1 block">Max</label>
              <input type="number" placeholder="Any" value={local.max_price ?? ""} onChange={(e) => update("max_price", e.target.value ? Number(e.target.value) : undefined)} className={inputCls} min={0} step={50000} />
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Make">
          <select value={local.make ?? ""} onChange={(e) => update("make", e.target.value)} className={selectCls}>
            <option value="">All makes</option>
            {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </FilterSection>

        <FilterSection title="Model">
          <input type="text" placeholder="Premio, Fielder" value={local.model ?? ""} onChange={(e) => update("model", e.target.value)} className={inputCls} />
        </FilterSection>

        <FilterSection title="Year">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-500 font-medium mb-1 block">From</label>
              <select value={local.min_year ?? ""} onChange={(e) => update("min_year", e.target.value ? Number(e.target.value) : undefined)} className={selectCls}>
                <option value="">Any</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-neutral-500 font-medium mb-1 block">To</label>
              <select value={local.max_year ?? ""} onChange={(e) => update("max_year", e.target.value ? Number(e.target.value) : undefined)} className={selectCls}>
                <option value="">Any</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Fuel type">
          <div className="flex flex-wrap gap-2">
            {FUEL_TYPES.map((f) => (
              <PillToggle key={f} label={f.charAt(0).toUpperCase() + f.slice(1)} active={local.fuel_type === f} onClick={() => update("fuel_type", local.fuel_type === f ? undefined : f)} />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Transmission">
          <div className="flex gap-2">
            {TRANSMISSIONS.map((t) => (
              <PillToggle key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} active={local.transmission === t} onClick={() => update("transmission", local.transmission === t ? undefined : t)} className="flex-1 justify-center" />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Seller type">
          <div className="flex gap-2">
            {SELLER_TYPES.map((s) => (
              <PillToggle key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} active={local.seller_type === s} onClick={() => update("seller_type", local.seller_type === s ? undefined : s)} className="flex-1 justify-center" />
            ))}
          </div>
        </FilterSection>
      </div>

      <div className="p-4 border-t border-neutral-200">
        {totalResults !== undefined && (
          <p className="text-xs text-neutral-500 text-center mb-3">
            <span className="font-semibold text-neutral-900">{totalResults.toLocaleString()}</span> cars found
          </p>
        )}
        <Button variant="primary" fullWidth onClick={applyFilters}>
          Apply filters
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 bg-white rounded-xl border border-neutral-200 sticky top-[calc(var(--nav-height)+1rem)] max-h-[calc(100vh-var(--nav-height)-2rem)] overflow-hidden">
        {sidebar}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-neutral-900/30" onClick={onMobileClose} />
          <aside className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white flex flex-col">
            <button onClick={onMobileClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors z-10">
              <Icon name="close" size={18} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
    </>
  );
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center justify-between w-full mb-2.5">
        <span className="text-xs font-medium text-neutral-700 tracking-wide">{title}</span>
        <Icon name={open ? "expand_less" : "expand_more"} size={18} className="text-neutral-400" />
      </button>
      {open && children}
    </div>
  );
}

function PillToggle({ label, active, onClick, className }: { label: string; active: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
        active
          ? "bg-neutral-900 text-white border-neutral-900"
          : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-900 hover:text-neutral-900",
        className
      )}
    >
      {label}
    </button>
  );
}

const inputCls  = "w-full rounded-full border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors";
const selectCls = "w-full rounded-full border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-colors appearance-none cursor-pointer";
