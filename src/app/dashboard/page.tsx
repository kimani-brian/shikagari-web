"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { ListingCard } from "@/types";
import { formatKES, timeAgo } from "@/lib/utils";
import {
  Car, PlusCircle, MessageSquare, Eye,
  TrendingUp, ArrowRight, ShieldCheck,
  AlertCircle, CheckCircle2, Clock,
  Building2, UserCheck
} from "lucide-react";
import Button from "@/components/ui/Button";
import { ApprovalBadge, ListingStatusBadge } from "@/components/ui/Badge";
import { CarCardSkeleton } from "@/components/ui/Skeleton";

interface DashboardStats {
  totalListings:  number;
  activeListings: number;
  totalViews:     number;
  openInquiries:  number;
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();

  const [stats,          setStats]          = useState<DashboardStats | null>(null);
  const [recentListings, setRecentListings] = useState<ListingCard[]>([]);
  const [dealerStatus,   setDealerStatus]   = useState<string | null>(null);
  const [sellerStatus,   setSellerStatus]   = useState<string | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [pendingCounts,  setPendingCounts]  = useState<{ dealers: number | null; sellers: number | null}>({
    dealers: null,
    sellers: null,
  });
  const [pendingLoading, setPendingLoading] = useState(false);
  const verificationSyncRequested = useRef(false);
  const formatPendingLabel = (count: number | null, singular: string) => {
    if (pendingLoading) return "Syncing...";
    if (typeof count !== "number") return "Unavailable";
    return `${count} ${singular}${count === 1 ? "" : "s"} pending`;
  };

  const isSeller = user?.role === "seller";
  const isAdmin  = user?.role === "admin";

