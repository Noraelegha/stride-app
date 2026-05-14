'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const coachLabels: Record<string, string> = {
    tough: 'No-Nonsense Coach', strategic: 'Strategic Partner',
    friend: 'Sarcastic Best Friend', mentor: 'Gentle Mentor',
  }

  const personaLabels: Record<string, string> = {
    builder: 'Solo-Hustler', learner: 'Learner', changer: 'Career Pivot',
  }

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>
      {/* Dark header */}
      <div style={{ background: '#1a1a2e', padding: '52px 22px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
          <div style={{
            width: '52px', height: '52px', background: '#F5A623',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#1a1a2e',
          }}>
            {(user?.name || 'N')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{user?.name || 'Nora'} Elegha</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
              {personaLabels[user?.persona] || 'Solo-Hustler'} · Day {user?.streak || 23}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { ico: '🔥', num: user?.streak || 7,  lbl: 'streak' },
            { ico: '✅', num: 23,                  lbl: 'tasks' },
            { ico: '📊', num: '84%',               lbl: 'score' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
              padding: '10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '16px' }}>{s.ico}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{s.num}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Active goal */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Active Goal</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>
            {user?.goal || 'Build a personal brand on LinkedIn'}
          </div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
            🎯 Big Prize: {user?.bigPrize || 'Land 3 high-paying consulting clients'}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>Phase 1: Foundation</div>
          <div style={{ height: '4px', background: '#eee', borderRadius: '2px', marginBottom: '4px' }}>
            <div style={{ height: '100%', width: '42%', background: '#F5A623', borderRadius: '2px' }} />
          </div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>42%</div>
        </div>

        {/* Dash settings */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 8px', fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Dash Settings
          </div>
          {[
            { ico: '🧑‍💼', label: 'Coach style', sub: 'How Dash pushes you', val: coachLabels[user?.coachStyle] || 'Strategic Partner' },
            { ico: '🔔',   label: 'Reminders',   sub: '8 AM and 8 PM daily',  val: 'On' },
          ].map((row, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '13px 16px', borderTop: '1px solid #f5f5f5',
            }}>
              <span style={{ fontSize: '20px' }}>{row.ico}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{row.label}</div>
                <div style={{ fontSize: '11px', color: '#aaa' }}>{row.sub}</div>
              </div>
              <div style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>{row.val}</div>
            </div>
          ))}
        </div>

        {/* Account */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px 8px', fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Account
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderTop: '1px solid #f5f5f5' }}>
            <span style={{ fontSize: '20px' }}>👤</span>
            <div style={{ fontSize: '14px', color: '#4A9EDB', fontWeight: 500 }}>
              {user?.name?.toLowerCase() || 'nora'}@example.com
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderTop: '1px solid #f5f5f5' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Upgrade to Pro</div>
              <div style={{ fontSize: '11px', color: '#aaa' }}>3 goals · Infinite memory · Analytics</div>
            </div>
            <div style={{ background: '#1a1a2e', color: '#fff', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
              $12/mo →
            </div>
          </div>
        </div>

        <button
          onClick={() => { localStorage.removeItem('stride_user'); router.push('/') }}
          style={{
            background: 'none', border: '1.5px solid #eee', borderRadius: '14px',
            padding: '13px', fontSize: '14px', color: '#888', cursor: 'pointer', width: '100%',
          }}
        >
          Sign out
        </button>
      </div>
      <BottomNav />
    </div>
  )
}