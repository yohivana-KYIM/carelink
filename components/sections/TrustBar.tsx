import { ShieldCheck, MonitorSmartphone, Lock, ThumbsUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { RevealGroup, RevealItem } from "@/components/ui/RevealGroup";
import { trustPoints } from "@/lib/site-config";

const icons = [ShieldCheck, Lock, ThumbsUp, MonitorSmartphone];

export function TrustBar() {
  return (
    <section id="securite" className="scroll-mt-24 border-y border-border py-12">
      <Container>
        <RevealGroup className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point, index) => {
            const Icon = icons[index % icons.length];
            return (
              <RevealItem key={point.title} className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{point.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{point.description}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
