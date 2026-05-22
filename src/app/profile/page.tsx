'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronDown } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const COACH_OPTIONS = [
  { id: 'tough',     emoji: '💪', label: 'No-nonsense coach',     sub: 'Direct. Unfiltered. Pure execution.' },
  { id: 'strategic', emoji: '🤝', label: 'Strategic partner',     sub: 'Professional. ROI-focused.' },
  { id: 'friend',    emoji: '😏', label: 'Sarcastic best friend', sub: 'Jokes with accountability.' },
  { id: 'mentor',    emoji: '🧘', label: 'Gentle mentor',         sub: 'Encouragement first.' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [editCoach, setEditCoach] = useState(false)
  const [morningTime, setMorningTime] = useState('08:00')
  const [eveningTime, setEveningTime] = useState('20:00')
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) {
      const u = JSON.parse(stored)
      setUser(u)
      if (u.morningReminder) setMorningTime(u.morningReminder)
      if (u.eveningReminder) setEveningTime(u.eveningReminder)
    }
  }, [])

  const saveUser = (updates: any) => {
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem('stride_user', JSON.stringify(updated))
    setSavedMsg('Saved')
    setTimeout(() => setSavedMsg(''), 1800)
  }

  const handleCoachSelect = (id: string) => {
    saveUser({ coachStyle: id })
    setEditCoach(false)
  }

  const handleSignOut = () => {
    localStorage.removeItem('stride_user')
    router.push('/')
  }

  const coachLabel = COACH_OPTIONS.find(c => c.id === user?.coachStyle)

  const displayGoal = user?.goalShort || user?.goal || 'Your goal'
  const displayPrize = user?.bigPrize || 'Your big prize'

  if (!user) return null

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>

      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '52px 22px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: 52, height: 52, background: '#F5A623', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 20, color: '#1a1a2e', flexShrink: 0,
          }}>
            {(user?.name || 'S')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)', marginTop: '2px' }}>
              {user?.persona === 'builder' ? 'Solo-Hustler' : user?.persona === 'learner' ? 'Learner' : 'Career Pivot'} · Day {(user?.tasksDone || 0) + 1}
            </div>
          </div>
          {savedMsg && (
            <div style={{ marginLeft: 'auto', background: '#22c55e', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px' }}>
              {savedMsg}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { val: user?.streak || 0,                   lbl: 'streak', ico: '🔥' },
            { val: user?.tasksDone || 0,                lbl: 'tasks',  ico: '✅' },
            { val: `${user?.score || 0}%`,              lbl: 'score',  ico: '📊' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,.1)', borderRadius: '12px', padding: '11px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.45)', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                <span>{s.ico}</span><span>{s.lbl}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Active goal */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Active Goal
          </div>
          <div style={{
            fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {displayGoal}
          </div>
          <div style={{
            fontSize: '12px', color: '#888',
            display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '14px',
          }}>
            <span style={{ flexShrink: 0 }}>🎯</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayPrize}
            </span>
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>
            Phase {user?.phase || 1}: {user?.phase === 2 ? 'Momentum' : user?.phase === 3 ? 'Acceleration' : 'Foundation'}
          </div>
          <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px' }}>
            <div style={{ width: `${user?.score || 0}%`, height: '100%', background: '#1a1a2e', borderRadius: '2px', transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '4px', textAlign: 'right' }}>{user?.score || 0}%</div>
        </div>

        {/* Dash settings */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', padding: '14px 16px 8px' }}>
            Dash Settings
          </div>

          {/* Coach style — tappable */}
          <div onClick={() => setEditCoach(!editCoach)} style={{ borderTop: '1px solid #f5f5f5', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px' }}>
              <div style={{ width: 34, height: 34, background: '#f5f5f7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                {coachLabel?.emoji || '🎭'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>Coach style</div>
                <div style={{ fontSize: '11px', color: '#888' }}>How Dash pushes you</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>{coachLabel?.label || 'Select'}</span>
                {editCoach ? <ChevronDown size={14} color="#ccc" /> : <ChevronRight size={14} color="#ccc" />}
              </div>
            </div>

            {editCoach && (
              <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}
                onClick={e => e.stopPropagation()}>
                {COACH_OPTIONS.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleCoachSelect(c.id)}
                    style={{
                      border: `1.5px solid ${user?.coachStyle === c.id ? '#1a1a2e' : '#eee'}`,
                      borderRadius: '12px', padding: '11px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: user?.coachStyle === c.id ? '#f5f5fa' : '#fff',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{c.emoji}</span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{c.label}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Morning reminder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderTop: '1px solid #f5f5f5' }}>
            <div style={{ width: 34, height: 34, background: '#fff8ec', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
              🌅
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>Morning check-in</div>
              <div style={{ fontSize: '11px', color: '#888' }}>When your task drops daily</div>
            </div>
            <input
              type="time"
              value={morningTime}
              onChange={e => { setMorningTime(e.target.value); saveUser({ morningReminder: e.target.value }) }}
              style={{ border: '1px solid #eee', borderRadius: '8px', padding: '5px 8px', fontSize: '13px', color: '#1a1a2e', background: '#fafafa', cursor: 'pointer', outline: 'none' }}
            />
          </div>

          {/* Evening reminder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderTop: '1px solid #f5f5f5' }}>
            <div style={{ width: 34, height: 34, background: '#eef4ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
              🌙
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>Evening nudge</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Reminder if task not done</div>
            </div>
            <input
              type="time"
              value={eveningTime}
              onChange={e => { setEveningTime(e.target.value); saveUser({ eveningReminder: e.target.value }) }}
              style={{ border: '1px solid #eee', borderRadius: '8px', padding: '5px 8px', fontSize: '13px', color: '#1a1a2e', background: '#fafafa', cursor: 'pointer', outline: 'none' }}
            />
          </div>
        </div>

        {/* Account */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', padding: '14px 16px 8px' }}>
            Account
          </div>

          {/* Email — read only */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f5f5f5' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>Email</div>
            <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
              {user?.email || '—'}
            </div>
          </div>

          {/* Upgrade to Pro */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderTop: '1px solid #f5f5f5' }}>
            <div style={{ width: 34, height: 34, background: '#1a1a2e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Upgrade to Pro</div>
              <div style={{ fontSize: '11px', color: '#888' }}>3 goals · Infinite memory · Analytics</div>
            </div>
            <div style={{ background: '#1a1a2e', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}>$12/mo ›</div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          style={{ background: 'none', border: 'none', color: '#f44', fontSize: '14px', cursor: 'pointer', padding: '8px 0', textAlign: 'left' }}
        >
          Sign out
        </button>

      </div>
      <BottomNav />
    </div>
  )
}