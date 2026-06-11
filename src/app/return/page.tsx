'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ThemeColor from '@/components/ThemeColor'

export default function ReturnPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [confetti, setConfetti] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
    setTimeout(() => setConfetti(true), 200)
  }, [])

  const handleReturn = async () => {
    localStorage.setItem('stride_from_recovery', 'true')
    try {
      const stored = localStorage.getItem('stride_user')
      if (stored) {
        const userData = JSON.parse(stored)
        await supabase
          .from('stride_users')
          .update({ last_active: new Date().toISOString() })
          .eq('email', userData.email)
      }
    } catch (e) {
      console.error('last_active update failed:', e)
    }
    router.push('/home')
  }

  const colors = ['#F5A623', '#22c55e', '#ffffff', '#60a5fa']

  return (
    <div style={{
      flex: 1, minHeight: '100vh',
      background: '#0f1623',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <ThemeColor color="#0f1623" />

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {confetti && Array.from({ length: 25 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', top: '-20px',
          left: `${(i * 4.1) % 100}%`,
          width: `${6 + (i % 4) * 2}px`,
          height: `${6 + (i % 4) * 2}px`,
          background: colors[i % colors.length],
          borderRadius: i % 2 === 0 ? '50%' : '2px',
          animation: `confettiFall ${1.5 + (i % 4) * 0.4}s ease-in ${(i % 5) * 0.2}s both`,
          pointerEvents: 'none',
        }} />
      ))}

      <div style={{
        width: '88px', height: '88px',
        background: 'linear-gradient(135deg, #F5A623, #d4891e)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '28px', fontSize: '32px', fontWeight: 900, color: '#0f1623',
        animation: 'float 1.5s ease-in-out infinite',
        border: '3px solid rgba(245,166,35,0.4)',
      }}>
        👀
      </div>

      <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'white', marginBottom: '12px', lineHeight: 1.3, animation: 'fadeIn 0.5s ease 0.2s both' }}>
        Do my eyes deceive me?
      </h1>
      <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#F5A623', marginBottom: '16px', animation: 'fadeIn 0.5s ease 0.3s both' }}>
        {user?.name || 'You'}, you came back!
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.7, maxWidth: '300px', marginBottom: '40px', animation: 'fadeIn 0.5s ease 0.4s both' }}>
        The streak can be rebuilt. The goal is still there. Dash never left. Welcome back.
      </p>

      <button
        onClick={handleReturn}
        style={{
          width: '100%', maxWidth: '300px',
          background: '#F5A623', color: '#1a1a2e',
          border: 'none', borderRadius: '50px', padding: '16px',
          fontSize: '16px', fontWeight: 800, cursor: 'pointer',
          animation: 'fadeIn 0.5s ease 0.5s both',
        }}
      >
        See my task ⚡
      </button>
    </div>
  )
}