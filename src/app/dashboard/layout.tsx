"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { accountPillLabel, useMyDealerBusinessName } from "@/hooks/useMyDealerProfile";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import {
  LayoutDashboard, Car, PlusCircle, MessageSquare,
  User, ShieldCheck, UserCheck, LogOut, ChevronRight, Bell
} from "lucide-react";

const BASE_NAV_ITEMS = [
  { label: "Overview",      href: "/dashboard",               icon: LayoutDashboard },
  { label: "My Listings",   href: "/dashboard/listings",      icon: Car             },
  { label: "New Listing",   href: "/dashboard/listings/new",  icon: PlusCircle      },
  { label: "Inbox",         href: "/dashboard/inbox",         icon: MessageSquare   },
  { label: "Profile",       href: "/dashboard/profile",       icon: User            },
];

const ADMIN_NAV_ITEMS = [
  ...BASE_NAV_ITEMS,
  { label: "Admin",    href: "/dashboard/admin",           icon: ShieldCheck },
  { label: "Sellers", href: "/dashboard/admin/verified",   icon: UserCheck   },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router              = useRouter();
  const pathname            = usePathname();
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const isSeller            = user?.role === "seller" || user?.role === "dealer";
  const dealerBusinessName  = useMyDealerBusinessName(user?.role);
  const pillLabel           = accountPillLabel(user?.role, user?.full_name, dealerBusinessName);
  const navItems = user?.role === "admin" ? ADMIN_NAV_ITEMS : BASE_NAV_ITEMS;

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) return <PageLoader />;
  if (!isLoggedIn) return null;

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col w-60 xl:w-64 shrink-0">

            {/* User card */}
            <div className="bg-white rounded-2xl p-5 border border-neutral-200  mb-4">
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center mb-3">
                  <span className="font-display text-2xl font-bold text-white">
                    {user?.full_name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <p className="font-display font-bold text-neutral-900">{user?.full_name}</p>
                <p className="text-xs text-neutral-400 mt-0.5 break-all">{user?.email}</p>
                {pillLabel && (
                  <p className="text-xs text-neutral-500 capitalize mt-2 px-3 py-1 bg-neutral-100 rounded-full">
                    {pillLabel}
                  </p>
                )}
              </div>

            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-2xl border border-neutral-200  overflow-hidden">
              {navItems.map((item) => {
                const Icon   = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                      "border-b border-slate-50 last:border-0",
                      active
                        ? "bg-neutral-50 text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 shrink-0", active ? "text-neutral-700" : "text-neutral-400")} />
                    {item.label}
                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-neutral-400" />}
                  </Link>
                );
              })}

              {/* Sign out */}
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors border-t border-neutral-200"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Sign out
              </button>
            </nav>
          </aside>

          {/* ── Main content ─────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {/* Mobile nav tabs */}
            <div className="lg:hidden flex overflow-x-auto scrollbar-hide gap-2 mb-5 pb-1">
              {navItems.map((item) => {
                const Icon   = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0 border",
                      active
                        ? "bg-neutral-900 text-white border-brand-700"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-slate-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}