'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeColor from '@/components/ThemeColor'

export default function StreakShieldPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
    setTimeout(() => setVisible(true), 80)
  }, [])

  const getDashLine = (streak: number, coachStyle: string) => {
    const style = coachStyle || 'mentor'
    const lines: Record<string, string> = {
      friend:    `${streak} days straight? Show off. Your shield's got you now.`,
      tough:     `${streak} days straight. That's the bar now.`,
      strategic: `${streak} consecutive days. That's a real pattern now.`,
      mentor:    `${streak} days of showing up. Something's looking out for you now.`,
    }
    return lines[style] || lines['mentor']
  }

  const getSubLine = (coachStyle: string) => {
    const style = coachStyle || 'mentor'
    const lines: Record<string, string> = {
      friend:    "Slip up one day and it'll quietly cover for you. Just keep showing up.",
      tough:     "Miss a day and it covers you once. Don't make a habit of needing it.",
      strategic: "One slip won't break the streak. The system is built to absorb it.",
      mentor:    "If you ever stumble, this catches you. No shame in that.",
    }
    return lines[style] || lines['mentor']
  }

  if (!user) return null

  const streak = user.streak || 5
  const shields = user.shields || 1

  const shapes = [
    { color: '#60A5FA', size: 9,  top: '9%',  left: '9%',  delay: '0s',    dur: '2.6s', r: 12,  type: 'sq' },
    { color: '#fff',    size: 6,  top: '14%', left: '85%', delay: '0.35s', dur: '2.8s', r: 0,   type: 'c'  },
    { color: '#93C5FD', size: 8,  top: '6%',  left: '55%', delay: '0.7s',  dur: '2.4s', r: -8,  type: 'sq' },
    { color: '#60A5FA', size: 6,  top: '22%', left: '20%', delay: '0.15s', dur: '3s',   r: 0,   type: 'c'  },
    { color: '#fff',    size: 8,  top: '71%', left: '8%',  delay: '0.55s', dur: '2.7s', r: 20,  type: 'sq' },
    { color: '#93C5FD', size: 6,  top: '67%', left: '85%', delay: '0.9s',  dur: '2.5s', r: 0,   type: 'c'  },
    { color: '#60A5FA', size: 10, top: '79%', left: '54%', delay: '0.25s', dur: '2.9s', r: -15, type: 'sq' },
    { color: '#fff',    size: 6,  top: '84%', left: '25%', delay: '0.65s', dur: '3.1s', r: 0,   type: 'c'  },
    { color: '#93C5FD', size: 8,  top: '33%', left: '91%', delay: '0.45s', dur: '2.6s', r: 10,  type: 'sq' },
    { color: '#60A5FA', size: 5,  top: '52%', left: '4%',  delay: '0.8s',  dur: '2.8s', r: 0,   type: 'c'  },
  ]

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0f1623',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px 44px',
      position: 'relative',
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease',
    }}>
      <ThemeColor color="#0f1623" />

      <style>{`
        @keyframes ssFloatShape {
          0%,100%{transform:translateY(0) rotate(var(--ss-r,0deg));opacity:0.4}
          50%{transform:translateY(-13px) rotate(calc(var(--ss-r,0deg) + 10deg));opacity:0.65}
        }
        @keyframes ssRayRotate {
          0%{transform:rotate(0deg);opacity:0.5}
          100%{transform:rotate(360deg);opacity:0.5}
        }
        @keyframes ssGlowPulse {
          0%,100%{box-shadow:0 0 30px 6px rgba(96,165,250,0.35),0 0 60px 18px rgba(96,165,250,0.12)}
          50%{box-shadow:0 0 44px 12px rgba(96,165,250,0.55),0 0 80px 26px rgba(96,165,250,0.2)}
        }
        @keyframes ssShieldPop {
          0%{transform:scale(0.3) rotate(-15deg);opacity:0}
          55%{transform:scale(1.18) rotate(6deg);opacity:1}
          75%{transform:scale(0.94) rotate(-2deg)}
          100%{transform:scale(1) rotate(0deg);opacity:1}
        }
        @keyframes ssBurst {
          0%{transform:translate(0,0) scale(1);opacity:1}
          100%{transform:translate(var(--bx),var(--by)) scale(0);opacity:0}
        }
        @keyframes ssFadeUp {
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes ssBadgePop {
          0%{transform:scale(0.7);opacity:0}
          70%{transform:scale(1.08);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
        @keyframes ssShine {
          0%{background-position:-100% 0}
          100%{background-position:200% 0}
        }
      `}</style>

      {shapes.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          background: s.color,
          borderRadius: s.type === 'c' ? '50%' : '2px',
          opacity: 0.4,
          animation: `ssFloatShape ${s.dur} ease-in-out infinite`,
          animationDelay: s.delay,
          ['--ss-r' as any]: `${s.r}deg`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Close X */}
      <button
        onClick={() => router.push('/home')}
        style={{
          position: 'absolute', top: 18, right: 18,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50%', width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
          fontSize: 15, lineHeight: '1',
        }}
      >✕</button>

      {/* Shield with rays, glow, burst */}
      <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', animation: 'ssRayRotate 14s linear infinite' }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <div key={deg} style={{
              position: 'absolute', width: 2, height: 130,
              background: 'linear-gradient(to bottom, rgba(96,165,250,0.5), transparent)',
              left: '50%', top: '50%', transformOrigin: '0 0',
              transform: `rotate(${deg}deg)`,
            }} />
          ))}
        </div>

        {[
          { bx: -46, by: -40, c: '#60A5FA', d: '0s' },
          { bx: 48,  by: -38, c: '#fff',    d: '0.55s' },
          { bx: -50, by: 34,  c: '#93C5FD', d: '0.6s' },
          { bx: 50,  by: 38,  c: '#60A5FA', d: '0.52s' },
          { bx: 0,   by: -58, c: '#fff',    d: '0.58s' },
          { bx: 0,   by: 58,  c: '#93C5FD', d: '0.65s' },
        ].map((p, i) => (
          <div key={i} style={{
            position: 'absolute', width: 5, height: 5, borderRadius: '50%',
            left: '50%', top: '50%', background: p.c,
            animation: 'ssBurst 1.1s ease-out 0.5s both',
            animationDelay: p.d,
            ['--bx' as any]: `${p.bx}px`,
            ['--by' as any]: `${p.by}px`,
          }} />
        ))}

        <div style={{
          position: 'relative', width: 104, height: 104, borderRadius: '50%',
          background: 'linear-gradient(160deg, #234876, #0f1623)',
          border: '2.5px solid #60A5FA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'ssShieldPop 0.65s cubic-bezier(.34,1.56,.64,1) both, ssGlowPulse 2.2s ease-in-out 0.65s infinite',
        }}>
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(96,165,250,0.22)"/>
            <path d="M9 12.2l2.2 2.2L15.5 9.6" stroke="#fff" strokeWidth="2.2"/>
          </svg>
        </div>
      </div>

      {/* Headline */}
      <div style={{
        fontSize: 25, fontWeight: 800, color: '#fff',
        marginBottom: 14, animation: 'ssFadeUp 0.5s ease 0.3s both',
        textAlign: 'center', letterSpacing: '-0.01em',
      }}>
        You&apos;ve earned a reward!
      </div>

      {/* Dash voice line — coach styled, no quotes */}
      <div style={{
        fontSize: 16, color: 'rgba(255,255,255,0.78)',
        textAlign: 'center', lineHeight: 1.65, maxWidth: 280,
        marginBottom: 10, animation: 'ssFadeUp 0.5s ease 0.45s both',
        fontStyle: 'italic', fontWeight: 500,
      }}>
        {getDashLine(streak, user.coachStyle)}
      </div>

      {/* Third line */}
      <div style={{
        fontSize: 14, color: 'rgba(255,255,255,0.46)',
        textAlign: 'center', lineHeight: 1.6, maxWidth: 255,
        marginBottom: 28, animation: 'ssFadeUp 0.5s ease 0.55s both',
      }}>
        {getSubLine(user.coachStyle)}
      </div>

      {/* Badge with shine */}
      <div style={{ animation: 'ssBadgePop 0.5s cubic-bezier(.34,1.56,.64,1) 0.65s both', marginBottom: 38 }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'rgba(96,165,250,0.14)',
          border: '1px solid rgba(96,165,250,0.4)',
          borderRadius: 20, padding: '8px 18px',
          fontSize: 13, fontWeight: 700, color: '#cfe3ff', letterSpacing: '0.02em',
        }}>
          🛡️ Extra shield earned!
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
            animation: 'ssShine 2.4s ease-in-out 1s infinite',
          }} />
        </div>
      </div>

      {/* Keep going button */}
      <div style={{ width: '100%', maxWidth: 320, animation: 'ssFadeUp 0.5s ease 0.8s both' }}>
        <button
          onClick={() => router.push('/home')}
          style={{
            width: '100%', background: '#60A5FA',
            border: 'none', borderRadius: 16,
            padding: '17px', fontSize: 16, fontWeight: 700,
            color: '#0f1623', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          Keep going 💪
        </button>
      </div>
    </div>
  )
}