import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Search, Flame, Plus, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site/site-shell";
import { useCart, formatPKR } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

type Category = {
  id: string; name: string; slug: string; sort_order: number;
};
type Food = {
  id: string; name: string; slug: string; description: string | null;
  price: number; discount_price: number | null;
  image_url: string | null; category_id: string | null;
  is_featured: boolean; is_vegetarian: boolean;
  spice: "none" | "mild" | "medium" | "hot" | "extra_hot" | null;
};

const menuQuery = queryOptions({
  queryKey: ["public-menu"],
  queryFn: async () => {
    const [cats, foods] = await Promise.all([
      supabase.from("categories").select("id,name,slug,sort_order").eq("is_active", true).order("sort_order"),
      supabase.from("foods")
        .select("id,name,slug,description,price,discount_price,image_url,category_id,is_featured,is_vegetarian,spice")
        .eq("is_available", true)
        .order("sort_order"),
    ]);
    if (cats.error) throw cats.error;
    if (foods.error) throw foods.error;
    return { categories: (cats.data ?? []) as Category[], foods: (foods.data ?? []) as Food[] };
  },
});

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Dream Cafe & Restaurant Shakargarh" },
      { name: "description", content: "Browse our menu: BBQ, Pakistani, Chinese, Continental, pizza, burgers, rice, soups, drinks and desserts. Order online in Shakargarh." },
      { property: "og:title", content: "Order Online — Dream Cafe & Restaurant" },
      { property: "og:description", content: "Freshly cooked BBQ, handi, pizza, biryani and more — delivered in Shakargarh." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(menuQuery),
  component: MenuPage,
  errorComponent: ({ error }) => (
    <SiteShell><div className="container-page py-32 text-center text-muted-foreground">Couldn't load the menu. {error.message}</div></SiteShell>
  ),
  pendingComponent: () => (
    <SiteShell><div className="container-page py-32 text-center text-muted-foreground">Loading menu…</div></SiteShell>
  ),
});

function MenuPage() {
  const { data } = useSuspenseQuery(menuQuery);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const { add, count, open } = useCart();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.foods.filter((f) => {
      if (term) {
        return f.name.toLowerCase().includes(term) || (f.description ?? "").toLowerCase().includes(term);
      }
      if (activeCat !== "all" && f.category_id !== activeCat) return false;
      return true;
    });
  }, [data.foods, activeCat, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, Food[]>();
    for (const f of filtered) {
      const k = f.category_id ?? "uncat";
      map.set(k, [...(map.get(k) ?? []), f]);
    }
    return map;
  }, [filtered]);

  return (
    <SiteShell>
      <section className="border-b border-border bg-gradient-to-b from-black/60 to-transparent pt-24 pb-6">
        <div className="container-page">
          <h1 className="font-display text-3xl md:text-4xl">Our Menu</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            BBQ, handi, biryani, pizzas and more — order for delivery or takeaway.
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search dishes…"
                className="input-base w-full pl-10 py-2.5 text-sm"
              />
            </div>
            {count > 0 && (
              <button
                onClick={open}
                className="inline-flex items-center justify-center gap-2 rounded-full gradient-gold px-4 py-2.5 text-xs font-semibold text-primary-foreground"
              >
                <ShoppingBag size={14} /> Cart ({count})
              </button>
            )}
          </div>

          <div className="mt-4 -mx-4 overflow-x-auto px-4">
            <div className="flex gap-1.5 pb-1">
              <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>All</CatChip>
              {data.categories.map((c) => (
                <CatChip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
                  {c.name}
                </CatChip>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No dishes match your search.</p>
        ) : q.trim() ? (
          <>
            <div className="mb-3 flex items-baseline justify-between border-b border-border/60 pb-2">
              <h2 className="font-display text-xl md:text-2xl text-gold">Search results</h2>
              <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{filtered.length} items</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((f) => <FoodCard key={f.id} food={f} onAdd={add} />)}
            </div>
          </>
        ) : activeCat === "all" ? (
          data.categories.map((c) => {
            const list = grouped.get(c.id);
            if (!list || list.length === 0) return null;
            return (
              <div key={c.id} className="mb-8">
                <div className="mb-3 flex items-baseline justify-between border-b border-border/60 pb-2">
                  <h2 className="font-display text-xl md:text-2xl text-gold">{c.name}</h2>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{list.length} items</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((f) => <FoodCard key={f.id} food={f} onAdd={add} />)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => <FoodCard key={f.id} food={f} onAdd={add} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
        active
          ? "border-gold bg-gold/15 text-gold"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
      )}
    >
      {children}
    </button>
  );
}

function FoodCard({ food, onAdd }: { food: Food; onAdd: ReturnType<typeof useCart>["add"] }) {
  const price = food.discount_price ?? food.price;
  return (
    <article className="group flex gap-3 overflow-hidden rounded-xl border border-border bg-card p-2.5 transition hover:border-gold/40 hover:shadow-md hover:shadow-black/20">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28">
        {food.image_url ? (
          <img src={food.image_url} alt={food.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : null}
        {food.discount_price && (
          <span className="absolute left-1 top-1 rounded-full bg-destructive/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
            Sale
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 font-display text-sm leading-snug sm:text-base">
            <span className="truncate">{food.name}</span>
            {food.is_featured && <span className="ml-1.5 text-[9px] uppercase tracking-wider text-gold">★</span>}
          </h3>
          {food.spice && food.spice !== "none" && (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-orange-400" title={`Spice: ${food.spice}`}>
              {Array.from({ length: food.spice === "extra_hot" ? 3 : food.spice === "hot" ? 2 : 1 }).map((_, i) => (
                <Flame key={i} size={10} />
              ))}
            </span>
          )}
        </div>
        {food.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{food.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-base text-gold sm:text-lg">{formatPKR(price)}</span>
            {food.discount_price && (
              <span className="text-[10px] text-muted-foreground line-through">{formatPKR(food.price)}</span>
            )}
          </div>
          <button
            onClick={() => onAdd({ id: food.id, name: food.name, price, image_url: food.image_url })}
            className="inline-flex items-center gap-1 rounded-full gradient-gold px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow hover:brightness-110"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
