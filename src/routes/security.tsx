import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, KeyRound, Database, Eye, ServerCog } from "lucide-react";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
  head: () => ({
    meta: [
      { title: "Security — FreshMart Retail Management" },
      {
        name: "description",
        content:
          "How FreshMart protects your store's data: encrypted connections, per-staff accounts, row-level access control and secure cloud hosting.",
      },
      { property: "og:title", content: "Security — FreshMart Retail Management" },
      {
        property: "og:description",
        content: "Encryption, per-staff accounts and strict access control keep your store's data safe.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/security" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/security" }],
  }),
});

const practices = [
  {
    icon: Lock,
    title: "Encrypted in transit",
    body: "Every connection between your browser and our servers is protected with modern TLS encryption, so sales and customer data can't be intercepted.",
  },
  {
    icon: KeyRound,
    title: "Per-staff accounts",
    body: "Each team member signs in with their own email and password. Passwords are never stored in plain text — only secure one-way hashes.",
  },
  {
    icon: Database,
    title: "Row-level access control",
    body: "Your store's records are isolated at the database level. No other account can read or modify your products, sales or customers.",
  },
  {
    icon: Eye,
    title: "Activity tracking",
    body: "Important actions are recorded in the activity log, so you can always see who did what and when inside your store.",
  },
  {
    icon: ServerCog,
    title: "Managed cloud hosting",
    body: "Data is hosted on professionally managed infrastructure with automatic backups and continuous monitoring.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible disclosure",
    body: "Found a security concern? Write to us and we'll investigate promptly. We take every report seriously.",
  },
];

function SecurityPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            Your store's data, kept safe
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Sales figures, supplier terms and customer details are the backbone of your business. Here's how FreshMart
            protects them.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {practices.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="shadow-card">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{p.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 rounded-xl border bg-card p-8 text-center shadow-card">
          <h2 className="text-2xl font-bold tracking-tight">Questions about security?</h2>
          <p className="mt-2 text-muted-foreground">
            Read our privacy policy or get in touch — we're happy to explain how your data is handled.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link to="/contact">Contact us</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/privacy">Privacy policy</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
