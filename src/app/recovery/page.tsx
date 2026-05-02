'use client'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'

export default function RecoveryPage() {
  const router = useRouter()

  return (
    <div style={{
      flex: 1, minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f1623 0%, #1a1a2e 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
    }}>
      {/* Breathing mascot */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          border: '1px solid rgba(245,166,35,0.15)',
          position: 'absolute', top: '-16px', left: '-16px',
          animation: 'breathe 3s ease-in-out infinite',
        }} />
        <div style={{
          width: '88px', height: '88px', borderRadius: '50%',
          border: '1px solid rgba(245,166,35,0.3)',
          position: 'absolute', top: '0', left: '0',
          animation: 'breathe 2.8s ease-in-out infinite 0.4s',
        }} />
        <div style={{
          width: '88px', height: '88px', background: '#1a1a2e',
          borderRadius: '50%', border: '2px solid #F5A623',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'breathe 2.4s ease-in-out infinite 0.2s',
          position: 'relative',
        }}>
          <Zap size={36} color="#F5A623" fill="#F5A623" />
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: 'white', borderRadius: '24px',
        padding: '32px 28px', maxWidth: '360px', width: '100%',
      }}>
        <h2 style={{ color: '#0f1623', fontSize: '22px', fontWeight: 900, marginBottom: '12px' }}>
          Hey. Dash is still here.
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.7, marginBottom: '28px' }}>
          No lecture. No streak guilt. The fog gets heavy sometimes and that is just real.
          The goal is still there. So is Dash.
          One small thing is all I am asking for right now.
        </p>
        <button
          onClick={() => router.push('/home')}
          style={{
            width: '100%', background: '#1a1a2e', color: 'white',
            border: 'none', borderRadius: '14px', padding: '16px',
            fontSize: '16px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          I am here ⚡
        </button>
      </div>
    </div>
  )
}