import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Copy, Upload, Loader2, X } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { useCart, formatPKR } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { placeOrder } from "@/lib/orders.functions";
import { toast } from "sonner";
import { site } from "@/lib/site-config";
import { useBusinessInfo } from "@/hooks/use-business-info";
import { usePaymentAccounts } from "@/hooks/use-payment-accounts";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Demo Restaurant" },
      { name: "description", content: "Complete your order for delivery or takeaway from Demo Restaurant Shakargarh." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const DELIVERY_FEE = 150;

function CheckoutPage() {
  const site = useBusinessInfo();
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const submit = useServerFn(placeOrder);
  const accounts = usePaymentAccounts();

  type PayMethod = "cod" | "bank_transfer" | "easypaisa" | "jazzcash";

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: user?.email ?? "",
    order_type: "delivery" as "delivery" | "takeaway" | "dine_in",
    payment_method: "cod" as PayMethod,
    delivery_address: "",
    delivery_city: "Shakargarh",
    delivery_notes: "",
    notes: "",
    coupon_code: "",
    payment_transaction_id: "",
  });
  const [proof, setProof] = useState<{ base64: string; name: string; preview: string } | null>(null);
  const proofRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((f) => ({ ...f, customer_email: user?.email ?? f.customer_email }));
  }, [user]);

  async function handleProof(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please upload an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max screenshot size is 5MB");
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result || "");
      setProof({ base64, name: file.name, preview: base64 });
    };
    reader.readAsDataURL(file);
  }

  if (items.length === 0) {
    return (
      <SiteShell>
        <section className="container-page pt-28 pb-16 text-center">
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
    const needsProof = form.payment_method === "easypaisa" || form.payment_method === "jazzcash" || form.payment_method === "bank_transfer";
    const needsTxn = form.payment_method === "easypaisa" || form.payment_method === "jazzcash";
    if (needsTxn && !form.payment_transaction_id.trim()) {
      toast.error("Please enter the transaction ID");
      return;
    }
    if (needsProof && !proof) {
      toast.error("Please upload a payment screenshot");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          ...form,
          payment_transaction_id: form.payment_transaction_id.trim() || undefined,
          payment_proof_base64: proof?.base64,
          user_id: user?.id ?? null,
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
                  <input required type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="0300 *******" className="input-base" />
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
                {([
                  { id: "cod" as const, label: "Cash on Delivery", desc: "Pay when your order arrives.", show: true },
                  { id: "easypaisa" as const, label: "EasyPaisa", desc: "Transfer to our EasyPaisa account.", show: accounts.easypaisa.enabled },
                  { id: "jazzcash" as const, label: "JazzCash", desc: "Transfer to our JazzCash account.", show: accounts.jazzcash.enabled },
                  { id: "bank_transfer" as const, label: "Bank Transfer", desc: "Send to our bank account.", show: accounts.bank.enabled },
                ]).filter((m) => m.show).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setForm({ ...form, payment_method: m.id })}
                    className={`rounded-xl border p-4 text-left transition ${
                      form.payment_method === m.id ? "border-gold bg-gold/10" : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <p className="font-medium">{m.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
                  </button>
                ))}
              </div>

              {(form.payment_method === "easypaisa" || form.payment_method === "jazzcash" || form.payment_method === "bank_transfer") && (
                <div className="mt-4 rounded-xl border border-gold/30 bg-gold/[0.06] p-4 text-sm">
                  <p className="text-xs text-muted-foreground mb-2">{accounts.instructions}</p>
                  <PaymentDetails
                    account={
                      form.payment_method === "easypaisa"
                        ? { title: accounts.easypaisa.account_title, number: accounts.easypaisa.account_number }
                        : form.payment_method === "jazzcash"
                        ? { title: accounts.jazzcash.account_title, number: accounts.jazzcash.account_number }
                        : { title: accounts.bank.account_title, number: accounts.bank.account_number, extra: [accounts.bank.bank_name, accounts.bank.iban || ""].filter(Boolean) }
                    }
                  />
                  {(form.payment_method === "easypaisa" || form.payment_method === "jazzcash") && (
                    <Field label="Transaction ID *" className="mt-3">
                      <input
                        required
                        value={form.payment_transaction_id}
                        onChange={(e) => setForm({ ...form, payment_transaction_id: e.target.value })}
                        placeholder="e.g. 12345678901"
                        className="input-base"
                      />
                    </Field>
                  )}
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Payment screenshot {form.payment_method === "bank_transfer" ? "*" : "*"}
                    </p>
                    <input ref={proofRef} type="file" accept="image/*" onChange={handleProof} className="hidden" />
                    {proof ? (
                      <div className="relative inline-block">
                        <img src={proof.preview} alt="proof" className="max-h-40 rounded-lg border border-border" />
                        <button
                          type="button"
                          onClick={() => { setProof(null); if (proofRef.current) proofRef.current.value = ""; }}
                          className="absolute -top-2 -right-2 rounded-full bg-background border border-border p-1"
                          aria-label="Remove"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => proofRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gold/50 px-4 py-2 text-sm hover:bg-gold/10"
                      >
                        <Upload size={14} /> Upload screenshot
                      </button>
                    )}
                  </div>
                </div>
              )}

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

function PaymentDetails({ account }: { account: { title: string; number: string; extra?: string[] } }) {
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };
  return (
    <div className="space-y-1.5">
      {account.title && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs">Account title</span>
          <span className="font-medium">{account.title}</span>
        </div>
      )}
      {account.number && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs">Account number</span>
          <button type="button" onClick={() => copy(account.number)} className="inline-flex items-center gap-1.5 font-mono font-medium text-gold hover:underline">
            {account.number} <Copy size={12} />
          </button>
        </div>
      )}
      {account.extra?.map((line, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground text-xs">{i === 0 ? "Bank" : "IBAN"}</span>
          <span className="font-medium">{line}</span>
        </div>
      ))}
    </div>
  );
}
