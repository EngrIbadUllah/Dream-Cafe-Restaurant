import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/site-shell";
import { site } from "@/lib/site-config";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${site.name}` },
      {
        name: "description",
        content: `How ${site.name} collects, uses and protects your personal information.`,
      },
      { property: "og:title", content: `Privacy Policy — ${site.name}` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const updated = "July 11, 2026";
  return (
    <SiteShell>
      <section className="container-page py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>

          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none text-[15px] leading-relaxed">
            <p>
              This page describes how {site.name} ("we", "us") collects and uses personal
              information when you use our website, place an order, or make a reservation.
            </p>

            <h2>Information we collect</h2>
            <ul>
              <li>Name, phone number and delivery address when you place an order.</li>
              <li>Email address if you create an account or subscribe to updates.</li>
              <li>Order history and preferences to improve your experience.</li>
              <li>Basic device information (browser, screen size) for security and analytics.</li>
            </ul>

            <h2>How we use your information</h2>
            <ul>
              <li>To prepare, deliver and track your orders.</li>
              <li>To confirm reservations and contact you about your booking.</li>
              <li>To respond to messages and support requests.</li>
              <li>To improve our menu, service and website.</li>
            </ul>

            <h2>Sharing your information</h2>
            <p>
              We do not sell your personal information. We only share it with trusted service
              providers required to operate the website (secure hosting and database), and when
              legally required.
            </p>

            <h2>Data retention</h2>
            <p>
              Order and reservation records are kept as long as needed for accounting and customer
              service. You may request deletion of your account and personal data at any time by
              contacting us.
            </p>

            <h2>Your rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data by
              emailing <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>

            <h2>Cookies</h2>
            <p>
              We use essential cookies and local storage to keep you signed in and remember your
              cart. We do not use third-party advertising trackers.
            </p>

            <h2>Contact</h2>
            <p>
              For privacy questions, contact us at{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
              <a href={`tel:${site.phones[0].tel}`}>{site.phones[0].number}</a>.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
