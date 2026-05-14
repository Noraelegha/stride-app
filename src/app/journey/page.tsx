'use client'
import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'

const RECENT_TASKS = [
  { day: 23, task: 'Changed LinkedIn headline to target niche',     done: true },
  { day: 22, task: 'Published first thought leadership post',        done: true },
  { day: 21, task: 'Missed',                                         done: false },
  { day: 20, task: 'Connected with 5 people in consulting niche',    done: true },
  { day: 19, task: 'Updated LinkedIn banner image',                  done: true },
  { day: 18, task: 'Wrote first draft of LinkedIn bio',              done: true },
]

export default function JourneyPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>
      <div style={{ background: '#1a1a2e', padding: '52px 22px 20px', flexShrink: 0 }}>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, marginBottom: '3px' }}>Your journey</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>
          {user?.goal || 'Build a personal brand on LinkedIn'}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Phase card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Phase 1: Foundation</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>42%</span>
          </div>
          <div style={{ height: '5px', background: '#eee', borderRadius: '3px', marginBottom: '8px' }}>
            <div style={{ height: '100%', width: '42%', background: '#1a1a2e', borderRadius: '3px' }} />
          </div>
          <div style={{ fontSize: '12px', color: '#888' }}>
            You are 42% through Phase 1. The finish line is closer than it feels.
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { ico: '🔥', num: user?.streak || 7,  lbl: 'streak' },
            { ico: '✅', num: 23,                  lbl: 'done' },
            { ico: '📊', num: '84%',               lbl: 'score' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px' }}>{s.ico}</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a1a2e' }}>{s.num}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Recent tasks */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>Recent Tasks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {RECENT_TASKS.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '11px 0',
                borderTop: i > 0 ? '1px solid #f5f5f5' : undefined,
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '6px',
                  background: t.done ? '#e8f5e9' : '#ffeaea',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '13px',
                }}>
                  {t.done ? '✓' : '✗'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: t.done ? '#1a1a2e' : '#e74c3c', lineHeight: 1.4 }}>{t.task}</div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>Day {t.day}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}