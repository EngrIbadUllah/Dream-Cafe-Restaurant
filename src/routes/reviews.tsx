import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/site/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Star, MessageSquareQuote } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Dream Cafe & Restaurant Shakargarh" },
      { name: "description", content: "Read what guests are saying about Dream Cafe & Restaurant, Shakargarh — and share your own experience." },
      { property: "og:title", content: "Guest Reviews — Dream Cafe" },
      { property: "og:description", content: "Real guest stories from Dream Cafe." },
    ],
  }),
  component: ReviewsPage,
});

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional().or(z.literal("")),
  comment: z.string().trim().min(10, "Please write a bit more").max(1000),
});

function ReviewsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["reviews", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id,rating,title,comment,customer_name,created_at,is_featured")
        .eq("is_approved", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
  });

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const parsed = schema.parse({ rating, title, comment });
      const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Guest";
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        customer_name: displayName,
        rating: parsed.rating,
        title: parsed.title || null,
        comment: parsed.comment,
      });
      if (error) throw error;
      toast.success("Thanks! Your review will appear once approved.");
      setTitle(""); setComment(""); setRating(5);
      qc.invalidateQueries({ queryKey: ["reviews", "public"] });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const avg = data && data.length ? (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1) : null;

  return (
    <SiteShell>
      <section className="pt-28 pb-8 sm:pt-32">
        <div className="container-page text-center">
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">
            Loved by <span className="italic text-gold">our guests.</span>
          </h1>
          {avg && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5">
              <Stars value={Math.round(Number(avg))} />
              <span className="font-display text-lg">{avg}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{data!.length} reviews</span>
            </div>
          )}
        </div>
      </section>

      <section className="container-page pb-16">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-[1.5rem] bg-muted" />)}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border py-20 text-center">
            <MessageSquareQuote className="mx-auto text-gold" size={36} />
            <p className="mt-4 font-display text-2xl">Be the first to leave a review</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data!.map((r) => (
              <article key={r.id} className="rounded-[1.5rem] border border-border bg-card p-6">
                <Stars value={r.rating} />
                {r.title && <h3 className="mt-3 font-display text-lg">{r.title}</h3>}
                <p className="mt-2 text-sm text-foreground/85">{r.comment}</p>
                <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">— {r.customer_name}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="container-page pb-16">
        <div className="rounded-[2rem] border border-border bg-card p-8 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl">Share your experience</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your review helps other guests. It appears once we approve it.</p>
          {!user ? (
            <div className="mt-6 rounded-2xl border border-border bg-background p-5 text-sm">
              <p className="text-muted-foreground">Please sign in to leave a review.</p>
              <Link to="/auth" search={{ redirect: "/reviews" } as never} className="mt-3 inline-flex rounded-full gradient-gold px-5 py-2.5 text-xs font-semibold text-primary-foreground">Sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Your rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                      <Star size={28} className={n <= rating ? "fill-gold text-gold" : "text-muted-foreground"} />
                    </button>
                  ))}
                </div>
              </div>
              <input maxLength={100} placeholder="Title (optional)" className="input-base" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea required rows={4} maxLength={1000} placeholder="What did you love?" className="input-base" value={comment} onChange={(e) => setComment(e.target.value)} />
              <button disabled={submitting} className="w-full rounded-full gradient-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit review"}
              </button>
            </form>
          )}
        </div>
      </section>
    </SiteShell>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={16} className={i < value ? "fill-gold text-gold" : "text-muted-foreground/40"} />
      ))}
    </div>
  );
}
