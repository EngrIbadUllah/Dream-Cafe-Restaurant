import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Dream Cafe Blog` },
      { name: "description", content: "A story from Dream Cafe & Restaurant, Shakargarh." },
    ],
  }),
  component: BlogPost,
  errorComponent: () => (
    <SiteShell>
      <div className="container-page pt-28 pb-16 text-center">
        <h1 className="font-display text-4xl">Post not found</h1>
        <Link to="/blog" className="mt-6 inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold">Back to blog</Link>
      </div>
    </SiteShell>
  ),
  notFoundComponent: () => (
    <SiteShell>
      <div className="container-page pt-28 pb-16 text-center">
        <h1 className="font-display text-4xl">Post not found</h1>
        <Link to="/blog" className="mt-6 inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold">Back to blog</Link>
      </div>
    </SiteShell>
  ),
});

function BlogPost() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["blog", "post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  if (isLoading) return <SiteShell><div className="container-page pt-28 pb-16"><div className="h-8 w-64 animate-pulse rounded bg-muted" /></div></SiteShell>;
  if (error || !data) return null;

  return (
    <SiteShell>
      <article className="container-page pt-28 pb-16 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft size={14} /> All posts
        </Link>
        {data.published_at && (
          <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
            {new Date(data.published_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </p>
        )}
        <h1 className="mt-3 font-display text-4xl sm:text-5xl">{data.title}</h1>
        {data.excerpt && <p className="mt-4 text-lg text-muted-foreground">{data.excerpt}</p>}
        {data.cover_image && (
          <img src={data.cover_image} alt={data.title} className="mt-8 aspect-[16/9] w-full rounded-[2rem] object-cover border border-border" />
        )}
        <div className="prose prose-invert mt-10 max-w-none whitespace-pre-wrap text-foreground/90 leading-relaxed">
          {data.content}
        </div>
      </article>
    </SiteShell>
  );
}
