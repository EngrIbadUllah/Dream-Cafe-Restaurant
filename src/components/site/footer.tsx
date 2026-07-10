import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { nav, site } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative bg-ink text-cream">
      <div className="container-page pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-11 w-11 place-items-center rounded-full gradient-gold text-primary-foreground font-display text-lg font-bold">
                D
              </span>
              <div className="leading-tight">
                <div className="font-display text-xl">Dream Cafe</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-gold">
                  & Restaurant
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm text-cream/70">
              {site.description}
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
                  {site.address.line1}
                  <br />
                  {site.address.city}, {site.address.postalCode}
                  <br />
                  {site.address.country}
                </span>
              </li>
              {site.phones.slice(0, 2).map((p) => (
                <li key={p.tel} className="flex gap-3">
                  <Phone size={16} className="mt-0.5 shrink-0 text-gold" />
                  <a href={`tel:${p.tel}`} className="hover:text-gold">
                    {p.number}
                  </a>
                </li>
              ))}
              <li className="flex gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-gold" />
                <a href={`mailto:${site.email}`} className="hover:text-gold">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="eyebrow">Hours</h4>
            <ul className="mt-5 space-y-2 text-sm text-cream/80">
              {site.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span className="text-cream/60">{h.day}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 hover:border-gold hover:text-gold transition"
              >
                <Facebook size={15} />
              </a>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 hover:border-gold hover:text-gold transition"
              >
                <Instagram size={15} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-cream/50 md:flex-row">
          <p>© {year} Dream Cafe & Restaurant. All rights reserved.</p>
          <p>
            Made by{" "}
            <a
              href="https://ibadullah.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              ibadullah.tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
