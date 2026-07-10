import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Star, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const setApproved = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("reviews").update({ is_approved: approved }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(approved ? "Approved" : "Hidden");
    qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    qc.invalidateQueries({ queryKey: ["admin", "stats"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-cream">Reviews</h1>
        <p className="text-cream/60 mt-1">Approve or hide customer reviews.</p>
      </header>

      {isLoading ? (
        <p className="text-cream/50">Loading…</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-cream/60">
          No reviews yet.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border p-5 ${r.is_approved ? "border-white/10 bg-white/[0.02]" : "border-gold/30 bg-gold/5"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-cream">{r.customer_name}</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? "fill-gold text-gold" : "text-cream/20"} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setApproved(r.id, !r.is_approved)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 text-cream/70 hover:text-gold"
                    title={r.is_approved ? "Hide" : "Approve"}
                  >
                    {r.is_approved ? <X size={14} /> : <Check size={14} />}
                  </button>
                  <button
                    onClick={() => del(r.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 text-cream/70 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {r.title && <p className="text-gold mt-3 text-sm font-medium">{r.title}</p>}
              <p className="text-sm text-cream/80 mt-1.5 whitespace-pre-wrap">{r.comment}</p>
              <p className="text-[11px] text-cream/40 mt-3">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
