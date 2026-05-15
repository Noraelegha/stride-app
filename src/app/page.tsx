'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()
  const [showCta, setShowCta] = useState(false)
  const [hasUser, setHasUser] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('stride_user')
    if (user) {
      setHasUser(true)
      // Returning user — brief pause then go home
      const t = setTimeout(() => router.push('/home'), 1800)
      return () => clearTimeout(t)
    } else {
      // New user — show CTAs after short load
      const t = setTimeout(() => setShowCta(true), 1200)
      return () => clearTimeout(t)
    }
  }, [router])

  const handleGetStarted = () => router.push('/onboarding')

  const handleDemo = () => {
    // Seeds a mock returning user so you can demo the full app
    localStorage.setItem('stride_user', JSON.stringify({
      name: 'Nora',
      persona: 'builder',
      goal: 'Build a personal brand on LinkedIn',
      domain: 'Social media',
      bigPrize: 'Land 3 high-paying consulting clients',
      hasDeadline: 'yes',
      deadline: '2025-09-30',
      personalWhy: 'I want to prove to myself I can actually follow through.',
      coachStyle: 'strategic',
      dailyTime: '30',
      streak: 7,
      phase: 1,
      joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }))
    router.push('/home')
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes floatBolt {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes ctaFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Status bar */}
      <div style={{
        width: '100%', height: '54px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'relative', zIndex: 5,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          {/* WiFi icon */}
          <svg width="16" height="13" viewBox="0 0 16 13" fill="none">
            <path d="M1 4C4 1.2 12 1.2 15 4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M3 7C5.3 5 10.7 5 13 7" stroke="rgba(255,255,255,0.65)" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M5.5 10C6.5 8.8 9.5 8.8 10.5 10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="8" cy="12.5" r="1" fill="white"/>
          </svg>
          {/* Battery icon */}
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="rgba(255,255,255,0.55)" strokeWidth="1"/>
            <rect x="2" y="2" width="16" height="8" rx="1.5" fill="white"/>
            <path d="M23 4v4c1-.5 1.5-1.1 1.5-2s-.5-1.5-1.5-2z" fill="rgba(255,255,255,0.55)"/>
          </svg>
        </div>
      </div>

      {/* Dynamic Island */}
      <div style={{
        position: 'absolute',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '126px', height: '34px',
        background: '#1a1a2e',
        borderRadius: '0 0 22px 22px',
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 10,
        paddingTop: '3px',
      }}>
        <div style={{
          width: '108px', height: '28px',
          background: '#000',
          borderRadius: '14px',
        }} />
      </div>

      {/* Main centred content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 32px',
        gap: '14px',
        textAlign: 'center',
      }}>

        {/* Amber bolt circle */}
        <div style={{
          width: '96px', height: '96px',
          borderRadius: '50%',
          background: '#F5A623',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'floatBolt 3s ease-in-out infinite',
        }}>
          <svg viewBox="0 0 24 24" fill="#1a1a2e" width="46" height="46">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
          </svg>
        </div>

        {/* STRIDE wordmark */}
        <h1 style={{
          fontSize: '40px',
          fontWeight: 800,
          color: '#F5A623',
          letterSpacing: '4px',
          margin: 0,
          lineHeight: 1,
        }}>
          STRIDE
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.8px',
          margin: '-4px 0 0',
          textAlign: 'center',
        }}>
          Stop guessing. Start stepping.
        </p>

        {/* CTAs — only shown to new users */}
        {!hasUser && showCta && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '12px',
            marginTop: '14px',
            animation: 'ctaFade 0.5s ease both',
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                background: '#F5A623',
                color: '#1a1a2e',
                fontSize: '17px',
                fontWeight: 700,
                padding: '15px 46px',
                borderRadius: '50px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Get started
            </button>

            <button
              onClick={handleDemo}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.35)',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              [Demo: returning user]
            </button>
          </div>
        )}

        {/* Returning user — show loading dots while redirecting */}
        {hasUser && (
          <div style={{
            display: 'flex', gap: '8px',
            marginTop: '14px',
            animation: 'ctaFade 0.5s ease 0.3s both',
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '7px', height: '7px',
                borderRadius: '50%',
                background: '#F5A623',
                opacity: 0.4 + i * 0.3,
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Home indicator */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '130px', height: '5px',
        borderRadius: '3px',
        background: 'rgba(255,255,255,0.3)',
      }} />
    </div>
  )
}