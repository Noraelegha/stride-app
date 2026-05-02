'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Zap } from 'lucide-react'

// ─── Step data ──────────────────────────────────────────────────────────────
const PERSONAS = [
  { id: 'hustler',  emoji: '🔨', label: "I'm building something",      sub: 'A brand, business, or side hustle' },
  { id: 'learner',  emoji: '📚', label: "I'm studying or learning",     sub: 'Exam, certification, or new skill' },
  { id: 'pivot',    emoji: '🔄', label: "I'm changing direction",       sub: 'Career change or big life move' },
]

const DOMAIN_CHIPS: Record<string, string[]> = {
  hustler: ['Social media', 'Freelancing', 'E-commerce', 'Service business', 'Content creation', 'Consulting'],
  learner: ['Tech / Coding', 'Professional cert', 'Language', 'Creative skill', 'Academic exam', 'Other'],
  pivot:   ['New career field', 'Relocating', 'Starting over', 'Back to school', 'Entrepreneurship', 'Other'],
}

const COACH_STYLES = [
  { id: 'sarcastic',  emoji: '😏', label: 'Sarcastic Best Friend',  sub: 'Accountability with humour' },
  { id: 'strategic',  emoji: '🤝', label: 'Strategic Partner',      sub: 'Professional. ROI-focused' },
  { id: 'mentor',     emoji: '🧘', label: 'Gentle Mentor',          sub: 'Encouragement first' },
  { id: 'tough',      emoji: '💪', label: 'No-Nonsense Coach',      sub: 'Direct. Unfiltered. Results only' },
]

const TIME_OPTIONS = [
  { id: '5',   label: '5 minutes',   sub: 'Just a quick win' },
  { id: '15',  label: '15 minutes',  sub: 'Focused micro-session' },
  { id: '30',  label: '30 minutes',  sub: 'Real slot for this' },
  { id: '60',  label: '1 hour+',     sub: 'Fully committed' },
]

const PRIOR_OPTIONS = [
  { id: 'fresh',    label: 'No, starting from zero',         sub: '' },
  { id: 'started',  label: "Yes, I've made some progress",   sub: '' },
  { id: 'reset',    label: 'Been at this a while. Need reset', sub: '' },
]

