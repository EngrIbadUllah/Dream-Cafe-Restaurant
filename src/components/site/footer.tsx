import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { nav, site } from "@/lib/site-config";
import { useCafeLogo } from "@/hooks/use-cafe-logo";
import { useBusinessInfo } from "@/hooks/use-business-info";

function TikTokIcon({ size = 15 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.75a8.16 8.16 0 0 0 4.77 1.52V6.82a4.85 4.85 0 0 1-1.84-.13z"/>
    </svg>
  );
}


export function Footer() {
  const logo = useCafeLogo();
  const s = useBusinessInfo();
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-ink text-cream">
      <div className="container-page pt-16 pb-10">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8">

          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full gradient-gold text-primary-foreground font-display text-lg font-bold">
                {logo ? (
                  <img src={logo} alt={site.name} className="h-full w-full object-cover" />
                ) : (
                  "D"
                )}
              </span>
              <div className="leading-tight">
                <div className="font-display text-xl">Dream Cafe</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  & Restaurant
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm text-cream/70">
              {s.description}
            </p>
          </div>

          <div>
            <h4 className="eyebrow">Explore</h4>
            <ul className="mt-5 space-y-2.5 text-sm">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-cream/75 hover:text-gold transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow">Visit us</h4>
            <ul className="mt-5 space-y-3 text-sm text-cream/80">
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                <span>
                  {s.address.line1}
                  <br />
                  {s.address.city}, {s.address.postalCode}
                  <br />
                  {s.address.country}
                </span>
              </li>
              {s.phones.slice(0, 2).map((p) => (
                <li key={p.tel} className="flex gap-3">
                  <Phone size={16} className="mt-0.5 shrink-0 text-gold" />
                  <a href={`tel:${p.tel}`} className="hover:text-gold">
                    {p.number}
                  </a>
                </li>
              ))}
              <li className="flex gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-gold" />
                <a href={`mailto:${s.email}`} className="hover:text-gold">
                  {s.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow">Hours</h4>
            <ul className="mt-5 space-y-2 text-sm text-cream/80">
              {s.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span className="text-cream/60">{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-3">
              {s.social.facebook.enabled && s.social.facebook.url && (
                <a href={s.social.facebook.url} target="_blank" rel="noreferrer" aria-label="Facebook"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 hover:border-gold hover:text-gold transition">
                  <Facebook size={15} />
                </a>
              )}
              {s.social.instagram.enabled && s.social.instagram.url && (
                <a href={s.social.instagram.url} target="_blank" rel="noreferrer" aria-label="Instagram"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 hover:border-gold hover:text-gold transition">
                  <Instagram size={15} />
                </a>
              )}
              {s.social.tiktok.enabled && s.social.tiktok.url && (
                <a href={s.social.tiktok.url} target="_blank" rel="noreferrer" aria-label="TikTok"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 hover:border-gold hover:text-gold transition">
                  <TikTokIcon size={15} />
                </a>
              )}
              {s.social.youtube.enabled && s.social.youtube.url && (
                <a href={s.social.youtube.url} target="_blank" rel="noreferrer" aria-label="YouTube"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 hover:border-gold hover:text-gold transition">
                  <Youtube size={15} />
                </a>
              )}
            </div>

          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-cream/50 md:flex-row">
          <p>© {year} Dream Cafe & Restaurant. All rights reserved.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-cream/60">
            <Link to="/faq" className="hover:text-gold transition-colors">FAQ</Link>
            <Link to="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-gold transition-colors">Contact</Link>
          </nav>
          <a
            href={`https://wa.me/923158896730?text=${encodeURIComponent("Hi Ibad, I want to design a website for my business like this one.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream/60 hover:text-cream transition-colors no-underline"
          >
            Crafted by <span className="font-display tracking-wide text-cream/80">Ibad Ullah</span>
          </a>
        </div>

      </div>
    </footer>
  );
}
