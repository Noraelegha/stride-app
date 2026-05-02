'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export default function ReturnPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
    setTimeout(() => setConfetti(true), 200)
  }, [])

  const colors = ['#F5A623', '#22c55e', '#ffffff', '#60a5fa']

  return (
    <div style={{
      flex: 1,
      minHeight: '100vh',
      background: '#0f1623',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Confetti */}
      {confetti && Array.from({ length: 25 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '-20px',
          left: `${Math.random() * 100}%`,
          width: `${6 + Math.random() * 8}px`,
          height: `${6 + Math.random() * 8}px`,
          background: colors[i % colors.length],
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 1}s both`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Mascot with bounce */}
      <div style={{
        width: '88px',
        height: '88px',
        background: 'linear-gradient(135deg, #F5A623, #d4891e)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '28px',
        fontSize: '32px',
        fontWeight: 900,
        color: '#0f1623',
        animation: 'float 1.5s ease-in-out infinite',
        border: '3px solid rgba(245,166,35,0.4)',
      }}>
        👀
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: '26px',
        fontWeight: 900,
        color: 'white',
        marginBottom: '12px',
        lineHeight: 1.3,
        animation: 'fadeIn 0.5s ease 0.2s both',
      }}>
        Do my eyes deceive me?
      </h1>
      <h2 style={{
        fontSize: '22px',
        fontWeight: 900,
        color: '#F5A623',
        marginBottom: '16px',
        animation: 'fadeIn 0.5s ease 0.3s both',
      }}>
        {user?.name || 'You'}, you came back!
      </h2>

      <p style={{
        color: '#94a3b8',
        fontSize: '15px',
        lineHeight: 1.7,
        maxWidth: '300px',
        marginBottom: '40px',
        animation: 'fadeIn 0.5s ease 0.4s both',
      }}>
        The streak can be rebuilt. The goal is still there.
        Dash never left. Welcome back.
      </p>

      <button
        onClick={() => router.push('/home')}
        className="gold-btn"
        style={{
          maxWidth: '300px',
          animation: 'fadeIn 0.5s ease 0.5s both',
        }}
      >
        See my task ⚡
      </button>
    </div>
  )
}