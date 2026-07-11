import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/lib/site-config";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: `Sign in — ${site.name}` },
      { name: "description", content: "Sign in or create your Dream Cafe account to track orders, save favourites and book tables faster." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: search.redirect ?? "/profile" });
      }
    });
  }, [navigate, search.redirect]);

  useEffect(() => {
    if (search.mode) setMode(search.mode);
  }, [search.mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: search.redirect ?? "/profile" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset`,
        });
        if (error) throw error;
        toast.success("Password reset email sent.");
        setMode("signin");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left — brand panel */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden text-[#f5ecd7]"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(201,168,76,0.35) 0%, transparent 55%), linear-gradient(135deg, #1a1207 0%, #0f0a04 55%, #050403 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_90%,rgba(201,168,76,0.18),transparent_60%)]" />

        <Link to="/" className="relative flex items-center gap-3 z-10">
          <span className="grid h-11 w-11 place-items-center rounded-full gradient-gold text-primary-foreground font-display text-lg font-bold">D</span>
          <div className="leading-tight">
            <div className="font-display text-lg">Dream Cafe</div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-gold">& Restaurant</div>
          </div>
        </Link>
        <div className="relative z-10 space-y-4">
          <h1 className="font-display text-4xl leading-tight">
            Where every bite feels like home.
          </h1>
          <p className="text-cream/70 max-w-md">
            Sign in to track orders, save your favourite dishes and reserve your table in seconds.
          </p>
        </div>
        <div className="relative z-10 text-xs text-cream/50">
          © {new Date().getFullYear()} {site.name}
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full gradient-gold text-primary-foreground font-display font-bold">D</span>
              <span className="font-display text-xl">Dream Cafe</span>
            </Link>
          </div>

          <h2 className="font-display text-3xl text-foreground">
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "forgot" && "Reset your password"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" && "Sign in to continue to your account."}
            {mode === "signup" && "Join Dream Cafe for faster ordering and rewards."}
            {mode === "forgot" && "Enter your email and we'll send a reset link."}
          </p>

          {mode !== "forgot" && (
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-border p-1">
              <button
                onClick={() => setMode("signin")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "signin" ? "gradient-gold text-primary-foreground" : "text-muted-foreground"}`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "signup" ? "gradient-gold text-primary-foreground" : "text-muted-foreground"}`}
              >
                Sign up
              </button>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <Field icon={<UserIcon size={16} />} label="Full name">
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ahmed Khan"
                    className="input-base"
                  />
                </Field>
                <Field icon={<Phone size={16} />} label="Phone">
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="input-base"
                  />
                </Field>
              </>
            )}
            <Field icon={<Mail size={16} />} label="Email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-base"
              />
            </Field>
            {mode !== "forgot" && (
              <Field icon={<Lock size={16} />} label="Password">
                <input
                  required
                  minLength={6}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base"
                />
              </Field>
            )}

            {mode === "signin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-gold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/25 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === "signin" && "Sign in"}
              {mode === "signup" && "Create account"}
              {mode === "forgot" && "Send reset link"}
            </button>

            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                ← Back to sign in
              </button>
            )}
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span className="text-gold">{icon}</span> {label}
      </span>
      {children}
    </label>
  );
}
