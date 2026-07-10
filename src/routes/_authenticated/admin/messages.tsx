import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const markRead = async (id: string) => {
    const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "messages"] });
    qc.invalidateQueries({ queryKey: ["admin", "stats"] });
  };

  const del = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "messages"] });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-cream">Messages</h1>
        <p className="text-cream/60 mt-1">Customer inquiries from the contact form.</p>
      </header>

      {isLoading ? (
        <p className="text-cream/50">Loading…</p>
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-cream/60">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border p-5 ${m.is_read ? "border-white/10 bg-white/[0.02]" : "border-gold/30 bg-gold/5"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg text-cream">{m.name}</h3>
                    {!m.is_read && <span className="text-[10px] uppercase tracking-wider text-gold border border-gold/40 rounded-full px-2 py-0.5">New</span>}
                  </div>
                  <p className="text-xs text-cream/50 mt-0.5">
                    {m.email} {m.phone ? `· ${m.phone}` : ""} · {new Date(m.created_at).toLocaleString()}
                  </p>
                  {m.subject && <p className="text-sm text-gold mt-2">{m.subject}</p>}
                  <p className="text-sm text-cream/80 mt-2 whitespace-pre-wrap">{m.message}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!m.is_read && (
                    <button
                      onClick={() => markRead(m.id)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-cream/70 hover:text-gold"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => del(m.id)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-cream/70 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
