'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const user = localStorage.getItem('stride_user')
        router.push(user ? '/home' : '/onboarding')
      } catch {
        router.push('/onboarding')
      }
    }, 2800)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div style={{
      flex: 1,
      minHeight: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      padding: '40px 32px',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    }}>
      <style>{`
        @keyframes floatBolt {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes dotPulse {
          0%,100% { opacity: 0.3; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Amber bolt circle */}
      <div style={{
        width: '96px',
        height: '96px',
        borderRadius: '50%',
        background: '#F5A623',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'floatBolt 3s ease-in-out infinite',
      }}>
        <svg viewBox="0 0 24 24" fill="#1a1a2e" width="46" height="46">
          <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
        </svg>
      </div>

      {/* STRIDE */}
      <h1 style={{
        fontSize: '40px',
        fontWeight: 800,
        color: '#F5A623',
        letterSpacing: '4px',
        margin: 0,
        lineHeight: 1,
        animation: 'fadeUp 0.6s ease 0.2s both',
      }}>
        STRIDE
      </h1>

      {/* Tagline */}
      <p style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: '0.8px',
        margin: '-4px 0 0',
        animation: 'fadeUp 0.6s ease 0.4s both',
      }}>
        Stop guessing. Start stepping.
      </p>

      {/* Loading dots */}
      <div style={{
        display: 'flex',
        gap: '9px',
        marginTop: '20px',
        animation: 'fadeUp 0.6s ease 0.8s both',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#F5A623',
            animation: `dotPulse 0.9s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}