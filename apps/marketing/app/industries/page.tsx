import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Header } from "../../components/header";
import { Footer } from "../../components/footer";
import { SECTOR_LIST } from "../../components/sector-data";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "SimpliLMS serves real estate schools, healthcare training, insurance, CDL trucking, cosmetology, IT/tech, corporate compliance, and government agencies.",
};

export default function IndustriesPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              Sector-Specific AI Modules
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Built for{" "}
              <span className="text-primary">your industry</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              SimpliLMS offers sector-specific modules with AI-generated
              curriculum, compliance documentation, and pre-built question banks
              — all tailored to your industry&apos;s regulations and standards.
            </p>
          </div>
        </div>
      </section>

      {/* Industry Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SECTOR_LIST.map((sector) => (
              <Link
                key={sector.slug}
                href={`/industries/${sector.slug}`}
                className="group relative rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${sector.colorBg} ${sector.colorText}`}
                >
                  <sector.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {sector.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sector.tagline}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">
                    From {sector.modulePrice}/mo
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What Every Module Includes */}
      <section className="bg-muted/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              What every sector module includes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Each module adds industry-specific capabilities on top of the
              SimpliLMS platform.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
            {[
              {
                title: "AI Course Creator Prompts",
                description:
                  "Sector-specific AI that understands your industry's regulations, terminology, and curriculum standards.",
              },
              {
                title: "Compliance Document Templates",
                description:
                  "Auto-generate syllabi, lesson plans, and program outlines in formats required by your state regulator.",
              },
              {
                title: "Pre-Built Curriculum Frameworks",
                description:
                  "Start from proven curriculum outlines instead of a blank page. Customize to your school's needs.",
              },
              {
                title: "Assessment Question Banks",
                description:
                  "Hundreds of pre-loaded questions aligned to licensing exams and certification standards.",
              },
              {
                title: "Regulatory Submission Helpers",
                description:
                  "Generate documentation in the exact format your state agency requires — TWC, GNPEC, BPPE, and more.",
              },
              {
                title: "Automatic Updates",
                description:
                  "When regulations change, your curriculum templates and compliance docs are updated automatically.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulatory Compliance */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The only LMS that helps you{" "}
              <span className="text-primary">get approved</span> and{" "}
              <span className="text-primary">stay approved</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Schools regulated by TWC, GNPEC, BPPE, ACCSC, COE, and other
              agencies choose SimpliLMS because we understand compliance.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {[
              { abbr: "TWC", name: "Texas" },
              { abbr: "GNPEC", name: "Georgia" },
              { abbr: "BPPE", name: "California" },
              { abbr: "SCHEV", name: "Virginia" },
              { abbr: "ACCSC", name: "National" },
              { abbr: "COE", name: "National" },
            ].map((reg) => (
              <div
                key={reg.abbr}
                className="flex flex-col items-center rounded-lg border bg-card p-4 text-center"
              >
                <span className="text-lg font-bold text-foreground">
                  {reg.abbr}
                </span>
                <span className="text-xs text-muted-foreground">
                  {reg.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Find your industry and get started today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            14-day free trial. No credit card required. Sector modules can be
            added anytime.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-base font-semibold text-primary shadow-lg hover:bg-gray-50 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
