import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { updateOrderStatus } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersPage,
});

const STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"] as const;

function OrdersPage() {
  const qc = useQueryClient();
  const update = useServerFn(updateOrderStatus);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = async (id: string, status: (typeof STATUSES)[number]) => {
    try {
      await update({ data: { id, status } });
      toast.success(`Order marked ${status.replace(/_/g, " ")}`);
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-cream">Orders</h1>
        <p className="text-cream/60 mt-1">Manage incoming orders and update their status.</p>
      </header>

      {isLoading ? (
        <p className="text-cream/50">Loading…</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-cream/60">
          No orders yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-cream/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Order #</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Placed</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((o) => (
                <tr key={o.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-gold">{o.order_number}</td>
                  <td className="px-4 py-3 text-cream">
                    <div>{o.customer_name}</div>
                    <div className="text-cream/50 text-xs">{o.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 text-cream/70">{o.order_items?.length ?? 0}</td>
                  <td className="px-4 py-3 text-right text-cream">PKR {Number(o.total).toLocaleString()}</td>
                  <td className="px-4 py-3 text-cream/70 capitalize">{o.order_type}</td>
                  <td className="px-4 py-3 text-cream/50 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o.id, e.target.value as (typeof STATUSES)[number])}
                      className="rounded-md border border-white/15 bg-black/40 px-2 py-1 text-cream text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
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
