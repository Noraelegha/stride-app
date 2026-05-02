'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has already completed onboarding
    const user = typeof window !== 'undefined'
      ? localStorage.getItem('stride_user')
      : null

    const timer = setTimeout(() => {
      if (user) {
        router.push('/home')
      } else {
        router.push('/onboarding')
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '32px',
      background: '#0f1623',
      minHeight: '100vh',
    }}>
      {/* Animated mascot */}
      <div style={{
        width: '88px',
        height: '88px',
        background: '#1a1a2e',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #F5A623',
        animation: 'pulse 2s infinite, breathe 3s ease-in-out infinite',
      }}>
        <Zap size={40} color="#F5A623" fill="#F5A623" />
      </div>

      {/* Logo */}
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.8s ease 0.3s both' }}>
        <h1 style={{
          fontSize: '52px',
          fontWeight: 900,
          color: 'white',
          letterSpacing: '6px',
          lineHeight: 1,
        }}>
          STRIDE
        </h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '12px',
          letterSpacing: '3px',
          marginTop: '10px',
          textTransform: 'uppercase',
        }}>
          Stop guessing. Start stepping.
        </p>
      </div>

      {/* Loading dots */}
      <div style={{
        display: 'flex',
        gap: '8px',
        animation: 'fadeIn 0.8s ease 1s both',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#F5A623',
            animation: `pulse ${0.8 + i * 0.2}s ease-in-out infinite`,
            opacity: 0.6 + i * 0.2,
          }} />
        ))}
      </div>
    </div>
  )
}