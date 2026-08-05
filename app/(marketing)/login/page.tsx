import type { Metadata } from "next";
import { LoginForm } from "@/components/sections/LoginForm";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace Carelink pour gérer les rendez-vous et relances de votre cabinet.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
