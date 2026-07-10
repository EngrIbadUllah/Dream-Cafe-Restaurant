import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/coming-soon";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Dream Cafe & Restaurant" },
      {
        name: "description",
        content:
          "Browse our full menu: Pakistani, BBQ, Chinese, Continental, pizza, burgers, rice, soups, drinks and desserts. Order online in Shakargarh.",
      },
      { property: "og:title", content: "Menu — Dream Cafe & Restaurant" },
      {
        property: "og:description",
        content:
          "BBQ, handi, pizza, Chinese, continental and more. Order online with fast delivery in Shakargarh.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Coming up next"
      title="The full interactive menu is being plated"
      description="Categories, filters, cart and online ordering land in the next build step — right after we set up the database."
    />
  ),
});
