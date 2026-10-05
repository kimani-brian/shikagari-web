"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Input, { Textarea, SelectField } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, X, Car, AlertCircle, ShieldCheck } from "lucide-react";
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

// ── Form options ───────────────────────────────────────────────────────────────
const CURRENT_YEAR  = new Date().getFullYear();
const YEARS         = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

interface FormData {
  description:  string;
  price_kes:    string;
  location:     string;
  body_type:    string;
  make:         string;
  model:        string;
  year:         string;
  mileage:      string;
  fuel_type:    string;
  transmission: string;
  drivetrain:   string;
  engine_size:  string;
  doors:        string;
  color:        string;
  verification_full_name: string;
  verification_id_number: string;
}

const EMPTY_FORM: FormData = {
  description:  "",
  price_kes:    "",
  location:     "",
  body_type:    "",
  make:         "",
  model:        "",
  year:         String(CURRENT_YEAR),
  mileage:      "",
  fuel_type:    "petrol",
  transmission: "automatic",
  drivetrain:   "",
  engine_size:  "",
  doors:        "",
  color:        "",
  verification_full_name: "",
  verification_id_number: "",
};

export default function NewListingPage() {
  const router     = useRouter();
  const { user }   = useAuth();

  const [form,         setForm]         = useState<FormData>(EMPTY_FORM);
  const [errors,       setErrors]       = useState<Partial<FormData>>({});
  const [apiError,     setApiError]     = useState("");
  const [loading,      setLoading]      = useState(false);
  const [imageFiles,   setImageFiles]   = useState<File[]>([]);
  const [imagePreviews,setImagePreviews]= useState<string[]>([]);
  const [step,         setStep]         = useState<1 | 2>(1);
  // Which photo represents the listing on cards and in search results.
  const [coverIndex,   setCoverIndex]   = useState(0);
  const [elogbook,     setELogbook]     = useState<File | null>(null);
  const [elogbookError,setELogbookError]= useState("");

  // Buyers list personally and their listing is only published once an admin
  // verifies the NTSA e-logbook. Approved dealers publish immediately.
  const isBuyerListing = user?.role === "buyer" || (user?.role === "admin" && !user?.is_verified);

  const set = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // ── Image handling ─────────────────────────────────────────────────────
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (imageFiles.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
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
    setCoverIndex((prev) => {
      if (imageFiles.length <= 1) return 0;
      if (prev === index) return 0;
      return prev > index ? prev - 1 : prev;
    });
  };

  // ── E-logbook handling ────────────────────────────────────────────────
  const handleELogbook = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // ── Validation ─────────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.price_kes || isNaN(Number(form.price_kes)) || Number(form.price_kes) <= 0)
      errs.price_kes = "Enter a valid price";
    if (!form.location)       errs.location     = "Select a location";
    if (!form.body_type)      errs.body_type    = "Select a body type";
    if (!form.make)           errs.make         = "Select a make";
    if (!form.model.trim())   errs.model        = "Enter the model";
    if (!form.mileage || isNaN(Number(form.mileage)) || Number(form.mileage) < 0)
      errs.mileage  = "Enter valid mileage";
    if (isBuyerListing) {
      if (!form.verification_full_name.trim())
        errs.verification_full_name = "Enter your full name as it appears on your ID";
      if (!form.verification_id_number.trim())
        errs.verification_id_number = "Enter your national ID number";
      if (!elogbook)
        setELogbookError("Upload your NTSA e-logbook");
    }
    setErrors(errs);
    return Object.keys(errs).length === 0 && (!isBuyerListing || !!elogbook);
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validateStep1()) return;

    try {
      setLoading(true);

      // 1. Create the listing (title is generated from year/make/model)
      const generatedTitle = `${form.year} ${form.make} ${form.model}`.trim();
      const res = await api.post("/listings", {
        title:        generatedTitle,
        description:  form.description.trim(),
        price_kes:    Number(form.price_kes),
        location:     form.location,
        body_type:    form.body_type,
        make:         form.make,
        model:        form.model.trim(),
        year:         Number(form.year),
        mileage:      Number(form.mileage),
        fuel_type:    form.fuel_type,
        transmission: form.transmission,
        drivetrain:   form.drivetrain || undefined,
        engine_size:  form.engine_size.trim() || undefined,
        doors:        form.doors ? Number(form.doors) : undefined,
        color:        form.color.trim(),
        // Buyer-only: identity travels with the create request, the e-logbook
        // file is attached in the next step once we have a listing ID.
        ...(isBuyerListing ? {
          verification_full_name: form.verification_full_name.trim(),
          verification_id_number: form.verification_id_number.trim(),
        } : {}),
      });

      const listingId = res.data.data.id;

      // 2. Attach the NTSA e-logbook — submits the listing for review
      if (isBuyerListing && elogbook) {
        const elogbookForm = new FormData();
        elogbookForm.append("elogbook", elogbook);
        await api.post(`/listings/${listingId}/elogbook`, elogbookForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 3. Upload images if any
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));
        const uploadRes = await api.post(`/listings/${listingId}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // 4. Promote the photo the seller picked as the card thumbnail
        const uploaded: string[] = uploadRes.data.data.images ?? [];
        const chosen = uploaded[coverIndex];
        if (chosen) {
          await api.patch(`/listings/${listingId}/cover`, { image_url: chosen });
        }
      }

      toast.success(
        isBuyerListing
          ? "Listing submitted for verification. It goes live once an admin approves your e-logbook."
          : "Listing created successfully!"
      );
      router.push("/dashboard/listings");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to create listing. Please try again.";
      setApiError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/listings">
          <button className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-neutral-900">Create New Listing</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Fill in the details of the vehicle you want to sell</p>
        </div>
      </div>

      {/* ── API Error ─────────────────────────────────────────────────── */}
      {apiError && (
        <div className="flex items-start gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-700 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Main form ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic info */}
            <FormSection title="Basic Information" icon={<Car className="w-4 h-4" />}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (KES)"
                  type="number"
                  placeholder="e.g. 1850000"
                  value={form.price_kes}
                  onChange={(e) => set("price_kes", e.target.value)}
                  error={errors.price_kes}
                  hint="Enter price in Kenyan Shillings"
                  required
                  min={0}
                />
                <SelectField
                  label="Location"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  error={errors.location}
                  options={KENYAN_COUNTIES.map((l) => ({ value: l, label: l }))}
                  placeholder="Select county"
                  required
                />
              </div>

              <Textarea
                label="Description"
                placeholder="Describe the car's condition, history, features, and any other relevant details..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                hint="A detailed description helps buyers make decisions faster"
              />
            </FormSection>

            {/* Vehicle specs */}
            <FormSection title="Vehicle Specifications" icon={<Car className="w-4 h-4" />}>
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Body Type"
                  value={form.body_type}
                  onChange={(e) => set("body_type", e.target.value)}
                  error={errors.body_type}
                  options={BODY_TYPES.map((b) => ({ value: b, label: b }))}
                  placeholder="Select body type"
                  required
                />
                <SelectField
                  label="Make"
                  value={form.make}
                  onChange={(e) => set("make", e.target.value)}
                  error={errors.make}
                  options={VEHICLE_MAKES.map((m) => ({ value: m, label: m }))}
                  placeholder="Select make"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Model"
                  placeholder='e.g. "Premio", "Fielder"'
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  error={errors.model}
                  required
                />
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-2">
                    Drivetrain
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DRIVETRAINS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => set("drivetrain", form.drivetrain === d ? "" : d)}
                        className={cn(
                          "py-2.5 rounded-xl text-xs font-semibold border transition-all",
                          form.drivetrain === d
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
                  value={form.year}
                  onChange={(e) => set("year", e.target.value)}
                  options={YEARS.map((y) => ({ value: String(y), label: String(y) }))}
                  required
                />
                <Input
                  label="Mileage (km)"
                  type="number"
                  placeholder="e.g. 42000"
                  value={form.mileage}
                  onChange={(e) => set("mileage", e.target.value)}
                  error={errors.mileage}
                  required
                  min={0}
                />
                <Input
                  label="Engine size"
                  placeholder="e.g. 3.0L"
                  value={form.engine_size}
                  onChange={(e) => set("engine_size", e.target.value)}
                />
                <Input
                  label="Doors"
                  type="number"
                  placeholder="e.g. 4"
                  value={form.doors}
                  onChange={(e) => set("doors", e.target.value)}
                  min={2}
                  max={6}
                />
                <Input
                  label="Color"
                  placeholder="e.g. Silver"
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fuel type */}
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-2">
                    Fuel Type <span className="text-neutral-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FUEL_TYPES.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => set("fuel_type", f)}
                        className={cn(
                          "py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all",
                          form.fuel_type === f
                            ? "bg-neutral-900 text-white border-brand-700"
                            : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <label className="text-sm font-semibold text-neutral-700 block mb-2">
                    Transmission <span className="text-neutral-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRANSMISSIONS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => set("transmission", t)}
                        className={cn(
                          "py-2.5 rounded-xl text-xs font-semibold capitalize border transition-all",
                          form.transmission === t
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
            </FormSection>
          </div>

          {/* ── Right col: images + submit ───────────────────────────── */}
          <div className="space-y-5">

            {/* Image upload */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 ">
              <h3 className="font-display font-bold text-neutral-900 mb-1">Photos</h3>
              <p className="text-xs text-neutral-500 mb-4">
                Upload up to 10 photos. Tap a photo to make it the card thumbnail.
              </p>

              {/* Upload area */}
              <label className={cn(
                "flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                imageFiles.length >= 10
                  ? "border-neutral-200 bg-neutral-50 cursor-not-allowed"
                  : "border-slate-300 hover:border-brand-400 hover:bg-neutral-50"
              )}>
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-neutral-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-neutral-700">
                    {imageFiles.length >= 10 ? "Maximum reached" : "Upload photos"}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    JPEG, PNG, WebP — max 5MB each
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImages}
                  className="sr-only"
                  disabled={imageFiles.length >= 10}
                />
              </label>

              {/* Previews — click to choose the cover */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {imagePreviews.map((src, i) => {
                    const isCover = i === coverIndex;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCoverIndex(i)}
                        aria-pressed={isCover}
                        aria-label={`Use photo ${i + 1} as thumbnail`}
                        className={cn(
                          "relative aspect-square rounded-xl overflow-hidden group transition-all",
                          isCover
                            ? "ring-2 ring-neutral-900 ring-offset-1"
                            : "opacity-75 hover:opacity-100"
                        )}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        {isCover ? (
                          <span className="absolute top-1 left-1 inline-flex items-center gap-1 px-1.5 py-0.5 bg-neutral-900 text-white text-[9px] font-bold rounded-md">
                            Thumbnail
                          </span>
                        ) : (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-white/90 text-neutral-700 text-[9px] font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            Set as thumbnail
                          </span>
                        )}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); removeImage(i); } }}
                          aria-label={`Remove photo ${i + 1}`}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-neutral-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-neutral-400 text-right mt-2">
                {imageFiles.length} / 10
              </p>
            </div>

            {/* Listing preview */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 ">
              <h3 className="font-display font-bold text-neutral-900 mb-3 text-sm">Listing Summary</h3>
              <div className="space-y-2 text-sm">
                <SummaryRow label="Title"    value={`${form.year} ${form.make} ${form.model}`.trim() || "—"} />
                <SummaryRow label="Make"     value={form.make     || "—"} />
                <SummaryRow label="Model"    value={form.model    || "—"} />
                <SummaryRow label="Body"     value={form.body_type || "—"} />
                <SummaryRow label="Year"     value={form.year     || "—"} />
                <SummaryRow label="Price"    value={form.price_kes ? `KES ${Number(form.price_kes).toLocaleString()}` : "—"} />
                <SummaryRow label="Location" value={form.location || "—"} />
                {isBuyerListing && (
                  <SummaryRow
                    label="Review"
                    value={elogbook ? "Pending admin check" : "E-logbook missing"}
                  />
                )}
              </div>
            </div>

            {/* Ownership verification — buyers only */}
            {isBuyerListing && (
              <div className="bg-white rounded-2xl p-5 border border-neutral-200 space-y-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-display font-bold text-neutral-900 text-sm">Ownership verification</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      An admin checks these details before your listing is published.
                    </p>
                  </div>
                </div>

                <Input
                  label="Full name"
                  placeholder="As it appears on your national ID"
                  value={form.verification_full_name}
                  onChange={(e) => set("verification_full_name", e.target.value)}
                  error={errors.verification_full_name}
                />
                <Input
                  label="National ID number"
                  placeholder="e.g. 29458821X"
                  value={form.verification_id_number}
                  onChange={(e) => set("verification_id_number", e.target.value)}
                  error={errors.verification_id_number}
                />

                <div>
                  <span className="block text-sm font-medium text-neutral-700 mb-1.5">
                    NTSA e-logbook
                  </span>
                  <label className={cn(
                    "flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                    elogbook
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-slate-300 hover:border-brand-400 hover:bg-neutral-50"
                  )}>
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center">
                      {elogbook
                        ? <ShieldCheck className="w-4 h-4 text-neutral-700" />
                        : <Upload className="w-4 h-4 text-neutral-400" />
                      }
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-neutral-700">
                        {elogbook ? elogbook.name : "Upload your e-logbook"}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {elogbook
                          ? `${(elogbook.size / 1024 / 1024).toFixed(1)}MB — click to replace`
                          : "Photo or PDF — max 5MB"
                        }
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleELogbook}
                      className="sr-only"
                    />
                  </label>
                  {elogbookError && (
                    <p className="text-xs text-red-600 mt-1.5">{elogbookError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
            >
              {isBuyerListing ? "Submit for verification" : "Publish Listing"}
            </Button>

            {isBuyerListing && (
              <p className="text-xs text-neutral-400 text-center">
                Your listing stays hidden until an admin verifies your e-logbook.
              </p>
            )}

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.push("/dashboard/listings")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Form section wrapper ───────────────────────────────────────────────────────
function FormSection({
  title,
  icon,
  children,
}: {
  title:    string;
  icon?:    React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200  space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-neutral-400">{icon}</span>}
        <h3 className="font-display font-bold text-neutral-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Summary row ────────────────────────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-neutral-400 text-xs">{label}</span>
      <span className="text-neutral-900 font-medium text-xs text-right truncate max-w-[140px]">{value}</span>
    </div>
  );
}