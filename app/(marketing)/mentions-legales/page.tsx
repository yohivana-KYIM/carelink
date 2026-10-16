import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ToConfirm } from "@/components/ui/ToConfirm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Ecotocare : éditeur, hébergeur, propriété intellectuelle, droit applicable.",
  alternates: {
    canonical: "/mentions-legales",
  },
  robots: { index: true, follow: true },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-base leading-relaxed text-ink-muted">{children}</p>;
}

export default function LegalNoticePage() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
          {siteConfig.name}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Mentions légales</h1>

        <H2>Éditeur du site</H2>
        <P>
          Le site {siteConfig.url.replace("https://", "")} est édité par{" "}
          <ToConfirm>raison sociale complète, forme juridique et numéro RCCM de MarketYou à confirmer</ToConfirm>,
          dont le siège est situé à Bonamoussadi, Douala, Cameroun.
        </P>
        <P>
          Directeur de la publication : <ToConfirm>nom à confirmer</ToConfirm>. Contact : infos@marketsyou.com.
        </P>

        <H2>Hébergeur</H2>
        <P>OVH SAS — 2 rue Kellermann, 59100 Roubaix, France. www.ovh.com.</P>

        <H2>Propriété intellectuelle</H2>
        <P>
          Le nom Ecotocare, le logo, les textes, les images et les autres éléments du site sont la propriété de{" "}
          MarketYou ou de ses partenaires. Toute reproduction sans autorisation écrite est interdite.
        </P>

        <H2>Nature du service</H2>
        <P>
          Ecotocare est un outil de communication administrative (rappels de rendez-vous et relances). Il ne
          fournit ni avis médical ni acte médical. Les informations du site sont données à titre indicatif et
          peuvent être modifiées.
        </P>

        <H2>Marques</H2>
        <P>
          WhatsApp et Meta sont des marques de leurs propriétaires respectifs. Ecotocare est un service
          indépendant.
        </P>

        <H2>Données personnelles</H2>
        <P>
          Le traitement des données personnelles est décrit dans notre{" "}
          <Link href="/confidentialite" className="font-medium text-brand-600 underline dark:text-brand-400">
            politique de confidentialité
          </Link>
          , accessible depuis le pied de page.
        </P>

        <H2>Droit applicable</H2>
        <P>
          Le site est soumis au droit camerounais. En cas de litige, les tribunaux de{" "}
          <ToConfirm>Douala, à confirmer avec un juriste</ToConfirm> sont compétents.
        </P>
      </Container>
    </section>
  );
}
