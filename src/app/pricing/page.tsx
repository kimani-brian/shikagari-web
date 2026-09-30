import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Metadata } from "next";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing for buyers, private sellers, and dealers on ShikaGari.",
};

const PLANS = [
  {
    name: "Buyers",
    price: "Free",
    copy: "Search, filter, and contact sellers at no cost.",
    features: ["Unlimited browsing", "Direct seller contact", "Saved cars"],
    cta: { label: "Vehicles", href: "/listings" },
  },
  {
    name: "Private sellers",
    price: "Free",
    copy: "List your car after admin verification.",
    features: ["Create listings", "Manage inquiries in dashboard", "Edit or remove anytime"],
    cta: { label: "List your car", href: "/register" },
  },
  {
    name: "Dealers",
    price: "Custom",
    copy: "Showroom profile plus inventory tools. Talk to us about onboarding.",
    features: ["Verified dealer profile", "Multiple listings", "Partnership support"],
    cta: { label: "Dealer signup", href: "/dealers" },
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-neutral-200">
        <PageWrapper className="py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Icon name="payments" size={16} />
              Pricing
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-neutral-900 mt-4">
              Simple pricing
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed mt-4">
              Browsing is free. Sellers list after verification. Dealers get a showroom profile with inventory tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {PLANS.map((plan) => (
              <div key={plan.name} className="border border-neutral-200 rounded-xl p-6 flex flex-col">
                <p className="text-xs font-medium text-neutral-500">{plan.name}</p>
                <p className="text-2xl font-semibold text-neutral-900 mt-2">{plan.price}</p>
                <p className="text-xs text-neutral-500 leading-relaxed mt-2">{plan.copy}</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                      <Icon name="check_circle" size={16} className="text-neutral-700 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.cta.href} className="mt-6">
                  <Button variant={plan.name === "Dealers" ? "secondary" : "primary"} size="md" fullWidth>
                    {plan.cta.label}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-12">
        <section className="rounded-xl border border-neutral-200 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Need something custom?</h2>
            <p className="text-sm text-neutral-500 mt-1">Talk to us about dealer onboarding and verification.</p>
          </div>
          <Link href="/contact">
            <Button variant="secondary" size="md">
              Contact us
            </Button>
          </Link>
        </section>
      </PageWrapper>
    </div>
  );
}
