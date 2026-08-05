import { Clock3, XCircle } from "lucide-react";
import type { Cabinet } from "@/lib/api";

export function PendingGate({ cabinet }: { cabinet: Cabinet | null }) {
  const isRejected = cabinet?.status === "REJECTED";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span
        className={`flex size-14 items-center justify-center rounded-full ${
          isRejected
            ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
            : "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
        }`}
      >
        {isRejected ? <XCircle size={26} /> : <Clock3 size={26} />}
      </span>
      <h1 className="text-xl font-semibold text-ink">
        {isRejected ? "Demande refusée" : "Compte en attente de validation"}
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-ink-muted">
        {isRejected
          ? `Votre demande d'inscription pour le cabinet "${cabinet?.name}" a été refusée. Contactez notre équipe pour plus d'informations.`
          : `Votre compte pour le cabinet "${cabinet?.name}" a bien été créé et est en attente de validation par notre équipe. Vous recevrez un email dès que votre compte sera activé.`}
      </p>
    </div>
  );
}
