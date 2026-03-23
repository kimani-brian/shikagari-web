import Link from "next/link";
import { Car, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";

const FOOTER_LINKS = {
  "Browse": [
    { label: "All Cars",    href: "/listings" },
    { label: "Dealers",     href: "/listings?seller_type=dealer" },
    { label: "Private Sellers", href: "/listings?seller_type=private" },
    { label: "New Listings", href: "/listings?sort_by=newest" },
  ],
  "Sell": [
    { label: "List Your Car",    href: "/register" },
    { label: "Dealer Signup",    href: "/dealers" },
    { label: "Seller Dashboard", href: "/dashboard" },
    { label: "Pricing",          href: "/pricing" },
  ],
  "Company": [
    { label: "About Us",     href: "/about" },
    { label: "Contact",      href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
};

const KENYAN_CITIES = [
  "Nairobi", "Mombasa", "Kisumu",
  "Nakuru", "Eldoret", "Thika",
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      {/* ── Main footer ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
                <Car className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                Shika<span className="text-brand-400">Gari</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Kenya's most trusted car marketplace. Find verified vehicles
              from dealers and private sellers across the country.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5">
              <a href="tel:+254700000000" className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                +254 700 000 000
              </a>
              <a href="mailto:hello@shikagari.co.ke" className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                hello@shikagari.co.ke
              </a>
              <span className="flex items-center gap-2.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                Westlands, Nairobi, Kenya
              </span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook,  href: "#", label: "Facebook" },
                { icon: Twitter,   href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-brand-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">
                {group}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Cities bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-xs text-slate-500 mb-3">Available in</p>
          <div className="flex flex-wrap gap-2">
            {KENYAN_CITIES.map((city) => (
              <Link
                key={city}
                href={`/listings?location=${city}`}
                className="px-3 py-1 rounded-full text-xs text-slate-400 border border-white/10 hover:border-brand-500 hover:text-brand-400 transition-colors"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ShikaGari. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Made with love in Nairobi, Kenya 🇰🇪
          </p>
        </div>
      </div>
    </footer>
  );
}