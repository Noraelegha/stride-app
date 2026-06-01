'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ThemeColor from '@/components/ThemeColor'

export default function GoalAchievedPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [phase, setPhase] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
    setTimeout(() => setPhase(1), 100)
    setTimeout(() => setPhase(2), 800)
    setTimeout(() => setPhase(3), 1400)
    launchConfetti()
  }, [])

  const launchConfetti = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 6 + 3,
      d: Math.random() * 20 + 5,
      color: ['#F5A623', '#fff', '#4CAF50', '#29B6F6', '#FF9500'][Math.floor(Math.random() * 5)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
    }))

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        p.tiltAngle += p.tiltAngleIncrement
        p.y += (Math.cos(frame / 20) + p.d / 10)
        p.x += Math.sin(frame / 40) * 0.8
        p.tilt = Math.sin(p.tiltAngle) * 12
        ctx.beginPath()
        ctx.lineWidth = p.r
        ctx.strokeStyle = p.color
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y)
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2)
        ctx.stroke()
      })
      frame++
      if (frame < 180) requestAnimationFrame(animate)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    requestAnimationFrame(animate)
  }

  const dayCount = user?.tasksDone || 0
  const goalText = user?.goalShort || user?.goal || 'your goal'
  const prizeText = user?.prizeShort || user?.bigPrize || 'your big prize'

  return (
    <div style={{
      minHeight: '100vh', background: '#0f0f1a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative', overflow: 'hidden',
    }}>
      <ThemeColor color="#0f0f1a" />

      <canvas ref={canvasRef} style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10,
      }} />

      {/* Glow orb behind everything */}
      <div style={{
        position: 'absolute', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)',
        borderRadius: '50%', top: '50%', left: '50%',
        transform: 'translate(-50%, -60%)', pointerEvents: 'none',
      }} />

      {/* Trophy */}
      <div style={{
        fontSize: '72px', marginBottom: '8px',
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        filter: 'drop-shadow(0 0 24px rgba(245,166,35,0.6))',
        position: 'relative', zIndex: 20,
      }}>🏆</div>

      {/* Main heading */}
      <div style={{
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.5s ease',
        textAlign: 'center', marginBottom: '6px',
        position: 'relative', zIndex: 20,
      }}>
        <div style={{
          fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em',
          color: '#F5A623', textTransform: 'uppercase', marginBottom: '10px',
        }}>
          Goal achieved
        </div>
        <div style={{
          fontSize: '32px', fontWeight: 900, color: '#fff',
          lineHeight: 1.15, maxWidth: '320px',
        }}>
          You actually did it.
        </div>
      </div>

      {/* Stats strip */}
      <div style={{
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.5s ease 0.1s',
        display: 'flex', gap: '10px', margin: '20px 0', width: '100%', maxWidth: '360px',
        position: 'relative', zIndex: 20,
      }}>
        {[
          { num: dayCount, label: 'Days in' },
          { num: user?.streak || 0, label: 'Streak' },
          { num: `${user?.score || 0}%`, label: 'Score' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(245,166,35,0.2)',
            borderRadius: '16px', padding: '14px 8px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#F5A623' }}>{s.num}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Goal card */}
      <div style={{
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.5s ease 0.2s',
        background: 'linear-gradient(135deg, rgba(245,166,35,0.12) 0%, rgba(245,166,35,0.04) 100%)',
        border: '1px solid rgba(245,166,35,0.25)',
        borderRadius: '20px', padding: '20px',
        width: '100%', maxWidth: '360px',
        marginBottom: '20px',
        position: 'relative', zIndex: 20,
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          What you set out to do
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: '12px' }}>
          {goalText}
        </div>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '12px' }} />
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          The prize you claimed
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#F5A623', lineHeight: 1.4 }}>
          {prizeText}
        </div>
      </div>

      {/* Dash message */}
      <div style={{
        opacity: phase >= 3 ? 1 : 0,
        transition: 'all 0.5s ease 0.3s',
        fontSize: '14px', color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.6, textAlign: 'center',
        maxWidth: '300px', marginBottom: '28px',
        position: 'relative', zIndex: 20,
      }}>
        Most people never finish what they start. You are not most people.
      </div>

      {/* Buttons */}
      <div style={{
        opacity: phase >= 3 ? 1 : 0,
        transition: 'all 0.5s ease 0.4s',
        display: 'flex', flexDirection: 'column', gap: '10px',
        width: '100%', maxWidth: '360px',
        position: 'relative', zIndex: 20,
      }}>
        <button
          onClick={() => router.push('/home')}
          style={{
            background: '#F5A623', color: '#0f0f1a', border: 'none',
            borderRadius: '14px', padding: '16px',
            fontSize: '15px', fontWeight: 800, cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          What is next? ⚡
        </button>
        <button
          onClick={() => {
            const text = `I just hit my goal on Stride after ${dayCount} days. No excuses. Just steps. ⚡ stride-app-one.vercel.app`
            if (navigator.share) {
              navigator.share({ text })
            } else {
              navigator.clipboard.writeText(text)
            }
          }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)',
            borderRadius: '14px', padding: '14px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Share the win 🏆
        </button>
      </div>
    </div>
  )
}