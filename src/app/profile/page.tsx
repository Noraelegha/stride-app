'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Shield, ChevronRight, LogOut } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('stride_user')
    router.push('/')
  }

  const coachLabels: Record<string, string> = {
    sarcastic: 'Sarcastic Best Friend',
    strategic: 'Strategic Partner',
    mentor: 'Gentle Mentor',
    tough: 'No-Nonsense Coach',
  }

  return (
    <div className="screen" style={{ background: '#0f1623' }}>
      {/* Profile header */}
      <div style={{
        background: '#1a1a2e',
        padding: '52px 20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: '72px', height: '72px',
          background: 'linear-gradient(135deg, #F5A623, #d4891e)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: 900, color: '#0f1623',
        }}>
          {user?.name?.[0] || 'N'}
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontWeight: 900, fontSize: '20px' }}>{user?.name || 'Nora'}</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>
            {user?.persona ? user.persona.charAt(0).toUpperCase() + user.persona.slice(1) : 'Solo-Hustler'} · Day {user?.streak || 7}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[['24', 'Tasks'], [`${user?.streak || 7}`, 'Streak'], ['1', 'Shields']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ color: '#F5A623', fontWeight: 900, fontSize: '20px' }}>{val}</div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Active goal */}
        <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Zap size={14} color="#F5A623" />
            <span style={{ color: '#F5A623', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Active Goal
            </span>
          </div>
          <p style={{ color: 'white', fontSize: '15px', fontWeight: 600, lineHeight: 1.5 }}>
            {user?.goal || 'Build a personal brand on LinkedIn'}
          </p>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '12px' }}>
            <div style={{ height: '100%', width: '42%', background: '#F5A623', borderRadius: '2px' }} />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px' }}>Phase 1 — 42% complete</p>
        </div>

        {/* Streak shields */}
        <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color="#60a5fa" />
            <div style={{ flex: 1 }}>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>Streak Shields</p>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>Earned every 5 consecutive days</p>
            </div>
            <span style={{ color: '#60a5fa', fontWeight: 900, fontSize: '22px' }}>1</span>
          </div>
        </div>

        {/* Settings */}
        <div style={{ background: '#1a1a2e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '16px 20px 8px' }}>
            Dash Settings
          </p>
          {[
            ['Coach style', coachLabels[user?.coachStyle] || 'Strategic Partner'],
            ['Reminders', '8 AM and 8 PM daily'],
            ['Daily time', `${user?.dailyTime || '30'} minutes`],
          ].map(([label, value]) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ color: '#e2e8f0', fontSize: '14px' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>{value}</span>
                <ChevronRight size={14} color="#94a3b8" />
              </div>
            </div>
          ))}
        </div>

        {/* Account */}
        <div style={{ background: '#1a1a2e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <p style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '16px 20px 8px' }}>
            Account
          </p>
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#e2e8f0', fontSize: '14px' }}>Email</span>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>nora@example.com</p>
          </div>
          <button onClick={handleSignOut} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#ef4444', fontSize: '14px',
          }}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}