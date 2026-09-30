import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Metadata } from "next";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Contact ShikaGari",
  description: "Get in touch with the ShikaGari team in Nairobi, Kenya.",
};

const CHANNELS = [
  {
    icon: "phone" as const,
    title: "Phone",
    value: "+254 700 000 000",
    href: "tel:+254700000000",
    copy: "Mon–Fri, 9am–5pm EAT",
  },
  {
    icon: "mail" as const,
    title: "Email",
    value: "hello@shikagari.co.ke",
    href: "mailto:hello@shikagari.co.ke",
    copy: "We reply within one business day",
  },
  {
    icon: "location_on" as const,
    title: "Office",
    value: "Westlands, Nairobi, Kenya",
    href: undefined,
    copy: "Visits by appointment",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-neutral-200">
        <PageWrapper className="py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Icon name="mail" size={16} />
              Contact
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-neutral-900 mt-4">
              Talk to our team
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed mt-4">
              Questions about a listing, selling your car, or dealer partnerships? Reach us directly through any channel below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {CHANNELS.map(({ icon, title, value, href, copy }) => (
              <div key={title} className="border border-neutral-200 rounded-xl p-5">
                <Icon name={icon} size={20} className="text-neutral-700" />
                <p className="text-sm font-medium text-neutral-900 mt-3">{title}</p>
                {href ? (
                  <a href={href} className="text-sm text-neutral-900 font-medium hover:underline break-all">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-neutral-900 font-medium">{value}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">{copy}</p>
              </div>
            ))}
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-12 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-neutral-200 p-6">
            <h2 className="text-base font-semibold text-neutral-900">Buying a car?</h2>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
              Browse live inventory and message sellers directly from any listing page.
            </p>
            <Link href="/listings" className="inline-flex mt-4">
              <Button variant="primary" size="md">
                Vehicles
              </Button>
            </Link>
          </div>
          <div className="rounded-xl border border-neutral-200 p-6">
            <h2 className="text-base font-semibold text-neutral-900">Selling or dealer partnership?</h2>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
              Create a seller account to list, or talk to us about dealer onboarding and verification.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link href="/register">
                <Button variant="primary" size="md">
                  List your car
                </Button>
              </Link>
              <Link href="/dealers">
                <Button variant="secondary" size="md">
                  Dealer signup
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </PageWrapper>
    </div>
  );
}
