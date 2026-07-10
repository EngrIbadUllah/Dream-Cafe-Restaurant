import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Clock, Users, PartyPopper } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { site } from "@/lib/site-config";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations — Dream Cafe & Restaurant Shakargarh" },
      { name: "description", content: "Reserve a table at Dream Cafe & Restaurant, Shakargarh. Family-friendly, private events, and celebrations welcome." },
      { property: "og:title", content: "Reserve a Table — Dream Cafe" },
      { property: "og:description", content: "Book your table in seconds. Family dining, birthdays, and private events." },
    ],
  }),
  component: ReservationsPage,
});

const schema = z.object({
  customer_name: z.string().trim().min(2, "Name is required").max(100),
  customer_phone: z.string().trim().regex(/^[\d+\s\-]{7,20}$/, "Valid phone required"),
  customer_email: z.string().trim().email().max(255).optional().or(z.literal("")),
  party_size: z.number().int().min(1).max(50),
  reservation_date: z.string().min(1, "Pick a date"),
  reservation_time: z.string().min(1, "Pick a time"),
  occasion: z.string().max(60).optional().or(z.literal("")),
  special_requests: z.string().max(500).optional().or(z.literal("")),
});

function ReservationsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: user?.email ?? "",
    party_size: 2,
    reservation_date: "",
    reservation_time: "",
    occasion: "",
    special_requests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsed = schema.parse({ ...form, party_size: Number(form.party_size) });
      const payload = {
        ...parsed,
        customer_email: parsed.customer_email || null,
        occasion: parsed.occasion || null,
        special_requests: parsed.special_requests || null,
        user_id: user?.id ?? null,
      };
      const { error } = await supabase.from("reservations").insert(payload);
      if (error) throw error;
      setDone(true);
      toast.success("Reservation received! We'll confirm shortly.");
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <SiteShell>
        <section className="container-page pt-36 pb-24 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full gradient-gold text-primary-foreground">
            <CalendarCheck size={28} />
          </div>
          <h1 className="mt-6 font-display text-4xl">Reservation received</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Thank you, {form.customer_name}. Our team will call {form.customer_phone} shortly to confirm your table for {form.party_size} on {form.reservation_date} at {form.reservation_time}.
          </p>
          <button onClick={() => { setDone(false); setForm({ ...form, customer_name: "", customer_phone: "", reservation_date: "", reservation_time: "", occasion: "", special_requests: "" }); }} className="mt-8 rounded-full border border-border px-6 py-3 text-sm font-semibold">
            Book another table
          </button>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="pt-36 pb-8 sm:pt-44">
        <div className="container-page text-center">
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">
            Reserve your <span className="italic text-gold">perfect evening.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Book a table in seconds. Birthdays, anniversaries, family dinners — tell us what you're planning and we'll take care of the rest.
          </p>
        </div>
      </section>

      <section className="section-y pt-4">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-border bg-card p-6 sm:p-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name *">
                <input required className="input-base" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Your name" />
              </Field>
              <Field label="Phone *">
                <input required className="input-base" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="0300 1234567" />
              </Field>
            </div>
            <Field label="Email (optional)">
              <input type="email" className="input-base" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} placeholder="you@example.com" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Party size *">
                <input type="number" min={1} max={50} required className="input-base" value={form.party_size} onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })} />
              </Field>
              <Field label="Date *">
                <input type="date" min={today} required className="input-base" value={form.reservation_date} onChange={(e) => setForm({ ...form, reservation_date: e.target.value })} />
              </Field>
              <Field label="Time *">
                <input type="time" required className="input-base" value={form.reservation_time} onChange={(e) => setForm({ ...form, reservation_time: e.target.value })} />
              </Field>
            </div>
            <Field label="Occasion (optional)">
              <select className="input-base" value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
                <option value="">— none —</option>
                <option>Birthday</option>
                <option>Anniversary</option>
                <option>Family dinner</option>
                <option>Business meeting</option>
                <option>Engagement</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Special requests (optional)">
              <textarea rows={3} maxLength={500} className="input-base" value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} placeholder="Cake, seating preference, allergies..." />
            </Field>
            <button disabled={submitting} className="w-full rounded-full gradient-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {submitting ? "Booking..." : "Reserve table"}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              We'll call to confirm within 30 minutes during business hours.
            </p>
          </form>

          <aside className="space-y-4">
            <InfoCard icon={Clock} title="Hours">
              <ul className="space-y-1.5 text-sm">
                {site.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-medium">{h.time}</span>
                  </li>
                ))}
              </ul>
            </InfoCard>
            <InfoCard icon={Users} title="Group bookings">
              For parties of 10+, please call {site.phones[0].number} so we can arrange seating and a set menu.
            </InfoCard>
            <InfoCard icon={PartyPopper} title="Private events">
              Birthdays, engagements, corporate dinners — we handle décor, cake and set menus. Mention the occasion above.
            </InfoCard>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function InfoCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl gradient-gold text-primary-foreground">
          <Icon size={16} />
        </div>
        <h3 className="font-display text-lg">{title}</h3>
      </div>
      <div className="mt-4 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
