import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/RevealGroup";
import { ArcRing, SoftOrb } from "@/components/ui/GeometricDecor";
import { resources } from "@/lib/site-config";

export function Resources() {
  return (
    <section id="ressources" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
      <SoftOrb className="absolute -right-20 bottom-0 hidden h-64 w-64 bg-brand-200/40 dark:bg-brand-800/20 lg:block" />
      <ArcRing className="absolute -bottom-16 left-[4%] hidden h-40 w-40 text-brand-300/50 dark:text-brand-700/40 lg:block" />

      <Container className="relative flex flex-col gap-14">
        <SectionHeading
          eyebrow="Ressources"
          title="Pour aller plus loin"
          description="Des repères pratiques sur la gestion de cabinet, la conformité et WhatsApp Business, à venir sur notre centre de ressources."
        />

        <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <RevealItem key={resource.title}>
              <article className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface-raised p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200/80 hover:shadow-xl dark:hover:border-brand-800/80">
                {/* Fond gradient au hover */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-brand-500/8" />
                <span className="relative w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                  {resource.tag}
                </span>
                <h3 className="relative text-lg font-semibold leading-snug text-ink">
                  {resource.title}
                </h3>
                <p className="relative text-sm leading-relaxed text-ink-muted">
                  {resource.excerpt}
                </p>
                <span className="relative mt-auto flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-400">
                  Bientôt disponible
                  <ArrowUpRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
                {/* Barre colorée bas */}
                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500 group-hover:w-full rounded-b-2xl" />
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
