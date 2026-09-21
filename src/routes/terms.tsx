import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms of Service — FreshMart ERP" },
      {
        name: "description",
        content: "The terms that govern use of FreshMart: accounts, subscriptions, acceptable use, data ownership and liability.",
      },
      { property: "og:title", content: "Terms of Service — FreshMart ERP" },
      { property: "og:description", content: "The agreement between your store and FreshMart Retail Systems." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
});

const sections = [
  {
    title: "1. Agreement",
    body: [
      "These terms form the agreement between FreshMart Retail Systems and the business using the service. By creating an account you accept them on behalf of that business.",
    ],
  },
  {
    title: "2. Your account",
    body: [
      "You are responsible for keeping sign-in details private and for everything done under your account. Tell us promptly if you believe someone else has access.",
      "Each person using the service should have their own sign-in rather than sharing one.",
    ],
  },
  {
    title: "3. Subscription and payment",
    body: [
      "Plans are billed in advance, monthly or annually, at the price shown on the pricing page at the time you subscribe.",
      "You may cancel at any time; the service continues to the end of the period already paid for. We do not refund part-used periods unless required by law.",
      "If a price changes, we give at least thirty days' notice before it applies to your renewal.",
    ],
  },
  {
    title: "4. Acceptable use",
    body: [
      "Do not use the service to store unlawful content, to attempt to access another customer's data, to probe or disrupt our systems, or to resell access without a written agreement with us.",
      "We may suspend an account that puts the service or other customers at risk, and will tell you why.",
    ],
  },
  {
    title: "5. Your data",
    body: [
      "The records you enter remain yours. We claim no ownership over your products, sales, customers or reports.",
      "You may export your data at any time, and you can ask us to delete it when you close your account.",
    ],
  },
  {
    title: "6. Availability",
    body: [
      "We aim for high availability but do not promise uninterrupted service. Planned maintenance is announced in advance where practical.",
      "Keep your own copies of records you are legally required to retain.",
    ],
  },
  {
    title: "7. Liability",
    body: [
      "The service is provided as it is. To the extent permitted by law, our total liability in any twelve-month period is limited to the fees you paid us in that period.",
      "We are not liable for indirect losses such as lost profit or lost goodwill.",
    ],
  },
  {
    title: "8. Ending the agreement",
    body: [
      "You can close your account at any time from the app or by writing to us. We may end the agreement with thirty days' notice, or immediately for serious breach of these terms.",
    ],
  },
  {
    title: "9. Governing law",
    body: ["This agreement is governed by the laws of India, and the courts of Pune have exclusive jurisdiction."],
  },
];

function TermsPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto max-w-3xl px-6 py-16">
        <Badge variant="secondary">Legal</Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-muted-foreground">
          Plain-language terms covering your use of FreshMart. Last updated 1 September 2026.
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold">{s.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 rounded-lg border bg-card p-5 text-sm text-muted-foreground">
          Need a signed copy or a custom agreement for a chain? Email billing@freshmart.in.
        </p>
      </section>
    </SiteLayout>
  );
}
