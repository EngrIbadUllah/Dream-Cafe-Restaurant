import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/coming-soon";
export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: () => <ComingSoon title="Customers" body="Browse registered customers, orders, and lifetime value in the next iteration." />,
});
