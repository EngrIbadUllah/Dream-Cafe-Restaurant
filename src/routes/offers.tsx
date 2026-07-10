import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/coming-soon";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Deals — Dream Cafe & Restaurant" },
      {
        name: "description",
        content:
          "Limited-time deals, coupons and promotions at Dream Cafe & Restaurant, Shakargarh.",
      },
      { property: "og:title", content: "Offers & Deals — Dream Cafe & Restaurant" },
      {
        property: "og:description",
        content: "Discounts and coupons for online orders and dine-in.",
      },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Offers"
      title="Deals and coupons in the oven"
      description="Admin-managed promotions with countdowns and coupon codes are next up in the roadmap."
    />
  ),
});
