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
import { DealerProfile, ApprovalStatus } from "@/types";
import { KENYAN_COUNTIES } from "@/lib/locations";
import { toast } from "react-hot-toast";
import { ArrowLeft, Upload, X } from "lucide-react";
import { DEALER_PROFILE_UPDATED_EVENT } from "@/hooks/useMyDealerProfile";

interface DealerForm {
  business_name: string;
  location: string;
  address: string;
  logo_url: string;
  description: string;
}

const DEFAULT_FORM: DealerForm = {
  business_name: "",
  location: "",
  address: "",
  logo_url: "",
  description: "",
};

export default function DealerProfileForm() {
  const { user, isLoggedIn, isLoading, refreshUser } = useAuth();
  const [form, setForm] = useState<DealerForm>(DEFAULT_FORM);
  const [savedForm, setSavedForm] = useState<DealerForm>(DEFAULT_FORM);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const accountTouched = useRef(false);
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [mode, setMode] = useState<"create" | "update">("create");
  // Save is only enabled when something differs from the last saved state.
  const isAccountDirty =
    accountTouched.current &&
    (accountEmail.trim() !== (user?.email ?? "").trim() ||
      accountPhone.trim() !== (user?.phone ?? "").trim());
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm) || isAccountDirty;
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Dealer accounts manage this page; legacy seller accounts keep access to
  // their existing profiles (the API strictly enforces dealer role on create).
  const isSeller = user?.role === "dealer" || user?.role === "seller" || user?.role === "admin";

  const loadProfile = useCallback(async () => {
    if (!isSeller) return;
    setFetching(true);
    setError(null);
    try {
      const res = await api.get("/dealers/profile");
      const profile = res.data.data as DealerProfile;
      const loaded: DealerForm = {
        business_name: profile.business_name ?? "",
        location: profile.location ?? "",
        address: profile.address ?? "",
        logo_url: profile.logo_url ?? "",
        description: profile.description ?? "",
      };
      setForm(loaded);
      setSavedForm(loaded);
      setStatus(profile.approval_status);
      setProfileId(profile.id ?? null);
      setMode("update");
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setForm(DEFAULT_FORM);
        setSavedForm(DEFAULT_FORM);
        setStatus(null);
        setProfileId(null);
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

  // Pre-fill account fields from the signed-in user (until the user edits them).
  useEffect(() => {
    if (!accountTouched.current && user) {
      setAccountEmail(user.email ?? "");
      setAccountPhone(user.phone ?? "");
    }
  }, [user]);

  const handleChange = (field: keyof DealerForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be JPEG, PNG, or WebP under 5MB");
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogoFile = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    // Edits never reset approval_status on the API, so an approved dealer
    // stays approved after saving.
    const wasApproved = mode === "update" && status === "approved";
    try {
      // Save account name/email/phone first so everything stays in sync.
      if (isAccountDirty) {
        await api.patch("/users/me", {
          email: accountEmail.trim() && accountEmail.trim() !== (user?.email ?? "") ? accountEmail.trim() : undefined,
          phone: accountPhone.trim() || undefined,
        });
        await refreshUser();
        accountTouched.current = false;
      }
      if (mode === "create") {
        await api.post("/dealers/profile", form);
        toast.success("Dealer profile submitted for review");
      } else {
        await api.patch("/dealers/profile", form);
        toast.success(
          wasApproved
            ? "Changes saved — your approval is unchanged"
            : "Dealer profile updated"
        );
        window.dispatchEvent(new Event(DEALER_PROFILE_UPDATED_EVENT));
      }
      // Upload a selected logo file after the profile exists, so the
      // returned URL is saved on the profile in one go. A logo failure
      // must not block the profile save already completed above.
      if (logoFile) {
        try {
          const logoData = new FormData();
          logoData.append("logo", logoFile);
          await api.post("/dealers/profile/logo", logoData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          toast.success("Logo uploaded successfully!");
          removeLogoFile();
        } catch {
          toast.error("Profile saved, but logo upload failed. Please try again.");
        }
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
        <p className="text-lg font-semibold text-slate-800">Dealer profiles are only available to dealer accounts.</p>
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
          Your dealership is approved. You can edit your info below — changes save
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
        <Input
          label="Dealership name"
          value={form.business_name}
          onChange={(e) => handleChange("business_name", e.target.value)}
          placeholder="Shika Motors Ltd"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          <SelectField
            label="Primary location"
            options={KENYAN_COUNTIES.map((county) => ({ value: county, label: county }))}
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Select a county"
            required
          />
        </div>

        <Input
          label="Physical address"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="Westlands, Waiyaki Way"
          required
        />

        <Input
          label="Logo URL"
          value={form.logo_url}
          onChange={(e) => handleChange("logo_url", e.target.value)}
          placeholder="https://..."
          hint="Paste a logo link, or upload an image below"
        />

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-2">
            Upload logo
          </label>
          {logoPreview ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-12 h-12 rounded-lg object-cover bg-white border border-neutral-200"
              />
              <p className="text-xs text-neutral-500 flex-1">
                Logo ready — it uploads when you save.
              </p>
              <button
                type="button"
                onClick={removeLogoFile}
                className="w-7 h-7 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-900 transition-colors"
                aria-label="Remove logo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-brand-400 hover:bg-neutral-50 transition-all text-sm font-medium text-neutral-600">
              <Upload className="w-4 h-4 text-neutral-400" />
              Choose image (JPEG, PNG, WebP, max 5MB)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoFile}
                className="sr-only"
              />
            </label>
          )}
        </div>

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Tell buyers about your inventory, services, financing, or inspection policies."
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
          {status === "approved" && profileId && (
            <Link href={`/dealers/${profileId}`}>
              <Button type="button" variant="secondary" size="lg" disabled={saving}>
                View public page
              </Button>
            </Link>
          )}
        </div>
      </form>
    </PageWrapper>
  );
}
