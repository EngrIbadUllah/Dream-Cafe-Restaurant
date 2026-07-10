import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Dream Cafe & Restaurant Shakargarh" },
      { name: "description", content: "Recipes, stories, and updates from the kitchens of Dream Cafe & Restaurant, Shakargarh." },
      { property: "og:title", content: "Blog — Dream Cafe" },
      { property: "og:description", content: "Recipes, stories and updates from Dream Cafe." },
    ],
  }),
  component: BlogListPage,
});

function BlogListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["blog", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id,slug,title,excerpt,cover_image,tags,published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <SiteShell>
      <section className="pt-28 pb-6 sm:pt-32">
        <div className="container-page text-center">
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">
            From our <span className="italic text-gold">kitchen journal.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Recipes, chef's notes, community stories, and the occasional behind-the-scenes.
          </p>
        </div>
      </section>

      <section className="container-page pb-16">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-[2rem] bg-muted" />
            ))}
          </div>
        ) : (data?.length ?? 0) === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border py-24 text-center">
            <BookOpen className="mx-auto text-gold" size={36} />
            <p className="mt-4 font-display text-2xl">First story coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back shortly.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data!.map((p) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="group overflow-hidden rounded-[2rem] border border-border bg-card transition hover:border-gold/60">
                {p.cover_image ? (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={p.cover_image} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] gradient-gold" />
                )}
                <div className="p-6">
                  {p.published_at && (
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {new Date(p.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                  <h3 className="mt-2 font-display text-2xl">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">Read <ArrowRight size={14} /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
