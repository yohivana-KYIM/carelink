import { type ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-700 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-300">
      {children}
    </span>
  );
}
