import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/coming-soon";
export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: () => <ComingSoon title="Site Settings" body="Configure restaurant info, hours, delivery zones, and branding in the next iteration." />,
});
