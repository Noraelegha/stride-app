'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

type Panel = 'task' | 'hint' | 'srp' | 'streakShow' | 'bonus' | 'locked'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [panel, setPanel] = useState<Panel>('task')
  const [showTut, setShowTut] = useState(true)
  const [pickedChip, setPickedChip] = useState('')
  const [showWall, setShowWall] = useState(false)
  const [pickedWall, setPickedWall] = useState('')
  const [wallNote, setWallNote] = useState('')
  const [isBeforeNoon, setIsBeforeNoon] = useState(false)
  const [bonusCompleted, setBonusCompleted] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)
  const bgDoneRef = useRef<HTMLDivElement>(null)
  const bgHintRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, curX: 0 })

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (!stored) { router.push('/onboarding'); return }
    setUser(JSON.parse(stored))
    setIsBeforeNoon(new Date().getHours() < 12)

    const dayLocked = localStorage.getItem('stride_day_locked')
    if (dayLocked === 'true') {
      setPanel('locked')
      localStorage.removeItem('stride_day_locked')
    }
  }, [router])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h >= 5  && h < 12) return { text: 'Good morning',   emoji: '🌞' }
    if (h >= 12 && h < 17) return { text: 'Good afternoon', emoji: '☀️' }
    if (h >= 17 && h < 21) return { text: 'Good evening',   emoji: '🌅' }
    return                         { text: 'Good night',     emoji: '🌙' }
  }

  const now = new Date()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - now.getDay() + i)
    return {
      day: dayNames[d.getDay()],
      num: d.getDate(),
      isToday: d.toDateString() === now.toDateString(),
    }
  })

  const startDrag = (x: number) => {
    if (panel !== 'task') return
    drag.current = { active: true, startX: x, curX: x }
  }
  const moveDrag = (x: number) => {
    if (!drag.current.active) return
    drag.current.curX = x
    const dx = x - drag.current.startX
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${dx}px) rotate(${dx * 0.03}deg)`
      cardRef.current.style.transition = 'none'
    }
    const r = Math.min(Math.abs(dx) / 100, 1)
    if (bgDoneRef.current) bgDoneRef.current.style.opacity = dx > 0 ? String(r) : '0'
    if (bgHintRef.current) bgHintRef.current.style.opacity = dx < 0 ? String(r) : '0'
  }
  const endDrag = () => {
    if (!drag.current.active) return
    drag.current.active = false
    const dx = drag.current.curX - drag.current.startX
    if (dx > 80) {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform .28s ease-in, opacity .28s'
        cardRef.current.style.transform = 'translateX(500px) rotate(20deg)'
        cardRef.current.style.opacity = '0'
      }
      setTimeout(() => {
        setPanel('srp')
        if (bgDoneRef.current) bgDoneRef.current.style.opacity = '0'
      }, 300)
    } else if (dx < -80) {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform .28s ease-in, opacity .28s'
        cardRef.current.style.transform = 'translateX(-500px) rotate(-20deg)'
        cardRef.current.style.opacity = '0'
      }
      setTimeout(() => {
        setPanel('hint')
        if (bgHintRef.current) bgHintRef.current.style.opacity = '0'
      }, 300)
    } else {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform .36s cubic-bezier(.34,1.56,.64,1)'
        cardRef.current.style.transform = 'none'
      }
      if (bgDoneRef.current) bgDoneRef.current.style.opacity = '0'
      if (bgHintRef.current) bgHintRef.current.style.opacity = '0'
    }
  }

  const wallPlaceholders: Record<string, string> = {
    more:    'What did you do beyond the task? Even small details help Dash build on it tomorrow',
    blocked: 'What got in the way? Could not start, something came up, or got stuck mid task?',
    partial: 'Where did you get to and what is left? Dash will pick it up from there tomorrow',
  }

  const canSubmit = !!pickedChip && (!showWall || !!pickedWall)

  const handleSubmit = () => {
    setIsBeforeNoon(new Date().getHours() < 12)
    setPanel('streakShow')
  }

  if (!user) return null

  if (panel === 'streakShow') {
    return (
      <div style={{ flex: 1, minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center', gap: '14px' }}>
        <div style={{ width: 72, height: 72, background: '#FF9500', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
          <svg viewBox="0 0 28 28" width="32" height="32" fill="none">
            <polyline points="5,14 11,20 23,8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🔥</span>
          <span style={{ fontSize: '32px', fontWeight: 900, color: '#1a1a2e' }}>{(user?.streak || 7) + 1} days</span>
        </div>
        <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.6, maxWidth: '300px', margin: 0 }}>
          {(user?.streak || 7) + 1} days. You are in the top tier of people who say they will do something and actually do it. Dash sees you. 🏆
        </p>
        {isBeforeNoon && (
          <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: '16px', padding: '16px', width: '100%', maxWidth: '320px', textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e', marginBottom: '5px' }}>You finished early ⚡</div>
            <div style={{ fontSize: '13px', color: '#777', lineHeight: 1.5, marginBottom: '14px' }}>
              Momentum window open. Want to go deeper today? Bonus task expires at midnight.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setPanel('bonus')} style={{ flex: 1, background: '#1a1a2e', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                Yes, more
              </button>
              <button onClick={() => setPanel('locked')} style={{ flex: 1, background: '#fff', border: '1.5px solid #eee', padding: '12px', borderRadius: '12px', fontSize: '14px', color: '#888', cursor: 'pointer' }}>
                Not today
              </button>
            </div>
          </div>
        )}
        {!isBeforeNoon && (
          <button onClick={() => setPanel('locked')} style={{ background: '#1a1a2e', border: 'none', padding: '14px 40px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: '#fff', cursor: 'pointer', marginTop: '8px' }}>
            See you tomorrow ☀️
          </button>
        )}
        {isBeforeNoon && <p style={{ fontSize: '13px', color: '#bbb', margin: 0 }}>See you tomorrow ☀️</p>}
      </div>
    )
  }

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>

      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '52px 22px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '11px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.45)', marginBottom: '2px' }}>
              {getGreeting().text} {getGreeting().emoji}
            </div>
            <div style={{ fontSize: '21px', fontWeight: 800, color: '#fff' }}>Hi, {user.name || 'Nora'}</div>
          </div>
          <div style={{ width: 40, height: 40, background: '#F5A623', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#1a1a2e' }}>
            {(user.name || 'N')[0].toUpperCase()}
          </div>
        </div>

        {/* 7-day week strip */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '11px' }}>
          {weekDates.map((d, i) => (
            <div key={i} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '7px 4px', borderRadius: '10px',
              background: d.isToday ? '#F5A623' : 'transparent',
            }}>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 500, color: d.isToday ? 'rgba(26,26,46,.6)' : 'rgba(255,255,255,.4)' }}>
                {d.day}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: d.isToday ? '#1a1a2e' : '#fff' }}>
                {d.num}
              </div>
            </div>
          ))}
        </div>

        {/* Streak + phase */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,.1)', borderRadius: '16px', padding: '5px 11px' }}>
            <span>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{user.streak || 7} days</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>streak</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Phase 1</span>
            <div style={{ width: 54, height: 3, background: 'rgba(255,255,255,.12)', borderRadius: 2 }}>
              <div style={{ width: '42%', height: '100%', background: '#F5A623', borderRadius: 2 }} />
            </div>
            <strong style={{ fontSize: 10, color: '#F5A623' }}>42%</strong>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '15px 18px', display: 'flex', flexDirection: 'column', gap: '13px' }}>

          {/* Today's task */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '9px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Today&apos;s task</div>
              <div style={{ fontSize: '12px', color: '#888' }}>See all</div>
            </div>

            {/* Swipe zone */}
            <div style={{ position: 'relative', height: '320px', overflow: 'hidden', borderRadius: '20px' }}>

              {/* BG: Right swipe = Done (green, label on right) */}
              <div ref={bgDoneRef} style={{
                position: 'absolute', inset: 0, background: '#4CAF50', borderRadius: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: '26px', opacity: 0, zIndex: 1,
              }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 7 }}>✅ Done!</div>
              </div>

              {/* BG: Left swipe = Hint (neutral, label on left) */}
              <div ref={bgHintRef} style={{
                position: 'absolute', inset: 0, background: '#f0f0f5', border: '1.5px solid #ddd',
                borderRadius: '20px', display: 'flex', alignItems: 'center',
                justifyContent: 'flex-start', paddingLeft: '26px', opacity: 0, zIndex: 1,
              }}>
                <div style={{ color: '#888', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>💡 Help</div>
              </div>

              {/* TASK CARD */}
              {panel === 'task' && (
                <div
                  ref={cardRef}
                  onMouseDown={e => startDrag(e.clientX)}
                  onMouseMove={e => moveDrag(e.clientX)}
                  onMouseUp={endDrag}
                  onMouseLeave={endDrag}
                  onTouchStart={e => startDrag(e.touches[0].clientX)}
                  onTouchMove={e => moveDrag(e.touches[0].clientX)}
                  onTouchEnd={endDrag}
                  style={{
                    position: 'absolute', inset: 0, background: '#fff',
                    borderRadius: '20px', border: '1.5px solid #1a1a2e',
                    padding: '16px 18px', cursor: 'grab', userSelect: 'none',
                    zIndex: 2, display: 'flex', flexDirection: 'column', gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', letterSpacing: '.1em', textTransform: 'uppercase' }}>Day 7 ⚡</div>
                  <div style={{ background: '#f9f9f9', borderRadius: '9px', borderBottomLeftRadius: '2px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Dash</div>
                    <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.45, margin: 0 }}>Day 7 and you are still here. That already puts you ahead of most. Let&apos;s make it count. 🔥</p>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e', lineHeight: 1.45, flex: 1 }}>
                    Open LinkedIn and send a connection request to 3 people in your consulting niche. Just the request. No message needed.
                  </div>
                  <div style={{ fontSize: '11px', color: '#bbb' }}>~5 minutes</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <span style={{ fontSize: '9px', color: '#ddd' }}>← Help</span>
                    <span style={{ fontSize: '9px', color: '#ddd' }}>Done →</span>
                  </div>
                </div>
              )}

              {/* HINT PANEL */}
              {panel === 'hint' && (
                <div style={{
                  position: 'absolute', inset: 0, background: '#fff',
                  borderRadius: '20px', border: '1.5px solid #F5A623',
                  padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 5,
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', letterSpacing: '.1em', textTransform: 'uppercase' }}>Hint from Dash 💡</div>
                  <div style={{ background: '#fffbf0', borderLeft: '3px solid #F5A623', borderRadius: '0 10px 10px 0', padding: '10px 12px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', marginBottom: '2px' }}>Dash</div>
                    <p style={{ fontSize: '12px', color: '#444', lineHeight: 1.45, margin: 0 }}>
                      It does not have to be perfect. Done beats perfect every single time. Forget the full task. Here is the smaller version.
                    </p>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a2e', lineHeight: 1.45, flex: 1 }}>
                    Open LinkedIn and look at ONE person&apos;s profile in your consulting niche. Do not send anything. Just look. That is it.
                  </div>
                  <div style={{ fontSize: '11px', color: '#bbb' }}>~2 minutes</div>
                  <button
                    onClick={() => setPanel('srp')}
                    style={{ background: '#1a1a2e', border: 'none', padding: '13px', borderRadius: '13px', fontSize: '14px', fontWeight: 700, color: '#fff', cursor: 'pointer', marginTop: 'auto' }}
                  >
                    ✓ Done
                  </button>
                </div>
              )}

              {/* SRP — fades in inside swipe zone */}
              <div style={{
                position: 'absolute', inset: 0, background: '#fff',
                borderRadius: '20px', border: '1.5px solid #1a1a2e',
                padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px',
                overflowY: 'auto',
                opacity: panel === 'srp' ? 1 : 0,
                pointerEvents: panel === 'srp' ? 'auto' : 'none',
                transition: 'opacity .3s ease',
                zIndex: panel === 'srp' ? 20 : 0,
              }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', letterSpacing: '.1em', textTransform: 'uppercase' }}>Dash</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>How did it go with the LinkedIn connections?</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { id: 'nailed',  ico: '✅', lbl: 'Sent all 3. Nailed it.',   wall: false },
                    { id: 'partial', ico: '⏱',  lbl: 'Only managed 1 or 2',     wall: false },
                    { id: 'other',   ico: '💬', lbl: 'Something else happened.', wall: true  },
                  ].map(c => (
                    <div
                      key={c.id}
                      onClick={() => { setPickedChip(c.id); setShowWall(c.wall); setPickedWall(''); setWallNote('') }}
                      style={{
                        border: `1.5px solid ${pickedChip === c.id ? '#1a1a2e' : '#eee'}`,
                        borderRadius: '12px', padding: '10px 13px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '9px',
                        background: pickedChip === c.id ? '#f5f5fa' : '#fff', transition: 'all .15s',
                      }}
                    >
                      <span style={{ fontSize: 17, width: 24, textAlign: 'center' }}>{c.ico}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{c.lbl}</span>
                    </div>
                  ))}
                </div>

                {showWall && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a2e' }}>What happened?</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'more',    ico: '🔥', lbl: 'Did more' },
                        { id: 'blocked', ico: '🚧', lbl: 'Hit a wall' },
                        { id: 'partial', ico: '⏸',  lbl: 'Partial' },
                      ].map(w => (
                        <div
                          key={w.id}
                          onClick={() => setPickedWall(w.id)}
                          style={{
                            border: `1.5px solid ${pickedWall === w.id ? '#1a1a2e' : '#eee'}`,
                            borderRadius: '20px', padding: '6px 12px', fontSize: '12px',
                            fontWeight: 600, color: pickedWall === w.id ? '#1a1a2e' : '#555',
                            cursor: 'pointer', background: pickedWall === w.id ? '#f5f5fa' : '#fff',
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                          }}
                        >
                          {w.ico} {w.lbl}
                        </div>
                      ))}
                    </div>
                    {pickedWall && (
                      <textarea
                        rows={2}
                        placeholder={wallPlaceholders[pickedWall]}
                        value={wallNote}
                        onChange={e => setWallNote(e.target.value)}
                        style={{ border: '1.5px solid #eee', borderRadius: '10px', padding: '8px 11px', fontSize: '12px', color: '#1a1a2e', outline: 'none', fontFamily: 'inherit', resize: 'none', width: '100%' }}
                      />
                    )}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{ background: '#1a1a2e', border: 'none', padding: '11px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#fff', cursor: canSubmit ? 'pointer' : 'default', opacity: canSubmit ? 1 : 0.3, marginTop: 'auto', transition: 'opacity .2s' }}
                >
                  Submit →
                </button>
              </div>

              {/* BONUS PANEL */}
              {panel === 'bonus' && (
                <div style={{
                  position: 'absolute', inset: 0, background: '#fff',
                  borderRadius: '20px', border: '1.5px solid #F5A623',
                  padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 5,
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', letterSpacing: '.1em', textTransform: 'uppercase' }}>⚡ Bonus task</div>
                  <div style={{ background: '#f9f9f9', borderRadius: '9px', borderBottomLeftRadius: '2px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: '#1a1a2e', textTransform: 'uppercase', marginBottom: '2px' }}>Dash</div>
                    <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.45, margin: 0 }}>You are on a roll. Build on what you just did. Expires at midnight.</p>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.45, flex: 1 }}>
                    Leave a meaningful comment on the post of one person you just connected with. One sentence. That is it.
                  </div>
                  <div style={{ fontSize: '11px', color: '#bbb' }}>~5 minutes</div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <button
                      onClick={() => { setBonusCompleted(false); setPanel('locked') }}
                      style={{ flex: 1, border: '1.5px solid #eee', background: '#fff', padding: '12px', borderRadius: '13px', fontSize: '13px', color: '#888', cursor: 'pointer' }}
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => { setBonusCompleted(true); setPanel('locked') }}
                      style={{ flex: 2, background: '#1a1a2e', border: 'none', padding: '12px', borderRadius: '13px', fontSize: '14px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}
                    >
                      ✓ Done
                    </button>
                  </div>
                </div>
              )}

              {/* LOCKED */}
              {panel === 'locked' && (
                <div style={{
                  position: 'absolute', inset: 0, background: '#fff',
                  borderRadius: '20px', border: `1.5px solid ${bonusCompleted ? '#F5A623' : '#4CAF50'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '10px', padding: '24px', textAlign: 'center', zIndex: 5,
                }}>
                  <div style={{ fontSize: '44px' }}>🔒</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '22px' }}>🔥</span>
                    <span style={{ fontSize: '28px', fontWeight: 900, color: '#1a1a2e' }}>{(user?.streak || 7) + 1} days</span>
                  </div>
                  <p style={{ color: '#555', fontSize: '15px', margin: 0, fontWeight: 500 }}>
                    {bonusCompleted ? 'Bonus locked. Extra mile taken today.' : 'Streak locked. The goal is moving.'}
                  </p>
                </div>
              )}

              {/* TUTORIAL */}
              {showTut && panel === 'task' && (
                <div
                  onClick={() => setShowTut(false)}
                  style={{
                    position: 'absolute', inset: 0, background: 'rgba(26,26,46,.88)',
                    borderRadius: '20px', zIndex: 30, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px', color: '#F5A623' }}>←</span>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Swipe left for help</span>
                  </div>
                  <div style={{ width: '40px', height: '1.5px', background: 'rgba(255,255,255,.2)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Swipe right for done</span>
                    <span style={{ fontSize: '22px', color: '#F5A623' }}>→</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginTop: '6px' }}>Tap anywhere to dismiss</div>
                </div>
              )}
            </div>
          </div>

          {/* Your progress */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', marginBottom: '9px' }}>Your progress</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '22px', marginBottom: '5px' }}>🔥</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#F5A623' }}>7</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Day streak</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '14px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <span style={{ display: 'inline-flex', width: '26px', height: '26px', background: '#4CAF50', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                      <polyline points="3,8 6.5,12 13,5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e' }}>23</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Tasks done</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '22px', marginBottom: '5px' }}>📊</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e' }}>84%</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Score</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '22px', color: '#FF9500', marginBottom: '5px' }}>⚡</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e' }}>3</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Bonus tasks</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '14px', borderLeft: '3px solid #4A9EDB' }}>
                <div style={{ fontSize: '22px', marginBottom: '5px' }}>💧</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#4A9EDB' }}>1</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Shields left</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <BottomNav />
    </div>
  )
}