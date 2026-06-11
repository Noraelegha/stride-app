'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeColor from '@/components/ThemeColor'

export default function UnfreezePage() {
  const router = useRouter()
  const [phase, setPhase] = useState<1 | 2>(1)
  const [p1Out, setP1Out] = useState(false)
  const [p2In, setP2In] = useState(false)

  useEffect(() => {
    setPhase(1)
    setP1Out(false)
    setP2In(false)
  }, [])

  const handlePhase1Tap = () => {
    setP1Out(true)
    setTimeout(() => setP2In(true), 180)
  }

  const handleContinue = () => {
    localStorage.setItem('stride_day_locked', 'true')
    router.push('/home')
  }

  const today = new Date()
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const todayIdx = today.getDay()
  type DayStatus = 'done' | 'missed' | 'today' | 'future'
  const weekData: DayStatus[] = weekDays.map((_, i) => {
    if (i < todayIdx) return i === todayIdx - 2 ? 'missed' : 'done'
    if (i === todayIdx) return 'today'
    return 'future'
  })

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: '100vh', overflow: 'hidden' }}>
      <ThemeColor color={p2In ? '#ffffff' : '#29B6F6'} />

      <style>{`
        @keyframes shieldPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes tapFade { 0%,100%{opacity:0.3} 50%{opacity:1.0} }
        @keyframes clap { 0%{transform:rotate(-18deg)} 50%{transform:rotate(8deg)} 100%{transform:rotate(-18deg)} }
      `}</style>

      {/* Phase 1 */}
      <div
        onClick={handlePhase1Tap}
        style={{
          position: 'absolute', inset: 0,
          background: '#29B6F6',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: '48px 32px', gap: '22px', textAlign: 'center',
          opacity: p1Out ? 0 : 1,
          transform: p1Out ? 'scale(0.94)' : 'scale(1)',
          transition: 'opacity 350ms ease, transform 350ms ease',
          pointerEvents: p1Out ? 'none' : 'auto',
          zIndex: p1Out ? 1 : 2,
        }}
      >
        <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="220" height="220" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.28, zIndex: 0 }} viewBox="0 0 220 220">
            <g stroke="white" strokeWidth="3" strokeLinecap="round">
              <line x1="178" y1="110" x2="210" y2="110" />
              <line x1="168.9" y1="144" x2="196.6" y2="160" />
              <line x1="144" y1="168.9" x2="160" y2="196.6" />
              <line x1="110" y1="178" x2="110" y2="210" />
              <line x1="76" y1="168.9" x2="60" y2="196.6" />
              <line x1="51.1" y1="144" x2="23.4" y2="160" />
              <line x1="42" y1="110" x2="10" y2="110" />
              <line x1="51.1" y1="76" x2="23.4" y2="60" />
              <line x1="76" y1="51.1" x2="60" y2="23.4" />
              <line x1="110" y1="42" x2="110" y2="10" />
              <line x1="144" y1="51.1" x2="160" y2="23.4" />
              <line x1="168.9" y1="76" x2="196.6" y2="60" />
            </g>
          </svg>
          <div style={{ width: 130, height: 130, position: 'relative', zIndex: 1, animation: 'shieldPulse 2.2s ease-in-out infinite', filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.45))' }}>
            <svg width="130" height="130" viewBox="0 0 120 130" fill="none">
              <defs>
                <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#B3E5FC" />
                  <stop offset="50%" stopColor="#29B6F6" />
                  <stop offset="100%" stopColor="#0277BD" />
                </linearGradient>
              </defs>
              <path d="M60 4 L20 22 L8 58 C8 90 30 112 60 126 C90 112 112 90 112 58 L100 22 Z" fill="white" fillOpacity="0.88" />
              <path d="M60 12 L26 28 L16 60 C16 88 35 107 60 120 C85 107 104 88 104 60 L94 28 Z" fill="url(#shieldGrad)" />
              <path d="M60 52 C60 52 48 66 48 74 C48 81 53 86 60 86 C67 86 72 81 72 74 C72 66 60 52 60 52Z" fill="#0288D1" fillOpacity="0.85" />
              <ellipse cx="55" cy="65" rx="3" ry="5" fill="white" fillOpacity="0.55" transform="rotate(-15 55 65)" />
              <polygon points="32,40 35,44 32,48 29,44" fill="white" fillOpacity="0.85" />
              <polygon points="88,38 91,42 88,46 85,42" fill="white" fillOpacity="0.70" />
              <polygon points="60,18 62,21 60,24 58,21" fill="white" fillOpacity="0.90" />
            </svg>
          </div>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', lineHeight: 1.25, margin: 0 }}>
          Shield used.<br />Streak protected.
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, margin: 0, maxWidth: '260px' }}>
          You missed a day. Your shield had your back.
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0, animation: 'tapFade 1.6s ease-in-out infinite' }}>
          Tap anywhere to continue
        </p>

        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', width: '130px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.3)' }} />
      </div>

      {/* Phase 2 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#fff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 28px', textAlign: 'center', gap: '0',
        opacity: p2In ? 1 : 0,
        transform: p2In ? 'scale(1)' : 'scale(1.04)',
        transition: 'opacity 400ms ease, transform 400ms ease',
        pointerEvents: p2In ? 'auto' : 'none',
        zIndex: p2In ? 2 : 1,
      }}>
        <div style={{ fontSize: '90px', lineHeight: 1, animation: 'clap 0.8s ease-in-out infinite', transformOrigin: 'bottom center', userSelect: 'none', marginBottom: '20px' }}>
          👏
        </div>
        <div style={{ fontSize: '96px', fontWeight: 900, color: '#FF9500', lineHeight: 1, marginBottom: '4px' }}>8</div>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#FF9500', marginBottom: '28px' }}>day streak</div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginBottom: '36px' }}>
          {weekDays.map((d, i) => {
            const status = weekData[i]
            const active = status === 'today' || status === 'done'
            const missed = status === 'missed'
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: active ? '#FF9500' : '#bbb' }}>{d}</div>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: active ? '#FF9500' : missed ? '#ffeded' : '#f0f0f0', border: missed ? '1.5px solid #ffb3b3' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {active && (
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                      <polyline points="3,8 6.5,12 13,5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {missed && <span style={{ fontSize: '13px', color: '#ff6b6b', fontWeight: 700 }}>–</span>}
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={handleContinue} style={{ width: '100%', maxWidth: '320px', background: '#1a1a2e', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>
          Continue
        </button>
      </div>
    </div>
  )
}