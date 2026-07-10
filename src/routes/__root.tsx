import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { site } from "../lib/site-config";
import { CartProvider } from "../hooks/use-cart";
import { CartDrawer } from "../components/site/cart-drawer";

const SITE_TITLE = `${site.name} — Shakargarh · BBQ · Chinese · Continental · Pakistani`;
const SITE_DESC = site.description;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="mt-4 font-display text-5xl text-foreground">
          This page isn't on the menu
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for may have been moved or removed.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="mt-4 font-display text-4xl text-foreground">
          This page didn't load
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Try again or head back home. Our team has been notified.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full gradient-gold px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESC },
      { name: "author", content: site.name },
      { name: "theme-color", content: "#141210" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESC },
      { property: "og:type", content: "restaurant" },
      { property: "og:site_name", content: site.name },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESC },
      { title: "Dream Cafe & Restaurant — BBQ · Chinese · Continental · Pakistani · Shakargarh" },
      { property: "og:title", content: "Dream Cafe & Restaurant — BBQ · Chinese · Continental · Pakistani · Shakargarh" },
      { name: "twitter:title", content: "Dream Cafe & Restaurant — BBQ · Chinese · Continental · Pakistani · Shakargarh" },
      { name: "description", content: "Fine-dining flavour on Noor Kot Road, Shakargarh. Order online, reserve a table, or explore our all-day menu of BBQ, handi, pizza, burgers and continental favourites." },
      { property: "og:description", content: "Fine-dining flavour on Noor Kot Road, Shakargarh. Order online, reserve a table, or explore our all-day menu of BBQ, handi, pizza, burgers and continental favourites." },
      { name: "twitter:description", content: "Fine-dining flavour on Noor Kot Road, Shakargarh. Order online, reserve a table, or explore our all-day menu of BBQ, handi, pizza, burgers and continental favourites." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/917de20b-210c-42bc-bc96-7f463bd5dee9/id-preview-0baa304a--4ed2787d-b5c4-431b-a659-e124db6891b3.lovable.app-1783706163014.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/917de20b-210c-42bc-bc96-7f463bd5dee9/id-preview-0baa304a--4ed2787d-b5c4-431b-a659-e124db6891b3.lovable.app-1783706163014.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },

      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Manrope:wght@300;400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = router.state.location.pathname;

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div key={pathname} className="animate-page-in">
          <Outlet />
        </div>
        <CartDrawer />
        <Toaster richColors position="top-center" />
      </CartProvider>
    </QueryClientProvider>
  );
}

