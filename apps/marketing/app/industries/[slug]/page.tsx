import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Brain,
  ClipboardList,
  HelpCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Header } from "../../../components/header";
import { Footer } from "../../../components/footer";
import { SECTORS, SECTOR_LIST } from "../../../components/sector-data";

interface SectorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SECTOR_LIST.map((sector) => ({ slug: sector.slug }));
}

export async function generateMetadata({
  params,
}: SectorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sector = SECTORS[slug];
  if (!sector) return {};
  return {
    title: `${sector.name} | SimpliLMS`,
    description: sector.heroDescription,
  };
}

export default async function SectorPage({ params }: SectorPageProps) {
  const { slug } = await params;
  const sector = SECTORS[slug];
  if (!sector) notFound();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section
        className={`relative overflow-hidden ${sector.colorBg} py-20 sm:py-28`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/industries"
              className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All Industries
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${sector.colorBg} ${sector.colorText} ring-2 ring-white shadow-sm`}
              >
                <sector.icon className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
                  {sector.name}
                </h1>
                <p className={`text-lg font-medium ${sector.colorText}`}>
                  {sector.tagline}
                </p>
              </div>
            </div>
            <p className="text-lg leading-8 text-muted-foreground">
              {sector.heroDescription}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              >
                {sector.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-6 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Book a Demo
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Sector module: {sector.modulePrice}/mo add-on
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {sector.questionBankSize} question bank
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sound familiar?
            </h2>
            <p className="mt-2 text-muted-foreground">
              These are the problems {sector.name.toLowerCase()} face every
              day. SimpliLMS solves them all.
            </p>
            <ul className="mt-8 space-y-4">
              {sector.painPoints.map((pain, i) => (
                <li key={i} className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                  <span className="text-foreground">{pain}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything your {sector.name.toLowerCase().replace(" schools", " school").replace(" training", " school").replace(" agencies", " agency")} needs
            </h2>
            <p className="mt-4 text-muted-foreground">
              The SimpliLMS {sector.name.split(" ")[0]} Module adds these
              sector-specific capabilities to the core platform.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sector.features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI + Compliance + Questions */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* AI Capabilities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Brain className={`h-5 w-5 ${sector.colorText}`} />
                <h3 className="text-lg font-bold text-foreground">
                  AI Course Creator
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The AI understands your industry&apos;s regulations and standards:
              </p>
              <ul className="space-y-3">
                {sector.aiCapabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Sparkles
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${sector.colorText}`}
                    />
                    <span className="text-foreground">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compliance Docs */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className={`h-5 w-5 ${sector.colorText}`} />
                <h3 className="text-lg font-bold text-foreground">
                  Compliance Documents
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Auto-generated documentation for regulatory submissions:
              </p>
              <ul className="space-y-3">
                {sector.complianceDocs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span className="text-foreground">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Question Bank */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className={`h-5 w-5 ${sector.colorText}`} />
                <h3 className="text-lg font-bold text-foreground">
                  Assessment Question Bank
                </h3>
              </div>
              <div className="rounded-xl border bg-card p-6 text-center">
                <p className="text-4xl font-bold text-primary">
                  {sector.questionBankSize}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  pre-loaded questions
                </p>
                <ul className="mt-4 space-y-2 text-sm text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Aligned to licensing exams
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Bloom&apos;s Taxonomy tagged
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Difficulty levels
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Customizable
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Regularly updated
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulators */}
      <section className="bg-muted/50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Regulatory bodies we support
            </h2>
            <p className="mt-2 text-muted-foreground">
              SimpliLMS generates documentation aligned to these regulatory
              standards.
            </p>
          </div>
          <div className="mx-auto mt-8 flex flex-wrap justify-center gap-4 max-w-3xl">
            {sector.regulators.map((reg) => (
              <div
                key={reg.name}
                className="flex flex-col items-center rounded-lg border bg-card px-6 py-4 text-center shadow-sm"
              >
                <span className="text-base font-bold text-foreground">
                  {reg.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {reg.jurisdiction}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Plus everything in the SimpliLMS platform
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sector modules add to the core platform — you get all of this
              included.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              "CRM & prospect pipeline",
              "Automated admissions",
              "Online application forms",
              "Identity verification (KYC)",
              "Stripe payment processing",
              "Installment payment plans",
              "Student portal",
              "Instructor marketplace",
              "Class & attendance management",
              "Zoom classroom integration",
              "Messaging & notifications",
              "Your branding (white-label)",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="border-t bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border bg-card p-8 sm:p-12 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Add the {sector.name.split(" ")[0]} Module
            </h2>
            <div className="mt-4 flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-primary">
                {sector.modulePrice}
              </span>
              <span className="text-lg text-muted-foreground">/month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Added to your Professional ($299/mo) or Enterprise ($999/mo) plan
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-md border border-border px-8 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
              >
                View All Pricing
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              14-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Other Industries */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-foreground mb-8">
            Explore other industries
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {SECTOR_LIST.filter((s) => s.slug !== sector.slug).map((s) => (
              <Link
                key={s.slug}
                href={`/industries/${s.slug}`}
                className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center transition-all hover:shadow-md hover:border-primary/30"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.colorBg} ${s.colorText}`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-foreground leading-tight">
                  {s.name.replace(" Schools", "").replace(" Training", "").replace(" Agencies", "")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
