import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { updateReservationStatus } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  component: ReservationsPage,
});

const STATUSES = ["pending", "confirmed", "seated", "completed", "cancelled", "no_show"] as const;

function ReservationsPage() {
  const qc = useQueryClient();
  const update = useServerFn(updateReservationStatus);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("reservation_date", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = async (id: string, status: (typeof STATUSES)[number]) => {
    try {
      await update({ data: { id, status } });
      toast.success(`Reservation marked ${status.replace(/_/g, " ")}`);
      qc.invalidateQueries({ queryKey: ["admin", "reservations"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-cream">Reservations</h1>
        <p className="text-cream/60 mt-1">Confirm, seat, or cancel table bookings.</p>
      </header>

      {isLoading ? (
        <p className="text-cream/50">Loading…</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-cream/60">
          No reservations yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-cream/60 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Guest</th>
                <th className="px-4 py-3 text-left">Contact</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-right">Party</th>
                <th className="px-4 py-3 text-left">Notes</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((r) => (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-cream">{r.customer_name}</td>
                  <td className="px-4 py-3 text-cream/70 text-xs">
                    <div>{r.customer_phone}</div>
                    <div>{r.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-cream/70">{r.reservation_date}</td>
                  <td className="px-4 py-3 text-cream/70">{r.reservation_time}</td>
                  <td className="px-4 py-3 text-right text-cream">{r.party_size}</td>
                  <td className="px-4 py-3 text-cream/60 text-xs max-w-xs truncate">{r.special_requests ?? "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => setStatus(r.id, e.target.value as (typeof STATUSES)[number])}
                      className="rounded-md border border-white/15 bg-black/40 px-2 py-1 text-cream text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
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
