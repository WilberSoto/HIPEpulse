import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HIPE - creative',
  description: 'Creative community for CUNY',
  icons: {
    icon: '/logo.webp',
    apple: '/logo.webp',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-screen">
      <body className="min-h-screen w-full">{children}</body>
    </html>
  )
}
