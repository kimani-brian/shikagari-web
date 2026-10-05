"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ApprovalBadge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { User } from "lucide-react";
import Link from "next/link";
import { ApprovalStatus } from "@/types";

interface DealerProfileState {
  status: ApprovalStatus;
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const isDealer = user?.role === "dealer";

  const [fullName,     setFullName]     = useState(user?.full_name ?? "");
  const [email,        setEmail]        = useState(user?.email     ?? "");
  const [phone,        setPhone]        = useState(user?.phone     ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [dealerProfile, setDealerProfile] = useState<DealerProfileState | null>(null);
  const [checkingDealerProfile, setCheckingDealerProfile] = useState(true);

  // Fill in once the session hydrates (AuthContext loads from storage on mount).
  useEffect(() => {
    if (user) {
      setFullName((v) => v || user.full_name || "");
      setEmail((v) => v || user.email || "");
      setPhone((v) => v || user.phone || "");
    }
  }, [user]);

  // Dealer profile verification status (mirrors the dashboard overview check).
  useEffect(() => {
    if (!isDealer) {
      setCheckingDealerProfile(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const dealerRes = await api.get("/dealers/profile");
        if (!cancelled && dealerRes.data.data) {
          setDealerProfile({ status: dealerRes.data.data.approval_status ?? "pending" });
        }
      } catch { /* no profile yet */ }
      finally {
        if (!cancelled) setCheckingDealerProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isDealer]);

  const saveProfile = async (name: string, mail: string, phoneNumber: string) => {
    if (profileLoading) return;
    try {
      setProfileLoading(true);
      await api.patch("/users/me", {
        full_name: name.trim() || undefined,
        email:     mail.trim() && mail.trim() !== (user?.email ?? "") ? mail.trim() : undefined,
        phone:     phoneNumber.trim() || undefined,
      });
      await refreshUser();
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    await saveProfile(fullName, email, phone);
  };

  // Auto-save shortly after the user stops typing (no save button).
  const firstRun = useRef(true);
  useEffect(() => {
    if (!user) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    const dirty =
      fullName.trim() !== (user.full_name ?? "").trim() ||
      email.trim() !== (user.email ?? "").trim() ||
      phone.trim() !== (user.phone ?? "").trim();
    if (!dirty) return;
    const t = setTimeout(() => {
      saveProfile(fullName, email, phone);
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName, email, phone, user]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-neutral-900">Profile Settings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage your account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Personal info */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 ">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-4 h-4 text-neutral-400" />
              <h3 className="font-display font-bold text-neutral-900">Personal Information</h3>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
              />
              <p className="text-xs text-neutral-400">
                {profileLoading ? "Saving…" : "Changes save automatically."}
              </p>
            </form>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Dealer profile status */}
          {isDealer && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 ">
              <div className="mb-4">
                <h3 className="font-display font-bold text-neutral-900 text-sm">Profile</h3>
              </div>
              {checkingDealerProfile ? (
                <p className="text-xs text-neutral-400">Checking status…</p>
              ) : dealerProfile ? (
                <div className="space-y-3">
                  <ApprovalBadge status={dealerProfile.status} />
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {dealerProfile.status === "pending" &&
                      "Under review. You can edit your details while you wait."}
                    {dealerProfile.status === "rejected" &&
                      "Not approved. Update your details or contact support for another review."}
                  </p>
                  <Link href="/dealers/profile/new" className="block">
                    <Button variant="secondary" size="sm" fullWidth>
                      {dealerProfile.status === "approved"
                        ? "Edit profile"
                        : dealerProfile.status === "pending"
                          ? "View submission"
                          : "Update details"}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Create your dealership profile to get verified and start listing.
                  </p>
                  <Link href="/dealers/profile/new" className="block">
                    <Button variant="primary" size="sm" fullWidth>
                      Create profile
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