// ─── Component ──────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 7

  const [data, setData] = useState({
    persona: '',
    domain: '',
    goal: '',
    prior: '',
    priorDetail: '',
    bigPrize: '',
    urgency: '',
    personalWhy: '',
    coachStyle: '',
    dailyTime: '',
  })

  const update = (key: string, value: string) =>
    setData((d) => ({ ...d, [key]: value }))

  const canNext = () => {
    if (step === 1) return !!data.persona
    if (step === 2) return !!data.goal
    if (step === 3) return !!data.prior
    if (step === 4) return !!data.bigPrize
    if (step === 5) return !!data.coachStyle
    if (step === 6) return !!data.dailyTime
    return true
  }

  const handleFinish = () => {
    const user = {
      ...data,
      name: 'User',
      streak: 0,
      phase: 1,
      joinedAt: new Date().toISOString(),
    }
    localStorage.setItem('stride_user', JSON.stringify(user))
    router.push('/locked-in')
  }

  return (
    <div className="screen" style={{ background: '#0f1623' }}>
      {/* Header */}
      <div style={{
        padding: '52px 20px 16px',
        background: '#1a1a2e',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: '3px',
                  borderRadius: '2px',
                  background: i < step ? '#F5A623' : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>
              Step {step} of {totalSteps}
            </p>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', animation: 'fadeIn 0.3s ease' }}>

        {/* STEP 1 — Persona */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '8px' }}>
              <Zap size={28} color="#F5A623" fill="#F5A623" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              Welcome to Stride.
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '28px', lineHeight: 1.6 }}>
              I am Dash. Before I can build your map, I need to understand your mission. Which of these sounds like you right now?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => update('persona', p.id)}
                  style={{
                    background: data.persona === p.id ? 'rgba(245,166,35,0.15)' : '#1a1a2e',
                    border: `1.5px solid ${data.persona === p.id ? '#F5A623' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{p.emoji}</span>
                  <div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{p.label}</div>
                    <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>{p.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Goal */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              What is the goal we are working on?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>
              Be specific. Messy is fine. Dash will sharpen it.
            </p>

            {/* Domain chips */}
            {data.persona && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  What space are you building in?
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DOMAIN_CHIPS[data.persona]?.map(chip => (
                    <button
                      key={chip}
                      onClick={() => update('domain', chip)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '20px',
                        border: `1.5px solid ${data.domain === chip ? '#F5A623' : 'rgba(255,255,255,0.15)'}`,
                        background: data.domain === chip ? 'rgba(245,166,35,0.15)' : 'transparent',
                        color: data.domain === chip ? '#F5A623' : '#94a3b8',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              value={data.goal}
              onChange={e => update('goal', e.target.value)}
              placeholder={
                data.persona === 'learner'
                  ? 'e.g. Get my Google Project Management certificate by June'
                  : data.persona === 'pivot'
                  ? 'e.g. Land a UX design role in a tech company by Q3'
                  : 'e.g. Grow my Instagram to 5k followers in the skincare niche'
              }
              rows={4}
              style={{
                width: '100%',
                background: '#1a1a2e',
                border: '1.5px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '16px',
                color: 'white',
                fontSize: '15px',
                lineHeight: 1.6,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        )}

        {/* STEP 3 — Prior progress */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              Where are you right now?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>
              Dash needs to know the starting point to build the right map.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {PRIOR_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => update('prior', opt.id)}
                  style={{
                    background: data.prior === opt.id ? 'rgba(245,166,35,0.15)' : '#1a1a2e',
                    border: `1.5px solid ${data.prior === opt.id ? '#F5A623' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {(data.prior === 'started' || data.prior === 'reset') && (
              <textarea
                value={data.priorDetail}
                onChange={e => update('priorDetail', e.target.value)}
                placeholder="Tell Dash specifically where you got to and what you built. The more detail, the better the map."
                rows={3}
                style={{
                  width: '100%',
                  background: '#1a1a2e',
                  border: '1.5px solid rgba(245,166,35,0.4)',
                  borderRadius: '14px',
                  padding: '14px',
                  color: 'white',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  animation: 'fadeIn 0.3s ease',
                }}
              />
            )}
          </div>
        )}

        {/* STEP 4 — Big Prize */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              What is the real prize?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>
              Not the goal. The thing that changes when the goal is done. Financial freedom? A new life? Prove yourself?
            </p>
            <textarea
              value={data.bigPrize}
              onChange={e => update('bigPrize', e.target.value)}
              placeholder="e.g. Land 3 high-paying clients and quit my 9-5"
              rows={3}
              style={{
                width: '100%',
                background: '#1a1a2e',
                border: '1.5px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '16px',
                color: 'white',
                fontSize: '15px',
                lineHeight: 1.6,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                marginBottom: '20px',
              }}
            />
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '10px' }}>How urgent is this?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Critical — this changes my life', 'Important — I really want this', 'Nice to have — no pressure'].map(u => (
                <button key={u} onClick={() => update('urgency', u)}
                  style={{
                    background: data.urgency === u ? 'rgba(245,166,35,0.15)' : '#1a1a2e',
                    border: `1.5px solid ${data.urgency === u ? '#F5A623' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '12px', padding: '14px', cursor: 'pointer',
                    textAlign: 'left', color: 'white', fontSize: '14px', transition: 'all 0.2s',
                  }}>{u}</button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5 — Coach style */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              How do you want Dash to coach you?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>
              This shapes every message you receive.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {COACH_STYLES.map(c => (
                <button
                  key={c.id}
                  onClick={() => update('coachStyle', c.id)}
                  style={{
                    background: data.coachStyle === c.id ? 'rgba(245,166,35,0.15)' : '#1a1a2e',
                    border: `1.5px solid ${data.coachStyle === c.id ? '#F5A623' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '14px', padding: '16px', cursor: 'pointer',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '26px' }}>{c.emoji}</span>
                  <div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{c.label}</div>
                    <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>{c.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6 — Daily time */}
        {step === 6 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              On a typical day, how much time do you actually have?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '14px' }}>
              Dash uses this to size your tasks. No judgment, no commitment.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {TIME_OPTIONS.map(t => (
                <button key={t.id} onClick={() => update('dailyTime', t.id)}
                  style={{
                    background: data.dailyTime === t.id ? 'rgba(245,166,35,0.15)' : '#1a1a2e',
                    border: `1.5px solid ${data.dailyTime === t.id ? '#F5A623' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '14px', padding: '16px', cursor: 'pointer',
                    textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ color: 'white', fontWeight: 600 }}>{t.label}</span>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>{t.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7 — Personal why */}
        {step === 7 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              One last thing.
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '14px' }}>
              Why does this goal matter to you? Not the outcome. The real reason.
            </p>
            <p style={{ color: '#F5A623', fontSize: '13px', marginBottom: '20px' }}>
              Dash pulls this out on your hardest days.
            </p>
            <textarea
              value={data.personalWhy}
              onChange={e => update('personalWhy', e.target.value)}
              placeholder="e.g. I want to prove to myself I can actually follow through. I'm tired of being the person who almost did things."
              rows={5}
              style={{
                width: '100%',
                background: '#1a1a2e',
                border: '1.5px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '16px',
                color: 'white',
                fontSize: '15px',
                lineHeight: 1.7,
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div style={{ padding: '16px 20px 32px', background: '#0f1623' }}>
        {step < 7 ? (
          <button
            className="gold-btn"
            disabled={!canNext()}
            onClick={() => setStep(s => s + 1)}
          >
            Continue
          </button>
        ) : (
          <button
            className="gold-btn"
            onClick={handleFinish}
          >
            Dash has my briefing. Let us go. ⚡
          </button>
        )}
      </div>
    </div>
  )
}