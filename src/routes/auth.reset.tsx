import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/lib/site-config";

export const Route = createFileRoute("/auth/reset")({
  head: () => ({
    meta: [
      { title: `Reset password — ${site.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      toast.success("Password updated");
      navigate({ to: "/profile" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
        <h1 className="font-display text-2xl text-foreground">Set new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a strong password for your account.</p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Lock size={14} className="text-gold" /> New password
            </span>
            <input required minLength={6} type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="input-base" />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Lock size={14} className="text-gold" /> Confirm password
            </span>
            <input required minLength={6} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-base" />
          </label>
          <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground">
            {loading && <Loader2 size={16} className="animate-spin" />}
            Update password
          </button>
        </div>
      </form>
    </div>
  );
}
