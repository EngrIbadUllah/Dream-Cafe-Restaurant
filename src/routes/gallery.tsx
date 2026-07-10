import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteShell } from "@/components/site/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Dream Cafe & Restaurant Shakargarh" },
      { name: "description", content: "See our dishes, ambience and moments at Dream Cafe & Restaurant, Shakargarh." },
      { property: "og:title", content: "Gallery — Dream Cafe" },
      { property: "og:description", content: "Food, ambience and moments captured at Dream Cafe." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data, isLoading } = useQuery({
    queryKey: ["gallery", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const categories = Array.from(new Set((data ?? []).map((g) => g.category ?? "general")));
  const filtered = (data ?? []).filter((g) => filter === "all" || (g.category ?? "general") === filter);

  return (
    <SiteShell>
      <section className="pt-36 pb-8 sm:pt-44">
        <div className="container-page text-center">
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">
            A taste of our <span className="italic text-gold">world.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Dishes fresh out of the kitchen, the warmth of our dining room, and the moments that make Dream Cafe home.
          </p>
        </div>
      </section>

      {categories.length > 0 && (
        <div className="container-page mb-6 flex flex-wrap justify-center gap-2">
          <Chip active={filter === "all"} onClick={() => setFilter("all")}>All</Chip>
          {categories.map((c) => (
            <Chip key={c} active={filter === c} onClick={() => setFilter(c)}>{c}</Chip>
          ))}
        </div>
      )}

      <section className="container-page pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-border py-24 text-center">
            <ImageIcon className="mx-auto text-muted-foreground" size={36} />
            <p className="mt-4 font-display text-2xl">Photos coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">We're curating a fresh set of shots.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((g) => (
              <a key={g.id} href={g.image_url} target="_blank" rel="noreferrer" className="group relative overflow-hidden rounded-2xl border border-border bg-card">
                <img src={g.image_url} alt={g.title ?? "Gallery image"} loading="lazy" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
                {g.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm text-white opacity-0 transition group-hover:opacity-100">
                    {g.title}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition ${active ? "gradient-gold border-transparent text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}
