import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/sections/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
  description: "Choisissez un nouveau mot de passe pour votre compte Carelink.",
  alternates: {
    canonical: "/reset-password",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
