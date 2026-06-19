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
  completed_at: string | null
  user_reply: string | null
  hint_text: string | null
  chip_type: string
  bonus_task_text: string | null
  bonus_task_status: string | null
}

type NotifLog = {
  tier: string
  message: string
  sent_at: string
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
  notifLogs?: NotifLog[]
  notifLoading?: boolean
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [wrongPassword, setWrongPassword] = useState(false)
  const [users, setUsers] = useState<UserStat[]>([])
  const [loading, setLoading] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const [filter, setFilter] = useState<'all' | 'done' | 'pending' | 'at_risk' | 'no_notif'>('all')
  const [selectedUser, setSelectedUser] = useState<UserStat | null>(null)
  const [detailTab, setDetailTab] = useState<'tasks' | 'notifications'>('tasks')
  const [viewDate, setViewDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [downloading, setDownloading] = useState(false)

  const fetchData = async (date?: string) => {
    setLoading(true)
    const targetDate = date || viewDate

    const { data: allUsers } = await supabase
      .from('stride_users')
      .select('email, name, streak, tasks_done, score, last_active, onesignal_id, joined_at, goal, coach_style')
      .order('last_active', { ascending: false })

    if (!allUsers) { setLoading(false); return }

    const { data: dateTasks } = await supabase
      .from('daily_tasks')
      .select('user_email, status')
      .eq('task_date', targetDate)

    const dateMap: Record<string, string> = {}
    dateTasks?.forEach((t: any) => { dateMap[t.user_email] = t.status })

    const now = new Date()
    const stats: UserStat[] = allUsers.map((u: any) => {
      const last = u.last_active ? new Date(u.last_active) : null
      const daysMissed = last
        ? Math.max(0, Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)) - 1)
        : 99
      return { ...u, todayStatus: (dateMap[u.email] as any) || 'none', daysMissed }
    })

    setUsers(stats)
    setLastRefreshed(new Date())
    setLoading(false)
  }

  const fetchHistory = async (email: string) => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, historyLoading: true } : u))
    const { data } = await supabase
      .from('daily_tasks')
      .select('task_date, day_number, task_text, dash_message, status, completed_at, user_reply, hint_text, chip_type, bonus_task_text, bonus_task_status')
      .eq('user_email', email)
      .order('task_date', { ascending: false })

    setUsers(prev => prev.map(u =>
      u.email === email ? { ...u, history: data || [], historyLoading: false } : u
    ))
    setSelectedUser(prev => prev?.email === email ? { ...prev, history: data || [], historyLoading: false } : prev)
    return data || []
  }

  const fetchNotifLogs = async (email: string) => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, notifLoading: true } : u))
    const { data } = await supabase
      .from('notification_logs')
      .select('tier, message, sent_at')
      .eq('user_email', email)
      .order('sent_at', { ascending: false })
      .limit(500)

    setUsers(prev => prev.map(u =>
      u.email === email ? { ...u, notifLogs: data || [], notifLoading: false } : u
    ))
    setSelectedUser(prev => prev?.email === email ? { ...prev, notifLogs: data || [], notifLoading: false } : prev)
    return data || []
  }

  const handleSelectUser = async (u: UserStat) => {
    setSelectedUser(u)
    setDetailTab('tasks')
    if (!u.history) await fetchHistory(u.email)
  }

  const handleTabChange = async (tab: 'tasks' | 'notifications') => {
    setDetailTab(tab)
    if (tab === 'notifications' && selectedUser && !selectedUser.notifLogs) {
      await fetchNotifLogs(selectedUser.email)
    }
  }

  const handleDateChange = (date: string) => {
    setViewDate(date)
    fetchData(date)
  }

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return ''
    const str = String(val).replace(/"/g, '""')
    return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str
  }

  const downloadUserData = async () => {
    if (!selectedUser) return
    setDownloading(true)

    try {
      // Fetch fresh data if not already loaded
      const history = selectedUser.history?.length
        ? selectedUser.history
        : await fetchHistory(selectedUser.email)

      const notifLogs = selectedUser.notifLogs?.length
        ? selectedUser.notifLogs
        : await fetchNotifLogs(selectedUser.email)

      const lines: string[] = []

      // ── SECTION 1: User Summary ──
      lines.push('STRIDE USER EXPORT')
      lines.push(`Generated,${new Date().toLocaleString('en-GB')}`)
      lines.push('')
      lines.push('USER SUMMARY')
      lines.push(`Name,${escapeCSV(selectedUser.name)}`)
      lines.push(`Email,${escapeCSV(selectedUser.email)}`)
      lines.push(`Goal,${escapeCSV(selectedUser.goal)}`)
      lines.push(`Coach Style,${escapeCSV(selectedUser.coach_style)}`)
      lines.push(`Joined,${selectedUser.joined_at ? new Date(selectedUser.joined_at).toLocaleDateString('en-GB') : '—'}`)
      lines.push(`Current Streak,${selectedUser.streak || 0} days`)
      lines.push(`Total Tasks Done,${selectedUser.tasks_done || 0}`)
      lines.push(`Score,${selectedUser.score || 0}%`)
      lines.push(`Notifications Enabled,${selectedUser.onesignal_id ? 'Yes' : 'No'}`)
      lines.push(`Last Active,${selectedUser.last_active ? new Date(selectedUser.last_active).toLocaleString('en-GB') : '—'}`)
      lines.push('')

      // ── SECTION 2: Task History ──
      lines.push('TASK HISTORY')
      lines.push([
        'Day',
        'Date',
        'Status',
        'Completed At',
        'Task',
        'Dash Message',
        'User Reply',
        'User Note',
        'Bonus Task',
        'Bonus Status',
      ].map(escapeCSV).join(','))

      const replyLabel = (r: string | null) => {
        if (!r) return ''
        return ({ chip1: 'Completed it', chip2: 'Partial', more: 'Did more', blocked: 'Hit a wall', partial: 'Partial', other: 'Something else' }[r] || r)
      }

      for (const t of (history as TaskHistory[])) {
        lines.push([
          t.day_number,
          t.task_date,
          t.status,
          t.completed_at ? new Date(t.completed_at).toLocaleString('en-GB') : '',
          t.task_text,
          t.dash_message,
          replyLabel(t.user_reply),
          t.hint_text || '',
          t.bonus_task_text || '',
          t.bonus_task_status || '',
        ].map(escapeCSV).join(','))
      }

      lines.push('')

      // ── SECTION 3: Daily Notification Summary ──
      lines.push('DAILY NOTIFICATION SUMMARY')
      lines.push(['Date', 'Notifications Sent', 'Tiers'].map(escapeCSV).join(','))

      const notifByDay: Record<string, { count: number; tiers: string[] }> = {}
      for (const n of (notifLogs as NotifLog[])) {
        const day = n.sent_at.split('T')[0]
        if (!notifByDay[day]) notifByDay[day] = { count: 0, tiers: [] }
        notifByDay[day].count++
        notifByDay[day].tiers.push(n.tier)
      }

      for (const [day, info] of Object.entries(notifByDay).sort((a, b) => b[0].localeCompare(a[0]))) {
        lines.push([
          day,
          info.count,
          [...new Set(info.tiers)].join(' / '),
        ].map(escapeCSV).join(','))
      }

      lines.push('')

      // ── SECTION 4: Full Notification Log ──
      lines.push('FULL NOTIFICATION LOG')
      lines.push(['Date & Time', 'Tier', 'Message'].map(escapeCSV).join(','))

      for (const n of (notifLogs as NotifLog[])) {
        lines.push([
          new Date(n.sent_at).toLocaleString('en-GB'),
          n.tier,
          n.message,
        ].map(escapeCSV).join(','))
      }

      // ── Trigger download ──
      const csv = lines.join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const safeName = (selectedUser.name || 'user').toLowerCase().replace(/\s+/g, '-')
      link.href = url
      link.download = `stride-${safeName}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Download failed:', e)
    }

    setDownloading(false)
  }

  const isToday = viewDate === new Date().toISOString().split('T')[0]

  useEffect(() => { if (authed) fetchData() }, [authed])

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

  const completedOnDate = users.filter(u => u.todayStatus === 'completed' || u.todayStatus === 'partial').length
  const pendingOnDate = users.filter(u => u.todayStatus === 'pending' || u.todayStatus === 'none').length
  const atRisk = users.filter(u => u.daysMissed >= 1).length
  const noNotif = users.filter(u => !u.onesignal_id).length
  const avgStreak = users.length > 0 ? Math.round(users.reduce((a, u) => a + (u.streak || 0), 0) / users.length) : 0
  const avgScore = users.length > 0 ? Math.round(users.reduce((a, u) => a + (u.score || 0), 0) / users.length) : 0

  const statusColor = (s: string) => ({ completed: '#4CAF50', partial: '#F5A623', pending: '#4A9EDB', blocked: '#888' }[s] || '#ccc')
  const statusBg = (s: string) => ({ completed: '#f0faf0', partial: '#fffbec', pending: '#eef4ff', blocked: '#f5f5f5' }[s] || '#f5f5f5')
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
    return ({ chip1: 'Completed it', chip2: 'Partial', more: 'Did more', blocked: 'Hit a wall', partial: 'Partial', other: 'Something else' }[r] || r)
  }
  const tierLabel = (t: string) => ({ morning: '🌅 Morning', midday: '☀️ Midday', afternoon: '🕒 Afternoon', evening: '🌆 Evening', night: '🌙 Night' }[t] || t)
  const fmtTime = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }
  const fmtDate = (d: string) => {
    if (isToday) return 'Today'
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const wrapStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: '#f5f5f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }

  if (!authed) {
    return (
      <div style={{ ...wrapStyle, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '40px 36px', width: '360px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 52, height: 52, background: '#1a1a2e', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '22px' }}>⚡</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e', marginBottom: '6px' }}>Stride Admin</div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '28px' }}>Enter your password to continue</div>
          <input type="password" placeholder="Admin password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', border: `1.5px solid ${wrongPassword ? '#f44' : '#e5e7eb'}`, borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: '#1a1a2e', outline: 'none', fontFamily: 'inherit', marginBottom: '10px', boxSizing: 'border-box' }}
          />
          {wrongPassword && <div style={{ fontSize: '12px', color: '#f44', marginBottom: '10px' }}>Wrong password.</div>}
          <button onClick={handleLogin} style={{ width: '100%', background: '#1a1a2e', color: '#fff', border: 'none', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            Enter dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={wrapStyle}>

      {/* Top nav */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 28, height: 28, background: '#1a1a2e', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>⚡</div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#1a1a2e' }}>Stride Admin</span>
          <span style={{ fontSize: '11px', color: '#bbb', marginLeft: '4px' }}>
            {lastRefreshed ? `Updated ${lastRefreshed.toLocaleTimeString()}` : ''}
          </span>
        </div>
        <button onClick={() => fetchData()} disabled={loading} style={{ background: '#f5f5f7', border: '1px solid #e8e8e8', color: '#555', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left — user list */}
        <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e8e8e8', background: '#fff', overflow: 'hidden' }}>

          {/* Date picker */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0 }}>Viewing</span>
            <input
              type="date"
              value={viewDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => handleDateChange(e.target.value)}
              style={{ flex: 1, border: '1.5px solid #eee', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', color: '#1a1a2e', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}
            />
            {!isToday && (
              <button onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                style={{ fontSize: '11px', fontWeight: 600, color: '#1a1a2e', background: '#f5f5f7', border: '1px solid #eee', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', flexShrink: 0 }}>
                Today
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ padding: '12px 16px 0', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: 'Total users', value: users.length, color: '#1a1a2e' },
              { label: isToday ? 'Done today' : `Done ${fmtDate(viewDate)}`, value: completedOnDate, color: '#4CAF50' },
              { label: isToday ? 'Pending' : 'Not done', value: pendingOnDate, color: '#4A9EDB' },
              { label: 'At risk now', value: atRisk, color: '#ff6b35' },
              { label: 'Avg streak', value: `${avgStreak}d`, color: '#F5A623' },
              { label: 'Avg score', value: `${avgScore}%`, color: '#7c3aed' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: '#999', marginTop: '2px', lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ padding: '12px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid #f0f0f0' }}>
            {[
              { id: 'all', label: `All (${users.length})` },
              { id: 'done', label: `Done (${completedOnDate})` },
              { id: 'pending', label: `Not done (${pendingOnDate})` },
              { id: 'at_risk', label: `At risk (${atRisk})` },
              { id: 'no_notif', label: `No notifs (${noNotif})` },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id as any)} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, border: `1.5px solid ${filter === f.id ? '#1a1a2e' : '#eee'}`, background: filter === f.id ? '#1a1a2e' : '#fff', color: filter === f.id ? '#fff' : '#666', cursor: 'pointer' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* User rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '13px' }}>Loading...</div>
            ) : filtered.map((u, i) => {
              const risk = riskLabel(u.daysMissed)
              const isSelected = selectedUser?.email === u.email
              return (
                <div key={i} onClick={() => handleSelectUser(u)}
                  style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5', borderLeft: `3px solid ${statusColor(u.todayStatus)}`, background: isSelected ? '#f5f5ff' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, background: '#F5A623', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#1a1a2e', flexShrink: 0 }}>
                    {(u.name || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '1px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>{u.name}</span>
                      <span style={{ fontSize: '11px' }}>{coachEmoji(u.coach_style)}</span>
                      {!u.onesignal_id && <span style={{ fontSize: '10px' }}>🔕</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>{u.goal || 'No goal'}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#888' }}>🔥 {u.streak || 0}</span>
                      <span style={{ fontSize: '10px', color: '#888' }}>✅ {u.tasks_done || 0}</span>
                      <span style={{ fontSize: '10px', color: '#888' }}>📊 {u.score || 0}%</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: statusColor(u.todayStatus), marginBottom: '2px' }}>{statusLabel(u.todayStatus)}</div>
                    <div style={{ fontSize: '10px', color: risk.color, fontWeight: 600 }}>{risk.text}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right — detail */}
        {selectedUser ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f5f5f7' }}>

            {/* User header */}
            <div style={{ background: '#fff', padding: '20px 28px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
              <div style={{ width: 48, height: 48, background: '#F5A623', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20, color: '#1a1a2e', flexShrink: 0 }}>
                {(selectedUser.name || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#1a1a2e', marginBottom: '2px' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{selectedUser.email}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { label: 'Streak', value: `${selectedUser.streak || 0}d`, color: '#F5A623' },
                  { label: 'Tasks', value: selectedUser.tasks_done || 0, color: '#4CAF50' },
                  { label: 'Score', value: `${selectedUser.score || 0}%`, color: '#7c3aed' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#f9f9f9', borderRadius: '10px', padding: '10px 16px', textAlign: 'center', border: '1px solid #eee' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Download button */}
              <button
                onClick={downloadUserData}
                disabled={downloading}
                style={{ background: downloading ? '#f5f5f7' : '#1a1a2e', border: '1px solid #eee', color: downloading ? '#aaa' : '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: downloading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}
              >
                {downloading ? '⏳ Preparing...' : '⬇ Export CSV'}
              </button>
              <button onClick={() => setSelectedUser(null)} style={{ background: '#f5f5f7', border: '1px solid #eee', color: '#888', width: 32, height: 32, borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>×</button>
            </div>

            {/* Meta row */}
            <div style={{ background: '#fff', padding: '12px 28px', borderBottom: '1px solid #e8e8e8', display: 'flex', gap: '32px', flexShrink: 0 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '3px' }}>Goal</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{selectedUser.goal || '—'}</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '3px' }}>Coach</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{coachEmoji(selectedUser.coach_style)} {selectedUser.coach_style || '—'}</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '3px' }}>Notifications</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: selectedUser.onesignal_id ? '#4CAF50' : '#f44' }}>
                  {selectedUser.onesignal_id ? '✓ Enabled' : '✗ Not enabled'}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '3px' }}>Joined</div>
                <div style={{ fontSize: '12px', color: '#555' }}>{selectedUser.joined_at ? new Date(selectedUser.joined_at).toLocaleDateString() : '—'}</div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 28px', display: 'flex', flexShrink: 0 }}>
              {[
                { id: 'tasks', label: `Task History (${selectedUser.history?.length || 0})` },
                { id: 'notifications', label: `Notifications (${selectedUser.notifLogs?.length || '…'})` },
              ].map(t => (
                <button key={t.id} onClick={() => handleTabChange(t.id as any)}
                  style={{ padding: '12px 20px', fontSize: '12px', fontWeight: 600, border: 'none', borderBottom: `2px solid ${detailTab === t.id ? '#1a1a2e' : 'transparent'}`, background: 'none', color: detailTab === t.id ? '#1a1a2e' : '#aaa', cursor: 'pointer' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>

              {detailTab === 'tasks' && (
                selectedUser.historyLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '13px' }}>Loading...</div>
                ) : !selectedUser.history || selectedUser.history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '13px' }}>No history yet.</div>
                ) : selectedUser.history.map((t, j) => (
                  <div key={j} style={{ background: '#fff', border: '1px solid #eee', borderLeft: `3px solid ${statusColor(t.status)}`, borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '.06em' }}>Day {t.day_number}</span>
                        <span style={{ fontSize: '11px', color: '#bbb' }}>{t.task_date}</span>
                        {t.completed_at && (
                          <span style={{ fontSize: '11px', color: '#4CAF50', fontWeight: 600 }}>✓ {fmtTime(t.completed_at)}</span>
                        )}
                        {t.chip_type === 'checkin' && (
                          <span style={{ fontSize: '10px', background: '#f3eeff', color: '#7c3aed', borderRadius: '6px', padding: '2px 7px', fontWeight: 600 }}>Check-in</span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor(t.status), background: statusBg(t.status), padding: '3px 10px', borderRadius: '6px' }}>
                        {statusLabel(t.status)}
                      </span>
                    </div>

                    {t.dash_message && (
                      <div style={{ background: '#1a1a2e', borderRadius: '8px', borderBottomLeftRadius: '2px', padding: '8px 12px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '3px' }}>Dash</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.8)', lineHeight: 1.5 }}>{t.dash_message}</div>
                      </div>
                    )}

                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5, marginBottom: (t.user_reply || t.hint_text || t.bonus_task_text) ? '10px' : 0 }}>
                      {t.task_text}
                    </div>

                    {t.user_reply && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: t.hint_text ? '8px' : 0 }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.06em' }}>Reply</span>
                        <span style={{ fontSize: '11px', color: '#555', background: '#f5f5f7', padding: '2px 8px', borderRadius: '6px' }}>{replyLabel(t.user_reply)}</span>
                      </div>
                    )}

                    {t.hint_text && (
                      <div style={{ background: '#fffbf0', borderLeft: '2px solid #F5A623', borderRadius: '0 8px 8px 0', padding: '8px 10px', marginBottom: t.bonus_task_text ? '8px' : 0 }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '3px' }}>User wrote</div>
                        <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>{t.hint_text}</div>
                      </div>
                    )}

                    {t.bonus_task_text && (
                      <div style={{ background: '#fffbf0', borderLeft: '2px solid #F5A623', borderRadius: '0 8px 8px 0', padding: '8px 10px' }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '3px' }}>
                          Bonus — {t.bonus_task_status || 'pending'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>{t.bonus_task_text}</div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {detailTab === 'notifications' && (
                selectedUser.notifLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '13px' }}>Loading...</div>
                ) : !selectedUser.notifLogs || selectedUser.notifLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '13px' }}>No notifications sent yet.</div>
                ) : selectedUser.notifLogs.map((n, j) => (
                  <div key={j} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '10px', padding: '12px 16px', marginBottom: '8px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, paddingTop: '2px' }}>
                      <span style={{ fontSize: '13px' }}>{tierLabel(n.tier).split(' ')[0]}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a2e' }}>{tierLabel(n.tier).split(' ').slice(1).join(' ')}</span>
                        <span style={{ fontSize: '10px', color: '#bbb' }}>{fmtTime(n.sent_at)}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.5 }}>{n.message}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '14px' }}>
            ← Select a user to view their history and notifications
          </div>
        )}
      </div>
    </div>
  )
}