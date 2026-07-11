import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { site, whatsappLink } from "@/lib/site-config";
import { useBusinessInfo } from "@/hooks/use-business-info";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Dream Cafe & Restaurant Shakargarh" },
      { name: "description", content: `Reach Dream Cafe & Restaurant on Noor Kot Road, Shakargarh. Call ${site.phones[0].number}, WhatsApp us, or send a message.` },
      { property: "og:title", content: "Contact — Dream Cafe & Restaurant" },
      { property: "og:description", content: "Address, phone, WhatsApp, hours and directions." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(1500),
});

function Contact() {
  const s = useBusinessInfo();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsed = schema.parse(form);
      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone || null,
        subject: parsed.subject || null,
        message: parsed.message,
      });
      if (error) throw error;
      toast.success("Message sent! We'll be in touch soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteShell>
      <section className="pt-28 pb-8 sm:pt-32">
        <div className="container-page text-center">
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">
            We'd love to <span className="italic text-gold">hear from you.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Questions, feedback, private events, catering — reach us any way you like. We reply on WhatsApp fastest.
          </p>
        </div>
      </section>

      <section className="section-y pt-4">
        <div className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ContactCard icon={Phone} title="Call us" action={{ href: `tel:${s.phones[0].tel}`, label: s.phones[0].number }}>Reservations & general</ContactCard>
          <ContactCard icon={MessageCircle} title="WhatsApp" action={{ href: whatsappLink(), label: "Open chat" }}>Fastest for orders</ContactCard>
          <ContactCard icon={Mail} title="Email" action={{ href: `mailto:${s.email}`, label: s.email }}>Partnerships & press</ContactCard>
          <ContactCard icon={MapPin} title="Visit" action={{ href: "https://maps.google.com/?q=Dream+Cafe+Restaurant+Noor+Kot+Road+Shakargarh", label: "Open in Maps" }}>{s.address.line1}, {s.address.city}</ContactCard>
        </div>


        <div className="container-page mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-border bg-card p-8 space-y-4">
            <div>
              <h2 className="mt-2 font-display text-3xl">Drop us a line</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input required maxLength={100} placeholder="Your name" className="input-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" maxLength={255} placeholder="Email" className="input-base" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input maxLength={30} placeholder="Phone (optional)" className="input-base" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input maxLength={120} placeholder="Subject (optional)" className="input-base" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <textarea required rows={5} maxLength={1500} placeholder="How can we help?" className="input-base" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button disabled={submitting} className="w-full rounded-full gradient-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {submitting ? "Sending..." : "Send message"}
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-border bg-card p-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Clock size={14} className="text-gold" /> Hours
              </div>
              <ul className="mt-4 divide-y divide-border">
                {s.hours.map((h) => (
                  <li key={h.day} className="flex justify-between py-3">
                    <span className="text-muted-foreground">{h.day}</span>
                    <span className="font-medium">{h.time}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Address</p>
                <p className="mt-2 text-foreground">{s.address.line1}, {s.address.city}, {s.address.postalCode}, {s.address.country}</p>
              </div>
            </div>
            <div className="min-h-[320px] overflow-hidden rounded-[2rem] border border-border">
              <iframe title="Dream Cafe & Restaurant on Google Maps" src={site.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full" />

            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function ContactCard({ icon: Icon, title, children, action }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; children: React.ReactNode; action: { href: string; label: string }; }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-gold text-primary-foreground">
        <Icon size={18} />
      </div>
      <h3 className="mt-5 font-display text-xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      <a href={action.href} target={action.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline">
        {action.label} →
      </a>
    </div>
  );
}
