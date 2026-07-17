import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Phone, Hash, Search, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { findOrdersByPhone } from "@/lib/orders.functions";
import { formatPKR } from "@/hooks/use-cart";
import { site } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Order — Dream Cafe & Restaurant" },
      {
        name: "description",
        content:
          "Track your Dream Cafe order using your phone number or order number. Live status updates for delivery, takeaway and dine-in orders.",
      },
      { property: "og:title", content: "Track Your Order — Dream Cafe" },
      {
        property: "og:description",
        content: "Look up your order status by phone number or order number.",
      },
    ],
  }),
  component: TrackPage,
});

type Mode = "phone" | "order";

function TrackPage() {
  const [mode, setMode] = useState<Mode>("phone");
  const findByPhone = useServerFn(findOrdersByPhone);
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderPhone, setOrderPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<
    Awaited<ReturnType<typeof findOrdersByPhone>>["orders"] | null
  >(null);

  async function handlePhoneLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrders(null);
    try {
      const res = await findByPhone({ data: { phone } });
      setOrders(res.orders);
      if (res.orders.length === 0)
        setError("No orders found for this phone number in the last 90 days.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <section className="container-page pt-28 pb-16">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl">Track your order</h1>
          <p className="mt-3 text-muted-foreground">
            No account needed. Look up your order using the phone number you placed it with — or the
            order number we sent you.
          </p>
        </div>

        <div className="mt-8 inline-flex rounded-full border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => {
              setMode("phone");
              setError(null);
            }}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
              mode === "phone"
                ? "gradient-gold text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Phone size={14} /> By phone
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("order");
              setError(null);
            }}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
              mode === "order"
                ? "gradient-gold text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Hash size={14} /> By order number
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-border bg-card p-6">
            {mode === "phone" ? (
              <form onSubmit={handlePhoneLookup} className="space-y-4">
                <label className="block">
                  <span className="text-sm text-muted-foreground">
                    Phone number used for the order
                  </span>
                  <input
                    className="input-base mt-2 w-full"
                    type="tel"
                    placeholder="0300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoFocus
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  <Search size={16} /> {loading ? "Searching…" : "Find my orders"}
                </button>
                {error && <p className="text-sm text-destructive">{error}</p>}

                {orders && orders.length > 0 && (
                  <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
                    {orders.map((o) => (
                      <li key={o.order_number}>
                        <Link
                          to="/order/$orderNumber"
                          params={{ orderNumber: o.order_number }}
                          search={{}}
                          onClick={() => { try { sessionStorage.setItem(`order-phone:${o.order_number}`, phone); } catch { /* ignore */ } }}
                          className="flex items-center justify-between gap-3 p-4 hover:bg-muted/60 transition"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-gold">
                                {o.order_number}
                              </span>
                              <StatusBadge status={o.status} />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {o.order_type.replace("_", " ")} ·{" "}
                              {new Date(o.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold whitespace-nowrap">
                              {formatPKR(Number(o.total))}
                            </span>
                            <ArrowRight size={16} className="text-muted-foreground" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const n = orderNumber.trim();
                  const p = orderPhone.trim();
                  if (!n || !p) return;
                  try { sessionStorage.setItem(`order-phone:${n}`, p); } catch { /* ignore */ }
                  navigate({
                    to: "/order/$orderNumber",
                    params: { orderNumber: n },
                    search: {},
                  });
                }}
                className="space-y-4"
              >
                <label className="block">
                  <span className="text-sm text-muted-foreground">Order number</span>
                  <input
                    className="input-base mt-2 w-full font-mono uppercase"
                    placeholder="DC-20260711-0001"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-muted-foreground">
                    Phone number used at checkout
                  </span>
                  <input
                    className="input-base mt-2 w-full"
                    type="tel"
                    placeholder="0300 1234567"
                    value={orderPhone}
                    onChange={(e) => setOrderPhone(e.target.value)}
                    required
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <Search size={16} /> Track order
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-lg">Need help?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Can't find your order? Call us and we'll look it up right away.
              </p>
              <div className="mt-4 space-y-2">
                {site.phones.map((p) => (
                  <a
                    key={p.tel}
                    href={`tel:${p.tel}`}
                    className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm hover:border-gold hover:text-gold"
                  >
                    <span className="flex items-center gap-2">
                      <Phone size={14} /> {p.label}
                    </span>
                    <span className="font-mono">{p.number}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-border p-5 text-xs text-muted-foreground">
              <p className="flex items-center gap-2 text-foreground/80">
                <CheckCircle2 size={14} className="text-gold" /> Secure lookup
              </p>
              <p className="mt-2">
                We only reveal order details to callers who know the phone number used at checkout.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-muted text-foreground/70",
    confirmed: "bg-blue-500/15 text-blue-400",
    preparing: "bg-amber-500/15 text-amber-400",
    ready: "bg-amber-500/15 text-amber-400",
    out_for_delivery: "bg-indigo-500/15 text-indigo-300",
    delivered: "bg-emerald-500/15 text-emerald-400",
    completed: "bg-emerald-500/15 text-emerald-400",
    cancelled: "bg-destructive/15 text-destructive",
  };
  const label: Record<string, string> = {
    pending: "Received",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready",
    out_for_delivery: "On the way",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        map[status] || "bg-muted",
      )}
    >
      <Clock size={10} /> {label[status] || status}
    </span>
  );
}
