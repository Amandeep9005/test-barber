import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Barber Ledger",
  description: "Log each sale and see who made what.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className={`${manrope.className} min-h-full bg-paper text-ink antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
