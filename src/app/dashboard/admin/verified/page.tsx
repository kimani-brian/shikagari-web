"use client";

import { useEffect, Children, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, UserCheck, ArrowLeft, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import VerifiedBadge from "@/components/shared/VerifiedBadge";
import { useAdminDealerProfiles, useAdminPrivateSellerProfiles } from "@/hooks/useAdminProfiles";
import { DealerProfile, PrivateSellerProfile } from "@/types";
import Button from "@/components/ui/Button";

export default function VerifiedSellersPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();

  const dealerData = useAdminDealerProfiles("approved");
  const sellerData = useAdminPrivateSellerProfiles("approved");

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

  if (isLoading || !isLoggedIn) {
    return <PageLoader />;
  }

  if (user?.role !== "admin") {
    return null;
  }

  const totalVerified = dealerData.total + sellerData.total;

  return (
    <div className="space-y-8">
      <header className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin tools</p>
          <h1 className="font-display text-3xl text-slate-900 mt-1">Verified sellers</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl">
            {totalVerified === 0
              ? "No approved seller profiles yet."
              : `${totalVerified} approved seller${totalVerified === 1 ? "" : "s"} ready for spotlight.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to approvals
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<ExternalLink className="w-4 h-4" />}
            onClick={() => router.push("/dealers")}
          >
            View public dealer page
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <VerifiedPanel
          title="Dealer partners"
          subtitle="Franchise and independent dealerships currently approved."
          icon={<Building2 className="w-5 h-5" />}
          loading={dealerData.loading}
          error={dealerData.error}
          emptyMessage="No approved dealer profiles yet."
        >
          {dealerData.profiles.map((profile) => (
            <DealerRow key={profile.id} profile={profile} />
          ))}
        </VerifiedPanel>

        <VerifiedPanel
          title="Private sellers"
          subtitle="Individuals who completed KYC and can list cars."
          icon={<UserCheck className="w-5 h-5" />}
          loading={sellerData.loading}
          error={sellerData.error}
          emptyMessage="No approved private sellers yet."
        >
          {sellerData.profiles.map((profile) => (
            <PrivateSellerRow key={profile.id} profile={profile} />
          ))}
        </VerifiedPanel>
      </div>
    </div>
  );
}

interface VerifiedPanelProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  children: React.ReactNode;
}

function VerifiedPanel({
  title,
  subtitle,
  icon,
  loading,
  error,
  emptyMessage,
  children,
}: VerifiedPanelProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
        {icon}
        Verified
      </div>
      <div>
        <h2 className="font-display text-2xl text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : Children.count(children) === 0 ? (
        <div className="text-sm text-slate-500 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
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

function DealerRow({ profile }: { profile: DealerProfile }) {
  return (
    <div className="flex flex-col gap-4 border border-slate-100 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        {profile.logo_url ? (
          <img
            src={profile.logo_url}
            alt={profile.business_name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Building2 className="w-5 h-5" />
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-900">{profile.business_name}</p>
          <p className="text-sm text-slate-500">{profile.location}</p>
          <p className="text-xs text-slate-400">Contact: {profile.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <VerifiedBadge size="sm" />
        <span>Approved {formatDate(profile.approved_at ?? profile.created_at)}</span>
      </div>
    </div>
  );
}

function PrivateSellerRow({ profile }: { profile: PrivateSellerProfile }) {
  return (
    <div className="flex flex-col gap-4 border border-slate-100 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        {profile.profile_photo_url ? (
          <img
            src={profile.profile_photo_url}
            alt={profile.user.full_name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <UserCheck className="w-5 h-5" />
          </div>
        )}
        <div>
          <p className="font-semibold text-slate-900">{profile.user.full_name}</p>
          <p className="text-sm text-slate-500">{profile.location}</p>
          <p className="text-xs text-slate-400">National ID: {profile.national_id_no}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <VerifiedBadge size="sm" />
        <span>Approved {formatDate(profile.approved_at ?? profile.created_at)}</span>
      </div>
    </div>
  );
}

function formatDate(date?: string | null) {
  if (!date) return "--";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
