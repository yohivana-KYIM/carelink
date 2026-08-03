type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export function TestimonialColumn({
  items,
  direction = "up",
  duration = 34,
  className = "",
}: {
  items: ReadonlyArray<Testimonial>;
  direction?: "up" | "down";
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`relative h-[560px] overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-surface to-transparent" />

      <div
        className="testimonial-track flex flex-col gap-5 will-change-transform"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: direction === "down" ? "reverse" : "normal",
        }}
      >
        <div className="flex flex-col gap-5">
          {items.map((item) => (
            <TestimonialCard key={item.name} {...item} />
          ))}
        </div>
        <div className="flex flex-col gap-5" aria-hidden="true">
          {items.map((item) => (
            <TestimonialCard key={item.name} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, name, role }: Testimonial) {
  const initials = name
    .replace("Dr. ", "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-border bg-surface-raised/80 p-6 shadow-card transition-transform duration-500 hover:-translate-y-1">
      <p className="text-sm leading-relaxed text-ink-muted">{quote}</p>
      <div className="mt-5 flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
          {initials}
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-ink">{name}</p>
          <p className="text-xs text-ink-soft">{role}</p>
        </div>
      </div>
    </div>
  );
}
