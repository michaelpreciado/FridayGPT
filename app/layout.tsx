import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Friday AI - Your Personal Assistant',
  description: 'JARVIS-inspired AI assistant with voice, memory, and smart-home integration',
  keywords: ['AI', 'assistant', 'JARVIS', 'voice', 'chat', 'smart home'],
  authors: [{ name: 'Friday AI Team' }],
  creator: 'Friday AI',
  publisher: 'Friday AI',
  metadataBase: new URL('https://friday-ai.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://friday-ai.vercel.app',
    title: 'Friday AI - Your Personal Assistant',
    description: 'JARVIS-inspired AI assistant with voice, memory, and smart-home integration',
    siteName: 'Friday AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Friday AI - Your Personal Assistant',
    description: 'JARVIS-inspired AI assistant with voice, memory, and smart-home integration',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Friday AI',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0B0C10',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-dark-bg text-white antialiased">
        {children}
      </body>
    </html>
  )
} 