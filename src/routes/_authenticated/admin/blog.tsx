import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Upload, Loader2 } from "lucide-react";

const SIGN_TTL = 60 * 60 * 24 * 365 * 10;
async function uploadCover(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `covers/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("blog")
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage.from("blog").createSignedUrl(path, SIGN_TTL);
  if (error || !data?.signedUrl) throw error ?? new Error("Signed URL failed");
  return data.signedUrl;
}

export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: AdminBlog,
});

type Draft = {
  id?: string;
  slug: string; title: string; excerpt: string; cover_image: string; content: string;
  tags: string; is_published: boolean;
};
const EMPTY: Draft = { slug: "", title: "", excerpt: "", cover_image: "", content: "", tags: "", is_published: false };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

function AdminBlog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "blog"],
    queryFn: async () => (await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  function edit(post: any) {
    setDraft({
      id: post.id, slug: post.slug, title: post.title,
      excerpt: post.excerpt ?? "", cover_image: post.cover_image ?? "",
      content: post.content, tags: (post.tags ?? []).join(", "),
      is_published: post.is_published,
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) return toast.error("Title and content required");
    const payload = {
      slug: draft.slug || slugify(draft.title),
      title: draft.title,
      excerpt: draft.excerpt || null,
      cover_image: draft.cover_image || null,
      content: draft.content,
      tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
      is_published: draft.is_published,
      published_at: draft.is_published ? new Date().toISOString() : null,
      author_id: user?.id ?? null,
    };
    const q = draft.id
      ? supabase.from("blog_posts").update(payload).eq("id", draft.id)
      : supabase.from("blog_posts").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success(draft.id ? "Updated" : "Post created");
    setDraft(EMPTY); setOpen(false); qc.invalidateQueries({ queryKey: ["admin", "blog"] });
  }

  async function togglePublish(post: any) {
    const { error } = await supabase.from("blog_posts").update({
      is_published: !post.is_published,
      published_at: !post.is_published ? new Date().toISOString() : post.published_at,
    }).eq("id", post.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "blog"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin", "blog"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Blog</h1>
          <p className="text-sm text-muted-foreground">Write articles for the public /blog page.</p>
        </div>
        <button onClick={() => { setDraft(EMPTY); setOpen(true); }} className="inline-flex items-center gap-1 rounded-full gradient-gold px-4 py-2 text-xs font-semibold text-primary-foreground">
          <Plus size={14} /> New post
        </button>
      </div>

      {isLoading ? <div className="h-40 animate-pulse rounded-2xl bg-muted" /> : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Title</th><th className="p-3">Slug</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3 font-medium">{p.title}</td>
                  <td className="p-3 text-muted-foreground">{p.slug}</td>
                  <td className="p-3">
                    <button onClick={() => togglePublish(p)} className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${p.is_published ? "gradient-gold text-primary-foreground" : "border border-border text-muted-foreground"}`}>
                      {p.is_published ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => edit(p)} className="mr-1 rounded-md border border-border p-2"><Pencil size={12} /></button>
                    <button onClick={() => del(p.id)} className="rounded-md border border-border p-2 text-destructive"><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
              {(data ?? []).length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No posts yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <form onSubmit={save} className="w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">{draft.id ? "Edit post" : "New post"}</h2>
              <button type="button" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <input required placeholder="Title" className="input-base" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slug || slugify(e.target.value) })} />
            <input placeholder="URL slug" className="input-base" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} />
            <input placeholder="Cover image URL (optional)" className="input-base" value={draft.cover_image} onChange={(e) => setDraft({ ...draft, cover_image: e.target.value })} />
            <textarea placeholder="Short excerpt" rows={2} maxLength={280} className="input-base" value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
            <textarea required placeholder="Content (plain text or markdown-lite)" rows={12} className="input-base font-mono text-xs" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} />
            <input placeholder="Tags (comma separated)" className="input-base" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.is_published} onChange={(e) => setDraft({ ...draft, is_published: e.target.checked })} />
              Publish now
            </label>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-full gradient-gold px-4 py-2.5 text-xs font-semibold text-primary-foreground">{draft.id ? "Save changes" : "Create post"}</button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-border px-4 py-2.5 text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
