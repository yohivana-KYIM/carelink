import { ShieldCheck, MonitorSmartphone, Lock, ThumbsUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealGroup, RevealItem } from "@/components/ui/RevealGroup";
import { trustPoints } from "@/lib/site-config";

const icons = [ShieldCheck, Lock, ThumbsUp, MonitorSmartphone];

export function TrustBar() {
  return (
    <section id="securite" className="scroll-mt-24 py-12">
      <Container>
        <div className="rounded-[2rem] border border-border bg-surface-raised p-6 shadow-card">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">
                API WhatsApp Business (Meta)
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Messagerie sécurisée, conforme et sans engagement
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
              Un encadrement clair de votre service : sécurité des données, conformité RGPD, et compatibilité sur tous les navigateurs.
            </p>
          </div>

          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustPoints.map((point, index) => {
              const Icon = icons[index % icons.length];
              return (
                <RevealItem
                  key={point.title}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-sm transition duration-300 hover:border-brand-200 hover:bg-surface-raised dark:hover:border-brand-700"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                      <Icon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{point.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{point.description}</p>
                    </div>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
