"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useListing } from "@/hooks/useListings";
import api from "@/lib/api";
import { API_ORIGIN } from "@/lib/config";
import Input, { Textarea, SelectField } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ListingStatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import toast from "react-hot-toast";
import { ArrowLeft, AlertCircle, Car, Upload, X, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  VEHICLE_MAKES,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  DRIVETRAINS,
} from "@/lib/vehicles";
import { KENYAN_COUNTIES } from "@/lib/locations";

// Pulls the server-provided message out of an axios rejection without
// resorting to `any`.
function apiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const { response } = err as { response?: { data?: { message?: string } } };
    if (response?.data?.message) return response.data.message;
  }
  return fallback;
}

const STATUSES      = ["active","inactive","sold"];
const CURRENT_YEAR  = new Date().getFullYear();
const YEARS         = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

export default function EditListingPage() {
  const router      = useRouter();
  const { id }      = useParams<{ id: string }>();
  const { listing, loading: listingLoading, refetch } = useListing(id);

  const [description,  setDescription]  = useState("");
  const [priceKES,     setPriceKES]     = useState("");
  const [location,     setLocation]     = useState("");
  const [bodyType,     setBodyType]     = useState("");
  const [make,         setMake]         = useState("");
  const [model,        setModel]        = useState("");
  const [year,         setYear]         = useState("");
  const [mileage,      setMileage]      = useState("");
  const [fuelType,     setFuelType]     = useState("petrol");
  const [transmission, setTransmission] = useState("automatic");
  const [drivetrain,   setDrivetrain]   = useState("");
  const [engineSize,   setEngineSize]   = useState("");
  const [doors,        setDoors]        = useState("");
  const [color,        setColor]        = useState("");
  const [status,       setStatus]       = useState("active");

  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [imageFiles,    setImageFiles]    = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [coverBusy,     setCoverBusy]     = useState(false);
  const [localCover,    setLocalCover]    = useState<string | null>(null);
  const [elogbook,      setELogbook]      = useState<File | null>(null);
  const [elogbookError, setELogbookError] = useState("");
  const [elogbookBusy,  setELogbookBusy]  = useState(false);

  // Populate form when listing loads — only once. A late or duplicate fetch
  // must never overwrite what the user has already typed.
  const populated = useRef(false);
  useEffect(() => {
    if (listing && !populated.current) {
      populated.current = true;
      setDescription(listing.description ?? "");
      setPriceKES(String(listing.price_kes));
      setLocation(listing.location);
      setBodyType(listing.body_type ?? "");
      setMake(listing.make);
      setModel(listing.model);
      setYear(String(listing.year));
      setMileage(String(listing.mileage));
      setFuelType(listing.fuel_type);
      setTransmission(listing.transmission);
      setDrivetrain(listing.drivetrain ?? "");
      setEngineSize(listing.engine_size ?? "");
      setDoors(listing.doors ? String(listing.doors) : "");
      setColor(listing.color ?? "");
      setStatus(listing.status);
    }
  }, [listing]);

  if (listingLoading) return <PageLoader />;
  if (!listing) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500">Listing not found.</p>
        <Link href="/dashboard/listings">
          <Button variant="primary" size="sm" className="mt-4">Back to listings</Button>
        </Link>
      </div>
    );
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!priceKES || isNaN(Number(priceKES)) || Number(priceKES) <= 0)
      errs.priceKES = "Enter a valid price";
    if (!location)
      errs.location = "Select a location";
    if (!bodyType)
      errs.bodyType = "Select a body type";
    if (!model.trim())
      errs.model    = "Enter the model";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const existingCount = listing?.images?.length ?? 0;

  // A buyer listing is only live once an admin approved the e-logbook, so the
  // owner cannot flip it back to "active" themselves.
  const awaitingReview = listing?.seller_type !== "dealer" && listing?.verification_status !== "approved";
  const availableStatuses = awaitingReview
    ? STATUSES.filter((s) => s !== "active")
    : STATUSES;

  // ── Multi-image handling ─────────────────────────────────────────────
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (existingCount + imageFiles.length + files.length > 10) {
      toast.error(`Maximum 10 photos per listing (${existingCount} already uploaded)`);
      return;
    }
    const validFiles = files.filter((f) =>
      ["image/jpeg","image/png","image/webp"].includes(f.type) && f.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== files.length) {
      toast.error("Some files were skipped (must be JPEG/PNG/WebP, max 5MB each)");
    }
    setImageFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev)    => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // The card thumbnail is whichever photo the seller picks here.
  // localCover mirrors the server value so the badge moves on click without
  // waiting for the refetch to land.
  const currentCover = localCover ?? listing?.cover_image ?? listing?.images?.[0] ?? null;

  const handleSetCover = async (imageUrl: string) => {
    if (imageUrl === currentCover || coverBusy) return;
    try {
      setCoverBusy(true);
      const res = await api.patch(`/listings/${id}/cover`, { image_url: imageUrl });
      toast.success("Thumbnail updated");
      // Keep local state in step so the badge moves immediately.
      setLocalCover(res.data.data.cover_image || imageUrl);
      await refetch();
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
      toast.error(data?.message ?? "Could not update the thumbnail.");
    } finally {
      setCoverBusy(false);
    }
  };

  const handleUpload = async () => {
    if (imageFiles.length === 0) return;
    try {
      setUploading(true);
      const formData = new FormData();
      imageFiles.forEach((file) => formData.append("images", file));
      await api.post(`/listings/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Photos added successfully!");
      setImageFiles([]);
      setImagePreviews([]);
      await refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to upload photos.");
    } finally {
      setUploading(false);
    }
  };

  const handleELogbookUpload = async () => {
    if (!elogbook) return;
    try {
      setELogbookBusy(true);
      setELogbookError("");
      const formData = new FormData();
      formData.append("elogbook", elogbook);
      await api.post(`/listings/${id}/elogbook`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("E-logbook uploaded — your listing is back in the review queue.");
      setELogbook(null);
      await refetch();
    } catch (err: unknown) {
      const msg = apiErrorMessage(err, "Failed to upload your e-logbook.");
      setELogbookError(msg);
      toast.error(msg);
    } finally {
      setELogbookBusy(false);
    }
  };

  const handleELogbookPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setELogbookError("E-logbook must be a JPEG, PNG, WebP, or PDF file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setELogbookError("E-logbook must be 5MB or smaller");
      return;
    }
    setELogbookError("");
    setELogbook(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    try {
      setLoading(true);
      await api.patch(`/listings/${id}`, {
        title:        `${year} ${make} ${model}`.trim(),
        description:  description.trim() || undefined,
        price_kes:    Number(priceKES),
        location,
        body_type:    bodyType,
        make,
        model:        model.trim(),
        year:         Number(year),
        mileage:      Number(mileage),
        fuel_type:    fuelType,
        transmission,
        drivetrain:   drivetrain || undefined,
        engine_size:  engineSize.trim() || undefined,
        doors:        doors ? Number(doors) : undefined,
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
          <button className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-neutral-900">Edit Listing</h1>
          <p className="text-sm text-neutral-500 mt-0.5 truncate">{listing.title}</p>
        </div>
        <ListingStatusBadge status={status} />
      </div>

      {/* API error */}
      {apiError && (
        <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-700 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Main fields */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic info */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-200  space-y-4">
              <h3 className="font-display font-bold text-neutral-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-neutral-400" />
                Basic Information
              </h3>
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
                  options={KENYAN_COUNTIES.map((l) => ({ value: l, label: l }))}
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
            <div className="bg-white rounded-2xl p-6 border border-neutral-200  space-y-4">
              <h3 className="font-display font-bold text-neutral-900">Vehicle Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Body Type"
                  value={bodyType}
                  onChange={(e) => setBodyType(e.target.value)}
                  error={errors.bodyType}
                  options={BODY_TYPES.map((b) => ({ value: b, label: b }))}
                  required
                />
                <SelectField
                  label="Make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  options={VEHICLE_MAKES.map((m) => ({ value: m, label: m }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  error={errors.model}
                  required
                />
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-2">Drivetrain</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DRIVETRAINS.map((d) => (
                      <button
                        key={d} type="button" onClick={() => setDrivetrain(drivetrain === d ? "" : d)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-semibold border transition-all",
                          drivetrain === d
                            ? "bg-neutral-900 text-white border-brand-700"
                            : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
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
                  label="Engine size"
                  value={engineSize}
                  onChange={(e) => setEngineSize(e.target.value)}
                  placeholder="e.g. 3.0L"
                />
                <Input
                  label="Doors"
                  type="number"
                  value={doors}
                  onChange={(e) => setDoors(e.target.value)}
                  placeholder="e.g. 4"
                  min={2}
                  max={6}
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
                  <label className="text-sm font-semibold text-neutral-700 block mb-2">Fuel Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FUEL_TYPES.map((f) => (
                      <button
                        key={f} type="button" onClick={() => setFuelType(f)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-semibold capitalize border transition-all",
                          fuelType === f
                            ? "bg-neutral-900 text-white border-brand-700"
                            : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-2">Transmission</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRANSMISSIONS.map((t) => (
                      <button
                        key={t} type="button" onClick={() => setTransmission(t)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-semibold capitalize border transition-all",
                          transmission === t
                            ? "bg-neutral-900 text-white border-brand-700"
                            : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
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

            {/* NTSA e-logbook — buyers only, until approved */}
            {awaitingReview && listing && (
              <div className="bg-white rounded-2xl p-5 border border-neutral-200 space-y-3">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-display font-bold text-neutral-900 text-sm">NTSA e-logbook</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {listing.verification_status === "rejected"
                        ? "Your listing was rejected. Upload a corrected e-logbook to resubmit."
                        : listing.verification_elogbook_url
                          ? "Your e-logbook is with our review team."
                          : "Upload your e-logbook to submit this listing for review."}
                    </p>
                  </div>
                </div>

                {listing.verification_status === "rejected" && listing.rejection_reason && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3">
                    <p className="text-xs font-semibold text-red-800 mb-0.5">Reason given</p>
                    <p className="text-xs text-red-700">{listing.rejection_reason}</p>
                  </div>
                )}

                <label className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                  elogbook
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-slate-300 hover:border-brand-400 hover:bg-neutral-50"
                )}>
                  <p className="text-sm font-semibold text-neutral-700">
                    {elogbook ? elogbook.name : "Choose e-logbook file"}
                  </p>
                  <p className="text-xs text-neutral-400">Photo or PDF — max 5MB</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleELogbookPick}
                    className="sr-only"
                  />
                </label>

                {elogbookError && <p className="text-xs text-red-600">{elogbookError}</p>}

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  fullWidth
                  disabled={!elogbook}
                  loading={elogbookBusy}
                  onClick={handleELogbookUpload}
                >
                  Submit e-logbook for review
                </Button>
              </div>
            )}

            {/* Status */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 ">
              <h3 className="font-display font-bold text-neutral-900 mb-3">Listing Status</h3>
              <div className="space-y-2">
                {availableStatuses.map((s) => (
                  <button
                    key={s} type="button" onClick={() => setStatus(s)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all",
                      status === s
                        ? "border-neutral-900 bg-neutral-50 text-neutral-900"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-slate-300"
                    )}
                  >
                    <span>{s}</span>
                    {status === s && (
                      <span className="w-2 h-2 rounded-full bg-neutral-900" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-3">
                Set to "inactive" to hide from public listings without deleting.
              </p>
            </div>

            {/* Photos: current + add more */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 ">
              <h3 className="font-display font-bold text-neutral-900 mb-1 text-sm">
                Photos ({existingCount + imageFiles.length} / 10)
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Tap a photo to make it the card thumbnail. Add more photos below.
              </p>

              {existingCount > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {listing.images.slice(0, 9).map((img, i) => {
                    const isCover = img === currentCover;
                    return (
                      <button
                        key={`existing-${i}`}
                        type="button"
                        onClick={() => handleSetCover(img)}
                        disabled={coverBusy}
                        aria-pressed={isCover}
                        aria-label={isCover ? "Current thumbnail" : `Use photo ${i + 1} as thumbnail`}
                        className={cn(
                          "relative aspect-square rounded-xl overflow-hidden bg-neutral-100 group transition-all",
                          isCover
                            ? "ring-2 ring-neutral-900 ring-offset-1"
                            : "opacity-75 hover:opacity-100",
                          coverBusy && "cursor-wait"
                        )}
                      >
                        <img
                          src={img.startsWith("http") ? img : `${API_ORIGIN}${img}`}
                          alt={`Image ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {isCover ? (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-neutral-900 text-white text-[9px] font-bold rounded-md">
                            Thumbnail
                          </span>
                        ) : (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-white/90 text-neutral-700 text-[9px] font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            Set as thumbnail
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <label className={cn(
                "flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                existingCount + imageFiles.length >= 10
                  ? "border-neutral-200 bg-neutral-50 cursor-not-allowed"
                  : "border-slate-300 hover:border-brand-400 hover:bg-neutral-50"
              )}>
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-700">
                    {existingCount + imageFiles.length >= 10 ? "Maximum reached" : "Add photos"}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Select multiple — JPEG, PNG, WebP, max 5MB each
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImages}
                  className="sr-only"
                  disabled={existingCount + imageFiles.length >= 10}
                />
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {imagePreviews.map((src, i) => (
                    <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-neutral-900 text-white text-[9px] font-bold rounded-md">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-neutral-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imageFiles.length > 0 && (
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  size="sm"
                  loading={uploading}
                  onClick={handleUpload}
                  className="mt-3"
                >
                  Upload {imageFiles.length} photo{imageFiles.length === 1 ? "" : "s"}
                </Button>
              )}
            </div>

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