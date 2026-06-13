'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = 'stride-admin-2024'

type UserStat = {
  email: string
  name: string
  streak: number
  tasks_done: number
  score: number
  last_active: string | null
  onesignal_id: string | null
  joined_at: string | null
  todayStatus: 'completed' | 'partial' | 'pending' | 'none'
  daysMissed: number
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [wrongPassword, setWrongPassword] = useState(false)
  const [users, setUsers] = useState<UserStat[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [filter, setFilter] = useState<'all' | 'done' | 'pending' | 'at_risk' | 'no_notif'>('all')

  const fetchData = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    const { data: allUsers } = await supabase
      .from('stride_users')
      .select('email, name, streak, tasks_done, score, last_active, onesignal_id, joined_at')
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

      const todayStatus = (todayMap[u.email] as any) || 'none'

      return {
        ...u,
        todayStatus,
        daysMissed,
      }
    })

    setUsers(stats)
    setLastRefreshed(new Date())
    setLoading(false)
  }

  useEffect(() => {
    if (authed) fetchData()
  }, [authed])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      setWrongPassword(false)
    } else {
      setWrongPassword(true)
    }
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

  const statusColor = (status: string) => {
    if (status === 'completed') return '#4CAF50'
    if (status === 'partial') return '#F5A623'
    if (status === 'pending') return '#4A9EDB'
    return '#ccc'
  }

  const statusLabel = (status: string) => {
    if (status === 'completed') return '✅ Done'
    if (status === 'partial') return '⏳ Partial'
    if (status === 'pending') return '⏱ Pending'
    return '— No task'
  }

  const riskLabel = (days: number) => {
    if (days === 0) return { text: 'Active', color: '#4CAF50' }
    if (days === 1) return { text: '1 day missed', color: '#F5A623' }
    if (days === 2) return { text: '2 days missed', color: '#ff6b35' }
    return { text: `${days}+ days gone`, color: '#f44' }
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
          {wrongPassword && <div style={{ fontSize: '12px', color: '#f44', marginBottom: '10px' }}>Wrong password. Try again.</div>}
          <button
            onClick={handleLogin}
            style={{ width: '100%', background: '#1a1a2e', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
          >
            Enter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '24px 28px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>⚡ Stride Admin</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>
              {lastRefreshed ? `Last refreshed ${lastRefreshed.toLocaleTimeString()}` : 'Loading...'}
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 20px' }}>

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
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              style={{
                padding: '7px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                border: `1.5px solid ${filter === f.id ? '#1a1a2e' : '#eee'}`,
                background: filter === f.id ? '#1a1a2e' : '#fff',
                color: filter === f.id ? '#fff' : '#555',
                cursor: 'pointer',
              }}
            >
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
            return (
              <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: `4px solid ${statusColor(u.todayStatus)}` }}>
                {/* Avatar */}
                <div style={{ width: 40, height: 40, background: '#F5A623', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#1a1a2e', flexShrink: 0 }}>
                  {(u.name || '?')[0].toUpperCase()}
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>{u.name || '—'}</div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: '#555' }}>🔥 {u.streak || 0} streak</span>
                    <span style={{ fontSize: '11px', color: '#555' }}>✅ {u.tasks_done || 0} tasks</span>
                    <span style={{ fontSize: '11px', color: '#555' }}>📊 {u.score || 0}%</span>
                    {!u.onesignal_id && <span style={{ fontSize: '11px', color: '#f44' }}>🔕 No notifications</span>}
                  </div>
                </div>

                {/* Right side */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: statusColor(u.todayStatus), marginBottom: '4px' }}>
                    {statusLabel(u.todayStatus)}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: risk.color }}>
                    {risk.text}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
