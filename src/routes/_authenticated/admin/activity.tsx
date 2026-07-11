import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  component: AdminActivity,
});

function AdminActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: async () =>
      (
        await supabase
          .from("activity_logs")
          .select("id,action,entity_type,entity_id,metadata,created_at,user_id")
          .order("created_at", { ascending: false })
          .limit(200)
      ).data ?? [],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-cream">Activity Log</h1>
        <p className="text-sm text-cream/60 mt-1">Latest 200 admin actions across the system.</p>
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      ) : (data ?? []).length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-cream/50">
          <Activity className="mx-auto mb-3 text-gold" /> No activity recorded yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-cream/50 text-xs uppercase tracking-wider bg-white/[0.02]">
              <tr className="text-left">
                <th className="py-3 px-4">When</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="text-cream/80">
              {(data ?? []).map((log) => (
                <tr key={log.id} className="border-t border-white/5 align-top">
                  <td className="py-3 px-4 text-xs text-cream/50 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="py-3 px-4 font-medium text-gold">{log.action}</td>
                  <td className="py-3 px-4 text-xs">{log.entity_type ?? "—"}<div className="text-cream/40 font-mono">{log.entity_id?.slice(0, 8) ?? ""}</div></td>
                  <td className="py-3 px-4 text-xs font-mono text-cream/50">{log.user_id?.slice(0, 8) ?? "system"}</td>
                  <td className="py-3 px-4 text-xs">
                    {log.metadata ? (
                      <pre className="whitespace-pre-wrap text-cream/60 max-w-md">{JSON.stringify(log.metadata, null, 0)}</pre>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
