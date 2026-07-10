import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { Tag, Sparkles, Clock } from "lucide-react";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Deals — Dream Cafe & Restaurant Shakargarh" },
      { name: "description", content: "Current promotions, seasonal deals and combos at Dream Cafe & Restaurant, Shakargarh." },
      { property: "og:title", content: "Offers — Dream Cafe" },
      { property: "og:description", content: "Save on your favourite dishes with our current offers." },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["offers", "public"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <SiteShell>
      <section className="pt-28 pb-6 sm:pt-32">
        <div className="container-page text-center">
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">
            Tasty deals, <span className="italic text-gold">every day.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Seasonal combos, weekday specials and family bundles — all at Dream Cafe pricing.
          </p>
        </div>
      </section>

      <section className="container-page pb-16">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-[2rem] bg-muted" />
            ))}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border py-24 text-center">
            <Sparkles className="mx-auto text-gold" size={36} />
            <p className="mt-4 font-display text-2xl">No live offers right now</p>
            <p className="mt-1 text-sm text-muted-foreground">Follow us on social media — new deals drop weekly.</p>
            <Link to="/menu" className="mt-6 inline-flex rounded-full gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground">Browse full menu</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data!.map((o) => (
              <article key={o.id} className="group overflow-hidden rounded-[2rem] border border-border bg-card">
                {o.image_url && (
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={o.image_url} alt={o.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full gradient-gold px-3 py-1 text-xs font-semibold text-primary-foreground">
                      <Tag size={12} /> Offer
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-2xl">{o.title}</h3>
                  {o.description && <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>}
                  {o.ends_at && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} /> Ends {new Date(o.ends_at).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mt-5 flex gap-2">
                    <Link to="/menu" className="rounded-full gradient-gold px-5 py-2.5 text-xs font-semibold text-primary-foreground">Order now</Link>
                    {o.link_url && (
                      <a href={o.link_url} target="_blank" rel="noreferrer" className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold">Learn more</a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
