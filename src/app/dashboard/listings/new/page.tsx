"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Input, { Textarea, SelectField } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, X, Car, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Form options ───────────────────────────────────────────────────────────────
const LOCATIONS = [
  "Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika",
  "Malindi","Nyeri","Machakos","Kisii","Kericho","Garissa",
  "Meru","Kakamega","Other",
];

const MAKES = [
  "Toyota","Nissan","Honda","Mazda","Subaru","Mitsubishi",
  "Isuzu","Mercedes-Benz","BMW","Volkswagen","Ford",
  "Hyundai","Kia","Land Rover","Jeep","Suzuki","Peugeot",
  "Renault","Audi","Other",
];

const FUEL_TYPES    = ["petrol","diesel","hybrid","electric"];
const TRANSMISSIONS = ["automatic","manual"];
const CURRENT_YEAR  = new Date().getFullYear();
const YEARS         = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

interface FormData {
  title:        string;
  description:  string;
  price_kes:    string;
  location:     string;
  make:         string;
  model:        string;
  year:         string;
  mileage:      string;
  fuel_type:    string;
  transmission: string;
  color:        string;
}

const EMPTY_FORM: FormData = {
  title:        "",
  description:  "",
  price_kes:    "",
  location:     "",
  make:         "",
  model:        "",
  year:         String(CURRENT_YEAR),
  mileage:      "",
  fuel_type:    "petrol",
  transmission: "automatic",
  color:        "",
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

  const set = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // ── Image handling ─────────────────────────────────────────────────────
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
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
  };

  // ── Validation ─────────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.title.trim()    || form.title.trim().length < 5)
      errs.title    = "Title must be at least 5 characters";
    if (!form.price_kes || isNaN(Number(form.price_kes)) || Number(form.price_kes) <= 0)
      errs.price_kes = "Enter a valid price";
    if (!form.location)       errs.location     = "Select a location";
    if (!form.make)           errs.make         = "Select a make";
    if (!form.model.trim())   errs.model        = "Enter the model";
    if (!form.mileage || isNaN(Number(form.mileage)) || Number(form.mileage) < 0)
      errs.mileage  = "Enter valid mileage";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validateStep1()) return;

    try {
      setLoading(true);

      // 1. Create the listing
      const res = await api.post("/listings", {
        title:        form.title.trim(),
        description:  form.description.trim(),
        price_kes:    Number(form.price_kes),
        location:     form.location,
        make:         form.make,
        model:        form.model.trim(),
        year:         Number(form.year),
        mileage:      Number(form.mileage),
        fuel_type:    form.fuel_type,
        transmission: form.transmission,
        color:        form.color.trim(),
      });

      const listingId = res.data.data.id;

      // 2. Upload images if any
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));
        await api.post(`/listings/${listingId}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Listing created successfully! 🎉");
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
          <button className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900">Create New Listing</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the details of the vehicle you want to sell</p>
        </div>
      </div>

      {/* ── API Error ─────────────────────────────────────────────────── */}
      {apiError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 animate-fade-in">
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
              <Input
                label="Listing Title"
                placeholder='e.g. "2019 Toyota Premio – One Owner, Low Mileage"'
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                error={errors.title}
                required
              />

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
                  options={LOCATIONS.map((l) => ({ value: l, label: l }))}
                  placeholder="Select city"
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
                  label="Make"
                  value={form.make}
                  onChange={(e) => set("make", e.target.value)}
                  error={errors.make}
                  options={MAKES.map((m) => ({ value: m, label: m }))}
                  placeholder="Select make"
                  required
                />
                <Input
                  label="Model"
                  placeholder='e.g. "Premio", "Fielder"'
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  error={errors.model}
                  required
                />
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
                  label="Color"
                  placeholder="e.g. Silver"
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fuel type */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Fuel Type <span className="text-red-500">*</span>
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
                            ? "bg-brand-700 text-white border-brand-700"
                            : "bg-white text-slate-600 border-slate-200 hover:border-brand-300"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Transmission <span className="text-red-500">*</span>
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
            </FormSection>
          </div>

          {/* ── Right col: images + submit ───────────────────────────── */}
          <div className="space-y-5">

            {/* Image upload */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
              <h3 className="font-display font-bold text-slate-900 mb-1">Photos</h3>
              <p className="text-xs text-slate-500 mb-4">
                Upload up to 10 photos. First photo will be the thumbnail.
              </p>

              {/* Upload area */}
              <label className={cn(
                "flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all",
                imageFiles.length >= 10
                  ? "border-slate-200 bg-slate-50 cursor-not-allowed"
                  : "border-slate-300 hover:border-brand-400 hover:bg-brand-50"
              )}>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    {imageFiles.length >= 10 ? "Maximum reached" : "Upload photos"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
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

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-brand-700 text-white text-[9px] font-bold rounded-md">
                          Cover
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 text-right mt-2">
                {imageFiles.length} / 10
              </p>
            </div>

            {/* Listing preview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
              <h3 className="font-display font-bold text-slate-900 mb-3 text-sm">Listing Summary</h3>
              <div className="space-y-2 text-sm">
                <SummaryRow label="Title"    value={form.title    || "—"} />
                <SummaryRow label="Make"     value={form.make     || "—"} />
                <SummaryRow label="Model"    value={form.model    || "—"} />
                <SummaryRow label="Year"     value={form.year     || "—"} />
                <SummaryRow label="Price"    value={form.price_kes ? `KES ${Number(form.price_kes).toLocaleString()}` : "—"} />
                <SummaryRow label="Location" value={form.location || "—"} />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
            >
              Publish Listing
            </Button>

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
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <h3 className="font-display font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Summary row ────────────────────────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className="text-slate-900 font-medium text-xs text-right truncate max-w-[140px]">{value}</span>
    </div>
  );
}