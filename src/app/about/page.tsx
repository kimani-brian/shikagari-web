import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Metadata } from "next";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "About ShikaGari",
  description:
    "Learn how ShikaGari helps buyers and sellers trade cars in Kenya.",
};

const HIGHLIGHTS = [
  {
    icon: "directions_car" as const,
    title: "Cars across Kenya",
    copy: "Browse listings from Nairobi to the coast and inland towns in one place.",
  },
  {
    icon: "location_on" as const,
    title: "47 counties",
    copy: "Inventory is organized by location so you can find cars near you.",
  },
  {
    icon: "group" as const,
    title: "Direct contact",
    copy: "Contact sellers directly to ask questions and arrange viewings.",
  },
];

const VALUES = [
  {
    title: "Clear pricing",
    copy: "Listings show key details and pricing upfront so you can compare easily.",
  },
  {
    title: "Simple process",
    copy: "Search, filter, and contact sellers without extra steps.",
  },
  {
    title: "Local focus",
    copy: "Built for the Kenyan market with mobile friendly flows and local context.",
  },
];

const TIMELINE = [
  { year: "2022", detail: "ShikaGari launches in Nairobi with early listings." },
  { year: "2023", detail: "Added dealer and private seller listings with messaging." },
  { year: "2024", detail: "Expanded coverage and grew active listings." },
  { year: "Today", detail: "Improving search, listing tools, and seller features." },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-neutral-200">
        <PageWrapper className="py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Icon name="info" size={16} />
              About ShikaGari
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-neutral-900 mt-4">
              A marketplace for cars in Kenya
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed mt-4">
              ShikaGari connects buyers with dealers and private sellers. The goal is to make it easy to find cars, compare options, and contact sellers directly.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/listings">
                <Button variant="primary" size="md">
                  Browse cars
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="md">
                  Join the marketplace
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {HIGHLIGHTS.map(({ icon, title, copy }) => (
              <div
                key={title}
                className="border border-neutral-200 rounded-xl p-5"
              >
                <Icon name={icon} size={20} className="text-neutral-700" />
                <p className="text-sm font-medium text-neutral-900 mt-3">{title}</p>
                <p className="text-xs text-neutral-500 leading-relaxed mt-1">{copy}</p>
              </div>
            ))}
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-12 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900">Our approach</h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Buying or selling a car should be straightforward. ShikaGari focuses on clear listings, useful filters, and direct communication between buyers and sellers.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Sellers" value="850+" icon="storefront" />
              <Stat label="Listings" value="12,000+" icon="directions_car" />
              <Stat label="Inquiries" value="40k+" icon="chat_bubble" />
            </div>
          </div>
          <div className="space-y-4 bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-sm font-semibold text-neutral-900">What we focus on</h3>
            <div className="space-y-4">
              {VALUES.map(({ title, copy }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-medium shrink-0">
                    {title.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{title}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Our journey</h2>
          <div className="space-y-4">
            {TIMELINE.map((item) => (
              <div key={item.year} className="flex gap-4 items-start">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-900 shrink-0">
                  <Icon name="schedule" size={16} className="text-neutral-500" />
                  {item.year}
                </div>
                <p className="text-sm text-neutral-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-neutral-900 rounded-xl text-white p-8 flex flex-col gap-6">
          <div>
            <p className="text-xs font-medium text-neutral-400">What is next</p>
            <h2 className="text-xl font-semibold mt-2">Tools for sellers</h2>
            <p className="text-sm text-neutral-300 mt-2 max-w-2xl">
              We are adding better listing management, search improvements, and seller tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dealers">
              <Button variant="secondary" size="md">
                See dealer features
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="md" className="text-white border border-white/20 hover:bg-neutral-100">
                Talk to our team
              </Button>
            </Link>
          </div>
        </section>
      </PageWrapper>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Icon>["name"];
}) {
  return (
    <div className="rounded-xl bg-white border border-neutral-200 p-4 space-y-2">
      <Icon name={icon} size={18} className="text-neutral-700" />
      <p className="text-lg font-semibold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
