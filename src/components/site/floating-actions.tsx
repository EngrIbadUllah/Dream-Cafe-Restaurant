import { useEffect, useState } from "react";
import { ArrowUp, Phone } from "lucide-react";
import { whatsappLink } from "@/lib/site-config";
import { useBusinessInfo } from "@/hooks/use-business-info";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path fill="#fff" d="M16.003 3C9.373 3 4 8.373 4 15c0 2.36.68 4.56 1.86 6.42L4 29l7.79-1.83A11.94 11.94 0 0 0 16.003 27C22.633 27 28 21.627 28 15S22.633 3 16.003 3Zm0 21.6c-1.86 0-3.6-.5-5.1-1.36l-.36-.21-4.62 1.08 1.11-4.5-.24-.37A9.55 9.55 0 0 1 6.4 15c0-5.29 4.31-9.6 9.6-9.6s9.6 4.31 9.6 9.6-4.3 9.6-9.6 9.6Zm5.28-7.19c-.29-.14-1.72-.85-1.99-.95-.27-.1-.46-.14-.66.14-.19.29-.75.95-.92 1.14-.17.19-.34.22-.63.07-.29-.14-1.23-.45-2.34-1.44-.87-.77-1.45-1.72-1.62-2.01-.17-.29-.02-.44.12-.58.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.14-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5l-.56-.01c-.19 0-.51.07-.78.36-.27.29-1.02.99-1.02 2.42s1.04 2.8 1.19 3c.14.19 2.05 3.13 4.97 4.39.7.3 1.24.48 1.66.62.7.22 1.33.19 1.83.11.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.33Z"/>
    </svg>
  );
}

export function FloatingActions() {
  const s = useBusinessInfo();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className={cn(
          "grid h-11 w-11 place-items-center rounded-full glass-dark text-cream shadow-lg transition-all",
          showTop ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2",
        )}
      >
        <ArrowUp size={16} />
      </button>
      <a
        href={`tel:${s.phones[0].tel}`}
        aria-label="Call restaurant"
        className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink shadow-xl shadow-black/25 hover:scale-105 transition"
      >
        <Phone size={18} />
      </a>
      <a
        href={whatsappLink(s.whatsappMessage, s.whatsapp)}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full shadow-xl shadow-black/25 hover:scale-105 transition"
        style={{ backgroundColor: "#25D366" }}
      >
        <WhatsAppIcon size={28} />
      </a>
    </div>
  );
}

