import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Heart, MapPin, Rocket, Users } from "lucide-react";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
  head: () => ({
    meta: [
      { title: "Careers & Team — FreshMart ERP" },
      {
        name: "description",
        content: "Meet the team building FreshMart and see open roles in engineering, support and retail success in Pune.",
      },
      { property: "og:title", content: "Careers & Team — FreshMart ERP" },
      { property: "og:description", content: "Meet the people behind FreshMart and browse open roles." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/careers" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/careers" }],
  }),
});

const team = [
  { name: "Ananya Rao", role: "Co-founder & Product", bio: "Grew up behind the counter of a family kirana in Nashik." },
  { name: "Vikram Shetty", role: "Co-founder & Engineering", bio: "Fifteen years building billing and inventory systems." },
  { name: "Meera Iyer", role: "Head of Retail Success", bio: "Onboards new stores and runs our supplier playbooks." },
  { name: "Rahul Nair", role: "Support Lead", bio: "Answers the phone before the second ring, most of the time." },
];

const values = [
  { icon: Users, title: "Shop floor first", body: "Every feature is tested in a real store before it ships to everyone." },
  { icon: Clock, title: "Respect the clock", body: "Owners work long days. We keep meetings short and deadlines honest." },
  { icon: Heart, title: "Support is the product", body: "The person who answers the phone can also change the code." },
  { icon: Rocket, title: "Small team, real ownership", body: "You'll own an area end to end, not a ticket queue." },
];

const roles = [
  {
    title: "Full-stack Engineer",
    team: "Engineering",
    location: "Pune (hybrid)",
    type: "Full-time",
    body: "Build billing and inventory features used every hour of every day. Comfortable with TypeScript, React and Postgres.",
  },
  {
    title: "Retail Success Associate",
    team: "Customer",
    location: "Pune / travel in Maharashtra",
    type: "Full-time",
    body: "Set up new stores, import their catalogues and train staff. Retail or FMCG background welcome.",
  },
  {
    title: "Support Specialist",
    team: "Customer",
    location: "Remote (India)",
    type: "Full-time",
    body: "Answer calls and emails from store owners, reproduce issues and write up clear reports for engineering.",
  },
  {
    title: "Product Designer",
    team: "Design",
    location: "Remote (India)",
    type: "Contract",
    body: "Design screens that a cashier can learn in ten minutes. Portfolio of real, shipped work matters more than a CV.",
  },
];

function CareersPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-2xl">
          <Badge variant="secondary">Careers & team</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Build the software your neighbourhood store runs on</h1>
          <p className="mt-3 text-muted-foreground">
            We're a small team in Pune helping grocers and supermarket chains replace notebooks and spreadsheets with
            something they can trust during a Saturday evening rush.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">The team</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <Card key={m.name} className="shadow-card">
                <CardHeader>
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary text-lg font-bold text-primary-foreground">
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-3 text-base">{m.name}</CardTitle>
                  <CardDescription className="font-medium text-primary">{m.role}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{m.bio}</CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">How we work</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <Card key={v.title} className="shadow-card">
                  <CardHeader>
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{v.title}</CardTitle>
                    <CardDescription>{v.body}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">Open roles</h2>
          <div className="mt-6 space-y-4">
            {roles.map((r) => (
              <Card key={r.title} className="shadow-card">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{r.title}</h3>
                      <Badge variant="secondary">{r.team}</Badge>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{r.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {r.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {r.type}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="shrink-0">
                    <a href={`mailto:billing@freshmart.in?subject=${encodeURIComponent(`Application: ${r.title}`)}`}>
                      Apply now
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-xl border bg-card p-8 text-center">
          <h2 className="text-xl font-semibold">Don't see your role?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us what you'd like to work on and why retail interests you.
          </p>
          <Button asChild className="mt-4">
            <Link to="/contact">Get in touch</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
