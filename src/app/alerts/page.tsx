'use client'
import { Bell, Flame, Zap, Trophy, CheckCircle } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const alerts = [
  { icon: Trophy,      color: '#F5A623', title: 'Streak shield earned!',  sub: '5 consecutive days. It protects your streak automatically if you miss a day.',       time: '2h ago', unread: true },
  { icon: Flame,       color: '#F5A623', title: '7-day streak!',          sub: 'You are in the top tier of people who say they will do something and actually do it.', time: '8h ago', unread: true },
  { icon: Zap,         color: '#60a5fa', title: 'Daily task ready',       sub: 'Your task for today is waiting. Dash is watching the clock. 👀',                      time: '8 AM',   unread: false },
  { icon: CheckCircle, color: '#22c55e', title: 'Bonus task completed!',  sub: 'Extra mile taken. That is the version of you we are building.',                       time: 'Yesterday', unread: false },
  { icon: Flame,       color: '#F5A623', title: '5-day streak!',          sub: 'Halfway to your next shield. Keep going.',                                            time: '2d ago', unread: false },
]

export default function AlertsPage() {
  return (
    <div className="screen" style={{ background: '#0f1623' }}>
      <div style={{ background: '#1a1a2e', padding: '52px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>Alerts</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Updates from Dash</p>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.map((alert, i) => {
          const Icon = alert.icon
          return (
            <div key={i} style={{
              background: '#1a1a2e', borderRadius: '14px', padding: '16px',
              border: alert.unread ? `1.5px solid rgba(245,166,35,0.25)` : '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: '14px', alignItems: 'flex-start',
              borderLeft: alert.unread ? `3px solid ${alert.color}` : undefined,
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: `rgba(${alert.color === '#F5A623' ? '245,166,35' : alert.color === '#22c55e' ? '34,197,94' : '96,165,250'},0.12)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={18} color={alert.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{alert.title}</p>
                  <span style={{ color: '#94a3b8', fontSize: '11px', flexShrink: 0, marginLeft: '8px' }}>{alert.time}</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5 }}>{alert.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav />
    </div>
  )
}