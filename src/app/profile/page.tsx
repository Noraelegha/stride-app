'use client'
import MarqueeText from '@/components/MarqueeText'
import ThemeColor from '@/components/ThemeColor'
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
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) {
      const u = JSON.parse(stored)
      setUser(u)
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

  const handleSignOut = async () => {
    try {
      const OneSignal = (await import('react-onesignal')).default
      await OneSignal.logout()
    } catch (e) {
      console.error('OneSignal logout failed:', e)
    }
    localStorage.removeItem('stride_user')
    router.push('/')
  }

  const coachLabel = COACH_OPTIONS.find(c => c.id === user?.coachStyle)

  if (!user) return null

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>
      <ThemeColor color="#1a1a2e" />

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
            { val: user?.streak || 0,      lbl: 'streak', ico: '🔥' },
            { val: user?.tasksDone || 0,   lbl: 'tasks',  ico: '✅' },
            { val: `${user?.score || 0}%`, lbl: 'score',  ico: '📊' },
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 76px' }}>

        {/* Active goal */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Active Goal
          </div>
          <MarqueeText
            text={user?.goalShort || user?.goal || 'Your goal'}
            style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '14px', overflow: 'hidden' }}>
            <span style={{ flexShrink: 0, fontSize: '12px' }}>🎯</span>
            <MarqueeText
              text={user?.prizeShort || user?.bigPrize || 'Your big prize'}
              style={{ fontSize: '12px', color: '#888', flex: 1 }}
            />
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>
            Phase {user?.phase || 1}: {user?.phase === 2 ? 'Momentum' : user?.phase === 3 ? 'Acceleration' : 'Foundation'}
          </div>
          {(() => {
            const calculatedPhase = (user?.tasksDone || 0) >= 60 ? 3 : (user?.tasksDone || 0) >= 30 ? 2 : 1
            const tasksInPhase = Math.max(0, (user?.tasksDone || 0) - ((calculatedPhase - 1) * 30))
            const phaseProgress = Math.min(Math.round((tasksInPhase / 30) * 100), 100)
            return (
              <>
                <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px' }}>
                  <div style={{ width: `${phaseProgress}%`, height: '100%', background: '#1a1a2e', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px', textAlign: 'right' }}>{phaseProgress}%</div>
              </>
            )
          })()}
        </div>

        {/* Dash settings */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'visible', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', padding: '14px 16px 8px' }}>
            Dash Settings
          </div>

          {/* Coach style */}
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

          {/* Notification schedule — informational only */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderTop: '1px solid #f5f5f5' }}>
            <div style={{ width: 34, height: 34, background: '#f0f6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
              🔔
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>Notifications</div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px', lineHeight: 1.5 }}>
                Dash checks in at 8am, 12pm, 3pm, 7pm and 10pm daily. Urgency increases if your task is still open.
              </div>
            </div>
          </div>
        </div>

        {/* Account */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', padding: '14px 16px 8px' }}>
            Account
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f5f5f5' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '6px' }}>Email</div>
            <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
              {user?.email || '—'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderTop: '1px solid #f5f5f5' }}>
            <div style={{ width: 34, height: 34, background: '#1a1a2e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Upgrade to Pro</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Full hint toolkit · Advanced coaching · Priority features</div>
            </div>
            <div style={{ background: '#1a1a2e', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '5px 10px', borderRadius: '8px', cursor: 'pointer' }}>Pro ›</div>
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