import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStats } from "@/lib/admin.functions";
import {
  ShoppingBag, CalendarCheck, Star, MessageSquare, UtensilsCrossed, Users, DollarSign, Clock,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const fn = useServerFn(getAdminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "stats"], queryFn: () => fn() });

  const stats = [
    { label: "Total Revenue", value: `PKR ${Math.round(data?.revenue ?? 0).toLocaleString()}`, icon: DollarSign, tone: "gold" },
    { label: "Total Orders", value: data?.ordersCount ?? 0, icon: ShoppingBag, tone: "cream", badge: data?.pendingOrders ? `${data.pendingOrders} pending` : undefined },
    { label: "Reservations", value: data?.reservationsCount ?? 0, icon: CalendarCheck, tone: "cream", badge: data?.pendingReservations ? `${data.pendingReservations} pending` : undefined },
    { label: "Reviews", value: data?.reviewsCount ?? 0, icon: Star, tone: "cream", badge: data?.pendingReviews ? `${data.pendingReviews} to approve` : undefined },
    { label: "Unread Messages", value: data?.unreadMessages ?? 0, icon: MessageSquare, tone: "cream" },
    { label: "Menu Items", value: data?.foodsCount ?? 0, icon: UtensilsCrossed, tone: "cream" },
    { label: "Customers", value: data?.customersCount ?? 0, icon: Users, tone: "cream" },
    { label: "Now", value: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), icon: Clock, tone: "cream" },
  ] as const;

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

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="font-serif text-xl text-cream mb-2">Welcome, Admin</h2>
        <p className="text-cream/60 text-sm">
          Use the sidebar to manage menu items, orders, reservations, reviews, gallery, offers, blog posts, customers, and site settings.
          All changes go live instantly.
        </p>
      </div>
    </div>
  );
}
