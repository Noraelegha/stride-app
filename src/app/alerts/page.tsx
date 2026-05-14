'use client'
import BottomNav from '@/components/BottomNav'

const alerts = [
  {
    ico: '🛡️',
    bg: '#eef4ff',
    title: 'Streak shield earned!',
    body: '5 consecutive days. You earned a shield. It will protect your streak automatically if you ever miss a day.',
    time: 'Today',
    unread: true,
  },
  {
    ico: '🔥',
    bg: '#fff4ec',
    title: '7-day streak milestone!',
    body: 'You just hit 7 days in a row. Top 20% of Stride users. Streak shield earned. 🛡',
    time: 'Just now',
    unread: true,
  },
  {
    ico: '⚡',
    bg: '#f3eeff',
    title: 'Dash has your task ready',
    body: 'Your Day 7 task is waiting. 5 minutes. The consulting clients are watching. 👀',
    time: '8:00 AM',
    unread: true,
  },
  {
    ico: '📊',
    bg: '#edfaf3',
    title: 'Weekly report ready',
    body: 'Your Week 1 report is ready. 6 of 7 tasks completed. 86% score.',
    time: 'Yesterday, 7 PM',
    unread: false,
  },
  {
    ico: '💪',
    bg: '#fffbec',
    title: 'Bonus task completed',
    body: 'You went deeper on Day 6. That is the kind of energy that wins.',
    time: '2 days ago',
    unread: false,
  },
]

export default function AlertsPage() {
  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>

      {/* Dark header */}
      <div style={{ background: '#1a1a2e', padding: '52px 22px 22px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: 0 }}>Alerts</h1>
      </div>

      {/* Alert list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {alerts.map((a, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              gap: '13px',
              alignItems: 'flex-start',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              position: 'relative',
            }}
          >
            {/* Icon circle */}
            <div style={{
              width: 42, height: 42,
              background: a.bg,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '19px',
              flexShrink: 0,
            }}>
              {a.ico}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3, marginBottom: '4px', paddingRight: a.unread ? '14px' : '0' }}>
                {a.title}
              </div>
              <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.55, marginBottom: '6px' }}>
                {a.body}
              </div>
              <div style={{ fontSize: '11px', color: '#bbb' }}>
                {a.time}
              </div>
            </div>

            {/* Unread dot */}
            {a.unread && (
              <div style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '8px',
                height: '8px',
                background: '#1a1a2e',
                borderRadius: '50%',
                flexShrink: 0,
              }} />
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}