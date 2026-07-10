import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: AdminGallery,
});

type Draft = { title: string; image_url: string; category: string; sort_order: number; is_active: boolean };
const EMPTY: Draft = { title: "", image_url: "", category: "food", sort_order: 0, is_active: true };

// 10 years — bucket is private, so we sign a long-lived URL for public display.
const SIGN_TTL = 60 * 60 * 24 * 365 * 10;

async function uploadToGallery(file: File, folder = "photos"): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("gallery")
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage.from("gallery").createSignedUrl(path, SIGN_TTL);
  if (error || !data) throw error ?? new Error("Failed to sign URL");
  return data.signedUrl;
}

function AdminGallery() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: async () => (await supabase.from("gallery").select("*").order("sort_order").order("created_at", { ascending: false })).data ?? [],
  });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return toast.error("Max file size is 8MB");
    setUploading(true);
    try {
      const url = await uploadToGallery(file);
      setDraft((d) => ({ ...d, image_url: url }));
      toast.success("Image uploaded — click Add to save");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.image_url.trim()) return toast.error("Upload an image or paste a URL first");
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
        <p className="text-sm text-muted-foreground">Upload photos directly or paste an image URL.</p>
      </div>

      <form onSubmit={add} className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/20 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : "Upload image"}
          </button>
          {draft.image_url && (
            <img src={draft.image_url} alt="preview" className="h-12 w-12 rounded-md object-cover ring-1 ring-border" />
          )}
          <span className="text-xs text-muted-foreground">or paste a URL below</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.5fr_2fr_1fr_100px_auto]">
          <input placeholder="Title (optional)" className="input-base" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
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
        </div>
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
