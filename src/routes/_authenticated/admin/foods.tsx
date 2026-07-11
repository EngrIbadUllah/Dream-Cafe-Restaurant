import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/foods")({
  component: FoodsPage,
});

const SIGN_TTL = 60 * 60 * 24 * 365 * 10; // 10 years

async function uploadFoodImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `items/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("food-images")
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage.from("food-images").createSignedUrl(path, SIGN_TTL);
  if (error || !data?.signedUrl) throw error ?? new Error("Signed URL failed");
  return data.signedUrl;
}

type FoodDraft = {
  id?: string;
  name: string;
  description: string;
  price: string;
  category_id: string;
  is_available: boolean;
  is_featured: boolean;
  image_url: string;
};

const EMPTY: FoodDraft = { name: "", description: "", price: "", category_id: "", is_available: true, is_featured: false, image_url: "" };

function FoodsPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<FoodDraft>(EMPTY);
  const [editing, setEditing] = useState(false);

  const { data: cats } = useQuery({
    queryKey: ["admin", "categories", "list"],
    queryFn: async () => (await supabase.from("categories").select("id,name").order("name")).data ?? [],
  });
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "foods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.price) return toast.error("Name and price required");
    const slug = draft.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const payload = {
      name: draft.name.trim(),
      slug,
      description: draft.description.trim() || null,
      price: Number(draft.price),
      category_id: draft.category_id || null,
      is_available: draft.is_available,
      is_featured: draft.is_featured,
      image_url: draft.image_url.trim() || null,
    };
    const q = editing && draft.id
      ? await supabase.from("foods").update(payload).eq("id", draft.id)
      : await supabase.from("foods").insert(payload);
    if (q.error) return toast.error(q.error.message);
    toast.success(editing ? "Updated" : "Added");
    setDraft(EMPTY); setEditing(false);
    qc.invalidateQueries({ queryKey: ["admin", "foods"] });
    qc.invalidateQueries({ queryKey: ["admin", "stats"] });
  };

  const edit = (f: NonNullable<typeof data>[number]) => {
    setEditing(true);
    setDraft({
      id: f.id, name: f.name, description: f.description ?? "", price: String(f.price),
      category_id: f.category_id ?? "", is_available: f.is_available, is_featured: f.is_featured,
      image_url: f.image_url ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("foods").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "foods"] });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-cream">Menu Items</h1>
        <p className="text-cream/60 mt-1">Add and manage dishes shown on your menu.</p>
      </header>

      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="input-base" placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          <input className="input-base" type="number" step="0.01" placeholder="Price (PKR)" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} required />
          <select className="input-base" value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}>
            <option value="">— No category —</option>
            {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="input-base" placeholder="Image URL (optional)" value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
        </div>
        <textarea className="input-base min-h-20" placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-cream/80">
            <input type="checkbox" checked={draft.is_available} onChange={(e) => setDraft({ ...draft, is_available: e.target.checked })} /> Available
          </label>
          <label className="flex items-center gap-2 text-sm text-cream/80">
            <input type="checkbox" checked={draft.is_featured} onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })} /> Featured
          </label>
          <div className="ml-auto flex gap-2">
            {editing && <button type="button" onClick={() => { setEditing(false); setDraft(EMPTY); }} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-cream/80">Cancel</button>}
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl gradient-gold px-4 py-2 text-primary-foreground font-semibold text-sm">
              <Plus size={16} /> {editing ? "Update" : "Add item"}
            </button>
          </div>
        </div>
      </form>

      {isLoading ? (
        <p className="text-cream/50">Loading…</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data && data.length > 0 ? data.map((f) => (
            <div key={f.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex gap-3">
              {f.image_url ? (
                <img src={f.image_url} alt="" className="h-20 w-20 rounded-lg object-cover border border-white/10" />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-cream/30 text-xs">No image</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-serif text-cream truncate">{f.name}</p>
                    <p className="text-xs text-cream/50 truncate">{f.categories?.name ?? "Uncategorized"}</p>
                  </div>
                  <p className="text-gold font-medium shrink-0">PKR {Number(f.price).toLocaleString()}</p>
                </div>
                <p className="text-xs text-cream/60 mt-1 line-clamp-2">{f.description}</p>
                <div className="flex gap-1.5 mt-2 items-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${f.is_available ? "border-emerald-500/40 text-emerald-400" : "border-white/15 text-cream/50"}`}>
                    {f.is_available ? "Available" : "Hidden"}
                  </span>
                  {f.is_featured && <span className="text-[10px] px-2 py-0.5 rounded-full border border-gold/40 text-gold">Featured</span>}
                  <div className="ml-auto flex gap-1">
                    <button onClick={() => edit(f)} className="grid h-7 w-7 place-items-center rounded-md border border-white/15 text-cream/70 hover:text-gold"><Pencil size={12} /></button>
                    <button onClick={() => del(f.id)} className="grid h-7 w-7 place-items-center rounded-md border border-white/15 text-cream/70 hover:text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-cream/60">
              No menu items yet — add your first above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
