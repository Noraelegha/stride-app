import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stride — Stop Guessing. Start Stepping.',
  description: 'Your AI accountability companion that turns your biggest goal into daily wins.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  )
}