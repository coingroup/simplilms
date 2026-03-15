import Link from "next/link";
import {
  GraduationCap,
  CreditCard,
  Users,
  BarChart3,
  Shield,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Brain,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
              S
            </div>
            <span className="text-xl font-bold text-foreground">SimpliLMS</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:block"
            >
              Request Demo
            </Link>
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
              <Sparkles className="h-4 w-4" />
              AI-Powered Course Creation Coming Soon
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Admissions to graduation.{" "}
              <span className="text-primary">One platform.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              SimpliLMS is the all-in-one platform for training schools and
              education businesses. Manage admissions, enrollment, payments,
              classes, and student communication — all under your brand.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-base font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Book a Demo
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                14-day free trial
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Your branding
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything your school needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From first inquiry to graduation — SimpliLMS handles the entire
              student lifecycle.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "CRM & Admissions",
                description:
                  "Track prospects, manage discovery calls, and automate the admissions pipeline from inquiry to enrollment.",
              },
              {
                icon: GraduationCap,
                title: "Enrollment Management",
                description:
                  "Application forms, document collection, identity verification (KYC), and automated approval workflows.",
              },
              {
                icon: CreditCard,
                title: "Payment Processing",
                description:
                  "Stripe-powered payments with support for full payment, installment plans, and income share agreements.",
              },
              {
                icon: BookOpen,
                title: "Class Management",
                description:
                  "Schedule classes, manage rosters, track attendance, and integrate with Zoom for virtual classrooms.",
              },
              {
                icon: BarChart3,
                title: "Instructor Marketplace",
                description:
                  "Onboard instructors with automated revenue splitting via Stripe Connect. 50/50 or custom splits.",
              },
              {
                icon: Brain,
                title: "AI Course Creator",
                description:
                  "Coming soon: AI interviews your subject matter experts and builds complete courses automatically.",
                badge: "Coming Soon",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="relative rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                {feature.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                    {feature.badge}
                  </span>
                )}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
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

      {/* How It Works */}
      <section
        id="how-it-works"
        className="bg-muted/50 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Up and running in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three steps to transform how your school manages admissions and
              enrollment.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Sign up & configure",
                description:
                  "Create your account, upload your logo, set your brand colors, and configure your programs. Takes 10 minutes.",
              },
              {
                step: "2",
                title: "Connect payments",
                description:
                  "Link your Stripe account to start accepting enrollment fees, tuition payments, and instructor payouts.",
              },
              {
                step: "3",
                title: "Start enrolling",
                description:
                  "Share your portal link. Prospects apply, pay, and get enrolled — automatically. You focus on teaching.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built by educators, for educators
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              SimpliLMS was born from running a real training school. We built
              the tool we wished existed.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: "100%", label: "Your branding" },
              { value: "Zero", label: "Manual enrollment steps" },
              { value: "5 min", label: "Average setup time" },
              { value: "24/7", label: "Automated admissions" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to simplify your school operations?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Join training schools that save hours every week on admissions,
            enrollment, and payments.
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
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
                  S
                </div>
                <span className="text-lg font-bold">SimpliLMS</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                All-in-one admissions, enrollment, and learning management for
                training schools.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-foreground">
                    Request Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SimpliLMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
