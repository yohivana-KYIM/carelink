"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { DotGrid, QuarterArc } from "@/components/ui/GeometricDecor";
import { faqItems } from "@/lib/site-config";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
      <QuarterArc className="absolute -left-4 -top-4 hidden h-24 w-24 -scale-x-100 text-brand-300/60 dark:text-brand-700/50 sm:block" />
      <DotGrid className="absolute bottom-6 left-[6%] hidden h-24 w-24 text-brand-300/40 dark:text-brand-700/40 lg:block" />

      <Container className="relative flex flex-col gap-14">
        <SectionHeading
          eyebrow="Questions fréquentes"
          title="Ce que les cabinets nous demandent le plus"
          description="Consentement patient, conformité, coûts WhatsApp : les réponses aux questions les plus courantes avant de démarrer."
        />

        <div className="mx-auto flex w-full max-w-3xl flex-col divide-y divide-border">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={item.question} delay={index * 0.03}>
                <div className="py-2">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="text-base font-semibold text-ink sm:text-lg">
                      {item.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                    >
                      <Plus size={16} />
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? "auto" : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pr-10 text-sm leading-relaxed text-ink-muted sm:text-base">
                      {item.answer}
                    </p>
                  </motion.div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
