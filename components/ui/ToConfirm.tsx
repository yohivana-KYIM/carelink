import { type ReactNode } from "react";

export function ToConfirm({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-amber-200/70 px-1 py-0.5 text-ink dark:bg-amber-400/25 dark:text-ink">
      {children}
    </mark>
  );
}
