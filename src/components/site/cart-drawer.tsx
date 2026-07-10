import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart, formatPKR } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { items, subtotal, isOpen, close, setQty, remove } = useCart();

  return (
    <>
      <div
        onClick={close}
        className={cn(
          "fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-background border-l border-border shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-gold" />
            <h2 className="font-display text-xl">Your Cart</h2>
          </div>
          <button
            onClick={close}
            className="grid h-9 w-9 place-items-center rounded-full border border-border hover:bg-accent"
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
                <ShoppingBag size={22} />
              </div>
              <p className="mt-4 font-display text-lg">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse the menu and add your favourites.
              </p>
              <Link
                to="/menu"
                onClick={close}
                className="mt-5 inline-flex rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Explore Menu
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 rounded-2xl border border-border p-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {i.image_url ? (
                      <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium leading-tight">{i.name}</p>
                      <button
                        onClick={() => remove(i.id)}
                        aria-label="Remove"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="text-sm text-gold">{formatPKR(i.price)}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-border">
                        <button
                          onClick={() => setQty(i.id, i.quantity - 1)}
                          className="grid h-7 w-7 place-items-center hover:text-gold"
                          aria-label="Decrease"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{i.quantity}</span>
                        <button
                          onClick={() => setQty(i.id, i.quantity + 1)}
                          className="grid h-7 w-7 place-items-center hover:text-gold"
                          aria-label="Increase"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatPKR(i.price * i.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-border px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-xl">{formatPKR(subtotal)}</span>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Delivery fee and taxes calculated at checkout.
            </p>
            <Link
              to="/checkout"
              onClick={close}
              className="flex w-full items-center justify-center rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-black/30"
            >
              Checkout
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
}
