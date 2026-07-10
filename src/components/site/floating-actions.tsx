import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle, Phone } from "lucide-react";
import { site, whatsappLink } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function FloatingActions() {
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
        href={`tel:${site.phones[0].tel}`}
        aria-label="Call restaurant"
        className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink shadow-xl shadow-black/25 hover:scale-105 transition"
      >
        <Phone size={18} />
      </a>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full text-white shadow-xl shadow-black/25 hover:scale-105 transition"
        style={{ backgroundColor: "#25D366" }}
      >
        <MessageCircle size={22} />
      </a>
    </div>
  );
}
