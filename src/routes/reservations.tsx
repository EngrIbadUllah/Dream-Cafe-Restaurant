import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/coming-soon";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reserve a Table — Dream Cafe & Restaurant" },
      {
        name: "description",
        content:
          "Book a table at Dream Cafe & Restaurant on Noor Kot Road, Shakargarh. Instant WhatsApp confirmation.",
      },
      { property: "og:title", content: "Reserve a Table — Dream Cafe & Restaurant" },
      {
        property: "og:description",
        content: "Book a table online with instant WhatsApp confirmation.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Reservations"
      title="Online table booking arriving soon"
      description="Pick a date, party size and time — with admin approval and WhatsApp confirmation. For now, call 0300 1212790 to reserve."
    />
  ),
});
