'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = 'stride-admin-2024'

type TaskHistory = {
  task_date: string
  day_number: number
  task_text: string
  dash_message: string
  status: string
  user_reply: string | null
  hint_text: string | null
  chip_type: string
  bonus_task_text: string | null
  bonus_task_status: string | null
}

type UserStat = {
  email: string
  name: string
  streak: number
  tasks_done: number
  score: number
  last_active: string | null
  onesignal_id: string | null
  joined_at: string | null
  goal: string | null
  coach_style: string | null
  todayStatus: 'completed' | 'partial' | 'pending' | 'blocked' | 'none'
  daysMissed: number
  history?: TaskHistory[]
  historyLoading?: boolean
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [wrongPassword, setWrongPassword] = useState(false)
  const [users, setUsers] = useState<UserStat[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [filter, setFilter] = useState<'all' | 'done' | 'pending' | 'at_risk' | 'no_notif'>('all')
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const { data: allUsers } = await supabase
      .from('stride_users')
      .select('email, name, streak, tasks_done, score, last_active, onesignal_id, joined_at, goal, coach_style')
      .order('last_active', { ascending: false })

    if (!allUsers) { setLoading(false); return }

    const { data: todayTasks } = await supabase
      .from('daily_tasks')
      .select('user_email, status')
      .eq('task_date', today)

    const todayMap: Record<string, string> = {}
    todayTasks?.forEach((t: any) => { todayMap[t.user_email] = t.status })

    const now = new Date()
    const stats: UserStat[] = allUsers.map((u: any) => {
      const last = u.last_active ? new Date(u.last_active) : null
      const daysMissed = last
        ? Math.max(0, Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)) - 1)
        : 99
      return {
        ...u,
        todayStatus: (todayMap[u.email] as any) || 'none',
        daysMissed,
      }
    })

    setUsers(stats)
    setLastRefreshed(new Date())
    setLoading(false)
  }

  const fetchHistory = async (email: string) => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, historyLoading: true } : u))

    const { data } = await supabase
      .from('daily_tasks')
      .select('task_date, day_number, task_text, dash_message, status, user_reply, hint_text, chip_type, bonus_task_text, bonus_task_status')
      .eq('user_email', email)
      .order('task_date', { ascending: false })

    setUsers(prev => prev.map(u =>
      u.email === email ? { ...u, history: data || [], historyLoading: false } : u
    ))
  }

  const toggleExpand = async (email: string) => {
    if (expandedEmail === email) {
      setExpandedEmail(null)
      return
    }
    setExpandedEmail(email)
    const user = users.find(u => u.email === email)
    if (!user?.history) await fetchHistory(email)
  }

  useEffect(() => {
    if (authed) fetchData()
  }, [authed])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setAuthed(true); setWrongPassword(false) }
    else setWrongPassword(true)
  }

  const filtered = users.filter(u => {
    if (filter === 'done') return u.todayStatus === 'completed' || u.todayStatus === 'partial'
    if (filter === 'pending') return u.todayStatus === 'pending' || u.todayStatus === 'none'
    if (filter === 'at_risk') return u.daysMissed >= 1
    if (filter === 'no_notif') return !u.onesignal_id
    return true
  })

  const completedToday = users.filter(u => u.todayStatus === 'completed' || u.todayStatus === 'partial').length
  const pendingToday = users.filter(u => u.todayStatus === 'pending' || u.todayStatus === 'none').length
  const atRisk = users.filter(u => u.daysMissed >= 1).length
  const noNotif = users.filter(u => !u.onesignal_id).length
  const avgStreak = users.length > 0 ? Math.round(users.reduce((a, u) => a + (u.streak || 0), 0) / users.length) : 0
  const avgScore = users.length > 0 ? Math.round(users.reduce((a, u) => a + (u.score || 0), 0) / users.length) : 0

  const statusColor = (s: string) => ({ completed: '#4CAF50', partial: '#F5A623', pending: '#4A9EDB', blocked: '#888' }[s] || '#ddd')
  const statusLabel = (s: string) => ({ completed: '✅ Done', partial: '⏳ Partial', pending: '⏱ Pending', blocked: '🚧 Blocked' }[s] || '— No task')
  const riskLabel = (d: number) => {
    if (d === 0) return { text: 'Active', color: '#4CAF50' }
    if (d === 1) return { text: '1 day missed', color: '#F5A623' }
    if (d === 2) return { text: '2 days missed', color: '#ff6b35' }
    return { text: `${d}+ days gone`, color: '#f44' }
  }
  const coachEmoji = (s: string | null) => ({ tough: '💪', strategic: '🤝', friend: '😏', mentor: '🧘' }[s || ''] || '🎭')
  const replyLabel = (r: string | null) => {
    if (!r) return null
    const map: Record<string, string> = { chip1: 'Completed it', chip2: 'Partial', more: 'Did more', blocked: 'Hit a wall', partial: 'Partial', other: 'Something else' }
    return map[r] || r
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '32px 28px', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e', marginBottom: '4px' }}>Stride Admin</div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px' }}>Enter your password to continue</div>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', border: `1.5px solid ${wrongPassword ? '#f44' : '#eee'}`, borderRadius: '12px', padding: '13px 15px', fontSize: '15px', color: '#1a1a2e', outline: 'none', fontFamily: 'inherit', marginBottom: '10px', boxSizing: 'border-box' }}
          />
          {wrongPassword && <div style={{ fontSize: '12px', color: '#f44', marginBottom: '10px' }}>Wrong password.</div>}
          <button onClick={handleLogin} style={{ width: '100%', background: '#1a1a2e', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
            Enter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      <div style={{ background: '#1a1a2e', padding: '24px 28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '960px', margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>⚡ Stride Admin</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>
              {lastRefreshed ? `Last refreshed ${lastRefreshed.toLocaleTimeString()}` : 'Loading...'}
            </div>
          </div>
          <button onClick={fetchData} disabled={loading} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '20px' }}>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { label: 'Total users', value: users.length, ico: '👥', color: '#1a1a2e' },
            { label: 'Done today', value: completedToday, ico: '✅', color: '#4CAF50' },
            { label: 'Still pending', value: pendingToday, ico: '⏱', color: '#4A9EDB' },
            { label: 'At risk', value: atRisk, ico: '⚠️', color: '#ff6b35' },
            { label: 'Avg streak', value: `${avgStreak}d`, ico: '🔥', color: '#F5A623' },
            { label: 'Avg score', value: `${avgScore}%`, ico: '📊', color: '#1a1a2e' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.ico}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${users.length})` },
            { id: 'done', label: `Done today (${completedToday})` },
            { id: 'pending', label: `Pending (${pendingToday})` },
            { id: 'at_risk', label: `At risk (${atRisk})` },
            { id: 'no_notif', label: `No notifications (${noNotif})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as any)} style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: `1.5px solid ${filter === f.id ? '#1a1a2e' : '#eee'}`, background: filter === f.id ? '#1a1a2e' : '#fff', color: filter === f.id ? '#fff' : '#555', cursor: 'pointer' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* User list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Loading users...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>No users in this filter.</div>
          ) : filtered.map((u, i) => {
            const risk = riskLabel(u.daysMissed)
            const isExpanded = expandedEmail === u.email
            return (
              <div key={i} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', borderLeft: `4px solid ${statusColor(u.todayStatus)}` }}>

                {/* User row — clickable */}
                <div
                  onClick={() => toggleExpand(u.email)}
                  style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
                >
                  <div style={{ width: 40, height: 40, background: '#F5A623', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#1a1a2e', flexShrink: 0 }}>
                    {(u.name || '?')[0].toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>{u.name || '—'}</div>
                      <div style={{ fontSize: '11px' }}>{coachEmoji(u.coach_style)}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.goal || 'No goal set'}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#555' }}>🔥 {u.streak || 0} streak</span>
                      <span style={{ fontSize: '11px', color: '#555' }}>✅ {u.tasks_done || 0} tasks</span>
                      <span style={{ fontSize: '11px', color: '#555' }}>📊 {u.score || 0}%</span>
                      {!u.onesignal_id && <span style={{ fontSize: '11px', color: '#f44' }}>🔕 No notifs</span>}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: statusColor(u.todayStatus), marginBottom: '4px' }}>
                      {statusLabel(u.todayStatus)}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: risk.color, marginBottom: '8px' }}>
                      {risk.text}
                    </div>
                    <div style={{ fontSize: '11px', color: '#bbb' }}>{isExpanded ? '▲ collapse' : '▼ history'}</div>
                  </div>
                </div>

                {/* Expanded task history */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #f5f5f5', padding: '0 16px 16px' }}>
                    {u.historyLoading ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>Loading history...</div>
                    ) : !u.history || u.history.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>No task history yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                        {u.history.map((t, j) => (
                          <div key={j} style={{ background: '#f9f9f9', borderRadius: '12px', padding: '12px', borderLeft: `3px solid ${statusColor(t.status)}` }}>

                            {/* Day + date + status */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                                  Day {t.day_number}
                                </span>
                                <span style={{ fontSize: '11px', color: '#bbb' }}>{t.task_date}</span>
                                {t.chip_type === 'checkin' && (
                                  <span style={{ fontSize: '10px', background: '#f3eeff', color: '#7c3aed', borderRadius: '6px', padding: '2px 6px', fontWeight: 600 }}>Check-in</span>
                                )}
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor(t.status) }}>
                                {statusLabel(t.status)}
                              </span>
                            </div>

                            {/* Dash message */}
                            {t.dash_message && (
                              <div style={{ background: '#1a1a2e', borderRadius: '8px', borderBottomLeftRadius: '2px', padding: '8px 10px', marginBottom: '8px' }}>
                                <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '3px' }}>Dash</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.85)', lineHeight: 1.45 }}>{t.dash_message}</div>
                              </div>
                            )}

                            {/* Task */}
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5, marginBottom: '8px' }}>
                              {t.task_text}
                            </div>

                            {/* User reply */}
                            {t.user_reply && (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: t.hint_text ? '6px' : '0' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#888', flexShrink: 0 }}>Reply:</span>
                                <span style={{ fontSize: '11px', color: '#555' }}>{replyLabel(t.user_reply)}</span>
                              </div>
                            )}

                            {/* User's written note */}
                            {t.hint_text && (
                              <div style={{ background: '#fffbf0', borderLeft: '3px solid #F5A623', borderRadius: '0 8px 8px 0', padding: '8px 10px', marginBottom: '6px' }}>
                                <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '3px' }}>User note</div>
                                <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.45 }}>{t.hint_text}</div>
                              </div>
                            )}

                            {/* Bonus task */}
                            {t.bonus_task_text && (
                              <div style={{ background: '#fff8ec', borderLeft: '3px solid #F5A623', borderRadius: '0 8px 8px 0', padding: '8px 10px', marginTop: '6px' }}>
                                <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '3px' }}>
                                  Bonus — {t.bonus_task_status || 'pending'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.45 }}>{t.bonus_task_text}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}