'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIME_OPTIONS = [
  { id: 'under10', emoji: '⏰', label: 'Under 10 minutes' },
  { id: '10to30',  emoji: '🕔', label: '10 to 30 minutes' },
  { id: '30to60',  emoji: '🕘', label: '30 minutes to 1 hour' },
  { id: '60plus',  emoji: '🔥', label: '1 hour or more' },
]

const COACH_OPTIONS = [
  { id: 'tough',     emoji: '💪', label: 'No-nonsense coach',     sub: 'Direct. Unfiltered. Pure execution.' },
  { id: 'strategic', emoji: '🤝', label: 'Strategic partner',     sub: 'Professional. ROI-focused.' },
  { id: 'friend',    emoji: '😏', label: 'Sarcastic best friend', sub: 'Jokes with accountability.' },
  { id: 'mentor',    emoji: '🧘', label: 'Gentle mentor',         sub: 'Encouragement first.' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 7

  const [data, setData] = useState({
    name: '',
    email: '',
    persona: '',
    goal: '',
    certSkill: '',
    certBody: '',
    domain: '',
    customDomain: '',
    changerRole: '',
    changerBackground: '',
    prior: '',
    priorChips: [] as string[],
    priorDetail: '',
    bigPrize: '',
    hasDeadline: '',
    deadline: '',
    personalWhy: '',
    coachStyle: '',
    dailyTime: '',
  })

  const set = (k: string, v: string) => setData(d => ({ ...d, [k]: v }))

  const toggleChip = (chip: string) => {
    setData(d => ({
      ...d,
      priorChips: d.priorChips.includes(chip)
        ? d.priorChips.filter(c => c !== chip)
        : [...d.priorChips, chip],
    }))
  }

  const canContinue = () => {
    if (step === 1) {
      return data.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(data.email)
    }
    if (step === 2) return !!data.persona
    if (step === 3) {
      if (!data.goal.trim()) return false
      if (data.persona === 'builder') return !!data.domain
      if (data.persona === 'learner') return data.certSkill.trim().length > 0
      if (data.persona === 'changer') return data.changerRole.trim().length > 0
      return true
    }
    if (step === 4) {
      if (!data.prior) return false
      if (data.prior === 'zero') return data.priorChips.length > 0
      if (data.prior === 'started' || data.prior === 'reset') return data.priorDetail.trim().length > 10
      return true
    }
    if (step === 5) {
      return data.bigPrize.trim().length > 0 && !!data.hasDeadline && data.personalWhy.trim().length > 5
    }
    if (step === 6) return !!data.coachStyle
    if (step === 7) return !!data.dailyTime
    return true
  }

  const handleFinish = () => {
    localStorage.setItem('stride_user', JSON.stringify({
      ...data,
      streak: 0,
      phase: 1,
      joinedAt: new Date().toISOString(),
    }))
    router.push('/lockedin')
  }

  const dots = Array.from({ length: totalSteps }).map((_, i) => (
    <div key={i} className={`ob-pd${i < step ? ' on' : ''}`} />
  ))

  return (
    <div className="ob-screen">

      {/* STEP 1 — Name + Email */}
      {step === 1 && (
        <>
          <div className="ob-head">
            <div className="ob-prog">{dots}</div>
            <div className="ob-step">Step 1 of {totalSteps}</div>
            <div className="ob-title">What should Dash call you?</div>
            <div className="ob-sub">Your name and email make every message personal.</div>
          </div>
          <div className="ob-body">
            <textarea
              className="ob-ta" rows={1}
              placeholder="Your first name"
              value={data.name}
              onChange={e => set('name', e.target.value)}
              style={{ resize: 'none' }}
            />
            <div className="ob-lbl" style={{ marginTop: '8px' }}>Email address</div>
            <textarea
              className="ob-ta" rows={1}
              placeholder="you@example.com"
              value={data.email}
              onChange={e => set('email', e.target.value)}
              style={{ resize: 'none' }}
            />
            <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
              Used for your weekly reports and progress updates from Dash.
            </div>
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </>
      )}

      {/* STEP 2 — Persona */}
      {step === 2 && (
        <>
          <div className="ob-head">
            <button className="ob-back" onClick={() => setStep(1)}>←</button>
            <div className="ob-prog">{dots}</div>
            <div className="ob-step">Step 2 of {totalSteps}</div>
            <div className="ob-title">What kind of mission are we on?</div>
            <div className="ob-sub">Pick the one that fits right now.</div>
          </div>
          <div className="ob-body">
            {[
              { id: 'builder', emoji: '🔨', label: 'Building something',  sub: 'Brand, business, or side hustle' },
              { id: 'learner', emoji: '📚', label: 'Studying or learning', sub: 'Exam, certification, new skill' },
              { id: 'changer', emoji: '🔄', label: 'Changing direction',   sub: 'New career, new chapter' },
            ].map(p => (
              <div
                key={p.id}
                className={`ob-opt${data.persona === p.id ? ' sel' : ''}`}
                onClick={() => set('persona', p.id)}
              >
                <div className="oi">{p.emoji}</div>
                <div>
                  <div className="ol">{p.label}</div>
                  <div className="os">{p.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(3)}>
              Continue
            </button>
          </div>
        </>
      )}

      {/* STEP 3 — Goal */}
      {step === 3 && (
        <>
          <div className="ob-head">
            <button className="ob-back" onClick={() => setStep(2)}>←</button>
            <div className="ob-prog">{dots}</div>
            <div className="ob-step">Step 3 of {totalSteps}</div>
            <div className="ob-title">What is the goal?</div>
            <div className="ob-sub">Be specific. Messy is fine. Dash will sharpen it.</div>
          </div>
          <div className="ob-body">
            <textarea
              className="ob-ta" rows={3}
              placeholder={
                data.persona === 'learner'
                  ? 'e.g. Get my Google Project Management certificate by June'
                  : data.persona === 'changer'
                  ? 'e.g. Land a UX design role in a tech company by Q3'
                  : 'e.g. Grow my Instagram following in the food photography niche'
              }
              value={data.goal}
              onChange={e => set('goal', e.target.value)}
            />

            {/* BUILDER */}
            {data.persona === 'builder' && (
              <>
                <div className="ob-lbl">What space are you building in?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {['Social media', 'Freelancing', 'E-commerce', 'Consulting', 'Content creation', 'Service business', 'Other'].map(c => (
                    <button
                      key={c}
                      className={`ob-chip${data.domain === c ? ' sel' : ''}`}
                      onClick={() => set('domain', c)}
                    >{c}</button>
                  ))}
                </div>
                {data.domain === 'Other' && (
                  <textarea
                    className="ob-ta" rows={1}
                    placeholder="Describe the space you are building in..."
                    value={data.customDomain}
                    onChange={e => set('customDomain', e.target.value)}
                    style={{ resize: 'none', borderColor: '#F5A623', marginTop: '4px' }}
                  />
                )}
              </>
            )}

            {/* LEARNER */}
            {data.persona === 'learner' && (
              <>
                <div className="ob-lbl">What are you getting certified or skilled in?</div>
                <textarea
                  className="ob-ta" rows={2}
                  placeholder="e.g. Google Project Management, IELTS, Python, ACCA..."
                  value={data.certSkill}
                  onChange={e => set('certSkill', e.target.value)}
                />
                <div className="ob-lbl">Any specific exam, institution, or body?</div>
                <textarea
                  className="ob-ta" rows={1}
                  placeholder="e.g. PMI, NMC, Coursera, self-study..."
                  value={data.certBody}
                  onChange={e => set('certBody', e.target.value)}
                  style={{ resize: 'none' }}
                />
              </>
            )}

            {/* CHANGER */}
            {data.persona === 'changer' && (
              <>
                <div className="ob-lbl">What industry or role are you moving toward?</div>
                <textarea
                  className="ob-ta" rows={2}
                  placeholder="e.g. UX design, nursing in the UK, remote tech work..."
                  value={data.changerRole}
                  onChange={e => set('changerRole', e.target.value)}
                />
                <div className="ob-lbl">Briefly describe your background</div>
                <textarea
                  className="ob-ta" rows={1}
                  placeholder="e.g. Currently in banking, recent graduate..."
                  value={data.changerBackground}
                  onChange={e => set('changerBackground', e.target.value)}
                  style={{ resize: 'none' }}
                />
              </>
            )}
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(4)}>
              Continue
            </button>
          </div>
        </>
      )}

      {/* STEP 4 — Prior progress */}
      {step === 4 && (
        <>
          <div className="ob-head">
            <button className="ob-back" onClick={() => setStep(3)}>←</button>
            <div className="ob-prog">{dots}</div>
            <div className="ob-step">Step 4 of {totalSteps}</div>
            <div className="ob-title">Where are you right now?</div>
            <div className="ob-sub">Dash needs your starting point to build the right map.</div>
          </div>
          <div className="ob-body">
            {[
              { id: 'zero',    emoji: '🆕', label: 'Starting from zero',               sub: 'Nothing set up yet' },
              { id: 'started', emoji: '⏸️', label: 'Started but stuck',                sub: 'Made some progress, lost momentum' },
              { id: 'reset',   emoji: '🔄', label: 'Been at it a while, need a reset', sub: 'Tried different things, nothing stuck' },
            ].map(opt => (
              <div
                key={opt.id}
                className={`ob-opt${data.prior === opt.id ? ' sel' : ''}`}
                onClick={() => { set('prior', opt.id); set('priorDetail', '') }}
              >
                <div className="oi">{opt.emoji}</div>
                <div>
                  <div className="ol">{opt.label}</div>
                  <div className="os">{opt.sub}</div>
                </div>
              </div>
            ))}

            {data.prior === 'zero' && (
              <>
                <div className="ob-lbl">What do you currently have in place?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {['No accounts set up', 'Have accounts, no content', 'Have an idea only', 'Completely blank'].map(chip => (
                    <button
                      key={chip}
                      className={`ob-chip${data.priorChips.includes(chip) ? ' sel' : ''}`}
                      onClick={() => toggleChip(chip)}
                    >{chip}</button>
                  ))}
                </div>
              </>
            )}

            {data.prior === 'started' && (
              <>
                <div className="ob-lbl">Tell Dash where you got to</div>
                <textarea
                  className="ob-ta" rows={3}
                  placeholder="e.g. I have 200 Instagram followers in the fitness niche, post occasionally but have not grown in 4 months."
                  value={data.priorDetail}
                  onChange={e => set('priorDetail', e.target.value)}
                />
                <div style={{ fontSize: '11px', color: '#aaa' }}>
                  The more specific you are, the better Dash picks up exactly where you left off.
                </div>
              </>
            )}

            {data.prior === 'reset' && (
              <>
                <div className="ob-lbl">What has not worked so far?</div>
                <textarea
                  className="ob-ta" rows={3}
                  placeholder="e.g. Tried posting every day for a month but got no engagement. Took an online course but never applied it."
                  value={data.priorDetail}
                  onChange={e => set('priorDetail', e.target.value)}
                />
                <div style={{ fontSize: '11px', color: '#aaa' }}>
                  This helps Dash avoid repeating what already failed.
                </div>
              </>
            )}
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(5)}>
              Continue
            </button>
          </div>
        </>
      )}

      {/* STEP 5 — Big prize + deadline */}
      {step === 5 && (
        <>
          <div className="ob-head">
            <button className="ob-back" onClick={() => setStep(4)}>←</button>
            <div className="ob-prog">{dots}</div>
            <div className="ob-step">Step 5 of {totalSteps}</div>
            <div className="ob-title">If you pull this off, what actually changes?</div>
            <div className="ob-sub">This is what Dash reminds you of when you want to quit.</div>
          </div>
          <div className="ob-body">
            <textarea
              className="ob-ta" rows={3}
              placeholder="e.g. Land 3 high-paying consulting clients"
              value={data.bigPrize}
              onChange={e => set('bigPrize', e.target.value)}
            />

            <div className="ob-lbl">Does this goal have a deadline?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { id: 'yes', emoji: '📅', label: 'Yes, it does' },
                { id: 'no',  emoji: '🔄', label: 'No, ongoing goal' },
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => set('hasDeadline', opt.id)}
                  style={{
                    border: `1.5px solid ${data.hasDeadline === opt.id ? '#1a1a2e' : '#eee'}`,
                    borderRadius: '14px', padding: '14px 10px', cursor: 'pointer',
                    textAlign: 'center' as const,
                    background: data.hasDeadline === opt.id ? '#f5f5fa' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '22px', marginBottom: '5px' }}>{opt.emoji}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{opt.label}</div>
                </div>
              ))}
            </div>

            {data.hasDeadline === 'yes' && (
              <>
                <div className="ob-lbl">When is the deadline?</div>
                <input
                  type="date"
                  className="ob-ta"
                  value={data.deadline}
                  onChange={e => set('deadline', e.target.value)}
                  style={{ cursor: 'pointer' }}
                />
              </>
            )}

            <div className="ob-lbl">In your own words, why does this matter?</div>
            <textarea
              className="ob-ta" rows={3}
              placeholder="Not the outcome. The reason behind it."
              value={data.personalWhy}
              onChange={e => set('personalWhy', e.target.value)}
            />
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(6)}>
              Continue
            </button>
          </div>
        </>
      )}

      {/* STEP 6 — Coach style */}
      {step === 6 && (
        <>
          <div className="ob-head">
            <button className="ob-back" onClick={() => setStep(5)}>←</button>
            <div className="ob-prog">{dots}</div>
            <div className="ob-step">Step 6 of {totalSteps}</div>
            <div className="ob-title">How do you want Dash to push you?</div>
            <div className="ob-sub">Be honest. This shapes every message you receive.</div>
          </div>
          <div className="ob-body">
            {COACH_OPTIONS.map(c => (
              <div
                key={c.id}
                className={`ob-opt${data.coachStyle === c.id ? ' sel' : ''}`}
                onClick={() => set('coachStyle', c.id)}
              >
                <div className="oi">{c.emoji}</div>
                <div>
                  <div className="ol">{c.label}</div>
                  <div className="os">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(7)}>
              Continue
            </button>
          </div>
        </>
      )}

      {/* STEP 7 — Daily time */}
      {step === 7 && (
        <>
          <div className="ob-head">
            <button className="ob-back" onClick={() => setStep(6)}>←</button>
            <div className="ob-prog">{dots}</div>
            <div className="ob-step">Step 7 of {totalSteps}</div>
            <div className="ob-title">On a typical day, how much time do you actually have?</div>
            <div className="ob-sub">Dash uses this to size your tasks. No judgment, no commitment.</div>
          </div>
          <div className="ob-body">
            {TIME_OPTIONS.map(t => (
              <div
                key={t.id}
                className={`ob-opt${data.dailyTime === t.id ? ' sel' : ''}`}
                onClick={() => set('dailyTime', t.id)}
              >
                <div className="oi">{t.emoji}</div>
                <div>
                  <div className="ol">{t.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={handleFinish}>
              Lock it in 🔒
            </button>
          </div>
        </>
      )}

    </div>
  )
}