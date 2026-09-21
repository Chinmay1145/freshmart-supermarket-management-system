import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPost } from "@/lib/blog";
import { shortDate } from "@/lib/format";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Article unavailable — FreshMart ERP" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — FreshMart Blog` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            author: { "@type": "Person", name: post.author },
          }),
        },
      ],
    };
  },
  notFoundComponent: MissingPost,
  component: BlogPost,
});

function MissingPost() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-bold tracking-tight">We couldn't find that article</h1>
        <p className="mt-3 text-muted-foreground">It may have been renamed or removed.</p>
        <Button asChild className="mt-6">
          <Link to="/blog">Back to all articles</Link>
        </Button>
      </section>
    </SiteLayout>
  );
}

function BlogPost() {
  const { post } = Route.useLoaderData();

  return (
    <SiteLayout>
      <article className="container mx-auto max-w-3xl px-6 py-16">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          ← All articles
        </Link>
        <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="secondary">{post.tag}</Badge>
          <span>{shortDate(post.date)}</span>
          <span>{post.readTime}</span>
        </div>
        <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight">{post.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
        <p className="mt-4 text-sm font-medium">By {post.author}</p>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/90">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mt-12 rounded-xl border bg-card p-6 text-center">
          <h2 className="text-lg font-semibold">Run your store on FreshMart</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Billing, stock, expenses and reports in one place — set up in an afternoon.
          </p>
          <Button asChild className="mt-4">
            <Link to="/auth/signup">Get started free</Link>
          </Button>
        </div>
      </article>
    </SiteLayout>
  );
}
