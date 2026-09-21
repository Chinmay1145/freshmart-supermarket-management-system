import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { posts } from "@/lib/blog";
import { shortDate } from "@/lib/format";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Retail Blog & News — FreshMart ERP" },
      {
        name: "description",
        content:
          "Practical writing on grocery retail: faster checkouts, honest stock counts, margins, and supplier negotiation.",
      },
      { property: "og:title", content: "Retail Blog & News — FreshMart ERP" },
      {
        property: "og:description",
        content: "Practical writing on grocery retail operations, inventory, margins and suppliers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/blog" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
});

function BlogIndex() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <Badge variant="secondary">Blog & news</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Notes from the shop floor</h1>
          <p className="mt-3 text-muted-foreground">
            Short, practical pieces on running a grocery business well — written for owners and store managers, not for
            software people.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Card key={p.slug} className="shadow-card transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="secondary">{p.tag}</Badge>
                  <span>{shortDate(p.date)}</span>
                  <span>{p.readTime}</span>
                </div>
                <CardTitle className="mt-2 text-xl leading-snug">
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="hover:text-primary">
                    {p.title}
                  </Link>
                </CardTitle>
                <CardDescription>{p.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Read article →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
