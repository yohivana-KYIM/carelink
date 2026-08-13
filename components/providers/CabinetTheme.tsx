"use client";

import { useEffect } from "react";
import { applyBrandPalette } from "@/lib/theme";

/**
 * Applique la couleur de marque du cabinet (si configurée dans ses paramètres)
 * à toute l'interface, en surchargeant les variables CSS --color-brand-*.
 * Ne rend rien à l'écran — composant purement fonctionnel.
 */
export function CabinetTheme({ primaryColor }: { primaryColor?: string | null }) {
  useEffect(() => {
    applyBrandPalette(primaryColor);
    return () => applyBrandPalette(null);
  }, [primaryColor]);

  return null;
}
