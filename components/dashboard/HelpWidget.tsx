"use client";

import Link from "next/link";
import { useState } from "react";
import { HelpCircle, X, MessageCircleQuestion, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="w-72 rounded-2xl border border-border bg-surface-raised p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Besoin d&apos;aide ?</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-full p-1 text-ink-muted hover:bg-surface"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/#faq"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm text-ink transition-colors hover:bg-surface"
              >
                <MessageCircleQuestion size={16} className="text-brand-600" />
                Questions fréquentes
              </Link>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm text-ink transition-colors hover:bg-surface"
              >
                <Mail size={16} className="text-brand-600" />
                Contacter le support
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ouvrir l'aide"
        aria-expanded={open}
        className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-colors hover:bg-brand-700 active:scale-95"
      >
        {open ? <X size={20} /> : <HelpCircle size={20} />}
      </button>
    </div>
  );
}
