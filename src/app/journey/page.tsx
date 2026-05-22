'use client'
import { useEffect, useState } from 'react'
import BottomNav from '@/components/BottomNav'

export default function JourneyPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  if (!user) return null

  const tasksDone = user.tasksDone || 0
  const streak = user.streak || 0
  const score = user.score || 0
  const phase = user.phase || 1
  const tasksPerPhase = 30
  const tasksInPhase = Math.max(0, tasksDone - ((phase - 1) * tasksPerPhase))
  const phaseProgress = Math.min(Math.round((tasksInPhase / tasksPerPhase) * 100), 100)
  const phaseName = phase === 1 ? 'Foundation' : phase === 2 ? 'Momentum' : 'Acceleration'
  const displayGoal = user.goalShort || user.goal || 'Your goal'

  const recentCount = Math.min(tasksDone, 6)
  const mockTasks = recentCount === 0 ? [] : Array.from({ length: recentCount }, (_, i) => {
    const dayNum = tasksDone - i
    const missed = i === 2 && tasksDone > 3
    return { day: dayNum, done: !missed }
  }).reverse()

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>

      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '52px 22px 20px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, marginBottom: '3px' }}>
          Your journey
        </h1>
        <p style={{
          fontSize: '12px', color: 'rgba(255,255,255,.45)', margin: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {displayGoal}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Phase card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Phase {phase}: {phaseName}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>{phaseProgress}%</div>
          </div>
          <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', marginBottom: '8px' }}>
            <div style={{
              width: `${phaseProgress}%`, height: '100%',
              background: '#1a1a2e', borderRadius: '3px',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <p style={{ fontSize: '12px', color: '#888', margin: 0, lineHeight: 1.5 }}>
            {phaseProgress === 0
              ? 'Your first task is waiting. Everything starts with one step.'
              : phaseProgress < 30
              ? 'You are just getting started. Every task is laying the foundation.'
              : phaseProgress < 70
              ? `You are ${phaseProgress}% through Phase ${phase}. The momentum is building.`
              : 'The finish line is closer than it feels. Keep going.'}
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '9px' }}>
          {[
            { ico: '🔥', val: streak,       lbl: 'streak' },
            { ico: '✅', val: tasksDone,    lbl: 'done' },
            { ico: '📊', val: `${score}%`,  lbl: 'score' },
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

          {tasksDone === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
              <p style={{ color: '#aaa', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                Complete your first task to see your history here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {mockTasks.map((t, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: '12px', padding: '13px 16px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '8px',
                    background: t.done ? '#e8f8f0' : '#ffeaea',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', flexShrink: 0,
                    color: t.done ? '#4CAF50' : '#f44',
                  }}>
                    {t.done ? '✓' : '✕'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: '#1a1a2e', lineHeight: 1.4 }}>
                      {t.done ? `Day ${t.day} task completed` : `Day ${t.day} — missed`}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>Day {t.day}</div>
                  </div>
                </div>
              ))}
              <div style={{ background: '#f9f9f9', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
                  Full task history coming soon — powered by Dash ⚡
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  )
}