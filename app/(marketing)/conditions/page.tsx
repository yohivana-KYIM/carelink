import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Conditions d'utilisation du service Ecotocare.",
  alternates: {
    canonical: "/conditions",
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
          Ecotocare
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Conditions d&apos;utilisation
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
          Les conditions d&apos;utilisation d&apos;Ecotocare sont en cours de finalisation avec notre conseil
          juridique. Cette page sera mise à jour avant l&apos;ouverture commerciale du service. Pour toute question
          en attendant, contactez-nous.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
        >
          Nous contacter
        </Link>
      </Container>
    </section>
  );
}
