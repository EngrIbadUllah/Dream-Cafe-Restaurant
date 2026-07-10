import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { SiteShell } from "./site-shell";

export function ComingSoon({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <SiteShell>
      <section className="section-y pt-40">
        <div className="container-page">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-card p-10 text-center sm:p-14">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-gold text-primary-foreground shadow-lg">
              <Sparkles size={22} />
            </div>
            <p className="eyebrow mt-6 justify-center">{eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl">{title}</h1>
            <p className="mt-4 text-muted-foreground">{description}</p>
            <div className="mt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-accent transition"
              >
                <ArrowLeft size={14} /> Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