  useEffect(() => {
    if (!isSeller) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        // Fetch recent listings
        const listingsRes = await api.get("/listings/me?page=1&per_page=5");
        const listings    = listingsRes.data.data ?? [];
        setRecentListings(listings);

        // Calculate stats from listings
        const active     = listings.filter((l: ListingCard) => l.status === "active").length;
        const totalViews = 0; // Would come from a dedicated stats endpoint

        setStats({
          totalListings:  listingsRes.data.meta?.total_items ?? listings.length,
          activeListings: active,
          totalViews,
          openInquiries:  0,
        });

        // Fetch seller profile status
        try {
          const dealerRes = await api.get("/dealers/profile");
          setDealerStatus(dealerRes.data.data?.approval_status ?? null);
        } catch { /* No dealer profile */ }

        try {
          const sellerRes = await api.get("/sellers/profile");
          setSellerStatus(sellerRes.data.data?.approval_status ?? null);
        } catch { /* No private seller profile */ }

      } catch {
        // Silently fail — user may be buyer
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isSeller]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    const fetchPendingCounts = async () => {
      setPendingLoading(true);
      try {
        const [dealerRes, sellerRes] = await Promise.all([
          api.get("/admin/dealers", { params: { status: "pending", page: 1, per_page: 1 } }),
          api.get("/admin/sellers", { params: { status: "pending", page: 1, per_page: 1 } }),
        ]);

        if (cancelled) return;

        const readTotal = (res: any) => res?.data?.meta?.total_items ?? res?.data?.data?.length ?? 0;

        setPendingCounts({
          dealers: readTotal(dealerRes),
          sellers: readTotal(sellerRes),
        });
      } catch {
        if (!cancelled) {
          setPendingCounts({ dealers: null, sellers: null });
        }
      } finally {
        if (!cancelled) {
          setPendingLoading(false);
        }
      }
    };

    fetchPendingCounts();
    return () => { cancelled = true; };
  }, [isAdmin]);

  const approvalStatus = isSeller ? dealerStatus ?? sellerStatus : null;
  const isApproved     = approvalStatus === "approved";
  const showVerifiedBadge = isSeller && (user?.is_verified || isApproved);

  useEffect(() => {
    if (!isSeller || !isApproved || user?.is_verified || verificationSyncRequested.current) return;
    verificationSyncRequested.current = true;
    refreshUser();
  }, [isSeller, isApproved, user?.is_verified, refreshUser]);

  const STAT_CARDS = [
    {
      label:   "Total Listings",
      value:   stats?.totalListings ?? 0,
      icon:    Car,
      color:   "bg-brand-50 text-brand-600",
      href:    "/dashboard/listings",
    },
    {
      label:   "Active Listings",
      value:   stats?.activeListings ?? 0,
      icon:    CheckCircle2,
      color:   "bg-emerald-50 text-emerald-600",
      href:    "/dashboard/listings",
    },
    {
      label:   "Total Views",
      value:   stats?.totalViews ?? 0,
      icon:    Eye,
      color:   "bg-purple-50 text-purple-600",
      href:    "/dashboard/listings",
    },
    {
      label:   "Open Inquiries",
      value:   stats?.openInquiries ?? 0,
      icon:    MessageSquare,
      color:   "bg-amber-50 text-amber-600",
      href:    "/dashboard/inbox",
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Welcome header ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-navy to-brand-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-blue-200/70 text-sm mb-1">Good day 👋</p>
            <h1 className="font-display text-2xl font-bold">
              {user?.full_name?.split(" ")[0]}
            </h1>
            <p className="text-blue-100/70 text-sm mt-1 capitalize">
              {user?.role} account
              {showVerifiedBadge && " · Verified ✓"}
            </p>
          </div>
          {isSeller && isApproved && (
            <Link href="/dashboard/listings/new">
              <Button
                variant="navy"
                size="sm"
                className="bg-white text-navy hover:bg-blue-50 shrink-0"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                New Listing
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">Review seller submissions</p>
            <p className="text-sm text-slate-500">
              Approve dealer and private seller profiles so verified sellers stand out on the marketplace.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                {formatPendingLabel(pendingCounts.dealers, "dealer")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                {formatPendingLabel(pendingCounts.sellers, "seller")}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link href="/dashboard/admin">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Open admin console
              </Button>
            </Link>
            <Link
              href="/dashboard/admin/verified"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 text-right"
            >
              Browse verified sellers →
            </Link>
          </div>
        </div>
      )}

      {/* ── Approval status banner ────────────────────────────────────── */}
      {isSeller && !approvalStatus && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900 mb-1">
              Complete your seller profile
            </p>
            <p className="text-sm text-amber-700 mb-3">
              You need an approved dealer or private seller profile before you can list vehicles.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/dealers/profile/new">
                <Button variant="warning" size="sm" className="bg-amber-600 text-white hover:bg-amber-700 border-0">
                  Create Dealer Profile
                </Button>
              </Link>
              <Link href="/sellers/profile/new">
                <Button variant="secondary" size="sm">
                  Create Private Seller Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {isSeller && approvalStatus && approvalStatus !== "approved" && (
        <div className={cn(
          "rounded-2xl p-5 flex items-start gap-4 border",
          approvalStatus === "pending"
            ? "bg-blue-50 border-blue-200"
            : "bg-red-50 border-red-200"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            approvalStatus === "pending" ? "bg-blue-100" : "bg-red-100"
          )}>
            {approvalStatus === "pending"
              ? <Clock className="w-5 h-5 text-blue-600" />
              : <AlertCircle className="w-5 h-5 text-red-600" />
            }
          </div>
          <div>
            <p className={cn(
              "font-semibold mb-1",
              approvalStatus === "pending" ? "text-blue-900" : "text-red-900"
            )}>
              {approvalStatus === "pending"
                ? "Profile under review"
                : "Profile not approved"
              }
            </p>
            <p className={cn(
              "text-sm",
              approvalStatus === "pending" ? "text-blue-700" : "text-red-700"
            )}>
              {approvalStatus === "pending"
                ? "Our team is reviewing your seller profile. You'll be able to list cars once approved."
                : "Your seller profile was not approved. Please contact support for more information."
              }
            </p>
          </div>
        </div>
      )}

      {/* ── Stats grid ────────────────────────────────────────────────── */}
      {isSeller && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", card.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-display text-2xl font-bold text-slate-900">
                  {loading ? "—" : card.value.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">{card.label}</p>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Recent listings ───────────────────────────────────────────── */}
      {isSeller && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-display font-bold text-slate-900">Recent Listings</h2>
            <Link
              href="/dashboard/listings"
              className="text-sm font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-20 h-16 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentListings.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Car className="w-7 h-7 text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="font-semibold text-slate-700 mb-1">No listings yet</p>
              <p className="text-sm text-slate-400 mb-4">
                {isApproved
                  ? "Create your first listing to start selling"
                  : "Get your profile approved to start listing"
                }
              </p>
              {isApproved && (
                <Link href="/dashboard/listings/new">
                  <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    Create Listing
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentListings.map((listing: any) => (
                <div key={listing.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-20 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    {listing.thumbnail_url ? (
                      <img
                        src={listing.thumbnail_url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🚗</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{listing.title}</p>
                    <p className="text-brand-700 font-bold text-sm">{formatKES(listing.price_kes)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{timeAgo(listing.created_at)}</p>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <ListingStatusBadge status={listing.status} />
                    <Link
                      href={`/dashboard/listings/${listing.id}/edit`}
                      className="text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Quick actions (buyer) ─────────────────────────────────────── */}
      {!isSeller && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/listings"
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
              <Car className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Browse Cars</p>
              <p className="text-sm text-slate-500">12,000+ listings available</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 ml-auto" />
          </Link>
          <Link
            href="/favorites"
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Saved Cars</p>
              <p className="text-sm text-slate-500">View your favourites</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 ml-auto" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ── cn helper (inline since not imported at top) ──────────────────────────────
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}