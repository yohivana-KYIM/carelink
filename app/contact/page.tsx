import type { Metadata } from "next";
import { Hero2 } from "@/components/sections/Hero2";
import { ContactForm } from "@/components/sections/ContactForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'équipe Carelink pour planifier une démonstration ou poser vos questions sur les rappels et relances patients par WhatsApp.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <Hero2
        badgeLabel="Contact"
        eyebrow={`Parlons de votre cabinet`}
        title="Discutons de vos rendez-vous et relances patients"
        description={`Une question sur ${siteConfig.name}, une démo à planifier ? Écrivez-nous ci-dessous, notre équipe vous répond rapidement.`}
        primaryCta={null}
        secondaryCta={null}
        checklist={[]}
        compact
      />
      <ContactForm />
    </>
  );
}
