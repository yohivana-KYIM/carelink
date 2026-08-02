"use client";

import Link from "next/link";

export function HoverLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative inline-block overflow-hidden py-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink ${className}`}
    >
      <span className="block transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full text-brand-600 transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-y-0 dark:text-brand-400"
      >
        {children}
      </span>
    </Link>
  );
}
