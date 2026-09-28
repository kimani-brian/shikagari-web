import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";
import Icon from "@/components/ui/Icon";

const FOOTER_LINKS = {
  Browse: [
    { label: "All cars", href: "/listings" },
    { label: "Dealers", href: "/dealers" },
    { label: "Private sellers", href: "/listings?seller_type=private" },
    { label: "New listings", href: "/listings?sort_by=newest" },
  ],
  Sell: [
    { label: "List your car", href: "/register" },
    { label: "Dealer signup", href: "/dealers" },
    { label: "Seller dashboard", href: "/dashboard" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of use", href: "/terms" },
  ],
};

function XBrandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
                <Icon name="directions_car" size={18} className="text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-neutral-900">
                ShikaGari
              </span>
            </Link>

            <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
              A marketplace for cars in Kenya. Find vehicles from dealers and private sellers.
            </p>

            <div className="space-y-2.5">
              <a
                href="tel:+254700000000"
                className="flex items-center gap-2.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <Icon name="phone" size={18} className="text-neutral-400" />
                +254 700 000 000
              </a>
              <a
                href="mailto:hello@shikagari.co.ke"
                className="flex items-center gap-2.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <Icon name="mail" size={18} className="text-neutral-400" />
                hello@shikagari.co.ke
              </a>
              <span className="flex items-center gap-2.5 text-sm text-neutral-500">
                <Icon name="location_on" size={18} className="text-neutral-400" />
                Westlands, Nairobi, Kenya
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="#"
                aria-label="X"
                className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                <XBrandIcon className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-medium text-neutral-900 tracking-wide mb-4">{group}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-neutral-500">© {new Date().getFullYear()} ShikaGari. All rights reserved.</p>
            <p className="text-xs text-neutral-400">Nairobi, Kenya</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
