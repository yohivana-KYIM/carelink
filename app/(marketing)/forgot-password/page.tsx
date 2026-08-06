import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/sections/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisez le mot de passe de votre compte Ecotocare.",
  alternates: {
    canonical: "/forgot-password",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
