import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Loader2, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/lib/site-config";
import { SiteShell } from "@/components/site/site-shell";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: `My Profile — ${site.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Shakargarh");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("full_name, phone, address, city")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        if (data) {
          setFullName(data.full_name ?? "");
          setPhone(data.phone ?? "");
          setAddress(data.address ?? "");
          setCity(data.city ?? "Shakargarh");
        }
        setLoading(false);
      });
  }, [user.id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, address, city })
      .eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  }

  async function onSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <SiteShell>
      <Navbar />
      <main className="pt-28 pb-20 min-h-screen bg-background">
        <div className="container-page max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="mt-2 font-display text-4xl text-foreground">Profile</h1>
              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            </div>
            <button
              onClick={onSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>

          {loading ? (
            <div className="mt-12 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" size={16} /> Loading…
            </div>
          ) : (
            <form onSubmit={onSave} className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="grid h-14 w-14 place-items-center rounded-full gradient-gold text-primary-foreground">
                  <UserIcon size={20} />
                </div>
                <div>
                  <div className="font-medium text-foreground">{fullName || "Your name"}</div>
                  <div className="text-xs text-muted-foreground">Customer</div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name">
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-base" />
                </Field>
                <Field label="Phone">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-base" />
                </Field>
              </div>
              <Field label="Delivery address">
                <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className="input-base" />
              </Field>
              <Field label="City">
                <input value={city} onChange={(e) => setCity(e.target.value)} className="input-base" />
              </Field>

              <button disabled={saving} className="inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground">
                {saving && <Loader2 size={16} className="animate-spin" />}
                Save changes
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </SiteShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
