"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Icon from "@/components/ui/Icon";

const NAV_LINKS = [
  { label: "Vehicles", href: "/listings" },
  { label: "Showrooms", href: "/dealers" },
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  // Guests get pointed at registration; buyers go straight to their listing
  // form. Dealers and admins have their own entry points in the dashboard.
  const showSell = !isLoggedIn || user?.role === "buyer";
  const sellHref = isLoggedIn ? "/dashboard/listings/new" : "/register";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-[var(--nav-height)]",
          "bg-neutral-900",
          "transition-shadow duration-200",
          scrolled ? "shadow-nav" : "border-b border-neutral-800"
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <Icon name="directions_car" size={18} className="text-neutral-900" />
            </div>
            <span className="font-semibold text-lg text-white tracking-tight">
              ShikaGari
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-white text-neutral-900"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {showSell && (
                  <Link
                    href={sellHref}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium",
                      "bg-white text-neutral-900",
                      "hover:bg-neutral-200",
                      "transition-colors duration-150"
                    )}
                  >
                    Sell
                  </Link>
                )}

                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen((v) => !v)}
                    className={cn(
                      "flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full",
                      "border border-white/15 bg-transparent",
                      "hover:bg-white/10 transition-colors",
                      dropOpen && "bg-white/10"
                    )}
                  >
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                      <span className="text-neutral-900 text-xs font-medium">
                        {user?.full_name?.[0]?.toUpperCase() ?? "U"}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-white leading-none">
                        {user?.full_name?.split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-neutral-400 leading-none mt-0.5 capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <Icon
                      name="chevron_down"
                      size={18}
                      className={cn(
                        "text-neutral-500 transition-transform",
                        dropOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {dropOpen && (
                    <div
                      className={cn(
                        "absolute right-0 top-full mt-2 w-56",
                        "bg-white rounded-2xl border border-neutral-200",
                        "shadow-[0_8px_24px_rgb(0_0_0/0.08)]",
                        "py-1.5 z-50"
                      )}
                    >
                      <div className="px-4 py-3 border-b border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900">
                          {user?.full_name}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <DropItem href="/dashboard" icon="dashboard" label="Dashboard" />
                        <DropItem href="/dashboard/listings" icon="directions_car" label="My listings" />
                        <DropItem href="/dashboard/inbox" icon="chat_bubble" label="Inbox" />
                        <DropItem href="/dashboard/profile" icon="person" label="Profile" />
                      </div>

                      <div className="border-t border-neutral-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setDropOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <Icon name="logout" size={18} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/register"
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium",
                  "bg-white text-neutral-900",
                  "hover:bg-neutral-200",
                  "transition-colors duration-150"
                )}
              >
                Sell
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-full text-neutral-300 hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <Icon name={menuOpen ? "close" : "menu"} size={22} />
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div className={cn("fixed inset-0 z-40 md:hidden", "pt-[var(--nav-height)]")}>
          <div
            className="absolute inset-0 bg-neutral-900/60"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative bg-neutral-900 border-b border-neutral-800">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl text-sm font-medium",
                    isActive(link.href)
                      ? "bg-white text-neutral-900"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="px-4 pb-4 pt-2 border-t border-neutral-800">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                      <span className="text-neutral-900 text-sm font-medium">
                        {user?.full_name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user?.full_name}</p>
                      <p className="text-xs text-neutral-400 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  {showSell && (
                    <Link
                      href={sellHref}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-neutral-900 bg-white hover:bg-neutral-200"
                    >
                      <Icon name="storefront" size={18} />
                      Sell your car
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10"
                  >
                    <Icon name="dashboard" size={18} />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white hover:bg-white/10"
                  >
                    <Icon name="logout" size={18} />
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/register"
                  className="block py-3 rounded-xl text-sm font-medium text-neutral-900 bg-white text-center hover:bg-neutral-200"
                >
                  Sell
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DropItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
    >
      <Icon name={icon} size={18} className="text-neutral-400" />
      {label}
    </Link>
  );
}
