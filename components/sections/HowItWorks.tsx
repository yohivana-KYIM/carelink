import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { HalfArc, RingDot } from "@/components/ui/GeometricDecor";
import { howItWorksSteps } from "@/lib/site-config";

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
      <HalfArc className="absolute -top-10 left-1/2 hidden h-64 w-64 -translate-x-1/2 -scale-y-100 text-brand-200/60 dark:text-brand-800/50 sm:block" />
      <RingDot className="absolute right-[10%] top-16 hidden h-16 w-16 text-brand-400/50 dark:text-brand-600/50 lg:block" />

      <Container className="relative flex flex-col gap-14">
        <SectionHeading
          eyebrow="Mise en route"
          title="Comment ça marche ?"
          description="Trois étapes suffisent pour que votre cabinet passe aux rappels automatiques par WhatsApp."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.1}>
              <div className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-surface-raised p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200/80 hover:shadow-xl dark:hover:border-brand-800/80">
                {/* Lueur fond */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-50/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-brand-500/10" />
                <span className="relative text-4xl font-bold text-brand-200 transition-colors duration-300 group-hover:text-brand-300 dark:text-brand-800 dark:group-hover:text-brand-700">
                  {step.number}
                </span>
                <div className="relative">
                  <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                </div>
                {step.image ? (
                  <div className="relative mt-2 aspect-[768/1376] w-full max-w-[220px] self-center overflow-hidden rounded-2xl shadow-card">
                    <Image
                      src={step.image}
                      alt="Écran mobile Ecotocare : formulaire de création de compte cabinet"
                      fill
                      sizes="220px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                {/* Barre colorée bas */}
                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500 group-hover:w-full rounded-b-2xl" />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
