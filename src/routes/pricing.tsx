import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — FreshMart Retail Management" },
      {
        name: "description",
        content: "Simple monthly plans for single stores and growing retail chains. Start free, upgrade when you grow.",
      },
      { property: "og:title", content: "Pricing — FreshMart Retail Management" },
      { property: "og:description", content: "Simple monthly plans for single stores and growing retail chains." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/pricing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
  }),
});

const plans = [
  {
    name: "Starter",
    price: "₹0",
    period: "per month",
    tagline: "For a single counter finding its feet.",
    features: ["1 store, 2 staff accounts", "Billing and invoices", "Products and categories", "Basic dashboard"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₹1,499",
    period: "per month",
    tagline: "For busy stores that need full control.",
    features: [
      "1 store, 10 staff accounts",
      "Purchases, suppliers and returns",
      "Stock adjustments and low-stock alerts",
      "Expenses and profit reports",
      "CSV exports",
    ],
    cta: "Choose Growth",
    highlighted: true,
  },
  {
    name: "Chain",
    price: "Custom",
    period: "talk to us",
    tagline: "For multi-branch retailers.",
    features: [
      "Unlimited stores and staff",
      "Consolidated reporting",
      "Priority support",
      "Onboarding and data migration",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

const faqs = [
  {
    q: "Is there really a free plan?",
    a: "Yes. The Starter plan covers billing, products and your dashboard at no cost, so you can run a single counter without paying anything.",
  },
  {
    q: "Can I change plans later?",
    a: "You can move up or down at any time. Your data stays exactly as it is when you switch.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. FreshMart runs in any modern browser on a desktop, laptop or tablet at the counter.",
  },
  {
    q: "What happens to my data if I stop?",
    a: "You can export your products, sales and customers as CSV files at any time and keep them.",
  },
];

function PricingPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Pricing that fits your counter</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            No setup fees, no per-invoice charges. Pick a plan and change it whenever your store changes.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlighted ? "border-primary shadow-lg ring-1 ring-primary/20" : "shadow-card"}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.highlighted && <Badge>Most popular</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                <div className="pt-3">
                  <span className="text-3xl font-extrabold tracking-tight">{plan.price}</span>{" "}
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
                  <Link to={plan.name === "Chain" ? "/contact" : "/auth/signup"}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight">Common questions</h2>
          <Accordion type="single" collapsible className="mt-4">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteLayout>
  );
}
