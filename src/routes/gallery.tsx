import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/coming-soon";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Dream Cafe & Restaurant" },
      {
        name: "description",
        content:
          "A visual tour of Dream Cafe & Restaurant Shakargarh — food, interior and events.",
      },
      { property: "og:title", content: "Gallery — Dream Cafe & Restaurant" },
      {
        property: "og:description",
        content: "Photos and videos from Dream Cafe & Restaurant Shakargarh.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Gallery"
      title="Photos and videos coming soon"
      description="A curated gallery with lightbox and categories will land after we wire up storage."
    />
  ),
});
