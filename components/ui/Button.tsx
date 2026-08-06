import Link from "next/link";
import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset] hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0",
  secondary:
    "border border-border bg-surface-raised text-ink hover:border-brand-300 hover:text-brand-700 hover:-translate-y-0.5 dark:hover:text-brand-300",
  ghost: "text-ink-muted hover:text-brand-600",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const classes = `${base} ${variants[variant]} ${disabled ? "pointer-events-none opacity-60" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
