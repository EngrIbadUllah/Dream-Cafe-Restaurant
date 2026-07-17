import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Package, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site/site-shell";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { formatPKR } from "@/hooks/use-cart";
import { site } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: `Order History — ${site.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  order_type: string;
  total: number;
  payment_status: string;
  created_at: string;
  customer_phone: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  confirmed: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  preparing: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  ready: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  out_for_delivery: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

function OrdersPage() {
  const { user } = Route.useRouteContext();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    supabase
      .from("orders")
      .select("id, order_number, status, order_type, total, payment_status, created_at, customer_phone")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setOrders((data ?? []) as OrderRow[]);
        setLoading(false);
      });
  }, [user.id]);

  return (
    <SiteShell>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen bg-background">
        <div className="container-page max-w-4xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="mt-2 font-display text-4xl text-foreground">Order History</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                All the orders placed with this account.
              </p>
            </div>
            <Link
              to="/menu"
              className="hidden sm:inline-flex items-center gap-2 rounded-full gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Order again
            </Link>
          </div>

          {loading ? (
            <div className="mt-16 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" size={16} /> Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-16 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-gold text-primary-foreground">
                <Package size={22} />
              </div>
              <h2 className="mt-4 font-display text-2xl">No orders yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                When you place an order, it will show up here.
              </p>
              <Link
                to="/menu"
                className="mt-6 inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Browse menu <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <ul className="mt-8 grid gap-3">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    to="/order/$orderNumber"
                    params={{ orderNumber: o.order_number }}
                    search={{}}
                    onClick={() => { try { sessionStorage.setItem(`order-phone:${o.order_number}`, o.customer_phone); } catch { /* ignore */ } }}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 hover:border-gold/60 transition"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                      <Package size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-base sm:text-lg">
                          {o.order_number}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_STYLES[o.status] ?? "border-border text-muted-foreground"}`}
                        >
                          {o.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleString()} ·{" "}
                        {o.order_type.replace("_", " ")} · {o.payment_status}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg text-gold">
                        {formatPKR(Number(o.total))}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground group-hover:text-gold">
                        View details →
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </SiteShell>
  );
}
