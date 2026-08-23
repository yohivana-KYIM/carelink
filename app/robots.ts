import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Espaces applicatifs privés et pages utilitaires sans valeur SEO
      // (la dernière contient en plus un ?token= qui ne doit jamais être indexé).
      disallow: ["/dashboard", "/admin", "/login", "/forgot-password", "/reset-password"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
