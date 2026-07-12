'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'
import ThemeColor from '@/components/ThemeColor'

type LogEntry = {
  tier: string
  message: string
  sent_at: string
}

const getTierMeta = (tier: string, message: string) => {
  if (tier === 'event') {
    if (message.includes('🏆') || message.includes('days in a row') || message.includes('streak')) {
      return { ico: '🔥', bg: '#fff4ec' }
    }
    if (message.includes('Shield earned') || message.includes('shield') || message.includes('🛡')) {
      return { ico: '🛡️', bg: '#eef4ff' }
    }
    return { ico: '⚡', bg: '#f3eeff' }
  }
  if (tier === 'morning') return { ico: '🌅', bg: '#fff8ec' }
  if (tier === 'midday') return { ico: '☀️', bg: '#fffbec' }
  if (tier === 'afternoon') return { ico: '⏳', bg: '#fff4ec' }
  if (tier === 'evening') return { ico: '🌙', bg: '#eef4ff' }
  if (tier === 'night') return { ico: '🔔', bg: '#f5f5f7' }
  return { ico: '⚡', bg: '#f3eeff' }
}

const formatTime = (sent_at: string) => {
  const date = new Date(sent_at)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const isSignificant = (entry: LogEntry) => {
  // Always show event notifications
  if (entry.tier === 'event') return true
  // Show escalated reminders — these signal something meaningful happened
  const msg = entry.message.toLowerCase()
  if (msg.includes('days') && (msg.includes('consecutive') || msg.includes('pattern') || msg.includes('quiet'))) return true
  if (msg.includes('final call')) return true
  if (msg.includes('shield')) return true
  return false
}

export default function AlertsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [allLogs, setAllLogs] = useState<LogEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (!stored) { setLoaded(true); return }
    const localUser = JSON.parse(stored)

    const fetchLogs = async () => {
      try {
        const { data } = await supabase
          .from('notification_logs')
          .select('tier, message, sent_at')
          .eq('user_email', localUser.email)
          .order('sent_at', { ascending: false })
          .limit(100)

        const entries = data || []
        setAllLogs(entries)
        setLogs(entries.filter(isSignificant))
      } catch (e) {
        console.error('Alerts fetch failed:', e)
      } finally {
        setLoaded(true)
      }
    }

    fetchLogs()
  }, [])

  const displayedLogs = showAll ? allLogs : logs

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>
      <ThemeColor color="#1a1a2e" />
      <div style={{ background: '#1a1a2e', padding: '52px 22px 22px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', margin: 0 }}>Alerts</h1>
          {allLogs.length > 0 && (
            <button
              onClick={() => setShowAll(v => !v)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
            >
              {showAll ? 'Highlights' : 'All'}
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: '#f5f5f7', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!loaded ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>Loading...</p>
          </div>
        ) : displayedLogs.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 28px', textAlign: 'center', gap: '12px' }}>
            <div style={{ fontSize: '40px' }}>🔔</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e' }}>No alerts yet</div>
            <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.6, margin: 0, maxWidth: '240px' }}>
              Complete tasks, hit streaks, and earn shields — your milestones will show up here.
            </p>
          </div>
        ) : (
          <>
            {displayedLogs.map((entry, i) => {
              const { ico, bg } = getTierMeta(entry.tier, entry.message)
              const isEvent = entry.tier === 'event'
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: '16px', padding: '14px 16px',
                  display: 'flex', gap: '13px', alignItems: 'flex-start',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  borderLeft: isEvent ? '3px solid #F5A623' : 'none',
                }}>
                  <div style={{
                    width: 42, height: 42, background: bg, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '19px', flexShrink: 0,
                  }}>
                    {ico}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: '#1a1a2e', lineHeight: 1.55, marginBottom: '5px' }}>
                      {entry.message}
                    </div>
                    <div style={{ fontSize: '11px', color: '#bbb' }}>
                      {formatTime(entry.sent_at)}
                      {entry.tier !== 'event' && (
                        <span style={{ marginLeft: '6px', color: '#ddd' }}>· {entry.tier}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {!showAll && allLogs.length > logs.length && (
              <button
                onClick={() => setShowAll(true)}
                style={{ background: '#fff', border: '1.5px solid #eee', borderRadius: '14px', padding: '13px', fontSize: '13px', fontWeight: 600, color: '#888', cursor: 'pointer', width: '100%' }}
              >
                Show all {allLogs.length} notifications
              </button>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}