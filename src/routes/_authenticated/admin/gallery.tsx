import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/admin/coming-soon";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: () => <ComingSoon title="Gallery" body="Upload and manage restaurant photos. Coming in the next iteration." />,
});
