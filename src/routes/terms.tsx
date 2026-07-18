import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/site-shell";
import { site } from "@/lib/site-config";
import { useBusinessInfo } from "@/hooks/use-business-info";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: `Terms of Service — ${site.name}` },
      {
        name: "description",
        content: `Terms and conditions for using the ${site.name} website and ordering service.`,
      },
      { property: "og:title", content: `Terms of Service — ${site.name}` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const site = useBusinessInfo();
  const updated = "July 11, 2026";
  return (
    <SiteShell>
      <section className="container-page py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl md:text-5xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>

          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none text-[15px] leading-relaxed">
            <p>
              By using the {site.name} website and services you agree to the following terms.
              Please read them carefully.
            </p>

            <h2>Orders</h2>
            <ul>
              <li>All orders are subject to availability and confirmation by our team.</li>
              <li>Prices are listed in Pakistani Rupees (Rs) and may change without notice.</li>
              <li>Delivery times are estimates and may vary due to weather or demand.</li>
            </ul>

            <h2>Payment</h2>
            <p>
              We currently accept Cash on Delivery for delivery orders and cash or card on arrival
              for dine-in. Payment is due when the order is delivered or served.
            </p>

            <h2>Cancellations & refunds</h2>
            <p>
              You may cancel an order at no charge before we start preparing it. Once cooking has
              begun, we cannot cancel or refund the order. If there is a problem with your order,
              contact us immediately so we can make it right.
            </p>

            <h2>Reservations</h2>
            <p>
              A reservation request is not a guaranteed booking until our team confirms it. We
              hold reserved tables for 15 minutes past the booking time.
            </p>

            <h2>Reviews and content</h2>
            <p>
              By submitting a review or photo you grant us the right to display it on this
              website. We reserve the right to remove content that is abusive, false or violates
              the rights of others.
            </p>

            <h2>Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, {site.name} is not liable for indirect or
              consequential damages arising from use of this website or our services.
            </p>

            <h2>Changes</h2>
            <p>
              We may update these terms from time to time. The latest version is always available
              on this page.
            </p>

            <h2>Contact</h2>
            <p>
              Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a> or call{" "}
              <a href={`tel:${site.phones[0].tel}`}>{site.phones[0].number}</a>.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
