import PageWrapper from "@/components/layout/PageWrapper";
import Link from "next/link";
import { Metadata } from "next";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Rules for using the ShikaGari car marketplace in Kenya.",
};

const SECTIONS = [
  {
    title: "Marketplace role",
    copy: "ShikaGari provides listings, seller profiles, and messaging tools. We do not own the vehicles, set final prices, or complete sales — agreements are made directly between buyers and sellers.",
  },
  {
    title: "Accounts and verification",
    copy: "You must provide accurate details when registering. Individual sellers list from their own account and must submit their identity details and an NTSA e-logbook; an admin verifies each listing before it is published. Dealers publish immediately once their dealer profile is approved.",
  },
  {
    title: "Listings",
    copy: "Sellers must only list vehicles they are entitled to sell, with accurate descriptions, pricing in KES, photos, and location. Misleading listings, duplicate spam, or off-platform fraud may lead to removal or suspension.",
  },
  {
    title: "Inquiries and contact",
    copy: "Use inquiry messaging for genuine purchase interest. Do not share false information, harass other users, or attempt to bypass safety guidance. Meet in public places and verify logbooks before payment.",
  },
  {
    title: "Suspension and removal",
    copy: "We may remove listings or suspend accounts that breach these terms, submit false verification documents, or misuse the platform.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-neutral-200">
        <PageWrapper className="py-16">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Icon name="info" size={16} />
              Terms of use
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-neutral-900 mt-4">
              Terms of use
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed mt-4">
              Last updated {new Date().getFullYear()}. By using ShikaGari you agree to the rules below.
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
          Questions about these terms?{" "}
          <Link href="/contact" className="font-medium text-neutral-900 hover:underline">
            Contact us
          </Link>
          .
        </p>
      </PageWrapper>
    </div>
  );
}
