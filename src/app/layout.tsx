import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://finscribe-ai.vercel.app'),
  title: "FinScribe AI — Smart Finance",
  description: "Modern SaaS financial ledger powered by AI.",
  openGraph: {
    images: [{ url: '/og-placeholder.png' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400&family=Syne:wght@400;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="bg-background text-foreground font-body min-h-screen antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
