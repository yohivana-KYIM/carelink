import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { TestimonialColumn } from "@/components/ui/TestimonialColumn";
import { testimonials } from "@/lib/site-config";

export function Testimonials() {
  const columns = [
    testimonials.filter((_, index) => index % 3 === 0),
    testimonials.filter((_, index) => index % 3 === 1),
    testimonials.filter((_, index) => index % 3 === 2),
  ];

  return (
    <section
      id="temoignages"
      className="scroll-mt-24 overflow-hidden py-20 sm:py-28"
    >
      <Container className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          <TestimonialColumn items={columns[0]} direction="up" duration={30} />
          <TestimonialColumn
            items={columns[1]}
            direction="down"
            duration={38}
            className="hidden sm:block"
          />
          <TestimonialColumn
            items={columns[2]}
            direction="up"
            duration={26}
            className="hidden lg:block"
          />
        </div>

        <div className="flex flex-col items-start gap-5">
          <Reveal>
            <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
              Pensé avec des professionnels dentaires
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="text-balance text-base leading-relaxed text-ink-muted sm:text-lg">
              Carelink est conçu à partir des retours de cabinets dentaires
              sur leur quotidien : rappels, relances et suivi patient, sans
              complexité inutile.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <Button href="/contact">Demander une démo</Button>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
