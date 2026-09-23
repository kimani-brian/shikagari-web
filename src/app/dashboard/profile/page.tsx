"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ApprovalBadge } from "@/components/ui/Badge";
import VerifiedBadge from "@/components/shared/VerifiedBadge";
import toast from "react-hot-toast";
import { User, Lock, ShieldCheck, Car, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const isSeller = user?.role === "seller";

  const [fullName,     setFullName]     = useState(user?.full_name ?? "");
  const [phone,        setPhone]        = useState(user?.phone     ?? "");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPwd,   setCurrentPwd]   = useState("");
  const [newPwd,       setNewPwd]       = useState("");
  const [confirmPwd,   setConfirmPwd]   = useState("");
  const [pwdLoading,   setPwdLoading]   = useState(false);
  const [pwdError,     setPwdError]     = useState("");

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      await api.patch("/users/me", {
        full_name: fullName.trim() || undefined,
        phone:     phone.trim()    || undefined,
      });
      await refreshUser();
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError("");

    if (newPwd.length < 8) {
      setPwdError("New password must be at least 8 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Passwords do not match");
      return;
    }

    try {
      setPwdLoading(true);
      await api.patch("/users/me/password", {
        current_password: currentPwd,
        new_password:     newPwd,
      });
      toast.success("Password changed successfully!");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err: any) {
      setPwdError(err?.response?.data?.message ?? "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

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
                value={user?.email ?? ""}
                disabled
                hint="Email address cannot be changed"
              />
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712 345 678"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={profileLoading}
              >
                Save Changes
              </Button>
            </form>
          </div>

          {/* Change password */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 ">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-4 h-4 text-neutral-400" />
              <h3 className="font-display font-bold text-neutral-900">Change Password</h3>
            </div>
            {pwdError && (
              <div className="flex items-start gap-2 p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {pwdError}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Input
                label="New Password"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                hint="Minimum 8 characters"
                required
                autoComplete="new-password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                success={confirmPwd && confirmPwd === newPwd ? "Passwords match" : undefined}
                required
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={pwdLoading}
              >
                Update Password
              </Button>
            </form>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">

          {/* Account card */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 ">
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-3">
                <span className="font-display text-2xl font-bold text-white">
                  {user?.full_name?.[0]?.toUpperCase()}
                </span>
              </div>
              <p className="font-display font-bold text-neutral-900">{user?.full_name}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{user?.email}</p>
              <p className="text-xs text-neutral-500 capitalize mt-1 px-3 py-1 bg-neutral-100 rounded-full mt-2">
                {user?.role}
              </p>
              {isSeller && user?.is_verified && (
                <div className="mt-3">
                  <VerifiedBadge size="md" />
                </div>
              )}
            </div>
          </div>

          {/* Seller profile status */}
          {user?.role === "seller" && (
            <div className="bg-white rounded-2xl p-5 border border-neutral-200 ">
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-4 h-4 text-neutral-400" />
                <h3 className="font-display font-bold text-neutral-900 text-sm">Seller Profile</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Dealer profile</span>
                  <Link href="/dealers/profile/new" className="text-xs font-semibold text-neutral-900 hover:text-brand-800">
                    Manage →
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Private seller</span>
                  <Link href="/sellers/profile/new" className="text-xs font-semibold text-neutral-900 hover:text-brand-800">
                    Manage →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Security info */}
          <div className="bg-neutral-50 rounded-2xl p-5 border border-brand-100">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-brand-900 mb-1">Account Security</p>
                <p className="text-xs text-neutral-900 leading-relaxed">
                  Use a strong, unique password. Never share your credentials with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
