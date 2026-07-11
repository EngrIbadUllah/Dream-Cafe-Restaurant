import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/site-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { site, whatsappLink } from "@/lib/site-config";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `FAQ — ${site.name}` },
      {
        name: "description",
        content:
          "Answers to common questions about ordering, delivery, reservations, payments and dining at Dream Cafe & Restaurant Shakargarh.",
      },
      { property: "og:title", content: `FAQ — ${site.name}` },
      {
        property: "og:description",
        content: "Ordering, delivery, reservations and payment questions answered.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FaqPage,
});

const faqs: { q: string; a: string }[] = [
  {
    q: "How do I place an order?",
    a: "Browse the menu, add items to your cart and checkout. You can order as a guest — no account required. You will receive an order number to track your order in real time.",
  },
  {
    q: "Do I need an account to order?",
    a: "No. Guest checkout is fully supported. Creating an account lets you keep your order history and reorder faster.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We currently accept Cash on Delivery (COD) for delivery orders and cash or card on arrival for dine-in.",
  },
  {
    q: "How long does delivery take?",
    a: "Most deliveries within Shakargarh arrive in 30–45 minutes depending on order size and traffic. You will see live status updates on the tracking page.",
  },
  {
    q: "How do I track my order without an account?",
    a: "Visit the Track Order page and enter your order number and phone, or search by phone number alone to see all recent orders placed with that number.",
  },
  {
    q: "Can I book a table in advance?",
    a: "Yes. Use the Reservations page to request a table. We confirm reservations by phone or WhatsApp within a short time.",
  },
  {
    q: "Do you cater for private events?",
    a: `Yes — we host birthdays, family gatherings and corporate events. Contact us on WhatsApp at ${site.whatsapp} to discuss your event.`,
  },
  {
    q: "Is the restaurant halal?",
    a: "Yes. All meat served at Dream Cafe & Restaurant is 100% halal.",
  },
  {
    q: "Can I cancel or change my order?",
    a: "If your order has not entered preparation, call us right away and we will adjust or cancel it. Once cooking has started, changes may not be possible.",
  },
  {
    q: "How can I share feedback or a complaint?",
    a: "We take feedback seriously. Use the Contact page, WhatsApp, or leave a review on the Reviews page — the management team reads every message.",
  },
];

function FaqPage() {
  return (
    <SiteShell>
      <section className="container-page py-14 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl md:text-5xl">Frequently asked questions</h1>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know before ordering or dining with us.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border bg-card p-2 sm:p-4">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-6 text-center">
          <h2 className="font-display text-2xl">Still have a question?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our team usually replies within minutes on WhatsApp.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Chat on WhatsApp
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-semibold hover:bg-accent"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
