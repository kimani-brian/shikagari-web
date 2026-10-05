"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import { ApprovalBadge } from "@/components/ui/Badge";
import { AdminPendingListing, ApprovalStatus } from "@/types";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { useAdminDealerProfiles, useAdminPendingListings } from "@/hooks/useAdminProfiles";
import { Building2, ShieldCheck } from "lucide-react";
import { API_ORIGIN } from "@/lib/config";
import { cn, formatKES, timeAgo } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

type ReviewDecision = "approved" | "rejected";

type ProfileKind = "dealer" | "listing";

export default function AdminApprovalsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();

  const [dealerStatus, setDealerStatus] = useState("pending");
  const [actionKey, setActionKey] = useState<string | null>(null);

  const dealerData = useAdminDealerProfiles(dealerStatus);
  const listingData = useAdminPendingListings();

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

  const handleReview = async (kind: ProfileKind, id: string, decision: ReviewDecision) => {
    try {
      setActionKey(`${kind}-${id}-${decision}`);
      if (kind === "dealer") {
        await api.patch(`/admin/dealers/${id}/review`, { approval_status: decision });
        dealerData.refetch();
      } else {
        // Rejections must carry a reason so the seller knows what to fix.
        const rejection_reason =
          decision === "rejected"
            ? window.prompt("Reason for rejection (shown to the seller):") ?? ""
            : undefined;
        if (decision === "rejected" && !rejection_reason) {
          setActionKey(null);
          return;
        }
        await api.patch(`/admin/listings/${id}/verify`, {
          verification_status: decision,
          rejection_reason,
        });
        listingData.refetch();
      }
      toast.success(`Profile ${decision}`);
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
            Review dealer profiles and verify buyer listings. Buyers list from their own account once you approve their NTSA e-logbook.
          </p>
        </div>
        <Link href="/dealers" className="text-sm font-semibold text-neutral-900 hover:text-brand-800">
          View public dealer page →
        </Link>
      </header>

      <div className="space-y-6">
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
          title="Listing verification"
          description="Buyers proving identity and car ownership with an NTSA e-logbook."
          icon={<ShieldCheck className="w-5 h-5" />}
          listingCount={listingData.total}
          loading={listingData.loading}
          error={listingData.error}
          emptyMessage="No listings are waiting for verification."
        >
          {listingData.profiles.map((listing) => (
            <ListingReviewCard
              key={listing.id}
              listing={listing}
              loadingKey={actionKey}
              onApprove={() => handleReview("listing", listing.id, "approved")}
              onReject={() => handleReview("listing", listing.id, "rejected")}
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
  status?: string;
  onStatusChange?: (status: string) => void;
  listingCount?: number;
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
  listingCount,
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
        {onStatusChange ? (
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
        ) : (
          <span className="shrink-0 inline-flex items-center gap-2 self-start rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white">
            {listingCount ?? 0} waiting
          </span>
        )}
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

interface ListingReviewCardProps {
  listing: AdminPendingListing;
  loadingKey: string | null;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * Full review card for a buyer listing. An admin has to sanity-check that the
 * car being sold matches the submitted e-logbook, so this shows the vehicle
 * details, the photos, the seller's contact info, and the ownership claim.
 */
function ListingReviewCard({
  listing,
  loadingKey,
  onApprove,
  onReject,
}: ListingReviewCardProps) {
  const rowKey = `listing-${listing.id}`;
  const approving = loadingKey === `${rowKey}-approved`;
  const rejecting = loadingKey === `${rowKey}-rejected`;

  // Admins need to check every photo against the e-logbook, not just the cover.
  const photos = listing.images ?? [];
  const [activePhoto, setActivePhoto] = useState(0);
  const current = photos[activePhoto] ?? photos[0];
  const src = (path: string) => (path.startsWith("http") ? path : `${API_ORIGIN}${path}`);

  const specs = [
    { label: "Body", value: listing.body_type },
    { label: "Year", value: String(listing.year) },
    { label: "Mileage", value: `${listing.mileage.toLocaleString()} km` },
    { label: "Fuel", value: listing.fuel_type },
    { label: "Transmission", value: listing.transmission },
    { label: "Drive", value: listing.drivetrain || "—" },
    { label: "Engine", value: listing.engine_size || "—" },
    { label: "Doors", value: listing.doors ? String(listing.doors) : "—" },
    { label: "Colour", value: listing.color || "—" },
    { label: "Location", value: listing.location },
  ];

  return (
    <article className="border border-neutral-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex flex-col sm:flex-row">
        {/* Photos — main image plus a scrollable thumbnail strip */}
        <div className="sm:w-52 shrink-0 bg-neutral-100 flex flex-col">
          <div className="relative flex-1 min-h-[140px]">
            {current ? (
              <img
                src={src(current)}
                alt={`${listing.title} — photo ${activePhoto + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[140px] flex flex-col items-center justify-center gap-1 text-neutral-400">
                <CarIcon />
                <span className="text-xs">No photos</span>
              </div>
            )}
            {photos.length > 1 && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-neutral-900/80 text-white text-[10px] font-semibold tabular-nums">
                {activePhoto + 1} / {photos.length}
              </span>
            )}
          </div>

          {photos.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto p-1.5 bg-neutral-100 border-t border-neutral-200 [scrollbar-width:thin]">
              {photos.map((photo, i) => (
                <button
                  key={`${photo}-${i}`}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Show photo ${i + 1} of ${photos.length}`}
                  aria-current={i === activePhoto}
                  className={cn(
                    "relative w-14 h-11 shrink-0 rounded-md overflow-hidden transition-all",
                    i === activePhoto
                      ? "ring-2 ring-neutral-900"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  <img
                    src={src(photo)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle + seller */}
        <div className="flex-1 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900">{listing.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {listing.make} {listing.model} · stock {listing.id.replace(/-/g, "").slice(0, 6).toUpperCase()}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-base font-semibold text-neutral-900">
                {formatKES(listing.price_kes)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 mt-0.5">
                asked price
              </p>
            </div>
          </div>

          {/* Specs */}
          <dl className="grid grid-cols-3 sm:grid-cols-5 gap-x-4 gap-y-2">
            {specs.map((spec) => (
              <div key={spec.label} className="min-w-0">
                <dt className="text-[10px] uppercase tracking-wider text-neutral-400">
                  {spec.label}
                </dt>
                <dd className="text-xs font-medium text-neutral-900 capitalize truncate">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>

          {listing.description && (
            <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3 border-l-2 border-neutral-200 pl-3">
              {listing.description}
            </p>
          )}

          {/* Seller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-2 border-t border-neutral-100">
            <p className="text-xs text-neutral-500">
              <span className="text-neutral-400">Seller:</span>{" "}
              <span className="text-neutral-900 font-medium">{listing.seller.full_name}</span>
            </p>
            <p className="text-xs text-neutral-500 truncate">
              <span className="text-neutral-400">Email:</span>{" "}
              <span className="text-neutral-900">{listing.seller_email}</span>
            </p>
            <p className="text-xs text-neutral-500">
              <span className="text-neutral-400">Phone:</span>{" "}
              <span className="text-neutral-900">{listing.seller.phone}</span>
            </p>
            <p className="text-xs text-neutral-500">
              <span className="text-neutral-400">Listed:</span>{" "}
              <span className="text-neutral-900">{timeAgo(listing.created_at)}</span>
            </p>
          </div>

          {/* Ownership claim */}
          <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1.5">
              Ownership claim
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="text-xs text-neutral-600">
                <span className="text-neutral-400">Name on ID:</span>{" "}
                <span className="font-medium text-neutral-900">
                  {listing.verification_full_name ?? "—"}
                </span>
              </p>
              <p className="text-xs text-neutral-600">
                <span className="text-neutral-400">ID no:</span>{" "}
                <span className="font-medium text-neutral-900">
                  {listing.verification_id_number ?? "—"}
                </span>
              </p>
              {listing.verification_elogbook_url && (
                <a
                  href={listing.verification_elogbook_url.startsWith("http")
                    ? listing.verification_elogbook_url
                    : `${API_ORIGIN}${listing.verification_elogbook_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-neutral-900 underline underline-offset-2"
                >
                  Open NTSA e-logbook
                </a>
              )}
            </div>
            {listing.images && listing.images.length > 1 && (
              <p className="text-[11px] text-neutral-400 mt-1.5">
                {listing.images.length} photos uploaded — open the listing to review them all.
              </p>
            )}
          </div>

          {/* Decision */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={onApprove}
              loading={approving}
            >
              Approve listing
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onReject}
              loading={rejecting}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CarIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M5 17h14M6 17v2m12-2v2M4 13l1.5-4.5A2 2 0 0 1 7.4 7h9.2a2 2 0 0 1 1.9 1.5L20 13v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3Z" />
      <circle cx="7.5" cy="14.5" r="1" />
      <circle cx="16.5" cy="14.5" r="1" />
    </svg>
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
