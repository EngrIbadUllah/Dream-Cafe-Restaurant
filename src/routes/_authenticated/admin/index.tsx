import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStats, getDashboardExtras } from "@/lib/admin.functions";
import {
  ShoppingBag, CalendarCheck, Star, MessageSquare, UtensilsCrossed, Users, DollarSign, Clock,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

const statusTone: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  confirmed: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  preparing: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30",
  out_for_delivery: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  delivered: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  cancelled: "bg-rose-500/15 text-rose-300 border-rose-400/30",
};

function AdminDashboard() {
  const statsFn = useServerFn(getAdminStats);
  const extrasFn = useServerFn(getDashboardExtras);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "stats"], queryFn: () => statsFn() });
  const { data: extras } = useQuery({ queryKey: ["admin", "extras"], queryFn: () => extrasFn() });

  const stats = [
    { label: "Total Revenue", value: `PKR ${Math.round(data?.revenue ?? 0).toLocaleString()}`, icon: DollarSign, tone: "gold" as const },
    { label: "Total Orders", value: data?.ordersCount ?? 0, icon: ShoppingBag, tone: "cream" as const, badge: data?.pendingOrders ? `${data.pendingOrders} pending` : undefined },
    { label: "Reservations", value: data?.reservationsCount ?? 0, icon: CalendarCheck, tone: "cream" as const, badge: data?.pendingReservations ? `${data.pendingReservations} pending` : undefined },
    { label: "Reviews", value: data?.reviewsCount ?? 0, icon: Star, tone: "cream" as const, badge: data?.pendingReviews ? `${data.pendingReviews} to approve` : undefined },
    { label: "Unread Messages", value: data?.unreadMessages ?? 0, icon: MessageSquare, tone: "cream" as const },
    { label: "Menu Items", value: data?.foodsCount ?? 0, icon: UtensilsCrossed, tone: "cream" as const },
    { label: "Customers", value: data?.customersCount ?? 0, icon: Users, tone: "cream" as const },
    { label: "Now", value: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), icon: Clock, tone: "cream" as const },
  ];

  const maxRev = Math.max(1, ...(extras?.weekly ?? []).map((d) => d.revenue));
  const maxQty = Math.max(1, ...(extras?.topFoods ?? []).map((t) => t.qty));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl md:text-4xl text-cream">Dashboard</h1>
        <p className="text-cream/60 mt-1">Overview of your restaurant at a glance.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-cream/50">{s.label}</p>
                  <p className={`mt-2 font-serif text-2xl ${s.tone === "gold" ? "text-gold" : "text-cream"}`}>
                    {isLoading ? "…" : s.value}
                  </p>
                </div>
                <div className={`grid h-10 w-10 place-items-center rounded-full ${s.tone === "gold" ? "gradient-gold text-primary-foreground" : "bg-white/5 text-gold"}`}>
                  <Icon size={18} />
                </div>
              </div>
              {s.badge && (
                <p className="mt-3 inline-flex items-center rounded-full bg-gold/10 px-2 py-0.5 text-[11px] text-gold border border-gold/30">
                  {s.badge}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-xl text-cream">Revenue — last 7 days</h2>
              <p className="text-xs text-cream/50 mt-0.5">Excludes cancelled orders</p>
            </div>
            <TrendingUp className="text-gold" size={18} />
          </div>
          <div className="flex items-end gap-3 h-48">
            {(extras?.weekly ?? []).map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-full">
                  <div
                    className="w-full gradient-gold rounded-t-md transition-all"
                    style={{ height: `${(d.revenue / maxRev) * 100}%`, minHeight: d.revenue ? 4 : 0 }}
                    title={`PKR ${Math.round(d.revenue).toLocaleString()} • ${d.orders} orders`}
                  />
                </div>
                <span className="text-[11px] text-cream/50">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="font-serif text-xl text-cream mb-4">Top items</h2>
          {(extras?.topFoods ?? []).length === 0 ? (
            <p className="text-cream/50 text-sm">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {extras?.topFoods.map((t) => (
                <li key={t.name}>
                  <div className="flex justify-between text-sm text-cream/80">
                    <span className="truncate">{t.name}</span>
                    <span className="text-gold">{t.qty}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full gradient-gold" style={{ width: `${(t.qty / maxQty) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-cream">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs text-gold hover:underline">View all →</Link>
        </div>
        {(extras?.recent ?? []).length === 0 ? (
          <p className="text-cream/50 text-sm">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-cream/50 text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Total</th>
                  <th className="py-2 pr-4">When</th>
                </tr>
              </thead>
              <tbody className="text-cream/80">
                {extras?.recent.map((o) => (
                  <tr key={o.id} className="border-t border-white/5">
                    <td className="py-2.5 pr-4 font-mono text-xs text-gold">{o.order_number}</td>
                    <td className="py-2.5 pr-4">{o.customer_name}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${statusTone[o.status] ?? "border-white/10 text-cream/60"}`}>
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right text-gold">PKR {Math.round(Number(o.total)).toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-cream/50 text-xs">{new Date(o.created_at).toLocaleString()}</td>
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
