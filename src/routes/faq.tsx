import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, LifeBuoy, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ & Help Centre — FreshMart ERP" },
      {
        name: "description",
        content:
          "Answers on setting up your store, billing, stock adjustments, GST, user access, data safety and support options.",
      },
      { property: "og:title", content: "FAQ & Help Centre — FreshMart ERP" },
      { property: "og:description", content: "Common questions about setup, billing, stock, GST and support." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/faq" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
});

const groups = [
  {
    title: "Getting started",
    items: [
      {
        q: "How long does setup take?",
        a: "Most stores are billing within an afternoon. Create your account, add your categories, import or type in your fast-moving products with prices, and raise your first bill. Everything else can be filled in as you go.",
      },
      {
        q: "Can I move my existing product list across?",
        a: "Yes. If your products are in a spreadsheet with name, category, price and stock, send it to our support address and we will help you get it in. You can also add products one at a time from the Products page.",
      },
      {
        q: "Do I need special hardware?",
        a: "No. FreshMart runs in any modern browser on a laptop, desktop or tablet. A barcode scanner and a receipt printer work if you already have them, but they are not required to start.",
      },
    ],
  },
  {
    title: "Billing and sales",
    items: [
      {
        q: "Which payment methods can I record?",
        a: "Cash, card, UPI, wallet and bank transfer. Every sale stores its payment method, so your reports can show you the split at any time.",
      },
      {
        q: "Can I print a receipt automatically after each sale?",
        a: "Yes. Turn on 'Print receipt automatically' in Store settings and the print dialog opens as soon as a sale is completed.",
      },
      {
        q: "How is tax handled?",
        a: "Set a default tax percentage and your GST number in Store settings. Both appear on invoices, and you can override the rate on an individual sale when needed.",
      },
    ],
  },
  {
    title: "Stock and suppliers",
    items: [
      {
        q: "What happens to stock when I make a sale?",
        a: "Stock is reduced automatically for every item on the bill, and the movement is recorded so you can see later exactly what changed and when.",
      },
      {
        q: "How do I correct a wrong stock figure?",
        a: "Open the Stock page, find the product and use Adjust. Enter the correct quantity and a short reason. The previous and new figures are both kept in the movement history.",
      },
      {
        q: "Can I track purchases from suppliers?",
        a: "Yes. Record purchases against a supplier and the stock is added for you, so purchase cost and stock stay in step.",
      },
    ],
  },
  {
    title: "Account, data and support",
    items: [
      {
        q: "Is my data safe?",
        a: "Your data is stored on managed cloud infrastructure with encrypted connections and daily backups. Each account can only read and write its own records.",
      },
      {
        q: "Can more than one person use the account?",
        a: "Yes. Each person signs in with their own email and password, and important changes are recorded in the activity log on the Settings page.",
      },
      {
        q: "How do I get help?",
        a: "Email billing@freshmart.in or call +91 98765 43210 between 9am and 8pm IST, Monday to Saturday. Growth and Chain plans include priority response.",
      },
    ],
  },
];

const channels = [
  { icon: MessageCircle, title: "Talk to us", body: "Email or phone support, Monday to Saturday, 9am to 8pm IST." },
  { icon: BookOpen, title: "Read the guides", body: "Short walkthroughs on our blog covering billing, stock and margins." },
  { icon: LifeBuoy, title: "Onboarding help", body: "We'll help import your product list and set up your first store free of charge." },
];

function FaqPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <Badge variant="secondary">Help centre</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Questions, answered</h1>
          <p className="mt-3 text-muted-foreground">
            Everything owners usually ask before and after moving their store onto FreshMart. If yours isn't here, get in
            touch and we'll answer it personally.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title} className="shadow-card">
                <CardHeader>
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <CardDescription>{c.body}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.title} className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">{g.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {g.items.map((item, i) => (
                    <AccordionItem key={item.q} value={`${g.title}-${i}`}>
                      <AccordionTrigger className="text-left text-sm">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-xl border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">Still stuck?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tell us what you're trying to do and we'll walk you through it.</p>
          <Button asChild className="mt-4">
            <Link to="/contact">Contact support</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
