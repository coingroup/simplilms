import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "SimpliLMS — Admissions & Learning Management Made Simple",
    template: "%s | SimpliLMS",
  },
  description:
    "All-in-one platform for admissions, enrollment, payments, and learning management. Built for training schools and education businesses.",
  keywords: [
    "LMS",
    "admissions",
    "enrollment",
    "student management",
    "training school software",
    "education SaaS",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
