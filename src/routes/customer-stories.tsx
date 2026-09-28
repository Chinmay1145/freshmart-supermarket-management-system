import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, Store, ShoppingCart, Warehouse } from "lucide-react";

export const Route = createFileRoute("/customer-stories")({
  component: CustomerStoriesPage,
  head: () => ({
    meta: [
      { title: "Customer Stories — FreshMart Retail Management" },
      {
        name: "description",
        content:
          "How supermarkets, grocers and retail chains use FreshMart to bill faster, keep stock accurate and understand their profits.",
      },
      { property: "og:title", content: "Customer Stories — FreshMart Retail Management" },
      {
        property: "og:description",
        content: "Real stores, real results — see how retailers run their business on FreshMart.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/customer-stories" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/customer-stories" }],
  }),
});

const stories = [
  {
    icon: Store,
    store: "Neighbourhood supermarket",
    location: "Pune, Maharashtra",
    quote:
      "Billing that used to take three minutes per customer now takes under one. The evening rush finally moves at the speed it should.",
    result: "3× faster checkout at peak hours",
  },
  {
    icon: ShoppingCart,
    store: "Family-run grocery store",
    location: "Nashik, Maharashtra",
    quote:
      "We used to discover stockouts only when a customer asked. Now low-stock alerts tell us before the shelf is empty, and the purchase orders practically write themselves.",
    result: "Stockouts down to near zero",
  },
  {
    icon: Warehouse,
    store: "Two-branch retail chain",
    location: "Mumbai, Maharashtra",
    quote:
      "For the first time I can see both branches' sales, expenses and profit on one screen — from my phone, at home, after closing time.",
    result: "Daily profit visibility across branches",
  },
];

function CustomerStoriesPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Stores like yours, running on FreshMart
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            From single-counter grocers to multi-branch chains — here's what changes when the whole store runs on one
            system.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {stories.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.store} className="flex flex-col shadow-card">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{s.store}</CardTitle>
                  <p className="text-xs text-muted-foreground">{s.location}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <Quote className="h-4 w-4 text-primary/40" />
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.quote}</p>
                  <p className="mt-4 rounded-lg bg-primary/5 px-3 py-2 text-sm font-medium text-primary">{s.result}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 rounded-xl border bg-card p-8 text-center shadow-card">
          <h2 className="text-2xl font-bold tracking-tight">Write your own story</h2>
          <p className="mt-2 text-muted-foreground">
            Create an account today and see the difference at your own counter.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link to="/auth/signup">Get started free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
