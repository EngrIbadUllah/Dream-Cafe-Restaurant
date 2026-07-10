import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listSettings, upsertSetting, deleteSetting } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Plus, Save, Trash2, Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

const PRESETS: { key: string; hint: string; sample: string }[] = [
  { key: "restaurant_name", hint: "Displayed across the site", sample: '"Dream Cafe & Restaurant"' },
  { key: "hero_tagline", hint: "Home page tagline", sample: '"Where every meal is a dream"' },
  { key: "delivery_fee", hint: "Flat delivery fee (PKR)", sample: "150" },
  { key: "min_order", hint: "Minimum order amount", sample: "500" },
  { key: "opening_hours", hint: "Weekly hours", sample: '{"mon_thu":"11am–11pm","fri_sun":"11am–1am"}' },
  { key: "bank_details", hint: "Bank transfer instructions", sample: '{"bank":"HBL","account":"1234-5678","title":"Dream Cafe"}' },
];

function SettingsPage() {
  const listFn = useServerFn(listSettings);
  const upsertFn = useServerFn(upsertSetting);
  const delFn = useServerFn(deleteSetting);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => listFn() });

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const save = useMutation({
    mutationFn: (input: { key: string; value: string }) => upsertFn({ data: input }),
    onSuccess: () => {
      toast.success("Setting saved");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (key: string) => delFn({ data: { key } }),
    onSuccess: () => {
      toast.success("Setting deleted");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const existingKeys = new Set((data ?? []).map((s) => s.key));
  const missingPresets = PRESETS.filter((p) => !existingKeys.has(p.key));

  const format = (v: unknown) =>
    typeof v === "string" ? v : JSON.stringify(v, null, 2);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl md:text-4xl text-cream">Site Settings</h1>
        <p className="text-cream/60 mt-1">Configure restaurant info, delivery, and site behaviour.</p>
      </header>

      {missingPresets.length > 0 && (
        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
          <p className="text-sm text-cream/80 mb-3">Suggested settings to configure:</p>
          <div className="flex flex-wrap gap-2">
            {missingPresets.map((p) => (
              <button
                key={p.key}
                onClick={() => {
                  setNewKey(p.key);
                  setNewValue(p.sample);
                }}
                className="text-xs rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold hover:bg-gold/20 transition"
                title={p.hint}
              >
                + {p.key}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <h2 className="font-serif text-xl text-cream mb-4 flex items-center gap-2">
          <Plus size={18} className="text-gold" /> Add / update setting
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
          <input
            className="input-base"
            placeholder="key (e.g. restaurant_name)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <input
            className="input-base font-mono text-sm"
            placeholder='value (JSON or string, e.g. "Dream Cafe")'
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
          />
          <button
            className="rounded-lg gradient-gold text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
            disabled={!newKey.trim() || save.isPending}
            onClick={() => {
              save.mutate(
                { key: newKey.trim(), value: newValue },
                {
                  onSuccess: () => {
                    setNewKey("");
                    setNewValue("");
                  },
                },
              );
            }}
          >
            Save
          </button>
        </div>
        <p className="text-[11px] text-cream/40 mt-2">
          Values are stored as JSON. Numbers, objects, arrays, and booleans are parsed automatically; anything else is stored as a string.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <SettingsIcon size={18} className="text-gold" />
          <h2 className="font-serif text-xl text-cream">Current settings</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-cream/50">Loading…</div>
        ) : (data ?? []).length === 0 ? (
          <div className="p-10 text-center text-cream/50">No settings yet. Add one above.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {data!.map((s) => {
              const current = drafts[s.key] ?? format(s.value);
              const dirty = current !== format(s.value);
              return (
                <li key={s.key} className="p-5 grid gap-3 sm:grid-cols-[220px_1fr_auto] sm:items-start">
                  <div>
                    <p className="font-mono text-sm text-gold">{s.key}</p>
                    <p className="text-[11px] text-cream/40 mt-1">
                      Updated {new Date(s.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <textarea
                    className="input-base font-mono text-sm min-h-[42px]"
                    rows={Math.min(6, Math.max(1, current.split("\n").length))}
                    value={current}
                    onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                  />
                  <div className="flex sm:flex-col gap-2 sm:items-end">
                    <button
                      className="inline-flex items-center gap-1 rounded-lg gradient-gold text-primary-foreground px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                      disabled={!dirty || save.isPending}
                      onClick={() =>
                        save.mutate(
                          { key: s.key, value: current },
                          { onSuccess: () => setDrafts((d) => { const c = { ...d }; delete c[s.key]; return c; }) },
                        )
                      }
                    >
                      <Save size={12} /> Save
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-400/30 bg-rose-500/10 text-rose-300 px-3 py-1.5 text-xs hover:bg-rose-500/20"
                      onClick={() => {
                        if (confirm(`Delete setting "${s.key}"?`)) remove.mutate(s.key);
                      }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
