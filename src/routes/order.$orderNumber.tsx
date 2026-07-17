import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CheckCircle2, Clock, Copy, Package, Truck, Utensils } from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/site-shell";
import { trackOrder } from "@/lib/orders.functions";
import { formatPKR } from "@/hooks/use-cart";
import { site, whatsappLink } from "@/lib/site-config";

const searchSchema = z.object({ phone: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/order/$orderNumber")({
  validateSearch: (s) => searchSchema.parse(s),
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderNumber} — Dream Cafe` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderTrackPage,
});

const STATUS_STEPS = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: "Received", confirmed: "Confirmed", preparing: "Preparing",
  ready: "Ready", out_for_delivery: "On the way", delivered: "Delivered",
  completed: "Completed", cancelled: "Cancelled",
};

function OrderTrackPage() {
  const { orderNumber } = Route.useParams();
  const search = Route.useSearch();
  const track = useServerFn(trackOrder);

  const stashed = typeof window !== "undefined" ? sessionStorage.getItem(`order-phone:${orderNumber}`) : null;
  const [phone, setPhone] = useState(stashed ?? search.phone ?? "");
  const [data, setData] = useState<Awaited<ReturnType<typeof trackOrder>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  async function lookup(p: string) {
    setLoading(true); setError(null);
    try {
      const res = await track({ data: { order_number: orderNumber, phone: p } });
      setData(res);
      if (!res.order) setError("No order found with that number and phone.");
      else {
        try { sessionStorage.setItem(`order-phone:${orderNumber}`, p); } catch { /* ignore */ }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(false); setTried(true);
    }
  }

  useEffect(() => {
    const auto = stashed ?? search.phone;
    if (auto) lookup(auto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const order = data?.order;
  const stepIdx = order ? STATUS_STEPS.indexOf(order.status as typeof STATUS_STEPS[number]) : -1;

  return (
    <SiteShell>
      <section className="container-page pt-28 pb-16">
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-4xl md:text-5xl">Order {orderNumber}</h1>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(orderNumber);
              toast.success("Order number copied");
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-gold hover:text-gold"
          >
            <Copy size={12} /> Copy
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Save this number — you can look up your order anytime on the{" "}
          <Link to="/track" className="text-gold hover:underline">Track Order</Link> page.
        </p>

        {!order && (
          <form
            onSubmit={(e) => { e.preventDefault(); lookup(phone); }}
            className="mt-8 max-w-md rounded-2xl border border-border bg-card p-6"
          >
            <label className="text-sm text-muted-foreground">Enter the phone number used for the order</label>
            <input
              className="input-base mt-2 w-full"
              placeholder="0300 *******"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button className="mt-3 w-full rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground" disabled={loading}>
              {loading ? "Looking up…" : "Track Order"}
            </button>
            {tried && error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </form>
        )}

        {order && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full gradient-gold text-primary-foreground">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl">Thanks, {order.customer_name.split(" ")[0]}!</h2>
                    <p className="text-sm text-muted-foreground">
                      We received your order on {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.status === "cancelled" ? (
                  <p className="mt-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
                    This order was cancelled. Please contact us if this is unexpected.
                  </p>
                ) : (
                  <ol className="mt-8 grid grid-cols-5 gap-2">
                    {STATUS_STEPS.map((s, i) => {
                      const done = i <= stepIdx;
                      const Icon = i === 0 ? Clock : i === 1 ? CheckCircle2 : i === 2 ? Utensils : i === 3 ? Truck : Package;
                      return (
                        <li key={s} className="flex flex-col items-center text-center">
                          <div className={`grid h-10 w-10 place-items-center rounded-full border ${done ? "border-gold bg-gold/15 text-gold" : "border-border text-muted-foreground"}`}>
                            <Icon size={16} />
                          </div>
                          <p className={`mt-2 text-[11px] ${done ? "text-foreground" : "text-muted-foreground"}`}>
                            {STATUS_LABELS[s]}
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-lg">Order Items</h3>
                <ul className="mt-4 divide-y divide-border">
                  {data!.items.map((it, idx) => (
                    <li key={idx} className="flex items-center justify-between py-3 text-sm">
                      <span>{it.quantity}× {it.food_name}</span>
                      <span>{formatPKR(it.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-display text-lg">Summary</h3>
                <dl className="mt-3 space-y-1 text-sm">
                  <Row label="Subtotal" value={formatPKR(order.subtotal)} />
                  {order.discount > 0 && <Row label="Discount" value={`-${formatPKR(order.discount)}`} />}
                  <Row label="Delivery" value={order.delivery_fee ? formatPKR(order.delivery_fee) : "Free"} />
                  <div className="flex justify-between border-t border-border pt-2 mt-2 font-display text-lg">
                    <span>Total</span><span className="text-gold">{formatPKR(order.total)}</span>
                  </div>
                </dl>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <p>Payment: {order.payment_method.replace("_", " ")} · {order.payment_status}</p>
                  <p>Type: {order.order_type.replace("_", " ")}</p>
                  {order.delivery_address && <p>To: {order.delivery_address}, {order.delivery_city}</p>}
                </div>
                <a
                  href={whatsappLink(`Hi, about my order ${order.order_number}`)}
                  target="_blank" rel="noreferrer"
                  className="mt-4 block rounded-full border border-border px-5 py-2.5 text-center text-sm hover:border-gold hover:text-gold"
                >
                  Chat on WhatsApp
                </a>
                <Link to="/menu" className="mt-2 block rounded-full gradient-gold px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground">
                  Order again
                </Link>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Questions? Call {site.phones[1].number}
              </p>
            </aside>
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
