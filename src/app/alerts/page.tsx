'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
    const localUser = JSON.parse(stored)

    const generateAlerts = async () => {
      try {
        // Always pull fresh from Supabase
        const { data: dbUser } = await supabase
          .from('stride_users')
          .select('streak, tasks_done, score, shields, bonus_tasks')
          .eq('email', localUser.email)
          .single()

        const streak = dbUser?.streak ?? localUser.streak ?? 0
        const tasksDone = dbUser?.tasks_done ?? localUser.tasksDone ?? 0
        const score = dbUser?.score ?? localUser.score ?? 0
        const shields = dbUser?.shields ?? localUser.shields ?? 0
        const bonusTasks = dbUser?.bonus_tasks ?? localUser.bonusTasks ?? 0

        // Check today's task status
        const today = new Date().toISOString().split('T')[0]
        const { data: todayTask } = await supabase
          .from('daily_tasks')
          .select('status, task_text')
          .eq('user_email', localUser.email)
          .eq('task_date', today)
          .maybeSingle()

        const generated: Alert[] = []

        // Today's task — only show if not yet completed
        if (!todayTask || todayTask.status === 'pending') {
          generated.push({
            ico: '⚡', bg: '#f3eeff',
            title: 'Dash has your task ready',
            body: `Your Day ${tasksDone + 1} task is waiting. Let's make it count.`,
            time: '8:00 AM',
            unread: true,
          })
        }

        // Streak shield earned — show when shields > 0 and streak just hit a multiple of 5
        if (shields > 0 && streak > 0 && streak % 5 === 0) {
          generated.push({
            ico: '🛡️', bg: '#eef4ff',
            title: 'Streak shield earned!',
            body: `${streak} consecutive days. You earned a shield. It will protect your streak if you ever miss a day.`,
            time: 'Today',
            unread: true,
          })
        } else if (shields > 0) {
          generated.push({
            ico: '🛡️', bg: '#eef4ff',
            title: `You have ${shields} streak shield${shields > 1 ? 's' : ''}`,
            body: `Your shield${shields > 1 ? 's' : ''} will automatically protect your streak if you miss a day. Keep going.`,
            time: `Day ${streak - (streak % 5)} milestone`,
            unread: false,
          })
        }

        // Streak milestone notifications
        const milestones = [3, 7, 14, 21, 30, 60, 90]
        const hitMilestone = milestones.filter(m => streak >= m).pop()
        if (hitMilestone && streak > 0) {
          generated.push({
            ico: '🔥', bg: '#fff4ec',
            title: `${streak}-day streak!`,
            body: streak >= 30
              ? `${streak} days in a row. You are in the top 5% of Stride users. This is rare. 🏆`
              : streak >= 7
              ? `${streak} days in a row. Top 20% of Stride users.${shields > 0 ? ' Shield earned. 🛡' : ''}`
              : `${streak} days in. The habit is forming. Keep showing up.`,
            time: streak % 7 === 0 ? 'Just now' : 'Today',
            unread: streak % 7 === 0,
          })
        }

        // Weekly report — only when enough tasks done
        if (tasksDone >= 7) {
          generated.push({
            ico: '📊', bg: '#edfaf3',
            title: 'Weekly report ready',
            body: `${tasksDone} tasks completed. ${score}% score. You are in the top tier of consistency.`,
            time: 'Yesterday, 7 PM',
            unread: false,
          })
        }

        // Bonus tasks milestone
        if (bonusTasks >= 3) {
          generated.push({
            ico: '💪', bg: '#fffbec',
            title: `${bonusTasks} bonus tasks completed`,
            body: `You went the extra mile ${bonusTasks} times. That is the kind of energy that wins.`,
            time: '2 days ago',
            unread: false,
          })
        } else if (bonusTasks > 0) {
          generated.push({
            ico: '💪', bg: '#fffbec',
            title: `Bonus task completed`,
            body: `You went the extra mile. That is the kind of energy that wins.`,
            time: '2 days ago',
            unread: false,
          })
        }

        // Shield used — fetch from recent task history
        const { data: recentTasks } = await supabase
          .from('daily_tasks')
          .select('task_date, status')
          .eq('user_email', localUser.email)
          .order('task_date', { ascending: false })
          .limit(7)

        const hadMissedDay = recentTasks?.some((t: any) => t.status === 'missed' || t.status === 'blocked')
        if (hadMissedDay && shields > 0) {
          generated.push({
            ico: '🛡️', bg: '#e8f4fd',
            title: 'Shield used — streak protected',
            body: 'You missed a day recently. Your shield kicked in automatically. Streak intact. 🔒',
            time: 'Recently',
            unread: false,
          })
        }

        setAlerts(generated)
      } catch (e) {
        console.error('Alerts fetch failed:', e)
      } finally {
        setLoaded(true)
      }
    }

    generateAlerts()
  }, [])

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>
      <div style={{ background: '#1a1a2e', padding: '52px 22px 22px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: 0 }}>Alerts</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!loaded ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>Loading...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 28px', textAlign: 'center', gap: '12px' }}>
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