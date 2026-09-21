import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — FreshMart ERP" },
      {
        name: "description",
        content: "How FreshMart collects, stores, uses and protects store and customer data, and the rights you have over it.",
      },
      { property: "og:title", content: "Privacy Policy — FreshMart ERP" },
      { property: "og:description", content: "How we handle and protect your store data." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
});

const sections = [
  {
    title: "1. What we collect",
    body: [
      "Account details you give us: your name, email address, phone number and store details such as address and GST number.",
      "Business data you enter: products, categories, stock levels, sales, purchases, suppliers, customers and expenses.",
      "Technical data created automatically: sign-in times, the pages you open in the app, and error reports used to fix problems.",
    ],
  },
  {
    title: "2. How we use it",
    body: [
      "To run the service — storing your records, producing invoices and generating your reports.",
      "To support you when you contact us, which may mean looking at your records with your permission to diagnose a problem.",
      "To keep the service secure and reliable, including detecting unusual sign-in activity and fixing faults.",
      "We do not sell your data, and we do not share your business records with other customers.",
    ],
  },
  {
    title: "3. Customer information in your store",
    body: [
      "If you record details of your own shoppers, such as a name or phone number for a credit sale, you remain responsible for that information. We process it only to provide the service to you.",
      "Collect only what you need, and tell your customers why you are collecting it.",
    ],
  },
  {
    title: "4. Where data is stored",
    body: [
      "Data is held on managed cloud infrastructure with encryption in transit and at rest, and automated daily backups retained for thirty days.",
      "Access by our team is limited to staff who need it to operate or support the service, and such access is logged.",
    ],
  },
  {
    title: "5. How long we keep it",
    body: [
      "Your records are kept for as long as your account is active. If you close your account, we delete your business data within ninety days, except where we are required to retain records by law.",
      "Backups are overwritten on their normal cycle.",
    ],
  },
  {
    title: "6. Your rights",
    body: [
      "You can ask for a copy of your data, ask us to correct it, or ask us to delete your account and its records.",
      "Write to billing@freshmart.in and we will respond within thirty days.",
    ],
  },
  {
    title: "7. Cookies",
    body: [
      "We use only the cookies and browser storage needed to keep you signed in and to remember basic preferences. We do not use advertising trackers.",
    ],
  },
  {
    title: "8. Changes to this policy",
    body: [
      "If we make a material change we will tell you by email or with a notice inside the app before it takes effect.",
    ],
  },
];

function PrivacyPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto max-w-3xl px-6 py-16">
        <Badge variant="secondary">Legal</Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-muted-foreground">
          This policy explains what FreshMart Retail Systems does with the information you and your store put into the
          service. Last updated 1 September 2026.
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
          Questions about this policy? Email billing@freshmart.in or write to 14 MG Road, Pune 411001.
        </p>
      </section>
    </SiteLayout>
  );
}
