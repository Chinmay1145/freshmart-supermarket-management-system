import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact FreshMart — Sales & Support" },
      {
        name: "description",
        content: "Reach the FreshMart team by phone or email for sales, onboarding and support for your retail store.",
      },
      { property: "og:title", content: "Contact FreshMart — Sales & Support" },
      { property: "og:description", content: "Reach the FreshMart team for sales, onboarding and support." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

const details = [
  { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: Mail, label: "Email", value: "billing@freshmart.in", href: "mailto:billing@freshmart.in" },
  { icon: MapPin, label: "Office", value: "14 MG Road, Pune, Maharashtra 411001" },
  { icon: Clock, label: "Hours", value: "Mon–Sat, 9:30 am – 7:00 pm IST" },
];

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [store, setStore] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`FreshMart enquiry from ${name || "a store owner"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nStore: ${store}\n\n${message}`,
    );
    window.location.href = `mailto:billing@freshmart.in?subject=${subject}&body=${body}`;
    toast.success("Opening your email app with the message ready to send.");
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Talk to us</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Questions about setup, pricing or moving your existing data across? Send a note and we will reply the same
            working day.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            {details.map((d) => {
              const Icon = d.icon;
              return (
                <Card key={d.label} className="shadow-card">
                  <CardContent className="flex items-start gap-3 pt-6">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{d.label}</p>
                      {d.href ? (
                        <a href={d.href} className="text-sm font-medium hover:underline">
                          {d.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium">{d.value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="shadow-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={submit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store">Store name</Label>
                  <Input id="store" value={store} onChange={(e) => setStore(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">How can we help?</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Send message</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-10 overflow-hidden shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Find us on the map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              title="FreshMart office location — 14 MG Road, Pune"
              src="https://www.google.com/maps?q=MG+Road,+Pune,+Maharashtra+411001&output=embed"
              className="h-96 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
