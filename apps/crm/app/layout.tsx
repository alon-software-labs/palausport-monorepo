import type { Metadata } from 'next'
import { Outfit, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/lib/context'
import faviconUrl from '@repo/assets/favicon.ico'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const ibmPlexMono = IBM_Plex_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-ibm-mono' });

export const metadata: Metadata = {
  title: 'PalauSport CRM',
  description: 'Manage cruise reservations, guests, and invoices',
  generator: 'v0.app',
  icons: {
    icon: [{ url: faviconUrl.src, type: 'image/x-icon' }],
    apple: faviconUrl.src,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${ibmPlexMono.variable}`}>
      <body className="font-sans antialiased">
        <AppProvider>
          {children}
        </AppProvider>
        <Analytics />
      </body>
    </html>
  )
}
