'use client'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'

export default function StreakShieldPage() {
  const router = useRouter()

  return (
    <div style={{
      flex: 1, minHeight: '100vh',
      background: '#0f1623',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: '80px', height: '80px',
        background: 'rgba(96,165,250,0.15)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
        border: '2px solid rgba(96,165,250,0.4)',
        animation: 'breathe 2s ease-in-out infinite',
      }}>
        <Shield size={36} color="#60a5fa" />
      </div>

      <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 900, marginBottom: '12px' }}>
        Streak Shield Earned
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.7, marginBottom: '8px', maxWidth: '300px' }}>
        5 consecutive days completed.
        Your shield activates automatically if you ever miss a day.
      </p>
      <p style={{ color: '#60a5fa', fontSize: '14px', fontWeight: 600, marginBottom: '40px' }}>
        You have 1 shield ready.
      </p>

      <button onClick={() => router.push('/home')} className="gold-btn" style={{ maxWidth: '300px' }}>
        Keep going ⚡
      </button>
    </div>
  )
}