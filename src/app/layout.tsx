import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import { themeScript } from '@/lib/theme-script'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  metadataBase: new URL('https://finscribe-ai.vercel.app'),
  title: {
    default: 'FinScribe — Personal finance, recorded clearly',
    template: '%s · FinScribe',
  },
  description: 'Record expenses, review spending, plan loans and goals, and ask an AI assistant for educational guidance.',
  applicationName: 'FinScribe',
  appleWebApp: {
    capable: true,
    title: 'FinScribe',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f6f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0e0d' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="bg-background text-foreground font-sans min-h-dvh antialiased">
          {children}
          <ServiceWorkerRegistration />
        </body>
      </html>
    </ClerkProvider>
  )
}
