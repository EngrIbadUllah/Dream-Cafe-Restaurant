import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { useCart, formatPKR } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { placeOrder } from "@/lib/orders.functions";
import { toast } from "sonner";
import { site } from "@/lib/site-config";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Dream Cafe & Restaurant" },
      { name: "description", content: "Complete your order for delivery or takeaway from Dream Cafe Shakargarh." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const DELIVERY_FEE = 150;

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const submit = useServerFn(placeOrder);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: user?.email ?? "",
    order_type: "delivery" as "delivery" | "takeaway" | "dine_in",
    payment_method: "cod" as "cod" | "bank_transfer",
    delivery_address: "",
    delivery_city: "Shakargarh",
    delivery_notes: "",
    notes: "",
    coupon_code: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, customer_email: user?.email ?? f.customer_email }));
  }, [user]);

  if (items.length === 0) {
    return (
      <SiteShell>
        <section className="container-page pt-32 pb-24 text-center">
          <h1 className="mt-3 font-display text-4xl">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Add some dishes before checking out.</p>
          <Link to="/menu" className="mt-6 inline-flex rounded-full gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground">
            Browse Menu
          </Link>
        </section>
      </SiteShell>
    );
  }

  const delivery_fee = form.order_type === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + delivery_fee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          ...form,
          items: items.map((i) => ({
            food_id: i.id, food_name: i.name, unit_price: i.price, quantity: i.quantity,
          })),
        },
      });
      toast.success(`Order placed! ${res.order_number}`);
      clear();
      navigate({ to: "/order/$orderNumber", params: { orderNumber: res.order_number }, search: { phone: form.customer_phone } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteShell>
      <section className="container-page pt-28 pb-16">
        <h1 className="mt-3 font-display text-4xl md:text-5xl">Complete your order</h1>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card title="1 · Order Type">
              <div className="grid grid-cols-3 gap-2">
                {(["delivery", "takeaway", "dine_in"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, order_type: t })}
                    className={`rounded-xl border px-3 py-3 text-sm capitalize transition ${
                      form.order_type === t ? "border-gold bg-gold/15 text-gold" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.replace("_", " ")}
                  </button>
                ))}
              </div>
            </Card>

            <Card title="2 · Your Details">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name *">
                  <input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="input-base" />
                </Field>
                <Field label="Phone *">
                  <input required type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="0300 1234567" className="input-base" />
                </Field>
                <Field label="Email">
                  <input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className="input-base" />
                </Field>
              </div>
            </Card>

            {form.order_type === "delivery" && (
              <Card title="3 · Delivery Address">
                <div className="grid gap-3">
                  <Field label="Address *">
                    <textarea required rows={2} value={form.delivery_address} onChange={(e) => setForm({ ...form, delivery_address: e.target.value })} className="input-base" placeholder="House, street, area…" />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="City">
                      <input value={form.delivery_city} onChange={(e) => setForm({ ...form, delivery_city: e.target.value })} className="input-base" />
                    </Field>
                    <Field label="Landmark / notes">
                      <input value={form.delivery_notes} onChange={(e) => setForm({ ...form, delivery_notes: e.target.value })} className="input-base" placeholder="Near…" />
                    </Field>
                  </div>
                </div>
              </Card>
            )}

            <Card title={`${form.order_type === "delivery" ? "4" : "3"} · Payment`}>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["cod", "bank_transfer"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, payment_method: m })}
                    className={`rounded-xl border p-4 text-left transition ${
                      form.payment_method === m ? "border-gold bg-gold/10" : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <p className="font-medium">{m === "cod" ? "Cash on Delivery" : "Bank Transfer"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m === "cod" ? "Pay when your order arrives." : "We'll share account details on confirmation."}
                    </p>
                  </button>
                ))}
              </div>
              <Field label="Order notes (optional)" className="mt-3">
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-base" placeholder="Allergies, preferences…" />
              </Field>
            </Card>
          </div>

          <aside className="space-y-4">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-xl">Order Summary</h3>
              <ul className="mt-4 space-y-2 border-b border-border pb-4">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between text-sm">
                    <span>{i.quantity}× {i.name}</span>
                    <span className="text-muted-foreground">{formatPKR(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <input value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} placeholder="Coupon code" className="input-base flex-1" />
              </div>
              <dl className="mt-4 space-y-1 text-sm">
                <Row label="Subtotal" value={formatPKR(subtotal)} />
                <Row label={`Delivery`} value={delivery_fee ? formatPKR(delivery_fee) : "Free"} />
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-display text-lg">
                  <span>Total</span><span className="text-gold">{formatPKR(total)}</span>
                </div>
              </dl>
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg disabled:opacity-60"
              >
                <CheckCircle2 size={16} /> {submitting ? "Placing order…" : "Place Order"}
              </button>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Need help? Call {site.phones[1].number}
              </p>
            </div>
          </aside>
        </form>
      </section>
    </SiteShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className}`}>
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
