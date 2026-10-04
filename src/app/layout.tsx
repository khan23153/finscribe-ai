import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import InstallServiceWorker from '@/components/InstallServiceWorker';

export const metadata: Metadata = {
  metadataBase: new URL('https://finscribe-ai.vercel.app'),
  title: "FinScribe AI — Smart Finance",
  description: "Modern SaaS financial ledger powered by AI.",
};

const themeScript = `
  try {
    if (localStorage.getItem('finscribe-theme') === 'light') {
      document.documentElement.classList.add('light');
    }
  } catch {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="bg-background text-foreground font-body min-h-screen antialiased">
          <InstallServiceWorker />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
