import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "@simplilms/ui";
import { loadTenantConfig } from "@simplilms/core/lib/load-tenant-config";
import { TenantProvider } from "@simplilms/core/context";
import { ThemeInjector } from "@simplilms/core/components/theme-injector";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await loadTenantConfig();
  return {
    title: {
      default: config.name,
      template: `%s | ${config.name}`,
    },
    description: config.description,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await loadTenantConfig();

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">
        <TenantProvider config={config}>
          <ThemeInjector />
          {children}
        </TenantProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
