import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Ticket } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/coupons")({
  component: AdminCoupons,
});

type Draft = {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount: number | null;
  usage_limit: number | null;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
};

const EMPTY: Draft = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 10,
  min_order_amount: 0,
  max_discount: null,
  usage_limit: null,
  starts_at: "",
  expires_at: "",
  is_active: true,
};

function AdminCoupons() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: async () =>
      (await supabase.from("coupons").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.code.trim()) return toast.error("Code required");
    const payload = {
      ...draft,
      code: draft.code.trim().toUpperCase(),
      description: draft.description || null,
      max_discount: draft.max_discount || null,
      usage_limit: draft.usage_limit || null,
      starts_at: draft.starts_at || null,
      expires_at: draft.expires_at || null,
    };
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Coupon created");
    setDraft(EMPTY);
    qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
  }

  async function toggle(id: string, is_active: boolean) {
    const { error } = await supabase.from("coupons").update({ is_active: !is_active }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
  }

  async function del(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-cream">Coupons</h1>
        <p className="text-sm text-cream/60 mt-1">Create promo codes customers apply at checkout.</p>
      </div>

      <form onSubmit={add} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:grid-cols-3">
        <input required placeholder="Code (e.g. WELCOME10)" className="input-base uppercase" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
        <select className="input-base" value={draft.discount_type} onChange={(e) => setDraft({ ...draft, discount_type: e.target.value as Draft["discount_type"] })}>
          <option value="percentage">Percentage %</option>
          <option value="fixed">Fixed PKR</option>
        </select>
        <input required type="number" min={0} placeholder="Discount value" className="input-base" value={draft.discount_value} onChange={(e) => setDraft({ ...draft, discount_value: Number(e.target.value) })} />
        <input placeholder="Description (optional)" className="input-base md:col-span-3" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        <input type="number" min={0} placeholder="Min order (PKR)" className="input-base" value={draft.min_order_amount} onChange={(e) => setDraft({ ...draft, min_order_amount: Number(e.target.value) })} />
        <input type="number" min={0} placeholder="Max discount (PKR, optional)" className="input-base" value={draft.max_discount ?? ""} onChange={(e) => setDraft({ ...draft, max_discount: e.target.value ? Number(e.target.value) : null })} />
        <input type="number" min={0} placeholder="Usage limit (optional)" className="input-base" value={draft.usage_limit ?? ""} onChange={(e) => setDraft({ ...draft, usage_limit: e.target.value ? Number(e.target.value) : null })} />
        <label className="text-xs text-cream/60">Starts at<input type="datetime-local" className="input-base mt-1 cursor-pointer [color-scheme:dark]" value={draft.starts_at} onFocus={(e) => e.currentTarget.showPicker?.()} onClick={(e) => e.currentTarget.showPicker?.()} onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })} /></label>
        <label className="text-xs text-cream/60">Expires at<input type="datetime-local" className="input-base mt-1 cursor-pointer [color-scheme:dark]" value={draft.expires_at} onFocus={(e) => e.currentTarget.showPicker?.()} onClick={(e) => e.currentTarget.showPicker?.()} onChange={(e) => setDraft({ ...draft, expires_at: e.target.value })} /></label>
        <label className="flex items-center gap-2 text-xs text-cream/70"><input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} /> Active</label>
        <button className="inline-flex items-center gap-1 justify-center rounded-full gradient-gold px-4 py-2.5 text-xs font-semibold text-primary-foreground md:col-span-3"><Plus size={14} /> Add coupon</button>
      </form>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      ) : (data ?? []).length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-cream/50">
          <Ticket className="mx-auto mb-3 text-gold" /> No coupons yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-cream/50 text-xs uppercase tracking-wider bg-white/[0.02]">
              <tr className="text-left">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min order</th>
                <th className="py-3 px-4">Used</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-cream/80">
              {(data ?? []).map((c) => (
                <tr key={c.id} className="border-t border-white/5">
                  <td className="py-3 px-4 font-mono font-semibold text-gold">{c.code}</td>
                  <td className="py-3 px-4">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `PKR ${c.discount_value}`}
                    {c.max_discount ? <span className="text-cream/40 text-xs"> (max {c.max_discount})</span> : null}
                  </td>
                  <td className="py-3 px-4">PKR {c.min_order_amount ?? 0}</td>
                  <td className="py-3 px-4">{c.used_count ?? 0}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                  <td className="py-3 px-4 text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] border ${c.is_active ? "bg-green-500/15 text-green-300 border-green-400/30" : "bg-white/5 text-cream/50 border-white/10"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => toggle(c.id, c.is_active)} className="rounded-md border border-white/15 px-2 py-1 text-xs">{c.is_active ? "Deactivate" : "Activate"}</button>
                      <button onClick={() => del(c.id)} className="rounded-md border border-white/15 p-1.5 text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
