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
import { PrivateSellerProfile, ApprovalStatus } from "@/types";
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

interface SellerForm {
  national_id_no: string;
  location: string;
  profile_photo_url: string;
  bio: string;
}

const DEFAULT_FORM: SellerForm = {
  national_id_no: "",
  location: "",
  profile_photo_url: "",
  bio: "",
};

export default function PrivateSellerProfileForm() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const [form, setForm] = useState<SellerForm>(DEFAULT_FORM);
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
      const res = await api.get("/sellers/profile");
      const profile = res.data.data as PrivateSellerProfile;
      setForm({
        national_id_no: profile.national_id_no ?? "",
        location: profile.location ?? "",
        profile_photo_url: profile.profile_photo_url ?? "",
        bio: profile.bio ?? "",
      });
      setStatus(profile.approval_status);
      setMode("update");
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setForm(DEFAULT_FORM);
        setStatus(null);
        setMode("create");
      } else {
        setError(err?.response?.data?.message ?? "Failed to load seller profile");
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

  const handleChange = (field: keyof SellerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        await api.post("/sellers/profile", form);
        toast.success("Seller profile submitted for review");
      } else {
        await api.patch("/sellers/profile", form);
        toast.success("Seller profile updated");
      }
      await loadProfile();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Could not save seller profile");
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
        <p className="text-lg font-semibold text-slate-800">Please sign in to manage your seller profile.</p>
        <Link href="/login">
          <Button variant="primary">Go to login</Button>
        </Link>
      </PageWrapper>
    );
  }

  if (!isSeller) {
    return (
      <PageWrapper className="py-20 text-center space-y-4">
        <p className="text-lg font-semibold text-slate-800">Seller profiles are only available to seller accounts.</p>
        <Link href="/dashboard/profile">
          <Button variant="secondary">Back to profile</Button>
        </Link>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="py-10 space-y-8">
      <div className="flex flex-col gap-3">
        <Link href="/dashboard/profile" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard profile
        </Link>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Seller setup</p>
          <h1 className="font-display text-3xl text-neutral-900">Private seller profile</h1>
          <p className="text-neutral-500 mt-1 max-w-2xl">
            Add your identification and quick bio so buyers can trust who they're negotiating with.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span>Status:</span>
          {status ? <ApprovalBadge status={status} /> : <span className="text-neutral-400">Not submitted</span>}
          <span className="text-slate-300">•</span>
          <span className="text-neutral-500 font-medium">
            {mode === "create" ? "Create profile" : "Update profile"}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-neutral-200  p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="National ID number"
            value={form.national_id_no}
            onChange={(e) => handleChange("national_id_no", e.target.value)}
            placeholder="12345678"
            required
          />
          <SelectField
            label="County / City"
            options={CITIES.map((city) => ({ value: city, label: city }))}
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Select a city"
            required
          />
        </div>

        <Input
          label="Profile photo URL"
          value={form.profile_photo_url}
          onChange={(e) => handleChange("profile_photo_url", e.target.value)}
          placeholder="https://..."
        />

        <Textarea
          label="Bio"
          value={form.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          rows={5}
          placeholder="Say something about your experience, preferred car categories, or inspection approach."
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
