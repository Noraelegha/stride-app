'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

export default function JourneyPage() {
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (!stored) return
    const userData = JSON.parse(stored)
    setUser(userData)

    const fetchTasks = async () => {
      try {
        const { data } = await supabase
          .from('daily_tasks')
          .select('day_number, task_text, status, task_date, bonus_completed')
          .eq('user_email', userData.email)
          .order('task_date', { ascending: false })
          .limit(10)
        setTasks(data || [])
      } catch (e) {
        console.error('Failed to fetch tasks:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  if (!user) return null

  const tasksDone = user.tasksDone || 0
  const streak = user.streak || 0
  const score = user.score || 0

  // Phase calculated dynamically from actual tasks done — ignores stale DB phase value
  const calculatedPhase = tasksDone >= 60 ? 3 : tasksDone >= 30 ? 2 : 1
  const phaseName = calculatedPhase === 1 ? 'Foundation' : calculatedPhase === 2 ? 'Momentum' : 'Acceleration'
  const tasksInPhase = tasksDone - ((calculatedPhase - 1) * 30)
  const phaseProgress = Math.min(Math.round((tasksInPhase / 30) * 100), 100)
  const displayGoal = user.goalShort || user.goal || 'Your goal'

  const getStatusStyle = (status: string) => {
    if (status === 'completed') return { bg: '#e8f8f0', color: '#4CAF50', icon: '✓' }
    if (status === 'partial') return { bg: '#fff8e8', color: '#F5A623', icon: '~' }
    return { bg: '#ffeaea', color: '#f44', icon: '✕' }
  }

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>
      <div style={{ background: '#1a1a2e', padding: '52px 22px 20px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, marginBottom: '3px' }}>
          Your journey
        </h1>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayGoal}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Phase card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Phase {calculatedPhase}: {phaseName}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>{phaseProgress}%</div>
          </div>
          <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', marginBottom: '8px' }}>
            <div style={{ width: `${phaseProgress}%`, height: '100%', background: '#1a1a2e', borderRadius: '3px', transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ fontSize: '12px', color: '#888', margin: 0, lineHeight: 1.5 }}>
            {phaseProgress === 0
              ? 'Your first task is waiting. Everything starts with one step.'
              : phaseProgress < 40
              ? 'You are just getting started. Every task is laying the foundation.'
              : phaseProgress < 80
              ? `You are ${phaseProgress}% through Phase ${calculatedPhase}. The momentum is building.`
              : phaseProgress < 100
              ? 'The finish line is closer than it feels. Keep going.'
              : `Phase ${calculatedPhase} complete. You are ready for the next level.`}
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '9px' }}>
          {[
            { ico: '🔥', val: streak,        lbl: 'streak' },
            { ico: '✅', val: tasksDone,     lbl: 'done' },
            { ico: '📊', val: `${score}%`,   lbl: 'score' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px' }}>{s.ico}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e' }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Recent tasks */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Recent Tasks
          </div>

          {loading ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>Loading...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
              <p style={{ color: '#aaa', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                Complete your first task to see your history here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tasks.map((t, i) => {
                const style = getStatusStyle(t.status)
                const isNegative = t.status !== 'completed' && t.status !== 'partial'
                return (
                  <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '8px',
                      background: style.bg, color: style.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {style.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', color: '#1a1a2e', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isNegative ? `Day ${t.day_number} — missed` : (t.task_text || `Day ${t.day_number} task completed`)}
                      </div>
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Day {t.day_number}</span>
                        {t.bonus_completed && <span style={{ color: '#F5A623', fontWeight: 600 }}>+bonus ⚡</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>Full task history — powered by Dash ⚡</p>
              </div>
            </div>
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  )
}