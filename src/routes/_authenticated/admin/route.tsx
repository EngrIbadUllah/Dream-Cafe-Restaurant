import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, UtensilsCrossed, FolderTree, ShoppingBag, CalendarCheck,
  Star, MessageSquare, Image as ImageIcon, Tag, BookOpen, Users, Settings,
  BarChart3, LogOut, Menu, X, Ticket, Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site-config";
import { useBusinessInfo } from "@/hooks/use-business-info";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    const user = (context as { user?: { id: string } }).user;
    if (!user) throw redirect({ to: "/auth", search: { mode: "signin", redirect: location.pathname } });
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    const roles = (data ?? []).map((r) => r.role);
    if (!roles.includes("admin") && !roles.includes("manager")) {
      throw redirect({ to: "/" });
    }
    return { adminRoles: roles };
  },
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/foods", label: "Menu Items", icon: UtensilsCrossed },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/reservations", label: "Reservations", icon: CalendarCheck },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/admin/offers", label: "Offers", icon: Tag },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/blog", label: "Blog", icon: BookOpen },
  { to: "/admin/customers", label: "Customers & Staff", icon: Users },
  { to: "/admin/activity", label: "Activity Log", icon: Activity },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function AdminLayout() {
  const site = useBusinessInfo();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setOpen(false), [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-deep)] text-cream">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-black/60 backdrop-blur-xl px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-lg border border-white/15"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link to="/admin" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md gradient-gold font-serif text-primary-foreground font-bold">
              D
            </span>
            <span className="font-serif text-lg tracking-wide">
              {site.shortName} <span className="text-gold">Admin</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xs text-cream/60 hover:text-gold px-3 py-1.5 rounded-md border border-white/10">
            View Site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-cream/80 hover:text-gold px-3 py-1.5 rounded-md border border-white/10"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-14 z-20 h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-black/50 backdrop-blur-xl transition-transform lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <nav className="p-3 space-y-0.5">
            {nav.map((item) => {
              const active = "exact" in item && item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "text-cream/70 hover:bg-white/5 hover:text-cream border border-transparent",
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {open && (
          <button
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-14 z-10 bg-black/60 lg:hidden"
            aria-label="Close menu"
          />
        )}

        <main className="flex-1 min-w-0 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
