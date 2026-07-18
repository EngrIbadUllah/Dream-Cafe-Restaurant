import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  CalendarDays,
  ChefHat,
  Clock,
  Flame,
  Leaf,
  MapPin,
  Phone,
  Quote,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import heroImg from "@/assets/hero-platter.jpg";
import interiorImg from "@/assets/interior.jpg";
import chefImg from "@/assets/chef.jpg";
import { SiteShell } from "@/components/site/site-shell";
import { site, whatsappLink } from "@/lib/site-config";
import { useBusinessInfo } from "@/hooks/use-business-info";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/use-cart";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Dream Cafe & Restaurant — BBQ · Chinese · Continental · Pakistani · Shakargarh",
      },
      {
        name: "description",
        content:
          "Fine-dining flavour on Noor Kot Road, Shakargarh. Order online, reserve a table, or explore our all-day menu of BBQ, handi, pizza, burgers and continental favourites.",
      },
      {
        property: "og:title",
        content:
          "Dream Cafe & Restaurant — BBQ · Chinese · Continental · Pakistani · Shakargarh",
      },
      {
        property: "og:description",
        content:
          "Fine-dining flavour on Noor Kot Road, Shakargarh. Order online, reserve a table, or explore our all-day menu of BBQ, handi, pizza, burgers and continental favourites.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteShell>
      <Hero />
      <Marquee />
      <Categories />
      <FeaturedFoods />
      
      <WhyChooseUs />
      <ChefSection />
      <Reviews />
      <ReservationCTA />
      <ContactStrip />
    </SiteShell>
  );
}

/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-ink text-cream">
      <img
        src={heroImg}
        alt=""
        width={1920}
        height={1280}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
      />
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_40%,transparent_0%,rgba(0,0,0,0.55)_70%)]" />

      <div className="container-page relative flex min-h-[100svh] flex-col justify-center pt-28 pb-20 sm:pt-32">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-4xl font-display text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[1.02] tracking-tight"
        >
          A taste of home,
          <br />
          <span className="italic text-gold">plated beautifully.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="mt-6 max-w-xl text-base text-cream/80 sm:text-lg"
        >
          Slow-cooked handi, live BBQ, wood-fired pizza and continental
          classics — served the way Shakargarh remembers, elevated for today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="mt-10 grid w-full max-w-xl grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-4"
        >
          <Link
            to="/menu"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full gradient-gold px-7 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-black/30 hover:brightness-110 transition sm:w-auto"
          >
            <ShoppingBag size={18} /> Order Now
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/reservations"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full glass-dark px-7 py-4 text-base font-semibold text-cream hover:border-gold/50 transition sm:w-auto"
          >
            <CalendarDays size={18} /> Reserve a Table
          </Link>
          <Link
            to="/menu"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 text-base font-semibold text-cream hover:bg-white/5 transition sm:w-auto"
          >
            <UtensilsCrossed size={18} /> View Menu
          </Link>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 max-w-4xl"
        >
          <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md p-1.5 shadow-2xl shadow-black/40">
            <div className="grid grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
              <Stat kpi="4.1" suffix="★" label="365+ reviews" />
              <Stat kpi="30+" label="Buffet dishes" />
              <Stat kpi="30" suffix=" min" label="Avg delivery" />
              <Stat kpi="12+" label="Cuisines" />
            </div>
          </div>
        </motion.div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        className="group pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-cream/60 hover:text-gold transition"
        aria-label="Scroll to explore"
      >
        <span>Scroll</span>
        <span className="relative h-8 w-px bg-cream/30 overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-3 bg-gold animate-[slideDown_1.8s_ease-in-out_infinite]" />
        </span>
      </button>
    </section>
  );
}

