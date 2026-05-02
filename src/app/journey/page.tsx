'use client'
import { useEffect, useState } from 'react'
import { Zap, Target, Flame, CheckCircle, Calendar } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const mockTasks = [
  { day: 7, task: 'Update LinkedIn headline with your niche', status: 'done', date: 'Today' },
  { day: 6, task: 'Write and schedule 3 social posts for the week', status: 'done', date: 'Yesterday' },
  { day: 5, task: 'Reach out to 2 potential collaborators', status: 'done', date: '2 days ago' },
  { day: 4, task: 'Record a 60-second intro video for your profile', status: 'missed', date: '3 days ago' },
  { day: 3, task: 'Join 2 relevant LinkedIn groups and comment', status: 'done', date: '4 days ago' },
]

export default function JourneyPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  return (
    <div className="screen" style={{ background: '#0f1623' }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '52px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>Your Journey</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Everything you have built so far</p>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Phase progress */}
        <div style={{ background: '#1a1a2e', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target size={16} color="#F5A623" />
            <span style={{ color: '#F5A623', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Phase 1 — Foundation
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Progress toward Phase 2</span>
            <span style={{ color: '#F5A623', fontWeight: 800 }}>42%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '42%', background: 'linear-gradient(90deg, #F5A623, #d4891e)', borderRadius: '4px' }} />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>
            {user?.goal || 'Building your personal brand'}
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: CheckCircle, label: 'Tasks done', value: '24', color: '#22c55e' },
            { icon: Flame, label: 'Best streak', value: '9 days', color: '#F5A623' },
            { icon: Zap, label: 'Bonus tasks', value: '3', color: '#60a5fa' },
            { icon: Calendar, label: 'Days active', value: '7', color: '#f472b6' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{
              background: '#1a1a2e', borderRadius: '14px', padding: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <Icon size={18} color={color} style={{ marginBottom: '8px' }} />
              <div style={{ color: 'white', fontWeight: 800, fontSize: '22px' }}>{value}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Task history */}
        <div>
          <h3 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Task History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mockTasks.map((task) => (
              <div key={task.day} style={{
                background: '#1a1a2e',
                borderRadius: '12px',
                padding: '14px 16px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: task.status === 'done' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${task.status === 'done' ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: '12px',
                }}>
                  {task.status === 'done' ? '✓' : '·'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'white', fontSize: '14px', lineHeight: 1.4 }}>{task.task}</p>
                  <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>Day {task.day} — {task.date}</p>
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