import Image from "next/image";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { highlightChecklist } from "@/lib/site-config";

export function FeatureHighlight() {
  return (
    <section id="automatisation" className="scroll-mt-24 py-20 sm:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionHeading
            align="left"
            eyebrow="Automatisation"
            title="Des rappels qui ne dorment jamais"
            description="Le système de tâches planifiées d'Ecotocare déclenche les rappels et les relances au bon moment, sans intervention manuelle — et journalise chaque envoi pour la traçabilité."
          />

          <ul className="flex flex-col gap-4">
            {highlightChecklist.map((item, index) => (
              <Reveal key={item} delay={index * 0.06}>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed text-ink-muted sm:text-base">
                    {item}
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal
          delay={0.35}
          className="relative mx-auto aspect-[1402/1122] w-full max-w-xl overflow-hidden rounded-[2rem] shadow-card"
        >
          <Image
            src="/images/patient.png"
            alt="Patient recevant un rappel de rendez-vous par WhatsApp et le confirmant en un clic"
            fill
            sizes="(min-width: 1024px) 560px, 420px"
            className="object-cover"
          />
        </Reveal>
      </Container>
    </section>
  );
}
