"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, ThumbsUp, ThumbsDown, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "@/lib/session";
import { api, type Testimonial } from "@/lib/api";

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-ink-soft">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < rating ? "fill-amber-400 text-amber-400" : "text-border"} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { token } = useSession();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.adminListTestimonials(token);
      setTestimonials(res.testimonials);
    } catch {
      toast.error("Impossible de charger les avis.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleToggleVisible(t: Testimonial) {
    if (!token) return;
    setBusyId(t.id);
    try {
      const res = await api.adminSetTestimonialVisibility(token, t.id, !t.visible);
      setTestimonials((prev) => prev.map((x) => (x.id === t.id ? res.testimonial : x)));
      toast.success(res.testimonial.visible ? "Avis publié" : "Avis masqué");
    } catch {
      toast.error("Échec de la mise à jour");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm("Supprimer définitivement cet avis ?")) return;
    setBusyId(id);
    try {
      await api.adminDeleteTestimonial(token, id);
      setTestimonials((prev) => prev.filter((x) => x.id !== id));
      toast.success("Avis supprimé");
    } catch {
      toast.error("Échec de la suppression");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8 p-4 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">Avis publics</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Modérez les avis soumis depuis le site vitrine. Seuls les avis publiés sont visibles publiquement.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-ink-soft">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : testimonials.length === 0 ? (
        <p className="text-sm text-ink-soft">Aucun avis pour le moment.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {testimonials.map((t) => (
            <div key={t.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-raised p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{t.authorName}</p>
                    {t.authorRole ? <p className="text-xs text-ink-soft">· {t.authorRole}</p> : null}
                  </div>
                  <Stars rating={t.rating} />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    t.visible
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                  }`}
                >
                  {t.visible ? "Publié" : "En attente"}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-ink">{t.message}</p>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-4 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-1"><ThumbsUp size={13} /> {t.likes}</span>
                  <span className="inline-flex items-center gap-1"><ThumbsDown size={13} /> {t.dislikes}</span>
                  <span>{new Date(t.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(t)}
                    disabled={busyId === t.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-50"
                  >
                    {t.visible ? <EyeOff size={13} /> : <Eye size={13} />}
                    {t.visible ? "Masquer" : "Publier"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    disabled={busyId === t.id}
                    aria-label="Supprimer"
                    className="text-ink-soft transition-colors hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
