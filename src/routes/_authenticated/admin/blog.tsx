import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/coming-soon";
export const Route = createFileRoute("/_authenticated/admin/blog")({
  component: () => <ComingSoon title="Blog" body="Publish articles and updates. Coming in the next iteration." />,
});
