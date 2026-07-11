import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, ClipboardList, Menu, Moon, Phone, ShoppingBag, Sun, User, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav, site } from "@/lib/site-config";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCafeLogo } from "@/hooks/use-cafe-logo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const { count, open: openCart } = useCart();
  const logo = useCafeLogo();
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

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // When at top of page, header sits over the dark hero → always light text.
  // Once scrolled, adopt theme-aware surface + foreground.
  const overHero = !scrolled;
  const iconBtn = cn(
    "grid h-10 w-10 place-items-center rounded-full border transition",
    overHero
      ? "border-white/20 text-cream/85 hover:text-gold hover:border-gold/50"
      : "border-border text-foreground/80 hover:text-gold hover:border-gold/60 bg-background/60",
  );

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border py-2 shadow-sm"
            : "bg-transparent py-4",
        )}
      >
        <div className="container-page flex items-center justify-between gap-4">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2.5",
              overHero ? "text-cream" : "text-foreground",
            )}
            aria-label={site.name}
          >
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full gradient-gold text-primary-foreground font-display text-lg font-bold shadow-lg shadow-black/30">
              {logo ? (
                <img src={logo} alt={site.name} className="h-full w-full object-cover" />
              ) : (
                "D"
              )}
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-base sm:text-lg tracking-tight">Dream Cafe</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-gold">
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
                      : overHero
                        ? "text-cream/85 hover:text-cream"
                        : "text-foreground/75 hover:text-foreground",
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
              className={cn("hidden sm:grid", iconBtn)}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              to={user ? "/profile" : "/auth"}
              aria-label={user ? "Profile" : "Sign in"}
              className={cn("hidden sm:grid", iconBtn)}
            >
              <User size={16} />
            </Link>
            <button
              onClick={openCart}
              aria-label="Open cart"
              className={cn("relative", iconBtn)}
            >
              <ShoppingBag size={16} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full gradient-gold px-1 text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </button>
            <Link
              to="/menu"
              className="hidden md:inline-flex items-center gap-2 rounded-full gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/25 hover:brightness-110 transition"
            >
              Order Now
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className={cn("lg:hidden", iconBtn)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — full opaque sheet with backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-[60] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!open}
      >
        {/* backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* sheet */}
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-[88%] max-w-sm bg-background border-l border-border shadow-2xl",
            "flex flex-col transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2.5 text-foreground">
              <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full gradient-gold text-primary-foreground font-display font-bold">
                {logo ? (
                  <img src={logo} alt={site.name} className="h-full w-full object-cover" />
                ) : (
                  "D"
                )}
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-base">Dream Cafe</span>
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  & Restaurant
                </span>
              </span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/70 hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col gap-1">
              {nav.map((item) => {
                const active = pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium transition-colors",
                        active
                          ? "bg-gold/10 text-gold"
                          : "text-foreground/85 hover:bg-muted",
                      )}
                    >
                      <span>{item.label}</span>
                      <span className="text-xs opacity-50">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="my-4 h-px bg-border" />

            <div className="grid gap-2">
              <Link
                to={user ? "/profile" : "/auth"}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground/85 hover:bg-muted"
              >
                <User size={16} className="text-gold" />
                {user ? "My profile" : "Sign in / Sign up"}
              </Link>
              <a
                href={`tel:${site.phones[0].tel}`}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground/85 hover:bg-muted"
              >
                <Phone size={16} className="text-gold" />
                {site.phones[0].number}
              </a>
              <button
                onClick={() => {
                  toggle();
                }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground/85 hover:bg-muted text-left"
              >
                {theme === "dark" ? <Sun size={16} className="text-gold" /> : <Moon size={16} className="text-gold" />}
                Switch to {theme === "dark" ? "light" : "dark"} mode
              </button>
            </div>
          </nav>

          <div className="border-t border-border p-4 grid grid-cols-2 gap-2">
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-1.5 rounded-full gradient-gold px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md"
            >
              <UtensilsCrossed size={14} /> Order Now
            </Link>
            <Link
              to="/reservations"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <CalendarDays size={14} /> Reserve
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
