import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinScribe AI — Intelligent Financial Ledger",
  description: "Modern SaaS financial ledger powered by AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-zinc-950 text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
