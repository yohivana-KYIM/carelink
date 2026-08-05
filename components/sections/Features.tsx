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
                <div className="group h-full rounded-2xl border border-border bg-surface-raised p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg dark:hover:border-brand-800">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {feature.description}
                  </p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
