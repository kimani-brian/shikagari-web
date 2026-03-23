"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Car,
  Menu,
  X,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Heart,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

// ── Nav links ─────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Browse Cars", href: "/listings" },
  { label: "Dealers",     href: "/dealers" },
  { label: "About",       href: "/about" },
];

export default function Navbar() {
  const pathname               = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const isSeller = user?.role === "seller";
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Scroll shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-[var(--nav-height)]",
          "bg-white/95 backdrop-blur-md",
          "transition-shadow duration-300",
          scrolled ? "shadow-nav" : "border-b border-slate-100"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

          {/* ── Logo ───────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-700 flex items-center justify-center shadow-blue group-hover:bg-brand-800 transition-colors">
              <Car className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl text-navy tracking-tight">
              Shika<span className="text-brand-600">Gari</span>
            </span>
          </Link>

          {/* ── Desktop nav links ───────────────────────────────────────── */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Right side ─────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Sell a car CTA */}
                <Link
                  href="/dashboard/listings/new"
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl",
                    "text-sm font-semibold text-brand-700",
                    "border border-brand-200 bg-brand-50",
                    "hover:bg-brand-100 transition-colors"
                  )}
                >
                  <PlusCircle className="w-4 h-4" />
                  Sell a Car
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen((v) => !v)}
                    className={cn(
                      "flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl",
                      "border border-slate-200 bg-white",
                      "hover:border-slate-300 hover:bg-slate-50 transition-all",
                      dropOpen && "border-brand-300 bg-brand-50"
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.full_name?.[0]?.toUpperCase() ?? "U"}
                      </span>
                    </div>

                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-900 leading-none">
                        {user?.full_name?.split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-none mt-0.5 capitalize">
                        {user?.role}
                      </p>
                    </div>

                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-slate-400 transition-transform",
                        dropOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {dropOpen && (
                    <div className={cn(
                      "absolute right-0 top-full mt-2 w-56",
                      "bg-white rounded-2xl border border-slate-100",
                      "shadow-[0_8px_32px_rgb(0_0_0/0.12)]",
                      "animate-fade-up py-1.5 z-50"
                    )}>
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-slate-50">
                        <p className="text-sm font-semibold text-slate-900">
                          {user?.full_name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user?.email}
                        </p>
                        {isSeller && user?.is_verified && (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Seller
                          </span>
                        )}
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <DropItem href="/dashboard"               icon={LayoutDashboard} label="Dashboard" />
                        <DropItem href="/dashboard/listings"       icon={Car}             label="My Listings" />
                        <DropItem href="/inquiries/inbox"          icon={MessageSquare}   label="Inbox" />
                        <DropItem href="/favorites"                icon={Heart}           label="Saved Cars" />
                        <DropItem href="/dashboard/profile"        icon={User}            label="Profile" />
                      </div>

                      <div className="border-t border-slate-50 pt-1 pb-1">
                        <button
                          onClick={() => { logout(); setDropOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-auto"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    "px-5 py-2.5 rounded-xl text-sm font-semibold",
                    "bg-brand-700 text-white",
                    "hover:bg-brand-800 shadow-blue hover:shadow-lg",
                    "transition-all duration-200"
                  )}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ────────────────────────────────────────── */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* ── Mobile menu ─────────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className={cn(
          "fixed inset-0 z-40 md:hidden",
          "pt-[var(--nav-height)] animate-fade-in"
        )}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-white border-b border-slate-100 shadow-xl animate-fade-up">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl text-sm font-medium",
                    isActive(link.href)
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth section */}
            <div className="px-4 pb-4 pt-2 border-t border-slate-100">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.full_name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user?.full_name}</p>
                      <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                    </div>
                  </div>

                  <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    Dashboard
                  </Link>
                  <Link href="/dashboard/listings/new" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-brand-700 bg-brand-50">
                    <PlusCircle className="w-4 h-4" />
                    Sell a Car
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" className="py-3 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 text-center hover:bg-slate-50">
                    Sign in
                  </Link>
                  <Link href="/register" className="py-3 rounded-xl text-sm font-semibold text-white bg-brand-700 text-center hover:bg-brand-800">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Dropdown menu item ────────────────────────────────────────────────────────
function DropItem({
  href,
  icon: Icon,
  label,
}: {
  href:  string;
  icon:  React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
    >
      <Icon className="w-4 h-4 text-slate-400" />
      {label}
    </Link>
  );
}