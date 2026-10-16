"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealGroup, RevealItem } from "@/components/ui/RevealGroup";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { specialtyBlocks, relanceExamples } from "@/lib/site-config";
import { useLocale } from "@/lib/i18n";

export function Specialties() {
  const { t } = useLocale();
  return (
    <section id="specialites" className="scroll-mt-24 py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          title={t("specialties.title", "Pour tous les cabinets qui vivent au rythme des rendez-vous")}
          description={t(
            "specialties.intro",
            "Ecotocare est conçu pour les médecins et spécialistes qui ont leur propre cabinet. Le rappel de rendez-vous convient à toutes les spécialités. La relance des patients se règle selon le rythme de suivi propre à votre discipline, par type de soin."
          )}
        />

        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {specialtyBlocks.map((block) => (
            <RevealItem key={block.key}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface-raised p-6 shadow-card">
                <div>
                  <h3 className="text-lg font-semibold text-ink">
                    {t(`specialties.${block.key}.title`, block.title)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {t(`specialties.${block.key}.tagline`, block.tagline)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {block.specialties.map((specialty, index) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                    >
                      {t(`specialties.${block.key}.items.${index}`, specialty)}
                    </span>
                  ))}
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-surface text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-5 py-3">{t("specialties.table.specialty", "Spécialité")}</th>
                  <th className="px-5 py-3">
                    {t("specialties.table.example", "Exemple de rappel ou de relance paramétrable")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface-raised">
                {relanceExamples.map((row) => (
                  <tr key={row.key}>
                    <td className="px-5 py-3 font-medium text-ink">
                      {t(`specialties.examples.${row.key}.specialty`, row.specialty)}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {t(`specialties.examples.${row.key}.example`, row.example)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink-soft">
            {t(
              "specialties.disclaimer",
              "Le délai de relance est fixé par le cabinet. Ecotocare n'émet aucune recommandation médicale."
            )}
          </p>
        </Reveal>

        <Reveal className="flex flex-col items-center gap-5 text-center">
          <p className="max-w-xl text-balance text-base leading-relaxed text-ink-muted">
            {t(
              "specialties.notListed",
              "Votre spécialité n'est pas dans la liste ? Ecotocare convient à tout cabinet qui travaille sur rendez-vous. Parlons-en."
            )}
          </p>
          <Button href="/contact">{t("hero.cta.demo", "Demander une démo")}</Button>
        </Reveal>
      </Container>
    </section>
  );
}
