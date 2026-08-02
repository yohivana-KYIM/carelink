import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBanner() {
  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-brand-900 px-6 py-16 text-center sm:px-16 sm:py-20">
          <Image
            src="/images/cta-background.jpeg"
            alt=""
            fill
            sizes="1200px"
            className="object-cover opacity-40"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-900/85 to-brand-700/80" />

          <div className="relative flex flex-col items-center gap-6">
            <Reveal>
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                Prêt à réduire vos rendez-vous manqués ?
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-xl text-balance text-base text-brand-100 sm:text-lg">
                Demandez une démo personnalisée et découvrez comment Carelink
                s&apos;intègre à votre agenda et à votre numéro WhatsApp
                Business en quelques jours.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button href="mailto:contact@carelink.app" variant="primary" className="bg-white text-brand-800 hover:bg-brand-50 hover:text-brand-900">
                  Demander une démo
                </Button>
                <Button
                  href="#faq"
                  variant="secondary"
                  className="border-white/30 bg-transparent text-white hover:border-white hover:text-white"
                >
                  Consulter la FAQ
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
