import PageWrapper from "@/components/layout/PageWrapper";
import Link from "next/link";
import { Metadata } from "next";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ShikaGari collects, uses, and protects your information.",
};

const SECTIONS = [
  {
    title: "Information we collect",
    copy: "Account details you provide (name, email, phone), verification documents (business registration, KRA PIN for dealers; national ID number and NTSA e-logbook for individual listings), listings and photos you publish, and inquiries you send through the marketplace.",
  },
  {
    title: "How we use it",
    copy: "To operate accounts, verify dealer profiles and individual listings, display listings, route inquiries between buyers and sellers, and keep the marketplace safe from fraud and abuse.",
  },
  {
    title: "What we share",
    copy: "Listing details and seller contact information you choose to publish are visible to other users. We do not sell personal data. Identity documents and e-logbooks are used for admin review only and are not shown publicly.",
  },
  {
    title: "Storage and security",
    copy: "Data is stored securely and access is limited to what is needed to operate the service. You can request correction or deletion of your account data at any time.",
  },
  {
    title: "Your choices",
    copy: "Update your profile from the dashboard, remove listings you no longer want published, and contact us to request export or deletion of your personal data.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-neutral-200">
        <PageWrapper className="py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Icon name="shield" size={16} />
              Privacy policy
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-neutral-900 mt-4">
              Privacy policy
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed mt-4">
              Last updated {new Date().getFullYear()}. This page explains what we collect and how it is used on ShikaGari.
            </p>
          </div>
        </PageWrapper>
      </section>

      <PageWrapper className="py-12 space-y-6" maxWidth="2xl">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-xl border border-neutral-200 p-6">
            <h2 className="text-base font-semibold text-neutral-900">{s.title}</h2>
            <p className="text-sm text-neutral-500 leading-relaxed mt-2">{s.copy}</p>
          </section>
        ))}

        <p className="text-sm text-neutral-500">
          Questions about privacy?{" "}
          <Link href="/contact" className="font-medium text-neutral-900 hover:underline">
            Contact us
          </Link>
          .
        </p>
      </PageWrapper>
    </div>
  );
}
