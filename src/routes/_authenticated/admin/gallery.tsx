import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: AdminGallery,
});

type Draft = { title: string; image_url: string; category: string; sort_order: number; is_active: boolean };
const EMPTY: Draft = { title: "", image_url: "", category: "food", sort_order: 0, is_active: true };

function AdminGallery() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => (await supabase.from("gallery").select("*").order("sort_order").order("created_at", { ascending: false })).data ?? [],
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.image_url.trim()) return toast.error("Image URL required");
    const { error } = await supabase.from("gallery").insert(draft);
    if (error) return toast.error(error.message);
    toast.success("Added"); setDraft(EMPTY); qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
  }

  async function toggle(id: string, is_active: boolean) {
    const { error } = await supabase.from("gallery").update({ is_active: !is_active }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this photo?")) return;
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "gallery"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Gallery</h1>
        <p className="text-sm text-muted-foreground">Add photos by URL. Toggle visibility or delete anytime.</p>
      </div>

      <form onSubmit={add} className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1.5fr_2fr_1fr_100px_auto]">
        <input required placeholder="Title (optional)" className="input-base" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <input required placeholder="Image URL" className="input-base" value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
        <select className="input-base" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
          <option value="food">Food</option>
          <option value="ambience">Ambience</option>
          <option value="events">Events</option>
          <option value="team">Team</option>
          <option value="general">General</option>
        </select>
        <input type="number" placeholder="Order" className="input-base" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
        <button className="inline-flex items-center gap-1 rounded-full gradient-gold px-4 py-2 text-xs font-semibold text-primary-foreground"><Plus size={14} /> Add</button>
      </form>

      {isLoading ? <div className="h-40 animate-pulse rounded-2xl bg-muted" /> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(data ?? []).map((g) => (
            <div key={g.id} className={`group relative overflow-hidden rounded-2xl border border-border bg-card ${!g.is_active ? "opacity-50" : ""}`}>
              <img src={g.image_url} alt={g.title ?? ""} className="aspect-square w-full object-cover" />
              <div className="p-2">
                <p className="truncate text-xs">{g.title || "—"}</p>
                <p className="text-[10px] uppercase text-muted-foreground">{g.category}</p>
                <div className="mt-2 flex gap-1">
                  <button onClick={() => toggle(g.id, g.is_active)} className="flex-1 rounded-md border border-border px-2 py-1 text-[10px]">{g.is_active ? "Hide" : "Show"}</button>
                  <button onClick={() => del(g.id)} className="rounded-md border border-border p-1.5 text-destructive"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
