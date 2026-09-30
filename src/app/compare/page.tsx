"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import api from "@/lib/api";
import { API_ORIGIN } from "@/lib/config";
import { ListingCard, ListingDetail } from "@/types";
import { formatKES, formatMileage, cn } from "@/lib/utils";
import { useCompare } from "@/hooks/useCompare";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

function resolveUrl(url: string): string {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_ORIGIN}${url}`;
}

interface SpecRow {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  render: (car: ListingDetail) => React.ReactNode;
}

const SPEC_ROWS: SpecRow[] = [
  { key: "price",        label: "Price",        icon: "payments",          render: (car) => <span className="font-semibold">{formatKES(car.price_kes)}</span> },
  { key: "year",         label: "Year",         icon: "calendar_today",    render: (car) => car.year },
  { key: "mileage",      label: "Mileage",      icon: "speed",             render: (car) => formatMileage(car.mileage) },
  { key: "body",         label: "Body Type",    icon: "directions_car",    render: (car) => car.body_type || "—" },
  { key: "fuel",         label: "Fuel Type",    icon: "local_gas_station", render: (car) => car.fuel_type.toUpperCase() },
  { key: "transmission", label: "Transmission", icon: "settings",          render: (car) => car.transmission.toUpperCase() },
  { key: "drive",        label: "Drive",        icon: "settings",          render: (car) => car.drivetrain || "—" },
  { key: "engine",       label: "Engine CC",    icon: "bolt",              render: (car) => car.engine_size || "—" },
  { key: "doors",        label: "Doors",        icon: "directions_car",    render: (car) => (car.doors ? String(car.doors) : "—") },
  { key: "color",        label: "Color",        icon: "palette",           render: (car) => car.color || "—" },
  { key: "location",     label: "Location",     icon: "map_pin",           render: (car) => car.location },
];

export default function ComparePage() {
  const { ids, toggle, remove, clear, max } = useCompare();
  const [cars, setCars] = useState<ListingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (ids.length === 0) {
      setCars([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchCars = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          ids.map((id) => api.get(`/listings/${id}`).then((res) => res.data.data as ListingDetail))
        );
        if (!cancelled) setCars(results);
      } catch {
        if (!cancelled) setCars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCars();
    return () => {
      cancelled = true;
    };
  }, [ids.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemove = (id: string, name: string) => {
    remove(id);
    toast.success(`${name} removed from compare`);
  };

  if (loading) return <PageLoader />;

  return (
    <PageWrapper className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Compare cars</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {cars.length} of {max} slots used
          </p>
        </div>
        <div className="flex items-center gap-2">
          {cars.length > 0 && (
            <Button variant="secondary" size="sm" onClick={clear}>
              Clear all
            </Button>
          )}
          <Link href="/listings">
            <Button variant="primary" size="sm" className="mt-2">
              Vehicles
            </Button>
          </Link>
        </div>
      </div>

      {cars.length < 2 && (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center mb-6">
          <p className="text-sm font-medium text-neutral-900">Add at least two vehicles to start comparing.</p>
          <Button variant="primary" size="sm" className="mt-3" onClick={() => setPickerOpen(true)}>
            Add a vehicle
          </Button>
        </div>
      )}

      {cars.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `170px repeat(${cars.length}, minmax(210px, 1fr)) minmax(180px, 200px)`,
              minWidth: 640,
            }}
          >
            {/* ── Header row ── */}
            <div className="sticky left-0 z-10 bg-white border-b border-neutral-200 p-4 flex items-end">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Specification
              </span>
            </div>
            {cars.map((car) => (
              <div key={car.id} className="border-b border-neutral-200 border-l border-neutral-100">
                <div className="relative bg-emerald-800 text-white">
                  <button
                    onClick={() => handleRemove(car.id, `${car.make} ${car.model}`)}
                    aria-label={`Remove ${car.make} ${car.model}`}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="aspect-[16/9] bg-emerald-900 overflow-hidden">
                    {car.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveUrl(car.images[0])}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon name="directions_car" size={28} className="text-white/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 pr-10">
                    <p className="text-sm font-semibold leading-tight truncate">
                      {car.year} {car.make} {car.model}
                    </p>
                    <p className="text-[11px] text-white/70 flex items-center gap-1 mt-1 uppercase tracking-wide">
                      <Icon name="map_pin" size={12} />
                      {car.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-b border-neutral-200 border-l border-neutral-100 p-3">
              <button
                onClick={() => setPickerOpen(true)}
                className="w-full h-full min-h-[180px] rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                <span className="text-3xl font-light leading-none">+</span>
                <span className="text-xs font-medium">Add Vehicle</span>
              </button>
            </div>

            {/* ── Spec rows (zebra) ── */}
            {SPEC_ROWS.map((row, rowIndex) => {
              const stripe = rowIndex % 2 === 0 ? "bg-white" : "bg-neutral-50";
              return (
                <div key={row.key} style={{ display: "contents" }}>
                  <div className={cn("sticky left-0 z-10 px-4 py-3 flex items-center gap-2 border-r border-neutral-200", stripe)}>
                    <Icon name={row.icon} size={15} className="text-neutral-400 shrink-0" />
                    <span className="text-xs font-medium text-neutral-600 truncate">{row.label}</span>
                  </div>
                  {cars.map((car) => (
                    <div
                      key={car.id}
                      className={cn("px-4 py-3 text-sm text-neutral-900 border-l border-neutral-100 truncate", stripe)}
                    >
                      {row.render(car)}
                    </div>
                  ))}
                  <div className={cn("border-l border-neutral-100", stripe)} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pickerOpen && (
        <AddVehicleModal
          excludeIds={ids}
          max={max}
          onAdd={(id) => {
            const result = toggle(id);
            if (result === "added") toast.success("Added to compare");
            if (result === "full") toast.error(`Compare list is full (${max} max)`);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </PageWrapper>
  );
}

// ── Add-vehicle search modal ────────────────────────────────────────────────
function AddVehicleModal({
  excludeIds,
  max,
  onAdd,
  onClose,
}: {
  excludeIds: string[];
  max: number;
  onAdd: (id: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ListingCard[]>([]);
  const [searching, setSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    let cancelled = false;
    const search = async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({ per_page: "8", sort_by: "newest" });
        if (debouncedQuery.trim()) params.set("search", debouncedQuery.trim());
        const res = await api.get(`/listings?${params.toString()}`);
        if (!cancelled) setResults(res.data.data ?? []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    };
    search();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const remaining = max - excludeIds.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md border border-neutral-200 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Add vehicle</h3>
            <p className="text-xs text-neutral-500 mt-0.5">{remaining} slot{remaining === 1 ? "" : "s"} left</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2.5">
            <Icon name="search" size={18} className="text-neutral-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search make, model, or keyword"
              className="flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
            />
          </div>
        </div>

        <div className="overflow-y-auto p-3 space-y-1">
          {searching && results.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">Searching…</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-8">No cars found</p>
          ) : (
            results.map((car) => {
              const added = excludeIds.includes(car.id);
              return (
                <div key={car.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                  <span className="w-16 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0 flex items-center justify-center">
                    {car.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={car.thumbnail_url.startsWith("http") ? car.thumbnail_url : `${API_ORIGIN}${car.thumbnail_url}`}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon name="directions_car" size={20} className="text-neutral-300" />
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-neutral-900 truncate">
                      {car.year} {car.make} {car.model}
                    </span>
                    <span className="block text-xs text-neutral-500">{formatKES(car.price_kes)}</span>
                  </span>
                  <Button
                    variant={added ? "secondary" : "primary"}
                    size="sm"
                    disabled={added}
                    onClick={() => onAdd(car.id)}
                  >
                    {added ? "Added" : "Add"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
