import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Metadata } from "next";
import { type ComponentType } from "react";
import {
  ShieldCheck,
  Clock3,
  MapPin,
  Users,
  Car,
  HeartHandshake,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About ShikaGari",
  description:
    "Learn how ShikaGari is building Kenya's most trusted car marketplace for buyers, dealers, and private sellers.",
};

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: "Verified sellers",
    copy: "Every dealer and private seller passes a manual verification before their listings go live.",
  },
  {
    icon: MapPin,
    title: "47 counties",
    copy: "From Nairobi to Eldoret, shoppers can browse inventory that is truly nationwide.",
  },
  {
    icon: Users,
    title: "4,500+ buyers",
    copy: "Active shoppers rely on ShikaGari alerts and saved searches every single day.",
  },
];

const VALUES = [
  {
    title: "Trust first",
    copy: "Transparent pricing, verified documents, and safety tooling keep fraud out of the marketplace.",
  },
  {
    title: "Human support",
    copy: "Dedicated account managers help dealers optimize listings and respond to buyer leads promptly.",
  },
  {
    title: "Local roots",
    copy: "We design for Kenyan buyers – mobile-first flows, M-Pesa friendly sellers, and localized advice.",
  },
];

const TIMELINE = [
  { year: "2022", detail: "ShikaGari launches in Nairobi with 200 pilot listings." },
  { year: "2023", detail: "Introduced verified seller badges and direct buyer messaging." },
  { year: "2024", detail: "Expanded to the coast and rift valley, crossing 10,000 active listings." },
  { year: "Today", detail: "Building dealer CRM tools, inspection reports, and financing partnerships." },
];

export default function AboutPage() {
  return (
    <div className="bg-surface-muted">
      <section className="bg-gradient-to-b from-navy via-navy-light to-navy text-white">
        <PageWrapper className="py-20 flex flex-col gap-12">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand-200">
              <ShieldCheck className="w-4 h-4" />
              About ShikaGari
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight">
              Kenya's marketplace for verified cars, born in Nairobi and built for the entire country.
            </h1>
            <p className="text-lg text-blue-100/80">
              We connect serious buyers with vetted dealers and private sellers, making every interaction safer,
              faster, and more transparent. Our team mixes automotive specialists, technologists, and customer
              success folks who understand the realities of the Kenyan car economy.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/listings">
                <Button variant="primary" size="lg">
                  Browse cars
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">
                  Join the marketplace
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, copy }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-sm"
              >
                <Icon className="w-6 h-6 text-brand-200" />
                <p className="text-lg font-semibold">{title}</p>
                <p className="text-sm text-blue-100/80">{copy}</p>
              </div>
            ))}
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-16 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="font-display text-3xl text-slate-900">Our mission</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Buying or selling a car in Kenya should feel modern and trustworthy. We remove the mystery by
              surfacing accurate pricing, enabling direct messaging, and arming sellers with insights so they
              can move inventory faster. Every feature – from saved searches to dealer analytics – is focused on
              confidence and speed.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Stat label="Verified sellers" value="850+" icon={ShieldCheck} />
              <Stat label="Active listings" value="12,000+" icon={Car} />
              <Stat label="Buyer inquiries" value="40k+" icon={HeartHandshake} />
            </div>
          </div>
          <div className="space-y-4 bg-white rounded-3xl border border-slate-100 shadow-card p-8">
            <h3 className="text-xl font-semibold text-slate-900">Values we live by</h3>
            <div className="space-y-4">
              {VALUES.map(({ title, copy }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-display text-lg">
                    {title.slice(0, 1)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-100 shadow-card p-8">
          <h2 className="font-display text-3xl text-slate-900 mb-6">Our journey</h2>
          <div className="space-y-6">
            {TIMELINE.map((item) => (
              <div key={item.year} className="flex gap-4 items-start">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                  <Clock3 className="w-4 h-4" />
                  {item.year}
                </div>
                <p className="text-slate-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-brand-600 to-navy rounded-3xl text-white p-10 flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-200">Next up</p>
            <h2 className="font-display text-3xl font-semibold mt-2">
              Building the tools dealers asked for
            </h2>
            <p className="text-blue-100/90 mt-3 max-w-2xl">
              Inventory scoring, inspection reports, financing hooks, and pro analytics roll out throughout the year.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/dealers">
              <Button variant="secondary" size="lg">
                See dealer features
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="lg" className="text-white border border-white/30">
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
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-card p-4 space-y-2">
      <Icon className="w-5 h-5 text-brand-600" />
      <p className="text-2xl font-display text-slate-900">{value}</p>
      <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}
