'use client'
import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'

type Alert = {
  ico: string
  bg: string
  title: string
  body: string
  time: string
  unread: boolean
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (!stored) { setLoaded(true); return }

    const user = JSON.parse(stored)
    const streak = user.streak || 0
    const tasksDone = user.tasksDone || 0
    const score = user.score || 0
    const shields = user.shields || 0
    const bonusTasks = user.bonusTasks || 0

    const generated: Alert[] = []

    // Only show alerts for things that have actually happened
    if (shields > 0 && streak >= 5) {
      generated.push({
        ico: '🛡️', bg: '#eef4ff',
        title: 'Streak shield earned!',
        body: `${streak} consecutive days. You earned a shield. It will protect your streak automatically if you ever miss a day.`,
        time: 'Today',
        unread: true,
      })
    }

    if (streak >= 7) {
      generated.push({
        ico: '🔥', bg: '#fff4ec',
        title: `${streak}-day streak milestone!`,
        body: `You just hit ${streak} days in a row. Top 20% of Stride users. ${shields > 0 ? 'Streak shield earned. 🛡' : 'Keep going.'}`,
        time: 'Just now',
        unread: true,
      })
    } else if (streak >= 3) {
      generated.push({
        ico: '🔥', bg: '#fff4ec',
        title: `${streak}-day streak!`,
        body: `${streak} days in. The habit is forming. Keep showing up.`,
        time: 'Just now',
        unread: streak >= 5,
      })
    }

    if (tasksDone > 0) {
      generated.push({
        ico: '⚡', bg: '#f3eeff',
        title: 'Dash has your task ready',
        body: `Your Day ${tasksDone + 1} task is waiting. Let's make it count.`,
        time: '8:00 AM',
        unread: false,
      })
    }

    if (score > 0 && tasksDone >= 7) {
      generated.push({
        ico: '📊', bg: '#edfaf3',
        title: 'Weekly report ready',
        body: `${tasksDone} tasks completed. ${score}% score. You are in the top tier of consistency.`,
        time: 'Yesterday, 7 PM',
        unread: false,
      })
    }

    if (bonusTasks > 0) {
      generated.push({
        ico: '💪', bg: '#fffbec',
        title: `${bonusTasks > 1 ? `${bonusTasks} bonus tasks` : 'Bonus task'} completed`,
        body: `You went the extra mile${bonusTasks > 1 ? ` ${bonusTasks} times` : ''}. That is the kind of energy that wins.`,
        time: '2 days ago',
        unread: false,
      })
    }

    setAlerts(generated)
    setLoaded(true)
  }, [])

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>
      <div style={{ background: '#1a1a2e', padding: '52px 22px 22px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: 0 }}>Alerts</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!loaded ? null : alerts.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '60px 28px', textAlign: 'center', gap: '12px',
          }}>
            <div style={{ fontSize: '40px' }}>🔔</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>No alerts yet</div>
            <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.6, margin: 0, maxWidth: '240px' }}>
              Complete tasks, hit streaks, and earn shields — your milestones will show up here.
            </p>
          </div>
        ) : (
          alerts.map((a, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '16px', padding: '14px 16px',
              display: 'flex', gap: '13px', alignItems: 'flex-start',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'relative',
            }}>
              <div style={{
                width: 42, height: 42, background: a.bg, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '19px', flexShrink: 0,
              }}>
                {a.ico}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3, marginBottom: '4px', paddingRight: a.unread ? '14px' : '0' }}>
                  {a.title}
                </div>
                <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.55, marginBottom: '6px' }}>
                  {a.body}
                </div>
                <div style={{ fontSize: '11px', color: '#bbb' }}>{a.time}</div>
              </div>
              {a.unread && (
                <div style={{
                  position: 'absolute', top: '14px', right: '14px',
                  width: '8px', height: '8px', background: '#1a1a2e', borderRadius: '50%',
                }} />
              )}
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}