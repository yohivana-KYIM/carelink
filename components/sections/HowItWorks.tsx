import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { howItWorksSteps } from "@/lib/site-config";

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="scroll-mt-24 py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Mise en route"
          title="Comment ça marche ?"
          description="Trois étapes suffisent pour que votre cabinet passe aux rappels automatiques par WhatsApp."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.1}>
              <div className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-surface-raised p-6 shadow-card">
                <span className="text-4xl font-bold text-brand-200 dark:text-brand-800">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                </div>
                {step.image ? (
                  <div className="relative mt-2 aspect-[768/1376] w-full max-w-[220px] self-center overflow-hidden rounded-2xl shadow-card">
                    <Image
                      src={step.image}
                      alt="Écran mobile Carelink : formulaire de création de compte cabinet"
                      fill
                      sizes="220px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
