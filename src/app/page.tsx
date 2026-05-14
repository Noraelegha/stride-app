'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Fade in
    setVisible(true)

    const user =
      typeof window !== 'undefined'
        ? localStorage.getItem('stride_user')
        : null
    const timer = setTimeout(() => {
      if (user) {
        router.push('/home')
      } else {
        router.push('/onboarding')
      }
    }, 2400)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div style={{
      flex: 1,
      minHeight: '100vh',
      background: '#0f1623',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '28px',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>
      {/* Bolt icon */}
      <div style={{
        width: '84px', height: '84px',
        background: '#1a1a2e',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid #F5A623',
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        <svg viewBox="0 0 24 24" fill="#F5A623" width="40" height="40">
          <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
        </svg>
      </div>

      {/* Wordmark */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '52px', fontWeight: 900, color: 'white',
          letterSpacing: '6px', lineHeight: 1, margin: 0,
        }}>
          STRIDE
        </h1>
        <p style={{
          color: '#94a3b8', fontSize: '12px',
          letterSpacing: '3px', marginTop: '10px',
          textTransform: 'uppercase',
        }}>
          Stop guessing. Start stepping.
        </p>
      </div>

      {/* Loading dots */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '6px', height: '6px',
            borderRadius: '50%',
            background: '#F5A623',
            animation: `pulse ${0.8 + i * 0.2}s ease-in-out infinite`,
            opacity: 0.5 + i * 0.25,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%,100%{box-shadow:0 0 0 0 rgba(245,166,35,0.4)}
          50%{box-shadow:0 0 0 14px rgba(245,166,35,0)}
        }
      `}</style>
    </div>
  )
}