function Stat({ kpi, suffix, label }: { kpi: string; suffix?: string; label: string }) {
  return (
    <div className="px-5 py-4 sm:px-6 sm:py-5 text-center sm:text-left">
      <div className="font-display text-3xl sm:text-4xl text-cream leading-none tracking-tight">
        {kpi}
        {suffix && <span className="text-gold">{suffix}</span>}
      </div>
      <div className="mt-2 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-cream/55">
        {label}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Marquee() {
  const items = [
    { text: "Live BBQ", icon: "🔥" },
    { text: "Handi Specialists", icon: "🍲" },
    { text: "Wood-Fired Pizza", icon: "🍕" },
    { text: "Continental Classics", icon: "🍽️" },
    { text: "Chinese Wok", icon: "🥢" },
    { text: "All-You-Can-Eat Buffet", icon: "✨" },
    { text: "Dine-in · Takeaway · Delivery", icon: "🛵" },
  ];
  return (
    <div className="relative border-y border-border/60 bg-gradient-to-r from-secondary/40 via-secondary/70 to-secondary/40 py-5 overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
      <div className="flex gap-10 animate-[marquee_38s_linear_infinite] whitespace-nowrap">
        {[...items, ...items].map((t, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 font-display text-base italic text-foreground/70"
          >
            <span className="text-gold not-italic">{t.icon}</span>
            {t.text}
            <span className="ml-10 h-1 w-1 rounded-full bg-gold/60" />
          </span>
        ))}
      </div>
    </div>
  );
}


/* -------------------------------------------------------------------------- */

const categories = [
  { name: "Pakistani", desc: "Handi, karahi & desi favourites", icon: Flame },
  { name: "BBQ", desc: "Live grill, seekh & tikka", icon: Flame },
  { name: "Chinese", desc: "Wok-tossed & saucy", icon: UtensilsCrossed },
  { name: "Continental", desc: "Steaks, pasta, breakfasts", icon: ChefHat },
  { name: "Pizza", desc: "Hand-stretched, wood-fired", icon: UtensilsCrossed },
  { name: "Burgers", desc: "Smash, zinger & signature", icon: UtensilsCrossed },
];

function Categories() {
  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeader
          title="Six kitchens, one address."
          subtitle="From slow-cooked handi to wood-fired pizza — every craving has its counter."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            >
              <Link
                to="/menu"
                className="group flex items-start justify-between gap-4 rounded-3xl border border-border bg-card p-6 transition-all hover:border-gold/50 hover:shadow-xl hover:shadow-black/5"
              >
                <div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gold/10 text-gold">
                    <c.icon size={20} />
                  </div>
                  <h3 className="mt-4 font-display text-xl">{c.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                </div>
                <ArrowRight
                  size={18}
                  className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-gold"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

type FeaturedFood = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  is_featured: boolean;
  category: { name: string } | null;
};

function FeaturedFoods() {
  const { add, open } = useCart();
  const { data, isLoading } = useQuery({
    queryKey: ["home-featured-foods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("foods")
        .select(
          "id,name,description,price,discount_price,image_url,is_featured,category:categories(name)",
        )
        .eq("is_available", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as FeaturedFood[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const items = (data ?? []).slice(0, 8);

  return (
    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            title="Handpicked by our chefs."
            subtitle="Dishes our regulars can't stop reordering — straight from tonight's menu."
            align="left"
          />
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline"
          >
            View full menu <ArrowRight size={14} />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-3xl border border-border bg-card"
              >
                <div className="aspect-[5/4] w-full bg-ink/60" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 rounded bg-muted" />
                  <div className="h-5 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-8 w-full rounded bg-muted" />
                </div>
              </div>
            ))}

          {!isLoading && items.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center text-muted-foreground">
              Our chefs are updating tonight's specials. Check the{" "}
              <Link to="/menu" className="text-gold underline">
                full menu
              </Link>
              .
            </div>
          )}

          {items.map((f, i) => {
            const hasDiscount =
              f.discount_price != null && f.discount_price < f.price;
            const shownPrice = hasDiscount ? f.discount_price! : f.price;
            const off = hasDiscount
              ? Math.round(((f.price - f.discount_price!) / f.price) * 100)
              : 0;
            return (
              <motion.article
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-ink">
                  {f.image_url ? (
                    <img
                      src={f.image_url}
                      alt={f.name}
                      loading="lazy"
                      width={800}
                      height={640}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-cream/40">
                      <UtensilsCrossed size={40} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

                  {f.is_featured && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold backdrop-blur">
                      <Sparkles size={10} /> Chef's pick
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      -{off}%
                    </span>
                  )}
                  {f.category?.name && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-cream backdrop-blur">
                      {f.category.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg leading-tight">
                    {f.name}
                  </h3>
                  {f.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {f.description}
                    </p>
                  )}
                  <div className="mt-auto flex items-end justify-between pt-4">
                    <div className="flex flex-col">
                      <span className="font-display text-xl leading-none text-gold">
                        Rs {shownPrice.toLocaleString("en-PK")}
                      </span>
                      {hasDiscount && (
                        <span className="mt-1 text-xs text-muted-foreground line-through">
                          Rs {f.price.toLocaleString("en-PK")}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        add(
                          {
                            id: f.id,
                            name: f.name,
                            price: shownPrice,
                            image_url: f.image_url,
                          },
                          1,
                        );
                        open();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full gradient-gold px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
                      type="button"
                      aria-label={`Add ${f.name} to cart`}
                    >
                      <ShoppingBag size={13} /> Add
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* -------------------------------------------------------------------------- */

function TodaysSpecial() {
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-ink text-cream">
          <img
            src={interiorImg}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />

          <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
            <div>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl">
                Buffet Night —<br />
                <span className="italic text-gold">30+ dishes till 8 PM</span>
              </h2>
              <p className="mt-4 max-w-md text-cream/80">
                Every evening, our chefs plate a live buffet of BBQ, handi,
                Chinese, continental and dessert. All-you-can-eat, one price.
              </p>

              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-5xl text-gold">Rs 1,499</span>
                <span className="text-cream/50 line-through">Rs 1,899</span>
                <span className="rounded-full bg-gold/20 px-2.5 py-1 text-xs font-semibold text-gold">
                  Save 20%
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/reservations"
                  className="inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  <CalendarDays size={16} /> Reserve for tonight
                </Link>
                <a
                  href={whatsappLink("Hi, I'd like details about tonight's buffet.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-cream hover:bg-white/5"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-3 self-center">
              {[
                "Live BBQ",
                "Handi Corner",
                "Chinese Wok",
                "Continental",
                "Dessert Bar",
                "Fresh Salads",
              ].map((t) => (
                <li
                  key={t}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm backdrop-blur"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

const perks = [
  {
    icon: ChefHat,
    title: "Chef-led kitchen",
    text: "Every recipe overseen by our head chef — consistent, plated with care.",
  },
  {
    icon: Leaf,
    title: "Fresh, sourced daily",
    text: "Local produce, real spices, no shortcuts. Halal-certified through and through.",
  },
  {
    icon: Truck,
    title: "30-min delivery",
    text: "Insulated bags, live tracking on WhatsApp, hot every single time.",
  },
  {
    icon: Award,
    title: "Loved in Shakargarh",
    text: "4.1★ from 365+ Google reviews and counting. That trust powers us.",
  },
];

function WhyChooseUs() {
  return (
    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <SectionHeader
          title="A restaurant, cafe and BBQ house — done properly."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="rounded-3xl border border-border bg-card p-6"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-gold text-primary-foreground shadow-md">
                <p.icon size={20} />
              </div>
              <h3 className="mt-5 font-display text-lg">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function ChefSection() {
  return (
    <section className="section-y">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[2rem] border border-border">
            <img
              src={chefImg}
              alt="Head chef plating a dish"
              loading="lazy"
              width={1200}
              height={1500}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-border bg-card p-5 shadow-xl sm:block">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full gradient-gold text-primary-foreground">
                <ChefHat size={18} />
              </div>
              <div>
                <div className="font-display text-lg leading-none">12+ years</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Kitchen experience
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div>
          <h2 className="mt-4 font-display text-4xl sm:text-5xl">
            Recipes shaped by memory,
            <br />
            <span className="italic text-gold">served with pride.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            Our head chef trained across Lahore and Islamabad before coming home to
            Shakargarh. His philosophy is simple — real ingredients, patient
            cooking, and a plate that makes you want to text your friends.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Handi & karahi cooked over slow charcoal.",
              "Fresh dough proofed daily for pizza and naan.",
              "House-made chutneys, sauces and marinades.",
            ].map((t) => (
              <li key={t} className="flex gap-3 text-sm">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-accent transition"
            >
              Read our story <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

const reviews = [
  {
    name: "Ameer H.",
    role: "TikTok · 147K views",
    text: "New Shakargarh branch is stunning. Buffet is a full experience — 30+ dishes and everything was fresh.",
  },
  {
    name: "Hadi R.",
    role: "Instagram",
    text: "Handi and seekh kebab hit exactly like home. Service was quick even on a full evening.",
  },
  {
    name: "Sufyan B.",
    role: "Google review",
    text: "Grand opening was packed — and the food matched the hype. Pulled beef benedict is unreal.",
  },
];

function Reviews() {
  return (
    <section className="section-y bg-secondary/40">
      <div className="container-page">
        <SectionHeader
          title="Trusted by 3,800+ followers and counting."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.blockquote
              key={r.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="rounded-3xl border border-border bg-card p-7"
            >
              <Quote size={22} className="text-gold" />
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                "{r.text}"
              </p>
              <footer className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 font-display text-gold">
                  {r.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={12} className="fill-gold text-gold" />
                  ))}
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function ReservationCTA() {
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-10 text-cream sm:p-16">
          <div className="absolute inset-0 opacity-20 [background:radial-gradient(60%_60%_at_20%_20%,var(--color-gold),transparent_60%),radial-gradient(50%_50%_at_80%_80%,var(--color-burgundy),transparent_60%)]" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="mt-3 max-w-xl font-display text-4xl sm:text-5xl">
                Your table at Dream Cafe,
                <br />
                <span className="italic text-gold">held with a tap.</span>
              </h2>
              <p className="mt-4 max-w-lg text-cream/75">
                Book online, get instant confirmation on WhatsApp, and skip the
                wait on busy nights.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/reservations"
                className="inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg"
              >
                <CalendarDays size={16} /> Reserve now
              </Link>
              <a
                href={`tel:${site.phones[0].tel}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold hover:bg-white/5"
              >
                <Phone size={16} /> {site.phones[0].number}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function ContactStrip() {
  return (
    <section className="section-y">
      <div className="container-page grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="rounded-[2rem] border border-border bg-card p-8 sm:p-10">
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            {site.address.line1}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {site.address.city}, {site.address.postalCode}, {site.address.country}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <InfoRow icon={Phone} label="Call us">
              {site.phones.slice(0, 2).map((p) => (
                <a key={p.tel} href={`tel:${p.tel}`} className="block hover:text-gold">
                  {p.number}
                </a>
              ))}
            </InfoRow>
            <InfoRow icon={Clock} label="Hours">
              {site.hours.map((h) => (
                <div key={h.day} className="text-sm">
                  <span className="text-muted-foreground">{h.day}: </span>
                  <span>{h.time}</span>
                </div>
              ))}
            </InfoRow>
            <InfoRow icon={MapPin} label="Location">
              Noor Kot Road, near Gamtala Chowk
            </InfoRow>
            <InfoRow icon={UtensilsCrossed} label="Service">
              Dine-in · Takeaway · Delivery
            </InfoRow>
          </div>
        </div>

        <div className="min-h-[360px] overflow-hidden rounded-[2rem] border border-border">
          <iframe
            title="Dream Cafe & Restaurant on Google Maps"
            src={site.mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full"
          />
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Icon size={14} className="text-gold" /> {label}
      </div>
      <div className="mt-2 text-sm text-foreground">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2
        className={`mt-4 font-display text-3xl sm:text-4xl md:text-5xl ${
          align === "center" ? "mx-auto max-w-3xl" : "max-w-2xl"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-muted-foreground ${
            align === "center" ? "mx-auto max-w-2xl" : "max-w-xl"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
