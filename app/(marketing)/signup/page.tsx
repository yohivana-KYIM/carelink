import type { Metadata } from "next";
import { SignupWizard } from "@/components/sections/SignupWizard";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez le compte Carelink de votre cabinet dentaire en quelques étapes.",
  alternates: {
    canonical: "/signup",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignupPage() {
  return <SignupWizard />;
}
