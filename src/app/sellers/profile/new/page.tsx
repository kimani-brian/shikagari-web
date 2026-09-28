"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Input, { SelectField, Textarea } from "@/components/ui/Input";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { ApprovalBadge } from "@/components/ui/Badge";
import { PrivateSellerProfile, ApprovalStatus } from "@/types";
import { KENYAN_COUNTIES } from "@/lib/locations";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

interface SellerForm {
  national_id_no: string;
  location: string;
  address: string;
  profile_photo_url: string;
  bio: string;
}

const DEFAULT_FORM: SellerForm = {
  national_id_no: "",
  location: "",
  address: "",
  profile_photo_url: "",
  bio: "",
};

export default function PrivateSellerProfileForm() {
  const { user, isLoggedIn, isLoading, refreshUser } = useAuth();
  const [form, setForm] = useState<SellerForm>(DEFAULT_FORM);
  const [savedForm, setSavedForm] = useState<SellerForm>(DEFAULT_FORM);
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const accountTouched = useRef(false);
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  // Save is only enabled when something differs from the last saved state.
  const isAccountDirty =
    accountTouched.current &&
    (accountName.trim() !== (user?.full_name ?? "").trim() ||
      accountEmail.trim() !== (user?.email ?? "").trim() ||
      accountPhone.trim() !== (user?.phone ?? "").trim());
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm) || isAccountDirty;
  const [mode, setMode] = useState<"create" | "update">("create");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Private seller profiles: seller accounts plus buyers on the self-serve
  // upgrade path (role is flipped to seller by admin at approval time).
  const isSeller = user?.role === "seller" || user?.role === "buyer" || user?.role === "admin";

  const loadProfile = useCallback(async () => {
    if (!isSeller) return;
    setFetching(true);
    setError(null);
    try {
      const res = await api.get("/sellers/profile");
      const profile = res.data.data as PrivateSellerProfile;
      const loaded: SellerForm = {
        national_id_no: profile.national_id_no ?? "",
        location: profile.location ?? "",
        address: profile.address ?? "",
        profile_photo_url: profile.profile_photo_url ?? "",
        bio: profile.bio ?? "",
      };
      setForm(loaded);
      setSavedForm(loaded);
      setStatus(profile.approval_status);
      setMode("update");
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setForm(DEFAULT_FORM);
        setSavedForm(DEFAULT_FORM);
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

  // Pre-fill account fields from the signed-in user (until the user edits them).
  useEffect(() => {
    if (!accountTouched.current && user) {
      setAccountName(user.full_name ?? "");
      setAccountEmail(user.email ?? "");
      setAccountPhone(user.phone ?? "");
    }
  }, [user]);

  const handleChange = (field: keyof SellerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Edits never reset approval_status on the API, so an approved seller
      // stays approved after saving.
      const wasApproved = mode === "update" && status === "approved";
      // Save account name/email/phone first so everything stays in sync.
      if (isAccountDirty) {
        await api.patch("/users/me", {
          full_name: accountName.trim() || undefined,
          email: accountEmail.trim() && accountEmail.trim() !== (user?.email ?? "") ? accountEmail.trim() : undefined,
          phone: accountPhone.trim() || undefined,
        });
        await refreshUser();
        accountTouched.current = false;
      }
      if (mode === "create") {
        await api.post("/sellers/profile", form);
        toast.success("Seller profile submitted for review");
      } else {
        await api.patch("/sellers/profile", form);
        toast.success(
          wasApproved
            ? "Changes saved — your approval is unchanged"
            : "Seller profile updated"
        );
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
        <h1 className="font-display text-3xl text-neutral-900">Profile</h1>
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

      {status === "approved" && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-900">
          Your seller profile is approved. You can edit your info below — changes save
          instantly everywhere and your approval stays in place, no re-verification needed.
        </div>
      )}
      {status === "pending" && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
          Your profile is under review. You can still edit your details while you wait.
        </div>
      )}
      {status === "rejected" && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-900">
          Your profile was not approved. You can update your details below, then contact
          support to request another review.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-neutral-200  p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Full name"
            value={accountName}
            onChange={(e) => {
              accountTouched.current = true;
              setAccountName(e.target.value);
            }}
            placeholder="Your full name"
            required
          />
          <Input
            label="Email address"
            type="email"
            value={accountEmail}
            onChange={(e) => {
              accountTouched.current = true;
              setAccountEmail(e.target.value);
            }}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Phone number"
            value={accountPhone}
            onChange={(e) => {
              accountTouched.current = true;
              setAccountPhone(e.target.value);
            }}
            placeholder="0712 345 678"
          />
          <Input
            label="National ID number"
            value={form.national_id_no}
            onChange={(e) => handleChange("national_id_no", e.target.value)}
            placeholder="12345678"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Primary location"
            options={KENYAN_COUNTIES.map((county) => ({ value: county, label: county }))}
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Select a county"
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

        <Input
          label="Logo URL"
          value={form.profile_photo_url}
          onChange={(e) => handleChange("profile_photo_url", e.target.value)}
          placeholder="https://..."
        />

        <Textarea
          label="Description"
          value={form.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          rows={5}
          maxLength={500}
          placeholder="Tell buyers about yourself and the car you are selling."
          required
        />

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={saving}
            disabled={saving || !isDirty}
            title={!isDirty ? "Make a change to enable saving" : undefined}
          >
            {mode === "create" ? "Submit for review" : "Update"}
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
}
