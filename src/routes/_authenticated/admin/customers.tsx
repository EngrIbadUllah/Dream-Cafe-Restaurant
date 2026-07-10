import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useMemo } from "react";
import { listCustomers, setUserRole } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Search, Shield, ShieldOff, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: CustomersPage,
});

const ROLES = ["admin", "manager", "staff", "customer"] as const;
type Role = (typeof ROLES)[number];

const roleTone: Record<Role, string> = {
  admin: "bg-gold/15 text-gold border-gold/40",
  manager: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  staff: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30",
  customer: "bg-white/5 text-cream/70 border-white/10",
};

function CustomersPage() {
  const listFn = useServerFn(listCustomers);
  const setRoleFn = useServerFn(setUserRole);
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({ queryKey: ["admin", "customers"], queryFn: () => listFn() });

  const mutate = useMutation({
    mutationFn: (input: { userId: string; role: Role; action: "add" | "remove" }) =>
      setRoleFn({ data: input }),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(s) ||
        c.phone?.toLowerCase().includes(s) ||
        c.city?.toLowerCase().includes(s),
    );
  }, [data, q]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-cream">Customers</h1>
          <p className="text-cream/60 mt-1">Manage users and their roles.</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, city…"
            className="input-base pl-9 w-72 max-w-full"
          />
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-cream/50">Loading customers…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-cream/50">
            <Users className="mx-auto mb-3 text-gold" />
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-cream/50 text-xs uppercase tracking-wider bg-white/[0.02]">
                <tr className="text-left">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Orders</th>
                  <th className="py-3 px-4">Spend</th>
                  <th className="py-3 px-4">Roles</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-cream/80">
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 font-medium text-cream">{c.full_name || "—"}</td>
                    <td className="py-3 px-4">{c.phone || "—"}</td>
                    <td className="py-3 px-4">{c.city || "—"}</td>
                    <td className="py-3 px-4">{c.orders}</td>
                    <td className="py-3 px-4 text-gold">PKR {Math.round(c.spend).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.roles.map((r) => (
                          <span
                            key={r}
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${roleTone[r as Role] ?? roleTone.customer}`}
                          >
                            {r === "admin" && <Shield size={10} />} {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-cream/50 text-xs">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <select
                          className="input-base py-1 px-2 text-xs"
                          defaultValue=""
                          onChange={(e) => {
                            const role = e.target.value as Role;
                            if (!role) return;
                            const has = c.roles.includes(role);
                            mutate.mutate({
                              userId: c.id,
                              role,
                              action: has ? "remove" : "add",
                            });
                            e.target.value = "";
                          }}
                        >
                          <option value="">Change role…</option>
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {c.roles.includes(r) ? `Remove ${r}` : `Add ${r}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-cream/40 flex items-center gap-2">
        <ShieldOff size={12} /> Only admins can change roles. Manager promotions grant admin-panel access.
      </p>
    </div>
  );
}
