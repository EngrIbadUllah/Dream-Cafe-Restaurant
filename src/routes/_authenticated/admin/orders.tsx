import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { updateOrderStatus } from "@/lib/admin.functions";
import { useAdminPush } from "@/hooks/use-admin-push";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersPage,
});

const STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"] as const;

// Play a pleasant chime using WebAudio (no asset needed)
function playChime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const notes = [880, 1175, 1568]; // A5, D6, G6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    /* ignore */
  }
}

function OrdersPage() {
  const qc = useQueryClient();
  const update = useServerFn(updateOrderStatus);
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(true);
  const push = useAdminPush();
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const o = payload.new as { order_number?: string; customer_name?: string; total?: number };
          qc.invalidateQueries({ queryKey: ["admin", "orders"] });
          qc.invalidateQueries({ queryKey: ["admin", "stats"] });
          if (soundRef.current) playChime();
          toast.success(`New order ${o.order_number ?? ""}`, {
            description: `${o.customer_name ?? "Guest"} · PKR ${Number(o.total ?? 0).toLocaleString()}`,
            duration: 8000,
          });
          if (typeof document !== "undefined") {
            const original = document.title;
            document.title = `🔔 New order · ${original}`;
            setTimeout(() => { document.title = original; }, 6000);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);
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
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-cream">Orders</h1>
          <p className="text-cream/60 mt-1">
            Live alerts · in-app sound + background push notifications.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {push.status !== "unsupported" && (
            <button
              onClick={() => (push.subscribed ? push.unsubscribe() : push.subscribe())}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
                push.subscribed
                  ? "border-gold/40 bg-gold/10 text-gold hover:bg-gold/15"
                  : "border-white/10 bg-white/5 text-cream hover:bg-white/10"
              }`}
              title="Get notified even when the site is closed"
            >
              <BellRing className="h-4 w-4" />
              {push.subscribed ? "Push on" : "Enable push"}
            </button>
          )}
          <button
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              if (next) playChime();
              toast.success(next ? "Sound alerts on" : "Sound alerts muted");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-cream hover:bg-white/10 transition"
            aria-label={soundOn ? "Mute new-order sound" : "Enable new-order sound"}
          >
            {soundOn ? <Bell className="h-4 w-4 text-gold" /> : <BellOff className="h-4 w-4 text-cream/50" />}
            {soundOn ? "Alerts on" : "Muted"}
          </button>
        </div>
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
