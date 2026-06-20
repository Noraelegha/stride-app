import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stride — Stop Guessing. Start Stepping.',
  description: 'Your AI accountability companion.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a2e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Stride" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(reg) {
                    // When a new service worker is waiting, activate it immediately
                    reg.addEventListener('updatefound', function() {
                      const newWorker = reg.installing
                      if (newWorker) {
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version available — reload to get fresh cache
                            window.location.reload()
                          }
                        })
                      }
                    })
                  })
              })
            }
          `
        }} />
      </head>
      <body>
        <div className="app-shell">
          {children}
        </div>
      </body>
    </html>
  )
}