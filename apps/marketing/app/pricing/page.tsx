import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowRight, X, Sparkles } from "lucide-react";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { SECTOR_LIST } from "../../components/sector-data";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for training schools of every size. Start free, scale as you grow.",
};

const tiers = [
  {
    name: "Starter",
    price: "$99",
    period: "/month",
    description: "For small schools getting started with digital admissions.",
    cta: "Start Free Trial",
    ctaHref: "/get-started?plan=starter",
    highlighted: false,
    features: [
      { text: "Up to 50 active students", included: true },
      { text: "CRM & prospect pipeline", included: true },
      { text: "Online application forms", included: true },
      { text: "Stripe payment processing", included: true },
      { text: "Student portal", included: true },
      { text: "Email notifications", included: true },
      { text: "Your branding (logo + colors)", included: true },
      { text: "Core LMS (courses, quizzes)", included: true },
      { text: "Instructor marketplace", included: false },
      { text: "AI Course Creator", included: false },
      { text: "Sector modules", included: false },
      { text: "White-label (custom domain)", included: false },
    ],
  },
  {
    name: "Professional",
    price: "$299",
    period: "/month",
    description:
      "For growing schools that need the full platform with AI tools.",
    cta: "Start Free Trial",
    ctaHref: "/get-started?plan=professional",
    highlighted: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited students", included: true },
      { text: "Everything in Starter", included: true },
      { text: "Instructor marketplace (Stripe Connect)", included: true },
      { text: "Zoom classroom integration", included: true },
      { text: "Attendance tracking", included: true },
      { text: "SMS & WhatsApp notifications", included: true },
      { text: "Identity verification (KYC)", included: true },
      { text: "AI Course Creator", included: true },
      { text: "Sector modules (add-on)", included: true },
      { text: "Certificates & verification", included: true },
      { text: "Priority support", included: true },
      { text: "White-label (custom domain)", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: "$999",
    period: "/month",
    description:
      "Full white-label deployment under your brand. Zero SimpliLMS references.",
    cta: "Contact Sales",
    ctaHref: "/contact?plan=enterprise",
    highlighted: false,
    features: [
      { text: "Everything in Professional", included: true },
      { text: "White-label (your domain)", included: true },
      { text: "Dedicated Supabase project", included: true },
      { text: "Custom onboarding", included: true },
      { text: "ISA partner integration", included: true },
      { text: "Custom feature flags", included: true },
      { text: "n8n workflow customization", included: true },
      { text: "SLA & dedicated support", included: true },
      { text: "Bulk pricing for multi-campus", included: true },
      { text: "API access", included: true },
      { text: "1 sector module included", included: true },
      { text: "Additional modules at discount", included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Pricing Header */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start with a 14-day free trial. No credit card required. Upgrade
              or cancel anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border ${
                  tier.highlighted
                    ? "border-primary shadow-lg ring-1 ring-primary"
                    : "border-border shadow-sm"
                } bg-card p-8`}
              >
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    {tier.badge}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-foreground">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {tier.price}
                  </span>
                  <span className="ml-1 text-sm text-muted-foreground">
                    {tier.period}
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {tier.description}
                </p>
                <Link
                  href={tier.ctaHref}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                    tier.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground/60"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sector Module Add-Ons */}
      <section className="border-t bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              Industry-Specific Add-Ons
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Sector modules
            </h2>
            <p className="mt-4 text-muted-foreground">
              Add industry-specific AI prompts, compliance documentation,
              curriculum frameworks, and assessment question banks to your plan.
              Available on Professional and Enterprise.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SECTOR_LIST.map((sector) => (
              <Link
                key={sector.slug}
                href={`/industries/${sector.slug}`}
                className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${sector.colorBg} ${sector.colorText}`}
                  >
                    <sector.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {sector.name
                        .replace(" Schools", "")
                        .replace(" Training", "")
                        .replace(" Agencies", "")}
                    </h3>
                    <p className="text-sm font-medium text-primary">
                      +{sector.modulePrice}/mo
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {sector.questionBankSize} questions, compliance docs, AI
                  prompts
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8 mx-auto max-w-2xl">
            <div className="rounded-lg border bg-card p-6 text-center">
              <p className="text-sm text-foreground">
                <strong>Enterprise customers:</strong> Your first sector module
                is included free. Additional modules at 20% discount.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/50 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <div className="mt-12 space-y-8">
            {[
              {
                q: "What happens after the free trial?",
                a: "After 14 days, you can choose a plan or your account pauses. No charges without your consent. Your data is kept for 30 days.",
              },
              {
                q: "Can I switch plans later?",
                a: "Yes, upgrade or downgrade anytime. Changes take effect on your next billing cycle. Upgrades are prorated.",
              },
              {
                q: "What does white-label mean?",
                a: 'Enterprise tier deploys under your own domain with your branding. Your students never see "SimpliLMS" anywhere. It\'s 100% your brand.',
              },
              {
                q: "Do students pay through my Stripe account?",
                a: "Yes. You connect your own Stripe account. All payments go directly to you. SimpliLMS never holds your funds.",
              },
              {
                q: "What is the AI Course Creator?",
                a: "An AI assistant that interviews your subject matter experts and automatically builds structured courses with modules, lessons, quizzes, and learning objectives. Available on Professional and Enterprise plans.",
              },
              {
                q: "What are sector modules?",
                a: "Industry-specific add-ons that give the AI Course Creator deep knowledge of your sector's regulations, terminology, and standards. They include pre-built curriculum frameworks, compliance document templates, and assessment question banks aligned to licensing exams.",
              },
              {
                q: "Can I add multiple sector modules?",
                a: "Yes. If your school serves multiple industries (e.g., real estate and insurance), you can add both modules. Enterprise plans include one module free and get 20% off additional modules.",
              },
              {
                q: "Which regulatory bodies do you support?",
                a: "We generate documentation aligned to TWC (Texas), GNPEC (Georgia), BPPE (California), SCHEV (Virginia), ACCSC, COE, DEAC, and many more. Each sector module includes state-specific and national regulatory support.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="text-base font-semibold text-foreground">
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
