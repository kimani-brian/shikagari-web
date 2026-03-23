"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Input, { SelectField, Textarea } from "@/components/ui/Input";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ApprovalBadge } from "@/components/ui/Badge";
import { DealerProfile, ApprovalStatus } from "@/types";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const CITIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Nyeri",
  "Machakos",
  "Kisii",
  "Kericho",
  "Garissa",
  "Meru",
  "Kakamega",
  "Other",
];

interface DealerForm {
  business_name: string;
  business_reg_no: string;
  location: string;
  address: string;
  kra_pin: string;
  logo_url: string;
  description: string;
}

const DEFAULT_FORM: DealerForm = {
  business_name: "",
  business_reg_no: "",
  location: "",
  address: "",
  kra_pin: "",
  logo_url: "",
  description: "",
};

export default function DealerProfileForm() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const [form, setForm] = useState<DealerForm>(DEFAULT_FORM);
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  const [mode, setMode] = useState<"create" | "update">("create");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSeller = user?.role === "seller";

  const loadProfile = useCallback(async () => {
    if (!isSeller) return;
    setFetching(true);
    setError(null);
    try {
      const res = await api.get("/dealers/profile");
      const profile = res.data.data as DealerProfile;
      setForm({
        business_name: profile.business_name ?? "",
        business_reg_no: profile.business_reg_no ?? "",
        location: profile.location ?? "",
        address: profile.address ?? "",
        kra_pin: profile.kra_pin ?? "",
        logo_url: profile.logo_url ?? "",
        description: profile.description ?? "",
      });
      setStatus(profile.approval_status);
      setMode("update");
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setForm(DEFAULT_FORM);
        setStatus(null);
        setMode("create");
      } else {
        setError(err?.response?.data?.message ?? "Failed to load dealer profile");
      }
    } finally {
      setFetching(false);
    }
  }, [isSeller]);

  useEffect(() => {
    if (!isLoading && isLoggedIn && isSeller) {
      loadProfile();
    }
  }, [isLoading, isLoggedIn, isSeller, loadProfile]);

  const handleChange = (field: keyof DealerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        await api.post("/dealers/profile", form);
        toast.success("Dealer profile submitted for review");
      } else {
        await api.patch("/dealers/profile", form);
        toast.success("Dealer profile updated");
      }
      await loadProfile();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not save dealer profile");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || (isSeller && fetching)) {
    return <PageLoader />;
  }

  if (!isLoggedIn) {
    return (
      <PageWrapper className="py-20 text-center space-y-4">
        <p className="text-lg font-semibold text-slate-800">Please sign in to manage your dealer profile.</p>
        <Link href="/login">
          <Button variant="primary">Go to login</Button>
        </Link>
      </PageWrapper>
    );
  }

  if (!isSeller) {
    return (
      <PageWrapper className="py-20 text-center space-y-4">
        <p className="text-lg font-semibold text-slate-800">Dealer profiles are only available to seller accounts.</p>
        <Link href="/dashboard/profile">
          <Button variant="secondary">Back to profile</Button>
        </Link>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-10 space-y-8">
      <div className="flex flex-col gap-3">
        <Link href="/dashboard/profile" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard profile
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Seller setup</p>
          <h1 className="font-display text-3xl text-slate-900">Dealer profile</h1>
          <p className="text-slate-500 mt-1 max-w-2xl">
            Provide your showroom details so we can verify your business and unlock listings, analytics, and lead tools.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Status:</span>
          {status ? <ApprovalBadge status={status} /> : <span className="text-slate-400">Not submitted</span>}
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">
            {mode === "create" ? "Create profile" : "Update profile"}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Business name"
            value={form.business_name}
            onChange={(e) => handleChange("business_name", e.target.value)}
            placeholder="Shika Motors Ltd"
            required
          />
          <Input
            label="Business registration number"
            value={form.business_reg_no}
            onChange={(e) => handleChange("business_reg_no", e.target.value)}
            placeholder="PVT-XXXX-2023"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Primary location"
            options={CITIES.map((city) => ({ value: city, label: city }))}
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Select a city"
            required
          />
          <Input
            label="Physical address"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Westlands, Waiyaki Way"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="KRA PIN"
            value={form.kra_pin}
            onChange={(e) => handleChange("kra_pin", e.target.value.toUpperCase())}
            placeholder="A123456789B"
            required
            maxLength={11}
          />
          <Input
            label="Logo URL"
            value={form.logo_url}
            onChange={(e) => handleChange("logo_url", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <Textarea
          label="Showroom description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={5}
          placeholder="Tell buyers about your inventory, services, financing, or inspection policies."
          required
        />

        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="primary" size="lg" loading={saving}>
            {mode === "create" ? "Submit for review" : "Save changes"}
          </Button>
          <Button type="button" variant="secondary" onClick={loadProfile} disabled={saving}>
            Reset
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}
