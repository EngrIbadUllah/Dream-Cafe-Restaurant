import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import { site, whatsappLink } from "@/lib/site-config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Dream Cafe & Restaurant Shakargarh" },
      {
        name: "description",
        content: `Reach Dream Cafe & Restaurant on Noor Kot Road, Shakargarh. Call ${site.phones[0].number}, WhatsApp us, or drop by.`,
      },
      { property: "og:title", content: "Contact — Dream Cafe & Restaurant" },
      {
        property: "og:description",
        content: "Address, phone, WhatsApp, hours and directions.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <SiteShell>
      <section className="pt-36 pb-10 sm:pt-44">
        <div className="container-page text-center">
          <p className="eyebrow justify-center">Get in touch</p>
          <h1 className="mt-4 font-display text-5xl sm:text-6xl">
            We'd love to <span className="italic text-gold">hear from you.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Questions, feedback, private events, catering — reach us any way
            you like. We reply on WhatsApp fastest.
          </p>
        </div>
      </section>

      <section className="section-y pt-4">
        <div className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card
            icon={Phone}
            title="Call us"
            action={{ href: `tel:${site.phones[0].tel}`, label: site.phones[0].number }}
          >
            Reservations & general
          </Card>
          <Card
            icon={MessageCircle}
            title="WhatsApp"
            action={{ href: whatsappLink(), label: "Open chat" }}
          >
            Fastest for orders
          </Card>
          <Card
            icon={Mail}
            title="Email"
            action={{ href: `mailto:${site.email}`, label: site.email }}
          >
            Partnerships & press
          </Card>
          <Card
            icon={MapPin}
            title="Visit"
            action={{
              href: "https://maps.google.com/?q=Dream+Cafe+Restaurant+Noor+Kot+Road+Shakargarh",
              label: "Open in Maps",
            }}
          >
            {site.address.line1}, {site.address.city}
          </Card>
        </div>

        <div className="container-page mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-[2rem] border border-border bg-card p-8">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Clock size={14} className="text-gold" /> Hours
            </div>
            <ul className="mt-4 divide-y divide-border">
              {site.hours.map((h) => (
                <li key={h.day} className="flex justify-between py-3">
                  <span className="text-muted-foreground">{h.day}</span>
                  <span className="font-medium">{h.time}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Address
              </p>
              <p className="mt-2 text-foreground">
                {site.address.line1}, {site.address.city}, {site.address.postalCode},{" "}
                {site.address.country}
              </p>
            </div>
          </div>

          <div className="min-h-[420px] overflow-hidden rounded-[2rem] border border-border">
            <iframe
              title="Dream Cafe & Restaurant on Google Maps"
              src={site.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full"
            />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Card({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
  action: { href: string; label: string };
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="grid h-11 w-11 place-items-center rounded-2xl gradient-gold text-primary-foreground">
        <Icon size={18} />
      </div>
      <h3 className="mt-5 font-display text-xl">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      <a
        href={action.href}
        target={action.href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:underline"
      >
        {action.label} →
      </a>
    </div>
  );
}
