"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useListing } from "@/hooks/useListings";
import api from "@/lib/api";
import Input, { Textarea, SelectField } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ListingStatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import { ArrowLeft, AlertCircle, Car } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOCATIONS = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika",
  "Malindi","Nyeri","Machakos","Kisii","Kericho","Garissa",
  "Meru","Kakamega","Other",
];

const MAKES = [
  "Toyota","Nissan","Honda","Mazda","Subaru","Mitsubishi",
  "Isuzu","Mercedes-Benz","BMW","Volkswagen","Ford",
  "Hyundai","Kia","Land Rover","Jeep","Suzuki","Other",
];

const FUEL_TYPES    = ["petrol","diesel","hybrid","electric"];
const TRANSMISSIONS = ["automatic","manual"];
const STATUSES      = ["active","inactive","sold"];
const CURRENT_YEAR  = new Date().getFullYear();
const YEARS         = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

export default function EditListingPage() {
  const router      = useRouter();
  const { id }      = useParams<{ id: string }>();
  const { listing, loading: listingLoading } = useListing(id);

  const [title,        setTitle]        = useState("");
  const [description,  setDescription]  = useState("");
  const [priceKES,     setPriceKES]     = useState("");
  const [location,     setLocation]     = useState("");
  const [make,         setMake]         = useState("");
  const [model,        setModel]        = useState("");
  const [year,         setYear]         = useState("");
  const [mileage,      setMileage]      = useState("");
  const [fuelType,     setFuelType]     = useState("petrol");
  const [transmission, setTransmission] = useState("automatic");
  const [color,        setColor]        = useState("");
  const [status,       setStatus]       = useState("active");

  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);

  // Populate form when listing loads
  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description ?? "");
      setPriceKES(String(listing.price_kes));
      setLocation(listing.location);
      setMake(listing.make);
      setModel(listing.model);
      setYear(String(listing.year));
      setMileage(String(listing.mileage));
      setFuelType(listing.fuel_type);
      setTransmission(listing.transmission);
      setColor(listing.color ?? "");
      setStatus(listing.status);
    }
  }, [listing]);

  if (listingLoading) return <PageLoader />;
  if (!listing) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Listing not found.</p>
        <Link href="/dashboard/listings">
          <Button variant="primary" size="sm" className="mt-4">Back to listings</Button>
        </Link>
      </div>
    );
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 5)
      errs.title    = "Title must be at least 5 characters";
    if (!priceKES || isNaN(Number(priceKES)) || Number(priceKES) <= 0)
      errs.priceKES = "Enter a valid price";
    if (!location)
      errs.location = "Select a location";
    if (!model.trim())
      errs.model    = "Enter the model";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    try {
      setLoading(true);
      await api.patch(`/listings/${id}`, {
        title:        title.trim()       || undefined,
        description:  description.trim() || undefined,
        price_kes:    Number(priceKES),
        location,
        make,
        model:        model.trim(),
        year:         Number(year),
        mileage:      Number(mileage),
        fuel_type:    fuelType,
        transmission,
        color:        color.trim() || undefined,
        status,
      });
      toast.success("Listing updated successfully!");
      router.push("/dashboard/listings");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to update listing.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/listings">
          <button className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-slate-900">Edit Listing</h1>
          <p className="text-sm text-slate-500 mt-0.5 truncate">{listing.title}</p>
        </div>
        <ListingStatusBadge status={status} />
      </div>

      {/* API error */}
      {apiError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Main fields */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card space-y-4">
              <h3 className="font-display font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-slate-400" />
                Basic Information
              </h3>
              <Input
                label="Listing Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (KES)"
                  type="number"
                  value={priceKES}
                  onChange={(e) => setPriceKES(e.target.value)}
                  error={errors.priceKES}
                  required
                  min={0}
                />
                <SelectField
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  error={errors.location}
                  options={LOCATIONS.map((l) => ({ value: l, label: l }))}
                  required
                />
              </div>
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card space-y-4">
              <h3 className="font-display font-bold text-slate-900">Vehicle Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  options={MAKES.map((m) => ({ value: m, label: m }))}
                  required
                />
                <Input
                  label="Model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  error={errors.model}
                  required
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <SelectField
                  label="Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
                />
                <Input
                  label="Mileage (km)"
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  min={0}
                />
                <Input
                  label="Color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Silver"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Fuel Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FUEL_TYPES.map((f) => (
                      <button
                        key={f} type="button" onClick={() => setFuelType(f)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-semibold capitalize border transition-all",
                          fuelType === f
                            ? "bg-brand-700 text-white border-brand-700"
                            : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Transmission</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRANSMISSIONS.map((t) => (
                      <button
                        key={t} type="button" onClick={() => setTransmission(t)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-semibold capitalize border transition-all",
                          transmission === t
                            ? "bg-brand-700 text-white border-brand-700"
                            : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-5">

            {/* Status */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
              <h3 className="font-display font-bold text-slate-900 mb-3">Listing Status</h3>
              <div className="space-y-2">
                {STATUSES.map((s) => (
                  <button
                    key={s} type="button" onClick={() => setStatus(s)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all",
                      status === s
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <span>{s}</span>
                    {status === s && (
                      <span className="w-2 h-2 rounded-full bg-brand-600" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Set to "inactive" to hide from public listings without deleting.
              </p>
            </div>

            {/* Current images */}
            {listing.images && listing.images.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
                <h3 className="font-display font-bold text-slate-900 mb-3 text-sm">
                  Current Photos ({listing.images.length})
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {listing.images.slice(0, 6).map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${img}`}
                        alt={`Image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  To update photos, delete and re-create the listing.
                </p>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
              Save Changes
            </Button>

            <Link href={`/listings/${id}`} target="_blank">
              <Button type="button" variant="secondary" fullWidth>
                Preview Listing
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}