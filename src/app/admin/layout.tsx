import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stride Admin',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, background: '#f5f5f7' }}>
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#f5f5f7' }}>
        {children}
      </body>
    </html>
  )
}