import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, BellRing, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { updateOrderStatus } from "@/lib/admin.functions";
import { deleteOrder } from "@/lib/orders.functions";
import { useAdminPush } from "@/hooks/use-admin-push";
import { toast } from "sonner";


export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersPage,
});

const STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"] as const;

// Rich "fantastic" arrival chime — bell arpeggio + shimmer via WebAudio (no asset).
function playChime() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 6000;
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.18;
    const fb = ctx.createGain();
    fb.gain.value = 0.28;
    master.connect(lp).connect(ctx.destination);
    lp.connect(delay).connect(fb).connect(delay);
    delay.connect(ctx.destination);

    const bell = (freq: number, when: number, dur = 1.5, vel = 0.38) => {
      const partials = [
        { m: 1, g: 1.0 }, { m: 2.01, g: 0.5 }, { m: 3.01, g: 0.28 },
        { m: 4.7, g: 0.18 }, { m: 6.2, g: 0.1 },
      ];
      partials.forEach((p) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq * p.m;
        const t = ctx.currentTime + when;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vel * p.g, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + dur + 0.05);
      });
    };
    const sparkle = (freq: number, when: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = ctx.currentTime + when;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 0.3);
    };
    // Uplifting C major arpeggio + high shimmer
    const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, C7 = 2093;
    bell(C5, 0.00, 1.6, 0.4);
    bell(E5, 0.14, 1.5, 0.38);
    bell(G5, 0.28, 1.5, 0.38);
    bell(C6, 0.44, 1.9, 0.5);
    sparkle(C7, 0.46);
    sparkle(C7 * 1.5, 0.6);
    setTimeout(() => ctx.close(), 3200);
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

  const removeFn = useServerFn(deleteOrder);
  const remove = async (id: string, num: string) => {
    if (!confirm(`Delete order ${num}? This cannot be undone.`)) return;
    try {
      await removeFn({ data: { id } });
      toast.success(`Order ${num} deleted`);
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
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
                <th className="px-4 py-3 text-right">Actions</th>
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
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(o.id, o.order_number)}
                      className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20 transition"
                      aria-label={`Delete order ${o.order_number}`}
                      title="Delete order"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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

