"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import { ApprovalBadge } from "@/components/ui/Badge";
import { ApprovalStatus } from "@/types";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { useAdminDealerProfiles, useAdminPrivateSellerProfiles } from "@/hooks/useAdminProfiles";
import { Building2, UserCheck } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

type ReviewDecision = "approved" | "rejected";

type ProfileKind = "dealer" | "seller";

export default function AdminApprovalsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();

  const [dealerStatus, setDealerStatus] = useState("pending");
  const [sellerStatus, setSellerStatus] = useState("pending");
  const [actionKey, setActionKey] = useState<string | null>(null);

  const dealerData = useAdminDealerProfiles(dealerStatus);
  const sellerData = useAdminPrivateSellerProfiles(sellerStatus);

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [isLoading, isLoggedIn, user?.role, router]);

  const handleReview = async (kind: ProfileKind, profileId: string, decision: ReviewDecision) => {
    const endpoint = kind === "dealer"
      ? `/admin/dealers/${profileId}/review`
      : `/admin/sellers/${profileId}/review`;

    try {
      setActionKey(`${kind}-${profileId}-${decision}`);
      await api.patch(endpoint, { approval_status: decision });
      toast.success(`Profile ${decision}`);
      if (kind === "dealer") {
        dealerData.refetch();
      } else {
        sellerData.refetch();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update profile");
    } finally {
      setActionKey(null);
    }
  };

  if (isLoading || !isLoggedIn) {
    return <PageLoader />;
  }

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-8">
      <header className="bg-white rounded-2xl border border-neutral-200  p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Admin tools</p>
          <h1 className="font-display text-3xl text-neutral-900 mt-1">Seller approvals</h1>
          <p className="text-sm text-neutral-500 mt-2 max-w-2xl">
            Review pending dealer and private seller profiles. Approving a profile allows the seller to list cars and earn the verified badge.
          </p>
        </div>
        <Link href="/dealers" className="text-sm font-semibold text-neutral-900 hover:text-brand-800">
          View public dealer page →
        </Link>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ApprovalPanel
          title="Dealer profiles"
          description="Franchise and independent showrooms submitting business documents."
          icon={<Building2 className="w-5 h-5" />}
          status={dealerStatus}
          onStatusChange={setDealerStatus}
          loading={dealerData.loading}
          error={dealerData.error}
          emptyMessage="No dealer profiles match this filter."
        >
          {dealerData.profiles.map((profile) => (
            <ProfileRow
              key={profile.id}
              primary={profile.business_name}
              secondary={`${profile.user.full_name} · ${profile.location}`}
              email={profile.user.phone}
              status={profile.approval_status}
              onApprove={() => handleReview("dealer", profile.id, "approved")}
              onReject={() => handleReview("dealer", profile.id, "rejected")}
              loadingKey={actionKey}
              rowKey={`dealer-${profile.id}`}
            />
          ))}
        </ApprovalPanel>

        <ApprovalPanel
          title="Private sellers"
          description="Individual sellers verifying their identity before listing."
          icon={<UserCheck className="w-5 h-5" />}
          status={sellerStatus}
          onStatusChange={setSellerStatus}
          loading={sellerData.loading}
          error={sellerData.error}
          emptyMessage="No private seller profiles match this filter."
        >
          {sellerData.profiles.map((profile) => (
            <ProfileRow
              key={profile.id}
              primary={profile.user.full_name}
              secondary={`${profile.location} · National ID ${profile.national_id_no}`}
              email={profile.user.phone}
              status={profile.approval_status}
              onApprove={() => handleReview("seller", profile.id, "approved")}
              onReject={() => handleReview("seller", profile.id, "rejected")}
              loadingKey={actionKey}
              rowKey={`seller-${profile.id}`}
            />
          ))}
        </ApprovalPanel>
      </div>
    </div>
  );
}

interface ApprovalPanelProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: string;
  onStatusChange: (status: string) => void;
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  children: React.ReactNode;
}

function ApprovalPanel({
  title,
  description,
  icon,
  status,
  onStatusChange,
  loading,
  error,
  emptyMessage,
  children,
}: ApprovalPanelProps) {
  return (
    <section className="bg-white rounded-2xl border border-neutral-200  p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
            {icon}
            Reviews
          </p>
          <h2 className="font-display text-2xl text-neutral-900">{title}</h2>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>
        <label className="text-xs font-semibold text-neutral-500 flex flex-col gap-1">
          Status filter
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-neutral-900 focus:ring-2 focus:ring-brand-500/20"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : React.Children.count(children) === 0 ? (
        <div className="text-sm text-neutral-500 border border-dashed border-neutral-200 rounded-2xl p-6 text-center">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {children}
        </div>
      )}
    </section>
  );
}

interface ProfileRowProps {
  primary: string;
  secondary: string;
  email: string;
  status: string;
  onApprove: () => void;
  onReject: () => void;
  loadingKey: string | null;
  rowKey: string;
}

function ProfileRow({
  primary,
  secondary,
  email,
  status,
  onApprove,
  onReject,
  loadingKey,
  rowKey,
}: ProfileRowProps) {
  const isPending = status === "pending";
  const approving = loadingKey === `${rowKey}-approved`;
  const rejecting = loadingKey === `${rowKey}-rejected`;

  return (
    <div className="flex flex-col gap-3 border border-neutral-200 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="font-semibold text-neutral-900">{primary}</p>
        <p className="text-sm text-neutral-500">{secondary}</p>
        <p className="text-xs text-neutral-400 mt-1">{email}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <ApprovalBadge status={status as ApprovalStatus} />
        <Button
          variant="primary"
          size="sm"
          onClick={onApprove}
          loading={approving}
          disabled={!isPending && !approving}
        >
          Approve
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onReject}
          loading={rejecting}
          disabled={!isPending && !rejecting}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
