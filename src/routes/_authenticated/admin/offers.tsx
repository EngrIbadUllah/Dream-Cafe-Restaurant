import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/coming-soon";
export const Route = createFileRoute("/_authenticated/admin/offers")({
  component: () => <ComingSoon title="Offers & Coupons" body="Create promo codes, discounts, and time-limited offers in the next iteration." />,
});
