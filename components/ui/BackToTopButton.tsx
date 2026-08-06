"use client";

import { ArrowUp, X, Send } from "lucide-react";
import { type SVGProps, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

const SIZE = 44;
const STROKE = 3;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.88 11.71c-.26-.13-1.53-.76-1.77-.84-.24-.08-.42-.13-.6.13-.18.26-.7.84-.86 1.01-.16.17-.32.19-.59.07-.26-.13-1.1-.4-2.09-1.29-.77-.69-1.29-1.53-1.44-1.79-.15-.26-.02-.4.12-.53.13-.13.28-.32.42-.48.14-.16.19-.26.28-.43.09-.17.05-.32-.02-.45-.08-.13-.6-1.43-.82-1.96-.22-.53-.44-.46-.6-.47-.15-.01-.33-.01-.51-.01-.18 0-.46.07-.7.32-.24.24-.94.92-.94 2.25 0 1.32.96 2.6 1.1 2.78.13.17 1.9 2.91 4.61 4.08.64.28 1.14.45 1.53.58.64.22 1.22.19 1.68.12.51-.08 1.53-.62 1.73-1.22.2-.6.2-1.12.14-1.22-.06-.1-.24-.16-.5-.29z" />
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.9.56 3.66 1.52 5.17L2 22l4.98-1.51A9.953 9.953 0 0022 12c0-5.52-4.48-10-10-10zm0 18c-1.53 0-3.02-.37-4.32-1.01l-.31-.17-2.95.9.99-2.71-.2-.35A7.965 7.965 0 014 12c0-4.41 3.59-8 8-8 4.41 0 8 3.59 8 8s-3.59 8-8 8z" />
    </svg>
  );
}

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? scrollTop / scrollable : 0;
      setProgress(Math.min(Math.max(ratio, 0), 1));
      setVisible(scrollTop > 480);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsChatOpen(false);
      }
    }
    if (isChatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatOpen]);

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const phone = "237659037423";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setMessage("");
    setIsChatOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-4 sm:right-6 lg:right-8">
      
      {/* Fenêtre Assistant WhatsApp */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[320px] rounded-3xl bg-surface-raised shadow-2xl border border-border overflow-hidden flex flex-col mb-2 origin-bottom-right"
          >
            {/* Header du chat */}
            <div className="bg-[#128C7E] px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative size-10 rounded-full bg-white flex items-center justify-center p-1">
                  <Image src="/images/ecotocare-icon.png" alt="Ecotocare" width={32} height={32} className="rounded-full" />
                  <div className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400 border-2 border-white" />
                </div>
                <div className="text-white">
                  <h3 className="font-semibold text-sm">Équipe Ecotocare</h3>
                  <p className="text-xs opacity-90">Répond en général vite</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            {/* Corps du chat */}
            <div className="bg-[#E5DDD5] dark:bg-brand-950/30 p-4 min-h-[200px] flex flex-col gap-3 relative">
              {/* Message bulles */}
              <div className="bg-white dark:bg-surface-raised rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[90%] text-sm text-ink relative z-10">
                Bonjour ! 👋<br/><br/>
                Bienvenue sur Ecotocare. Avez-vous besoin d'une démo ou d'informations sur la plateforme ?
                <span className="block text-[10px] text-ink-soft text-right mt-1">À l'instant</span>
              </div>
            </div>

            {/* Input du chat */}
            <div className="bg-surface p-3 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Écrivez un message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-ink focus:border-[#128C7E] focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#128C7E] text-white transition-colors hover:bg-[#075E54] disabled:opacity-50 disabled:hover:bg-[#128C7E]"
                >
                  <Send size={16} className="-ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`flex items-center gap-3 rounded-full bg-surface-raised p-2 shadow-card transition-all duration-300 ${
          visible || isChatOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Retour en haut de page"
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-background text-ink-muted transition-colors duration-300 hover:text-brand-600 dark:hover:text-brand-400"
        >
          <svg
            aria-hidden
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="absolute inset-0 -rotate-90"
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              className="stroke-border"
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="stroke-brand-600 transition-[stroke-dashoffset] duration-150 ease-linear dark:stroke-brand-400"
            />
          </svg>
          <ArrowUp size={18} className="relative" />
        </button>

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="flex h-11 items-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#128C7E] shadow-[0_4px_14px_rgba(37,211,102,0.39)]"
        >
          <WhatsappIcon className="h-5 w-5" />
          WhatsApp
        </button>
      </div>
    </div>
  );
}
