import {
  BellRing,
  CheckCheck,
  LayoutDashboard,
  RefreshCcw,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/RevealGroup";
import { ArcRing, DotGrid, SoftOrb } from "@/components/ui/GeometricDecor";
import { features } from "@/lib/site-config";

const iconMap: Record<string, LucideIcon> = {
  BellRing,
  RefreshCcw,
  CheckCheck,
  LayoutDashboard,
  UserRound,
  ShieldCheck,
};

export function Features() {
  return (
    <section id="fonctionnalites" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
      <SoftOrb className="absolute -left-24 top-10 hidden h-72 w-72 bg-brand-200/40 dark:bg-brand-800/20 lg:block" />
      <ArcRing className="absolute -right-16 top-24 hidden h-56 w-56 text-brand-300/50 dark:text-brand-700/40 lg:block" />
      <DotGrid className="absolute bottom-10 right-[8%] hidden h-28 w-28 text-brand-300/40 dark:text-brand-700/40 xl:block" />

      <Container className="relative flex flex-col gap-14">
        <SectionHeading
          eyebrow="Fonctionnalités"
          title="Un outil pensé pour votre cabinet"
          description="Chaque fonctionnalité répond à un besoin concret du cahier des charges : moins de no-show, plus de patients réactivés, une équipe qui garde le contrôle."
        />

        <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <RevealItem key={feature.title}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-surface-raised p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200/80 hover:shadow-xl dark:hover:border-brand-800/80">
                  {/* Lueur de fond au hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-50/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-brand-500/10" />
                  <span className="relative flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-md dark:bg-brand-500/10 dark:text-brand-400">
                    <Icon size={20} />
                  </span>
                  <h3 className="relative mt-5 text-lg font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-ink-muted">
                    {feature.description}
                  </p>
                  {/* Barre colorée en bas */}
                  <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500 group-hover:w-full rounded-b-2xl" />
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
