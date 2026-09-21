import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About FreshMart — Built for Indian retail" },
      {
        name: "description",
        content:
          "FreshMart builds retail management software for supermarkets and neighbourhood grocers across India.",
      },
      { property: "og:title", content: "About FreshMart — Built for Indian retail" },
      {
        property: "og:description",
        content: "Retail management software for supermarkets and neighbourhood grocers across India.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

const stats = [
  { value: "1,200+", label: "Counters billing daily" },
  { value: "18", label: "Cities served" },
  { value: "₹40 Cr+", label: "Invoiced through FreshMart" },
  { value: "99.9%", label: "Uptime over the last year" },
];

const values = [
  {
    title: "Built at the counter",
    body: "Every screen was designed alongside cashiers during peak hours, not in a boardroom. If it slows down a queue, it does not ship.",
  },
  {
    title: "Honest numbers",
    body: "Stock, margins and dues are shown as they are. No rounded-up dashboards that hide a shortfall.",
  },
  {
    title: "Owner first",
    body: "Store owners should be able to answer any question about their business in under a minute, from any device.",
  },
];

function AboutPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            We make retail software that keeps the queue moving
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            FreshMart started in a single 900 sq ft grocery store in Pune, where the owner was reconciling three
            registers by hand every night. We built the first version of this system to end that routine — one place for
            billing, stock, suppliers and the numbers that decide what to order next.
          </p>
          <p className="mt-4 text-muted-foreground">
            Today the same system runs supermarkets, dairy outlets and speciality food stores. The goal has not changed:
            a cashier should never wait on software, and an owner should never guess.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="pt-6">
                <div className="text-2xl font-extrabold tracking-tight text-primary">{s.value}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title}>
              <h2 className="text-lg font-semibold">{v.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-xl border bg-card p-8 shadow-card sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Want to talk to the team?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We are happy to walk through your store's setup before you commit.
            </p>
          </div>
          <Button className="mt-4 sm:mt-0" asChild>
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
