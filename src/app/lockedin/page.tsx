'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Check } from 'lucide-react'

export default function LockedInPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
    setTimeout(() => setConfetti(true), 300)
  }, [])

  const colors = ['#F5A623', '#22c55e', '#ffffff', '#60a5fa', '#f472b6']

  return (
    <div style={{
      flex: 1,
      background: 'linear-gradient(160deg, #0f3d1a 0%, #0f1623 60%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Confetti */}
      {confetti && Array.from({ length: 30 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '-20px',
          left: `${Math.random() * 100}%`,
          width: `${6 + Math.random() * 8}px`,
          height: `${6 + Math.random() * 8}px`,
          background: colors[i % colors.length],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 1.5}s both`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Check circle */}
      <div style={{
        width: '80px',
        height: '80px',
        background: '#22c55e',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        animation: 'fadeIn 0.5s ease',
      }}>
        <Check size={40} color="white" strokeWidth={3} />
      </div>

      <h1 style={{
        fontSize: '28px',
        fontWeight: 900,
        color: 'white',
        marginBottom: '12px',
        animation: 'fadeIn 0.5s ease 0.2s both',
      }}>
        Dash has the briefing.
      </h1>

      <p style={{
        color: '#94a3b8',
        fontSize: '15px',
        lineHeight: 1.6,
        marginBottom: '32px',
        animation: 'fadeIn 0.5s ease 0.4s both',
      }}>
        Your first task drops tomorrow at 8 AM.
        No more guessing. Just one step at a time.
      </p>

      {/* Goal card */}
      {user && (
        <div style={{
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '20px',
          width: '100%',
          marginBottom: '32px',
          animation: 'fadeIn 0.5s ease 0.5s both',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Zap size={18} color="#F5A623" fill="#F5A623" />
            <span style={{ color: '#F5A623', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Your goal is locked in
            </span>
          </div>
          <p style={{ color: 'white', fontSize: '15px', fontWeight: 600, lineHeight: 1.5 }}>
            {user.goal || 'Your goal has been saved.'}
          </p>
          {user.bigPrize && (
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>
              The prize: {user.bigPrize}
            </p>
          )}
        </div>
      )}

      <button
        className="gold-btn"
        onClick={() => router.push('/home')}
        style={{ animation: 'fadeIn 0.5s ease 0.7s both' }}
      >
        See my first task ⚡
      </button>
    </div>
  )
}