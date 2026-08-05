type ShapeProps = {
  className?: string;
};

/**
 * Anneau complet en pointillés — accent décoratif discret.
 */
export function ArcRing({ className = "" }: ShapeProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
    >
      <circle
        cx="100"
        cy="100"
        r="97"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 11"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Arc de cercle ouvert (demi-anneau) — accent directionnel.
 */
export function HalfArc({ className = "" }: ShapeProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
    >
      <path
        d="M6 100a94 94 0 0 1 188 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Petit quart de cercle épais — accent d'angle.
 */
export function QuarterArc({ className = "" }: ShapeProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 120"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
    >
      <path d="M4 4a116 116 0 0 1 112 112" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Grille de points — texture décorative.
 */
export function DotGrid({ className = "", size = 6 }: ShapeProps & { size?: number }) {
  const cells = Array.from({ length: size * size }, (_, i) => ({
    row: Math.floor(i / size),
    col: i % size,
  }));
  const gap = 100 / (size - 1);

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      fill="currentColor"
      className={`pointer-events-none select-none ${className}`}
    >
      {cells.map(({ row, col }) => (
        <circle key={`${row}-${col}`} cx={col * gap} cy={row * gap} r="1.6" />
      ))}
    </svg>
  );
}

/**
 * Cercle plein flouté — halo de couleur discret.
 */
export function SoftOrb({ className = "" }: ShapeProps) {
  return <div aria-hidden className={`pointer-events-none select-none rounded-full blur-3xl ${className}`} />;
}

/**
 * Petit cercle fin — puce décorative isolée.
 */
export function RingDot({ className = "" }: ShapeProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 40"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
    >
      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
