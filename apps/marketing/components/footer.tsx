import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
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
                <Link href="/#features" className="hover:text-foreground">
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
            <h4 className="text-sm font-semibold text-foreground">
              Industries
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/industries/real-estate"
                  className="hover:text-foreground"
                >
                  Real Estate
                </Link>
              </li>
              <li>
                <Link
                  href="/industries/healthcare"
                  className="hover:text-foreground"
                >
                  Healthcare
                </Link>
              </li>
              <li>
                <Link
                  href="/industries/insurance"
                  className="hover:text-foreground"
                >
                  Insurance
                </Link>
              </li>
              <li>
                <Link
                  href="/industries"
                  className="hover:text-foreground font-medium"
                >
                  View All Industries
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
          <p>
            &copy; {new Date().getFullYear()} SimpliLMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
