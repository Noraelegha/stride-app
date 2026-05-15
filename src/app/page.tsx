'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()
  const [dot, setDot] = useState(0)

  useEffect(() => {
    // Cycle loading dots
    const dotInterval = setInterval(() => {
      setDot(d => (d + 1) % 3)
    }, 500)

    // Wait 3.5 seconds then route
    const nav = setTimeout(() => {
      clearInterval(dotInterval)
      try {
        const user = localStorage.getItem('stride_user')
        router.push(user ? '/home' : '/onboarding')
      } catch {
        router.push('/onboarding')
      }
    }, 3500)

    return () => {
      clearInterval(dotInterval)
      clearTimeout(nav)
    }
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
      gap: '0px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes splashPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(245,166,35,0.5); transform: scale(1); }
          50% { box-shadow: 0 0 0 18px rgba(245,166,35,0); transform: scale(1.04); }
        }
        @keyframes splashFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotPulse {
          0%,100% { opacity: 0.3; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes bgGlow {
          0%,100% { opacity: 0.06; }
          50%      { opacity: 0.12; }
        }
      `}</style>

      {/* Subtle background glow rings */}
      <div style={{
        position: 'absolute',
        width: '420px', height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)',
        animation: 'bgGlow 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Mascot circle */}
      <div style={{
        width: '88px', height: '88px',
        background: '#1a1a2e',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid #F5A623',
        animation: 'splashPulse 2.4s ease-in-out infinite',
        marginBottom: '28px',
        position: 'relative', zIndex: 1,
      }}>
        <svg viewBox="0 0 24 24" fill="#F5A623" width="42" height="42">
          <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
        </svg>
      </div>

      {/* STRIDE wordmark */}
      <h1 style={{
        fontSize: '54px',
        fontWeight: 900,
        color: '#ffffff',
        letterSpacing: '8px',
        lineHeight: 1,
        margin: 0,
        marginBottom: '10px',
        animation: 'splashFadeUp 0.7s ease 0.2s both',
        position: 'relative', zIndex: 1,
      }}>
        STRIDE
      </h1>

      {/* Tagline */}
      <p style={{
        color: 'rgba(148,163,184,0.8)',
        fontSize: '12px',
        letterSpacing: '2.5px',
        textTransform: 'uppercase',
        margin: 0,
        marginBottom: '52px',
        animation: 'splashFadeUp 0.7s ease 0.4s both',
        position: 'relative', zIndex: 1,
      }}>
        Stop guessing. Start stepping.
      </p>

      {/* Loading dots */}
      <div style={{
        display: 'flex', gap: '10px',
        animation: 'splashFadeUp 0.7s ease 0.8s both',
        position: 'relative', zIndex: 1,
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: '7px', height: '7px',
              borderRadius: '50%',
              background: '#F5A623',
              animation: `dotPulse 0.9s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}