import { Sparkles } from "lucide-react";

export function ComingSoon({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-cream">{title}</h1>
      </header>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-gold text-primary-foreground">
          <Sparkles size={22} />
        </div>
        <p className="mt-4 text-cream/70 max-w-md mx-auto">{body}</p>
      </div>
    </div>
  );
}
