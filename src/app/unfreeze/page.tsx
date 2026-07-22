'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ThemeColor from '@/components/ThemeColor'

export default function UnfreezePage() {
  const router = useRouter()
  const [phase, setPhase] = useState<1 | 2>(1)
  const [p1Out, setP1Out] = useState(false)
  const [p2In, setP2In] = useState(false)
  const [actualStreak, setActualStreak] = useState(0)
  const [weekData, setWeekData] = useState<Array<'done' | 'missed' | 'today' | 'future'>>([])
  const [loading, setLoading] = useState(true)

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (!stored) { router.push('/onboarding'); return }
    const userData = JSON.parse(stored)
    setActualStreak(userData.streak || 0)

    const params = new URLSearchParams(window.location.search)
    const isReveal = params.get('reveal') === 'true'

    if (isReveal) {
      setPhase(2)
      setP1Out(true)
      setP2In(true)
    } else {
      setPhase(1)
      setP1Out(false)
      setP2In(false)
    }

    const loadWeekData = async () => {
      try {
        const today = new Date()
        const todayIdx = today.getDay()
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - todayIdx)
        weekStart.setHours(0, 0, 0, 0)

        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(weekStart)
          d.setDate(weekStart.getDate() + i)
          return d.toISOString().split('T')[0]
        })

        const res = await fetch('/api/tasks/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.email,
            fields: 'task_date, status',
            order: { column: 'task_date', ascending: false },
            limit: 14,
          }),
        })
        const { data: tasks } = await res.json()

        const taskMap: Record<string, string> = {}
        tasks?.forEach((t: any) => { taskMap[t.task_date] = t.status })

        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        const todayStr = today.toISOString().split('T')[0]

        const data: Array<'done' | 'missed' | 'today' | 'future'> = weekDates.map((dateStr, i) => {
          if (dateStr === todayStr) return isReveal ? 'done' : 'today'
          if (dateStr === yesterdayStr) return 'missed'
          if (i > todayIdx) return 'future'
          const status = taskMap[dateStr]
          if (status === 'completed' || status === 'partial') return 'done'
          if (dateStr < todayStr && dateStr < yesterdayStr) return 'done'
          return 'future'
        })

        setWeekData(data)
      } catch (e) {
        console.error('Failed to load week data:', e)
        const today = new Date()
        const todayIdx = today.getDay()
        const fallback: Array<'done' | 'missed' | 'today' | 'future'> = weekDays.map((_, i) => {
          if (i === todayIdx) return isReveal ? 'done' : 'today'
          if (i === todayIdx - 1) return 'missed'
          if (i < todayIdx) return 'done'
          return 'future'
        })
        setWeekData(fallback)
      } finally {
        setLoading(false)
      }
    }

    loadWeekData()
  }, [])

  const handlePhase1Tap = () => {
    setP1Out(true)
    setTimeout(() => { router.push('/home') }, 350)
  }

  const handleContinue = () => { router.push('/home') }

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: '100vh', overflow: 'hidden' }}>
      <ThemeColor color={phase === 1 ? '#29B6F6' : '#0f1623'} />

      <style>{`
        @keyframes ufShieldPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes ufTapFade { 0%,100%{opacity:0.3} 50%{opacity:1.0} }
        @keyframes ufFloat {
          0%,100%{transform:translateY(0) rotate(var(--uf-r,0deg));opacity:0.4}
          50%{transform:translateY(-13px) rotate(calc(var(--uf-r,0deg)+8deg));opacity:0.65}
        }
        @keyframes ufShieldIn {
          0%{transform:scale(0.5) rotate(-10deg);opacity:0}
          60%{transform:scale(1.1) rotate(3deg);opacity:1}
          100%{transform:scale(1) rotate(0deg);opacity:1}
        }
        @keyframes ufCheckDraw { 0%{stroke-dashoffset:40} 100%{stroke-dashoffset:0} }
        @keyframes ufGlow {
          0%,100%{box-shadow:0 0 30px 6px rgba(245,166,35,0.35),0 0 60px 18px rgba(245,166,35,0.12)}
          50%{box-shadow:0 0 44px 12px rgba(245,166,35,0.55),0 0 80px 26px rgba(245,166,35,0.2)}
        }
        @keyframes ufNumPop {
          0%{transform:scale(0.5);opacity:0}
          65%{transform:scale(1.08);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
        @keyframes ufFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ufPillIn {
          0%{transform:scale(0.8);opacity:0}
          70%{transform:scale(1.04);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
      `}</style>

      {/* PHASE 1 — Blue shield screen */}
      <div onClick={handlePhase1Tap} style={{ position: 'absolute', inset: 0, background: '#29B6F6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '48px 32px', gap: '22px', textAlign: 'center', opacity: p1Out ? 0 : 1, transform: p1Out ? 'scale(0.94)' : 'scale(1)', transition: 'opacity 350ms ease, transform 350ms ease', pointerEvents: p1Out ? 'none' : 'auto', zIndex: p1Out ? 1 : 2 }}>
        <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="220" height="220" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.28, zIndex: 0 }} viewBox="0 0 220 220">
            <g stroke="white" strokeWidth="3" strokeLinecap="round">
              {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
                const rad = (deg * Math.PI) / 180
                const x1 = 110 + 68 * Math.cos(rad), y1 = 110 + 68 * Math.sin(rad)
                const x2 = 110 + 100 * Math.cos(rad), y2 = 110 + 100 * Math.sin(rad)
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
              })}
            </g>
          </svg>
          <div style={{ width: 130, height: 130, position: 'relative', zIndex: 1, animation: 'ufShieldPulse 2.2s ease-in-out infinite', filter: 'drop-shadow(0 0 18px rgba(255,255,255,0.45))' }}>
            <svg width="130" height="130" viewBox="0 0 120 130" fill="none">
              <defs><linearGradient id="sfGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#B3E5FC" /><stop offset="50%" stopColor="#29B6F6" /><stop offset="100%" stopColor="#0277BD" /></linearGradient></defs>
              <path d="M60 4 L20 22 L8 58 C8 90 30 112 60 126 C90 112 112 90 112 58 L100 22 Z" fill="white" fillOpacity="0.88" />
              <path d="M60 12 L26 28 L16 60 C16 88 35 107 60 120 C85 107 104 88 104 60 L94 28 Z" fill="url(#sfGrad)" />
              <path d="M60 52 C60 52 48 66 48 74 C48 81 53 86 60 86 C67 86 72 81 72 74 C72 66 60 52 60 52Z" fill="#0288D1" fillOpacity="0.85" />
            </svg>
          </div>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', lineHeight: 1.25, margin: 0 }}>Shield used.<br />Streak protected.</h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55, margin: 0, maxWidth: '260px' }}>You missed a day. Your shield had your back.</p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0, animation: 'ufTapFade 1.6s ease-in-out infinite' }}>Tap anywhere to continue</p>
      </div>

      {/* PHASE 2 — Dark comeback screen */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #0f1c35 0%, #1a1a2e 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 28px 44px', textAlign: 'center', opacity: p2In ? 1 : 0, transform: p2In ? 'scale(1)' : 'scale(1.04)', transition: 'opacity 400ms ease, transform 400ms ease', pointerEvents: p2In ? 'auto' : 'none', zIndex: p2In ? 2 : 1, overflow: 'hidden' }}>

        {[
          { c: '#F5A623', s: 8, t: '8%',  l: '8%',  r: 14,  d: '0s',    dur: '2.8s', sq: true  },
          { c: '#fff',    s: 6, t: '14%', l: '86%', r: 0,   d: '0.4s',  dur: '3s',   sq: false },
          { c: '#F5A623', s: 7, t: '71%', l: '7%',  r: 20,  d: '0.6s',  dur: '2.7s', sq: true  },
          { c: '#fff',    s: 6, t: '67%', l: '86%', r: 0,   d: '0.9s',  dur: '2.5s', sq: false },
          { c: '#F5A623', s: 9, t: '80%', l: '55%', r: -16, d: '0.3s',  dur: '3s',   sq: true  },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', top: s.t, left: s.l, width: s.s, height: s.s, background: s.c, borderRadius: s.sq ? '2px' : '50%', opacity: 0.4, animation: `ufFloat ${s.dur} ease-in-out infinite`, animationDelay: s.d, ['--uf-r' as any]: `${s.r}deg`, pointerEvents: 'none' }} />
        ))}

        <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, animation: 'ufShieldIn 0.6s cubic-bezier(.34,1.56,.64,1) both, ufGlow 2.4s ease-in-out 0.6s infinite', borderRadius: '50%', background: 'rgba(245,166,35,0.1)' }}>
          <svg width="72" height="80" viewBox="0 0 72 80" fill="none">
            <defs><linearGradient id="ufGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#F5A623" stopOpacity="0.9" /><stop offset="100%" stopColor="#d4891e" stopOpacity="0.9" /></linearGradient></defs>
            <path d="M36 2 L12 13 L5 35 C5 54 18 67 36 76 C54 67 67 54 67 35 L60 13 Z" fill="none" stroke="rgba(245,166,35,0.4)" strokeWidth="2" />
            <path d="M36 7 L15 17 L9 37 C9 54 21 65 36 73 C51 65 63 54 63 37 L57 17 Z" fill="url(#ufGold)" fillOpacity="0.15" />
            <polyline points="22,38 32,48 50,28" stroke="#F5A623" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset="0" style={{ animation: 'ufCheckDraw 0.5s ease-out 0.7s both' }} />
          </svg>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, animation: 'ufFadeUp 0.4s ease 0.4s both' }}>Streak saved.</div>
        <div style={{ fontSize: 88, fontWeight: 900, color: '#F5A623', lineHeight: 1, animation: 'ufNumPop 0.55s cubic-bezier(.34,1.56,.64,1) 0.5s both', marginBottom: 4 }}>{actualStreak}</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.03em', marginBottom: 22, animation: 'ufFadeUp 0.4s ease 0.65s both' }}>days</div>

        <div style={{ animation: 'ufPillIn 0.45s cubic-bezier(.34,1.56,.64,1) 0.75s both', marginBottom: 24 }}>
          <div style={{ position: 'relative', overflow: 'hidden', background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 700, color: '#F5A623', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="11" height="13" viewBox="0 0 72 80" fill="none" style={{ flexShrink: 0 }}><path d="M36 7 L15 17 L9 37 C9 54 21 65 36 73 C51 65 63 54 63 37 L57 17 Z" fill="#F5A623" fillOpacity="0.85" /></svg>
            Shield delivered. Streak protected.
          </div>
        </div>

        {!loading && weekData.length === 7 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 28, animation: 'ufFadeUp 0.4s ease 0.85s both' }}>
            {weekDays.map((d, i) => {
              const status = weekData[i]
              const isDone = status === 'done', isMissed = status === 'missed', isToday = status === 'today'
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: isDone ? '#F5A623' : isMissed ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.2)' }}>{d}</div>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDone ? '#F5A623' : isMissed ? 'rgba(245,166,35,0.1)' : isToday ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.06)', border: isMissed ? '1.5px solid rgba(245,166,35,0.4)' : isToday ? '2px dashed rgba(245,166,35,0.5)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isDone && <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><polyline points="3,8 6.5,12 13,5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    {isMissed && <svg width="12" height="14" viewBox="0 0 72 80" fill="none"><path d="M36 7 L15 17 L9 37 C9 54 21 65 36 73 C51 65 63 54 63 37 L57 17 Z" fill="rgba(245,166,35,0.6)" /></svg>}
                    {isToday && <span style={{ fontSize: 10, color: '#F5A623', fontWeight: 700 }}>•</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 1.65, fontStyle: 'italic', fontWeight: 500, maxWidth: 265, marginBottom: 44, animation: 'ufFadeUp 0.4s ease 0.95s both' }}>
          You slipped. You came back. That is the whole thing.
        </div>

        <div style={{ width: '100%', maxWidth: 320, animation: 'ufFadeUp 0.4s ease 1.1s both' }}>
          <button onClick={handleContinue} style={{ width: '100%', background: '#F5A623', border: 'none', borderRadius: 16, padding: '17px', fontSize: 16, fontWeight: 700, color: '#1a1a2e', cursor: 'pointer' }}>
            Keep going 💪
          </button>
        </div>
      </div>
    </div>
  )
}