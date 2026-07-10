import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, ChefHat, Heart, Leaf, ShieldCheck, Star } from "lucide-react";
import { SiteShell } from "@/components/site/site-shell";
import interiorImg from "@/assets/interior.jpg";
import chefImg from "@/assets/chef.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Dream Cafe & Restaurant Shakargarh" },
      {
        name: "description",
        content:
          "The story, mission and team behind Dream Cafe & Restaurant on Noor Kot Road, Shakargarh — Pakistani, BBQ, Chinese and continental cuisine.",
      },
      { property: "og:title", content: "Our Story — Dream Cafe & Restaurant" },
      {
        property: "og:description",
        content:
          "From a family kitchen to Shakargarh's premium dining destination.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <SiteShell>
      <section className="relative isolate min-h-[70svh] bg-ink text-cream">
        <img
          src={interiorImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 gradient-hero" />
        <div className="container-page relative flex min-h-[70svh] flex-col justify-end pb-16 pt-40">
          <p className="eyebrow">Our story</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl sm:text-6xl md:text-7xl">
            From a family kitchen to
            <br />
            <span className="italic text-gold">Shakargarh's dining table.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-cream/80">
            Dream Cafe & Restaurant began with one belief: that great food
            deserves a room worthy of it. Today we serve BBQ, handi, pizza,
            Chinese and continental — all under one roof on Noor Kot Road.
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[2rem] border border-border">
            <img src={chefImg} alt="Head chef" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="eyebrow">Our mission</p>
            <h2 className="mt-3 font-display text-4xl">
              Real ingredients. Patient cooking.{" "}
              <span className="italic text-gold">Plated with pride.</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              We source produce locally every morning, marinate meats
              overnight, and cook handi on slow charcoal. Nothing is rushed —
              because a plate that lands at your table represents everyone in
              the kitchen.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <Value
                icon={Leaf}
                title="Fresh, halal, honest"
                text="Halal-certified meats, real spices, no shortcuts."
              />
              <Value
                icon={Heart}
                title="Made with care"
                text="Every dish tasted by our chef before it leaves the pass."
              />
              <Value
                icon={ShieldCheck}
                title="Quality standards"
                text="Clean kitchen, trained staff, strict food-safety protocol."
              />
              <Value
                icon={Award}
                title="Loved locally"
                text="4.1★ from 365+ reviews and 3.8K+ social followers."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-y bg-secondary/40">
        <div className="container-page text-center">
          <p className="eyebrow justify-center">Our vision</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl sm:text-5xl">
            To be the place Shakargarh chooses for{" "}
            <span className="italic text-gold">every celebration.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Birthdays, family gatherings, quick lunches, late-night cravings —
            we're building a restaurant that shows up for all of them, without
            compromise.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 rounded-full gradient-gold px-6 py-3.5 text-sm font-semibold text-primary-foreground"
            >
              <ChefHat size={16} /> Explore the menu
            </Link>
            <Link
              to="/reservations"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold hover:bg-accent"
            >
              Reserve a table
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Value({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold">
        <Icon size={18} />
      </div>
      <h3 className="mt-4 font-display text-lg">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
      <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
        <Star size={12} className="fill-gold text-gold" /> Signature standard
      </div>
    </div>
  );
}
