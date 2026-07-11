import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*, foods(count)")
        .order("sort_order")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("categories").insert({ name: name.trim(), slug, description: desc.trim() || null });
    if (error) return toast.error(error.message);
    toast.success("Category added");
    setName(""); setDesc("");
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category? Foods inside will lose their category.")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from("categories").update({ is_active: !is_active }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-cream">Categories</h1>
        <p className="text-cream/60 mt-1">Organize your menu into sections.</p>
      </header>

      <form onSubmit={add} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 grid gap-3 md:grid-cols-[1fr_2fr_auto]">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="input-base" required />
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Short description (optional)" className="input-base" />
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl gradient-gold px-4 py-2 text-primary-foreground font-semibold text-sm">
          <Plus size={16} /> Add
        </button>
      </form>

      {isLoading ? (
        <p className="text-cream/50">Loading…</p>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
          {data && data.length > 0 ? data.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-serif text-cream">{c.name}</p>
                <p className="text-xs text-cream/50">{c.slug} · {c.description ?? "no description"}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(c.id, c.is_active)}
                  className={`text-xs rounded-full px-3 py-1 border ${c.is_active ? "border-emerald-500/40 text-emerald-400" : "border-white/15 text-cream/50"}`}
                >
                  {c.is_active ? "Active" : "Inactive"}
                </button>
                <button onClick={() => del(c.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-cream/70 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )) : (
            <p className="p-6 text-center text-cream/50">No categories yet — add your first above.</p>
          )}
        </div>
      )}
    </div>
  );
}
