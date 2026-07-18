import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Ban, Percent, Truck, Download } from "lucide-react";
import { getAnalytics } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const PRESETS = [
  { label: "Today", from: () => todayStr(0), to: () => todayStr(0), granularity: "hour" as const },
  { label: "Yesterday", from: () => todayStr(-1), to: () => todayStr(-1), granularity: "hour" as const },
  { label: "Last 7 days", from: () => todayStr(-6), to: () => todayStr(0), granularity: "day" as const },
  { label: "Last 30 days", from: () => todayStr(-29), to: () => todayStr(0), granularity: "day" as const },
  { label: "This month", from: () => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); }, to: () => todayStr(0), granularity: "day" as const },
];

function AnalyticsPage() {
  const fn = useServerFn(getAnalytics);
  const [from, setFrom] = useState(() => todayStr(-6));
  const [to, setTo] = useState(() => todayStr(0));
  const [granularity, setGranularity] = useState<"hour" | "day">("day");

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["admin", "analytics", from, to, granularity],
    queryFn: () => fn({ data: { from, to, granularity } }),
  });

  const maxRev = useMemo(() => Math.max(1, ...(data?.series ?? []).map((b) => b.revenue)), [data]);

  function applyPreset(p: typeof PRESETS[number]) {
    setFrom(p.from());
    setTo(p.to());
    setGranularity(p.granularity);
  }

  function exportCsv() {
    if (!data) return;
    const rows = [
      ["Order Number", "Customer", "Type", "Status", "Payment", "Total", "Created At"],
      ...data.orders.map((o) => [
        o.order_number,
        o.customer_name,
        o.order_type,
        o.status,
        o.payment_method,
        String(Math.round(Number(o.total))),
        new Date(o.created_at).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demo-restaurant-orders_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-cream">Analytics</h1>
          <p className="text-cream/60 mt-1 text-sm">
            Explore revenue and orders by date range or day-of-week.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!data?.orders.length}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-cream/80 hover:text-gold hover:border-gold/40 disabled:opacity-50"
        >
          <Download size={14} /> Export CSV
        </button>
      </header>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-cream/70 hover:text-gold hover:border-gold/40"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] items-end">
          <label className="text-xs text-cream/60">
            <span className="block mb-1">From</span>
            <input
              type="date"
              value={from}
              max={to}
              onFocus={(e) => e.currentTarget.showPicker?.()}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-cream [color-scheme:dark]"
            />
          </label>
          <label className="text-xs text-cream/60">
            <span className="block mb-1">To</span>
            <input
              type="date"
              value={to}
              min={from}
              max={todayStr(0)}
              onFocus={(e) => e.currentTarget.showPicker?.()}
              onClick={(e) => e.currentTarget.showPicker?.()}
              onChange={(e) => setTo(e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-cream [color-scheme:dark]"
            />
          </label>
          <div className="inline-flex rounded-lg border border-white/15 p-1 bg-black/40">
            {(["day", "hour"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`px-3 py-1.5 text-xs rounded-md capitalize ${
                  granularity === g ? "gradient-gold text-primary-foreground" : "text-cream/70 hover:text-cream"
                }`}
              >
                {g}ly
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-white/15 px-4 py-2 text-xs text-cream/80 hover:text-gold hover:border-gold/40"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={`PKR ${Math.round(summary?.revenue ?? 0).toLocaleString()}`} icon={DollarSign} tone="gold" loading={isFetching && !data} />
        <StatCard label="Orders" value={String(summary?.completedCount ?? 0)} icon={ShoppingBag} loading={isFetching && !data} />
        <StatCard label="Avg. order" value={`PKR ${Math.round(summary?.avgOrder ?? 0).toLocaleString()}`} icon={TrendingUp} loading={isFetching && !data} />
        <StatCard label="Cancelled" value={String(summary?.cancelledCount ?? 0)} icon={Ban} loading={isFetching && !data} />
        <StatCard label="Discounts given" value={`PKR ${Math.round(summary?.discountTotal ?? 0).toLocaleString()}`} icon={Percent} loading={isFetching && !data} />
        <StatCard label="Delivery fees" value={`PKR ${Math.round(summary?.deliveryTotal ?? 0).toLocaleString()}`} icon={Truck} loading={isFetching && !data} />
      </div>

      {/* Time series chart */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="font-serif text-xl text-cream mb-4">
          Revenue by {granularity === "hour" ? "hour" : "day"}
        </h2>
        {(data?.series ?? []).length === 0 ? (
          <p className="text-cream/50 text-sm">No data.</p>
        ) : (
          <div className="flex items-end gap-1.5 h-52 overflow-x-auto pb-2">
            {data!.series.map((b) => (
              <div key={b.key} className="flex flex-col items-center gap-2 min-w-[36px] flex-1">
                <div className="w-full flex flex-col justify-end h-full">
                  <div
                    className="w-full gradient-gold rounded-t-md transition-all"
                    style={{ height: `${(b.revenue / maxRev) * 100}%`, minHeight: b.revenue ? 4 : 0 }}
                    title={`${b.label} — PKR ${Math.round(b.revenue).toLocaleString()} • ${b.orders} orders`}
                  />
                </div>
                <span className="text-[10px] text-cream/50 rotate-[-25deg] origin-top-left whitespace-nowrap">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Breakdowns */}
      <div className="grid gap-6 lg:grid-cols-3">
        <BreakdownCard title="By status" entries={Object.entries(data?.statusCounts ?? {})} />
        <BreakdownCard title="By type" entries={Object.entries(data?.typeCounts ?? {})} />
        <BreakdownCard title="By payment" entries={Object.entries(data?.paymentCounts ?? {})} />
      </div>

      {/* Top items */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="font-serif text-xl text-cream mb-4">Top items in range</h2>
        {(data?.topItems ?? []).length === 0 ? (
          <p className="text-cream/50 text-sm">No items sold in this range.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-cream/50 text-xs uppercase tracking-wider text-left">
                <tr>
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4 text-right">Qty sold</th>
                  <th className="py-2 pr-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="text-cream/80">
                {data!.topItems.map((it) => (
                  <tr key={it.name} className="border-t border-white/5">
                    <td className="py-2.5 pr-4">{it.name}</td>
                    <td className="py-2.5 pr-4 text-right">{it.qty}</td>
                    <td className="py-2.5 pr-4 text-right text-gold">
                      PKR {Math.round(it.revenue).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders in range */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-cream">
            Orders in range {data ? `(${data.orders.length})` : ""}
          </h2>
          <span className="text-xs text-cream/40">Showing latest 100</span>
        </div>
        {(data?.orders ?? []).length === 0 ? (
          <p className="text-cream/50 text-sm">No orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-cream/50 text-xs uppercase tracking-wider text-left">
                <tr>
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                  <th className="py-2 pr-4">When</th>
                </tr>
              </thead>
              <tbody className="text-cream/80">
                {data!.orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/5">
                    <td className="py-2.5 pr-4 font-mono text-xs text-gold">{o.order_number}</td>
                    <td className="py-2.5 pr-4">{o.customer_name}</td>
                    <td className="py-2.5 pr-4 text-xs">{o.order_type.replace("_", " ")}</td>
                    <td className="py-2.5 pr-4 text-xs">{o.status.replace(/_/g, " ")}</td>
                    <td className="py-2.5 pr-4 text-right text-gold">
                      PKR {Math.round(Number(o.total)).toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 text-cream/50 text-xs">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, tone, loading,
}: {
  label: string; value: string; icon: React.ComponentType<{ size?: number }>; tone?: "gold"; loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-cream/50">{label}</p>
          <p className={`mt-2 font-serif text-2xl ${tone === "gold" ? "text-gold" : "text-cream"}`}>
            {loading ? "…" : value}
          </p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-full ${tone === "gold" ? "gradient-gold text-primary-foreground" : "bg-white/5 text-gold"}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ title, entries }: { title: string; entries: [string, number][] }) {
  const total = entries.reduce((s, [, n]) => s + n, 0);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h3 className="font-serif text-lg text-cream mb-4">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-cream/50 text-sm">No data.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map(([key, n]) => (
            <li key={key}>
              <div className="flex justify-between text-sm text-cream/80">
                <span className="capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-gold">{n}</span>
              </div>
              <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full gradient-gold" style={{ width: `${total ? (n / total) * 100 : 0}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
