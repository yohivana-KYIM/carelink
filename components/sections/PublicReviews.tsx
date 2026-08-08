"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Star, ThumbsUp, ThumbsDown, Loader2, MessageSquarePlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { api, type Testimonial } from "@/lib/api";

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-amber-400 text-amber-400" : "text-border"}
        />
      ))}
    </div>
  );
}

export function PublicReviews() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactedIds, setReactedIds] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ authorName: "", authorRole: "", rating: 5, message: "" });

  useEffect(() => {
    api.listTestimonials()
      .then((r) => setReviews(r.testimonials))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleReact(id: string, kind: "like" | "dislike") {
    if (reactedIds.has(id)) return;
    setReactedIds((prev) => new Set(prev).add(id));
    try {
      const res = kind === "like" ? await api.likeTestimonial(id) : await api.dislikeTestimonial(id);
      setReviews((prev) => prev.map((t) => (t.id === id ? res.testimonial : t)));
    } catch {
      toast.error("Impossible d'enregistrer votre réaction");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitTestimonial(form);
      setSubmitted(true);
      setForm({ authorName: "", authorRole: "", rating: 5, message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'envoi de votre avis");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="avis" className="scroll-mt-24 py-20 sm:py-28">
      <Container className="flex flex-col gap-10">
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-4xl">
            Avis de nos utilisateurs
          </h2>
          <p className="max-w-xl text-balance text-base text-ink-muted">
            Des retours vérifiés de cabinets qui utilisent Ecotocare au quotidien.
          </p>
        </Reveal>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-ink-soft" size={24} />
          </div>
        ) : reviews.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((t) => (
              <div key={t.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-raised p-6">
                <Stars rating={t.rating} />
                <p className="flex-1 text-sm leading-relaxed text-ink">{t.message}</p>
                <div>
                  <p className="text-sm font-semibold text-ink">{t.authorName}</p>
                  {t.authorRole ? <p className="text-xs text-ink-soft">{t.authorRole}</p> : null}
                </div>
                <div className="flex items-center gap-4 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => handleReact(t.id, "like")}
                    disabled={reactedIds.has(t.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-brand-600 disabled:opacity-50"
                  >
                    <ThumbsUp size={14} /> {t.likes}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReact(t.id, "dislike")}
                    disabled={reactedIds.has(t.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-red-600 disabled:opacity-50"
                  >
                    <ThumbsDown size={14} /> {t.dislikes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-ink-soft">Aucun avis publié pour le moment.</p>
        )}

        <Reveal className="mx-auto w-full max-w-lg">
          {submitted ? (
            <p className="rounded-2xl border border-border bg-surface-raised p-6 text-center text-sm text-ink-muted">
              Merci pour votre avis ! Il sera visible ici après validation par notre équipe.
            </p>
          ) : formOpen ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-raised p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  placeholder="Votre nom"
                  value={form.authorName}
                  onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                  className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none"
                />
                <input
                  placeholder="Rôle / cabinet (optionnel)"
                  value={form.authorRole}
                  onChange={(e) => setForm((f) => ({ ...f, authorRole: e.target.value }))}
                  className="rounded-full border border-border bg-background px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button key={i} type="button" onClick={() => setForm((f) => ({ ...f, rating: i + 1 }))}>
                    <Star
                      size={22}
                      className={i < form.rating ? "fill-amber-400 text-amber-400" : "text-border"}
                    />
                  </button>
                ))}
              </div>
              <textarea
                required
                rows={4}
                minLength={10}
                placeholder="Votre avis..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-ink placeholder:text-ink-soft focus:border-brand-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-70"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                Envoyer mon avis
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="mx-auto inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-raised"
            >
              <MessageSquarePlus size={16} /> Laisser un avis
            </button>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
