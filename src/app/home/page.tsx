'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Zap, HelpCircle, MessageCircle } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

type CardState = 'task' | 'hint' | 'feedback' | 'bonus' | 'locked'
type Chip = 'nailed' | 'partial' | 'more' | ''

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cardState, setCardState] = useState<CardState>('task')
  const [selectedChip, setSelectedChip] = useState<Chip>('')
  const [showContext, setShowContext] = useState(false)
  const [contextNote, setContextNote] = useState('')
  const [showMomentum, setShowMomentum] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-150, 150], [-8, 8])
  const rightOpacity = useTransform(x, [0, 80, 150], [0, 0.8, 1])
  const leftOpacity = useTransform(x, [-150, -80, 0], [1, 0.8, 0])

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (!stored) { router.push('/onboarding'); return }
    setUser(JSON.parse(stored))
    const tutSeen = localStorage.getItem('stride_tutorial_seen')
    if (!tutSeen) { setShowTutorial(true); localStorage.setItem('stride_tutorial_seen', '1') }
  }, [router])

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 90) {
      animate(x, 500, { duration: 0.25 })
      setTimeout(() => { setCardState('feedback'); animate(x, 0, { duration: 0 }) }, 280)
    } else if (info.offset.x < -90) {
      animate(x, -500, { duration: 0.25 })
      setTimeout(() => { setCardState('hint'); animate(x, 0, { duration: 0 }) }, 280)
    } else {
      animate(x, 0, { duration: 0.3, type: 'spring', stiffness: 300 })
    }
  }

  const handleSubmitFeedback = () => {
    const now = new Date()
    const isBeforeNoon = now.getHours() < 12
    if (isBeforeNoon) setShowMomentum(true)
    else setCardState('locked')
  }

  const todayTask = "Open LinkedIn and update your headline to include your specific niche. Example: 'Helping [audience] achieve [outcome] | [your niche]'"
  const hintText = "It does not have to be perfect. It just has to exist. Done beats perfect every single time. Start with just your audience and what you help them do."

  if (!user) return null

  return (
    <div className="screen" style={{ background: '#0f1623' }}>

      {/* Tutorial overlay */}
      {showTutorial && (
        <div onClick={() => setShowTutorial(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease', maxWidth: '300px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👆</div>
            <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>
              How to use the action card
            </h3>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px' }}>✅</div>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Swipe right when done</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px' }}>💡</div>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Swipe left for a hint</p>
              </div>
            </div>
            <p style={{ color: '#F5A623', fontSize: '14px' }}>Tap anywhere to start</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: '#1a1a2e',
        padding: '52px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px', height: '40px', background: '#0f1623',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #F5A623',
          }}>
            <Zap size={18} color="#F5A623" fill="#F5A623" />
          </div>
          <div>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>Good morning</p>
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>{user.name || 'Nora'} 👋</h2>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ color: '#F5A623', fontWeight: 800, fontSize: '18px' }}>🔥 {user.streak || 0}</div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>day streak</div>
          </div>
        </div>

        {/* Phase progress bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Phase 1 — Foundation</span>
            <span style={{ color: '#F5A623', fontSize: '12px', fontWeight: 700 }}>42%</span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: '42%', background: '#F5A623', borderRadius: '2px' }} />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Dash message bubble */}
        <div style={{
          background: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          padding: '14px 16px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <div style={{
            width: '28px', height: '28px', background: '#0f1623',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid #F5A623', flexShrink: 0,
          }}>
            <Zap size={12} color="#F5A623" fill="#F5A623" />
          </div>
          <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: 1.6 }}>
            {cardState === 'task' && "Day 7. You are in the top tier of people who say they will do something and actually do it."}
            {cardState === 'hint' && "I hear you. Here is how we make this smaller."}
            {cardState === 'feedback' && "Done. Tell me how it went."}
            {cardState === 'bonus' && "You finished early and still had energy. That is the version of you we are building."}
            {cardState === 'locked' && "Streak locked. Rest up. Dash is back at 8 AM. 🔒"}
          </p>
        </div>

        {/* Swipe zone */}
        <div style={{ position: 'relative', minHeight: '220px' }}>

          {/* TASK CARD */}
          {cardState === 'task' && (
            <>
              {/* Swipe indicators behind the card */}
              <motion.div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                display: 'flex', alignItems: 'center', paddingLeft: '16px',
                opacity: leftOpacity, pointerEvents: 'none',
              }}>
                <div style={{
                  background: 'rgba(245,166,35,0.15)', border: '2px solid #F5A623',
                  borderRadius: '12px', padding: '12px 16px',
                  color: '#F5A623', fontWeight: 700, fontSize: '14px',
                }}>💡 Hint</div>
              </motion.div>
              <motion.div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0,
                display: 'flex', alignItems: 'center', paddingRight: '16px',
                opacity: rightOpacity, pointerEvents: 'none',
              }}>
                <div style={{
                  background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e',
                  borderRadius: '12px', padding: '12px 16px',
                  color: '#22c55e', fontWeight: 700, fontSize: '14px',
                }}>Done ✅</div>
              </motion.div>

              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                style={{
                  x, rotate,
                  background: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  cursor: 'grab',
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 10,
                }}
                whileTap={{ cursor: 'grabbing', scale: 1.01 }}
              >
                <div style={{ marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '2px',
                    color: '#1a1a2e', textTransform: 'uppercase',
                  }}>
                    TODAY'S TASK
                  </span>
                </div>
                <p style={{ color: '#0f1623', fontSize: '16px', fontWeight: 700, lineHeight: 1.5, marginBottom: '12px' }}>
                  {todayTask}
                </p>
                <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>~ 5 minutes</p>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '11px', color: '#94a3b8',
                }}>
                  <span>← Hint</span>
                  <span>Done →</span>
                </div>
              </motion.div>
            </>
          )}

          {/* HINT PANEL */}
          {cardState === 'hint' && (
            <div style={{
              background: 'white',
              border: '2px solid #F5A623',
              borderRadius: '20px',
              padding: '20px',
              animation: 'slideUp 0.3s ease',
            }}>
              <div style={{ color: '#F5A623', fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>
                💡 PERMISSION SLIP
              </div>
              <p style={{ color: '#0f1623', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
                {hintText}
              </p>
              <button
                onClick={() => setCardState('feedback')}
                style={{
                  width: '100%', background: '#1a1a2e', color: 'white',
                  border: 'none', borderRadius: '12px', padding: '14px',
                  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Done with the smaller version ✅
              </button>
            </div>
          )}

          {/* FEEDBACK PANEL */}
          {cardState === 'feedback' && (
            <div style={{
              background: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '20px',
              animation: 'slideUp 0.3s ease',
            }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
                How did it go?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {[
                  { id: 'nailed', label: '✅ Nailed it', desc: 'Completed as intended' },
                  { id: 'partial', label: '⏸️ Partial', desc: 'Did some, ran out of time' },
                  { id: 'more', label: '💬 Something else happened', desc: '' },
                ].map(chip => (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setSelectedChip(chip.id as Chip)
                      setShowContext(chip.id === 'more')
                    }}
                    style={{
                      background: selectedChip === chip.id ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1.5px solid ${selectedChip === chip.id ? '#F5A623' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '12px', padding: '12px 16px', cursor: 'pointer',
                      textAlign: 'left', color: 'white', fontSize: '14px', fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                  >
                    {chip.label}
                    {chip.desc && <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '8px' }}>{chip.desc}</span>}
                  </button>
                ))}
              </div>

              {/* Context sub-chips */}
              {showContext && (
                <div style={{ marginBottom: '12px', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['🔥 Did more than asked', '🚧 Hit a wall', '⏸️ Only got partway'].map(sub => (
                      <button key={sub} onClick={() => setContextNote(sub)}
                        style={{
                          background: contextNote === sub ? 'rgba(245,166,35,0.1)' : 'transparent',
                          border: `1px solid ${contextNote === sub ? '#F5A623' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
                          color: 'white', fontSize: '13px', textAlign: 'left',
                        }}
                      >{sub}</button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmitFeedback}
                disabled={!selectedChip}
                className="gold-btn"
                style={{ marginTop: '8px' }}
              >
                Submit
              </button>
            </div>
          )}

          {/* BONUS PANEL */}
          {cardState === 'bonus' && (
            <div style={{
              background: '#1a1a2e',
              border: '1.5px solid #F5A623',
              borderRadius: '20px',
              padding: '20px',
              animation: 'slideUp 0.3s ease',
            }}>
              <div style={{ color: '#F5A623', fontWeight: 700, marginBottom: '8px' }}>⚡ BONUS TASK</div>
              <p style={{ color: 'white', fontSize: '15px', lineHeight: 1.6, marginBottom: '16px' }}>
                You have momentum. Comment on 3 posts from people in your niche. Genuine comments only. No "Great post!" fluff.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setCardState('locked')} className="ghost-btn" style={{ flex: 1 }}>Skip</button>
                <button onClick={() => setCardState('locked')} className="gold-btn" style={{ flex: 2 }}>Done ✅</button>
              </div>
            </div>
          )}

          {/* LOCKED STATE */}
          {cardState === 'locked' && (
            <div style={{
              background: '#1a1a2e',
              borderRadius: '20px',
              padding: '32px 20px',
              textAlign: 'center',
              animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
              <div style={{ color: '#F5A623', fontSize: '28px', fontWeight: 900 }}>
                🔥 {(user.streak || 0) + 1}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>day streak</div>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>
                Streak locked for today.
              </p>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>
                Next task at 8:00 AM tomorrow
              </p>
            </div>
          )}
        </div>

        {/* Momentum window */}
        {showMomentum && cardState !== 'locked' && cardState !== 'bonus' && (
          <div style={{
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '20px',
            animation: 'slideUp 0.4s ease',
          }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>
              ⚡ Momentum Window
            </p>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
              You finished early. One more task available. Expires at midnight.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowMomentum(false); setCardState('locked') }} className="ghost-btn" style={{ flex: 1 }}>
                Not today
              </button>
              <button onClick={() => { setShowMomentum(false); setCardState('bonus') }} className="gold-btn" style={{ flex: 2 }}>
                Yes, more ⚡
              </button>
            </div>
          </div>
        )}

        {/* Progress stats */}
        <div style={{
          background: '#1a1a2e',
          borderRadius: '16px',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          textAlign: 'center',
        }}>
          {[
            { label: 'Completed', value: '24', emoji: '✅' },
            { label: 'Streak', value: `${(user.streak || 0)}d`, emoji: '🔥' },
            { label: 'Shields', value: '1', emoji: '🛡️' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: '18px' }}>{stat.emoji}</div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '20px' }}>{stat.value}</div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}