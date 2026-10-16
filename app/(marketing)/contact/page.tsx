import type { Metadata } from "next";
import { ContactHero } from "@/components/sections/ContactHero";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'équipe Ecotocare pour planifier une démonstration ou poser vos questions sur les rappels et relances patients par WhatsApp.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactForm />
    </>
  );
}
