import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, ShoppingBag, Sun, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site-config";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const { count, open: openCart } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-dark border-b border-white/10 py-2"
          : "bg-transparent py-4",
      )}
    >
      <div className="container-page flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-cream"
          aria-label={site.name}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full gradient-gold text-primary-foreground font-display text-lg font-bold shadow-lg shadow-black/30">
            D
          </span>
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-display text-lg tracking-tight">Dream Cafe</span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
              & Restaurant
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-gold"
                    : "text-cream/80 hover:text-cream",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="hidden sm:grid h-10 w-10 place-items-center rounded-full border border-white/15 text-cream/80 hover:text-gold hover:border-gold/50 transition"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            to={user ? "/profile" : "/auth"}
            aria-label={user ? "Profile" : "Sign in"}
            className="hidden sm:grid h-10 w-10 place-items-center rounded-full border border-white/15 text-cream/80 hover:text-gold hover:border-gold/50 transition"
          >
            <User size={16} />
          </Link>
          <Link
            to="/menu"
            className="hidden md:inline-flex items-center gap-2 rounded-full gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/25 hover:brightness-110 transition"
          >
            <ShoppingBag size={16} /> Order Now
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-white/15 text-cream"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height,opacity] duration-300",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="container-page pt-4 pb-6">
          <div className="glass-dark rounded-3xl p-3">
            <ul className="flex flex-col">
              {nav.map((item) => {
                const active = pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3 text-base transition-colors",
                        active
                          ? "bg-white/10 text-gold"
                          : "text-cream/90 hover:bg-white/5",
                      )}
                    >
                      {item.label}
                      <span className="text-xs text-cream/50">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center rounded-full gradient-gold px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Order Now
              </Link>
              <Link
                to="/reservations"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-cream"
              >
                Reserve Table
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
