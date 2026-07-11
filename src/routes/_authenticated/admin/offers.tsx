import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/offers")({
  component: AdminOffers,
});

type Draft = {
  title: string; description: string; image_url: string; link_url: string;
  starts_at: string; ends_at: string; is_active: boolean; sort_order: number;
};
const EMPTY: Draft = { title: "", description: "", image_url: "", link_url: "", starts_at: "", ends_at: "", is_active: true, sort_order: 0 };

function AdminOffers() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "offers"],
    queryFn: async () => (await supabase.from("offers").select("*").order("sort_order").order("created_at", { ascending: false })).data ?? [],
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return toast.error("Title required");
    const payload = {
      ...draft,
      description: draft.description || null,
      image_url: draft.image_url || null,
      link_url: draft.link_url || null,
      starts_at: draft.starts_at || null,
      ends_at: draft.ends_at || null,
    };
    const { error } = await supabase.from("offers").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Offer added"); setDraft(EMPTY); qc.invalidateQueries({ queryKey: ["admin", "offers"] });
  }

  async function toggle(id: string, is_active: boolean) {
    const { error } = await supabase.from("offers").update({ is_active: !is_active }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "offers"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this offer?")) return;
    const { error } = await supabase.from("offers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "offers"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Offers & Deals</h1>
        <p className="text-sm text-muted-foreground">Publish promotions shown on the /offers page.</p>
      </div>

      <form onSubmit={add} className="grid gap-3 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <input required placeholder="Title" className="input-base" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <input placeholder="Image URL (optional)" className="input-base" value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
        <textarea placeholder="Description" rows={2} className="input-base md:col-span-2" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <input placeholder="Link URL (optional)" className="input-base" value={draft.link_url} onChange={(e) => setDraft({ ...draft, link_url: e.target.value })} />
        <input type="number" placeholder="Sort order" className="input-base" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
        <label className="text-xs text-muted-foreground">Starts at<input type="datetime-local" className="input-base mt-1 cursor-pointer [color-scheme:dark]" value={draft.starts_at} onFocus={(e) => e.currentTarget.showPicker?.()} onClick={(e) => e.currentTarget.showPicker?.()} onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })} /></label>
        <label className="text-xs text-muted-foreground">Ends at<input type="datetime-local" className="input-base mt-1 cursor-pointer [color-scheme:dark]" value={draft.ends_at} onFocus={(e) => e.currentTarget.showPicker?.()} onClick={(e) => e.currentTarget.showPicker?.()} onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })} /></label>
        <button className="inline-flex items-center gap-1 justify-center rounded-full gradient-gold px-4 py-2.5 text-xs font-semibold text-primary-foreground md:col-span-2"><Plus size={14} /> Add offer</button>
      </form>

      {isLoading ? <div className="h-40 animate-pulse rounded-2xl bg-muted" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((o) => (
            <div key={o.id} className={`rounded-2xl border border-border bg-card overflow-hidden ${!o.is_active ? "opacity-50" : ""}`}>
              {o.image_url && <img src={o.image_url} alt={o.title} className="aspect-video w-full object-cover" />}
              <div className="p-4">
                <h3 className="font-display text-lg">{o.title}</h3>
                {o.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{o.description}</p>}
                {o.ends_at && <p className="mt-2 text-[10px] uppercase text-muted-foreground">Ends {new Date(o.ends_at).toLocaleDateString()}</p>}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => toggle(o.id, o.is_active)} className="flex-1 rounded-md border border-border px-2 py-1 text-xs">{o.is_active ? "Hide" : "Show"}</button>
                  <button onClick={() => del(o.id)} className="rounded-md border border-border p-2 text-destructive"><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
