'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ThemeColor from '@/components/ThemeColor'

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

async function shortenText(text: string, type: 'goal' | 'prize'): Promise<string> {
  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type }),
    })
    const data = await res.json()
    return data.shortened || text
  } catch {
    return text
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 7
  const [isFinishing, setIsFinishing] = useState(false)

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
    if (step === 1) return data.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(data.email)
    if (step === 2) return !!data.persona
    if (step === 3) {
      if (!data.goal.trim() || data.goal.trim().length < 40) return false
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
    if (step === 5) return data.bigPrize.trim().length > 0 && !!data.hasDeadline && data.personalWhy.trim().length > 5
    if (step === 6) return !!data.coachStyle
    if (step === 7) return !!data.dailyTime
    return true
  }

  const handleFinish = async () => {
    setIsFinishing(true)

    const [goalShort, prizeShort] = await Promise.all([
      shortenText(data.goal, 'goal'),
      shortenText(data.bigPrize, 'prize'),
    ])

    const userData = {
      ...data,
      goalShort,
      prizeShort,
      streak: 0,
      phase: 1,
      tasksDone: 0,
      score: 0,
      bonusTasks: 0,
      shields: 1,
      joinedAt: new Date().toISOString(),
    }

    localStorage.setItem('stride_user', JSON.stringify(userData))

    try {
      await supabase.from('stride_users').insert({
        email: data.email.toLowerCase().trim(),
        name: data.name,
        persona: data.persona,
        goal: data.goal,
        goal_short: goalShort,
        big_prize: data.bigPrize,
        prize_short: prizeShort,
        personal_why: data.personalWhy,
        coach_style: data.coachStyle,
        daily_time: data.dailyTime,
        domain: data.domain,
        prior: data.prior,
        prior_detail: data.priorDetail,
        has_deadline: data.hasDeadline,
        deadline: data.deadline || null,
        streak: 0,
        phase: 1,
        tasks_done: 0,
        score: 0,
        bonus_tasks: 0,
        shields: 1,
      })
    } catch (e) {
      console.error('Supabase save failed:', e)
    }

    // Send welcome email — fire and forget, don't block navigation
    fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        goal: data.goal,
        coachStyle: data.coachStyle,
      }),
    }).catch(e => console.error('Welcome email failed:', e))

    router.push('/lockedin')
  }

  const dots = Array.from({ length: totalSteps }).map((_, i) => (
    <div key={i} className={`ob-pd${i < step ? ' on' : ''}`} />
  ))

  return (
    <div className="ob-screen">
      <ThemeColor color="#ffffff" />

      {step === 1 && (
        <>
          <div className="ob-head">
            <div className="ob-prog">{dots}</div>
            <div className="ob-step">Step 1 of {totalSteps}</div>
            <div className="ob-title">What should Dash call you?</div>
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
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </>
      )}

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
              <div key={p.id} className={`ob-opt${data.persona === p.id ? ' sel' : ''}`} onClick={() => set('persona', p.id)}>
                <div className="oi">{p.emoji}</div>
                <div><div className="ol">{p.label}</div><div className="os">{p.sub}</div></div>
              </div>
            ))}
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(3)}>Continue</button>
          </div>
        </>
      )}

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
              className="ob-ta" rows={4}
              placeholder="Include what exactly you are doing, a specific number or target, and a timeframe."
              value={data.goal}
              onChange={e => set('goal', e.target.value)}
            />
            {data.goal.trim().length > 0 && data.goal.trim().length < 40 && (
              <div style={{ fontSize: '11px', color: '#F5A623', marginTop: '2px' }}>
                Add more detail — include your niche, a number, or a timeframe.
              </div>
            )}

            {data.persona === 'builder' && (
              <>
                <div className="ob-lbl" style={{ marginTop: '10px' }}>What space are you building in?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {['Social media', 'Freelancing', 'E-commerce', 'Consulting', 'Content creation', 'Service business', 'Other'].map(c => (
                    <button key={c} className={`ob-chip${data.domain === c ? ' sel' : ''}`} onClick={() => set('domain', c)}>{c}</button>
                  ))}
                </div>
                {data.domain === 'Other' && (
                  <textarea className="ob-ta" rows={1} placeholder="Describe your space" value={data.customDomain} onChange={e => set('customDomain', e.target.value)} style={{ resize: 'none', borderColor: '#F5A623', marginTop: '4px' }} />
                )}
              </>
            )}

            {data.persona === 'learner' && (
              <>
                <div className="ob-lbl" style={{ marginTop: '10px' }}>What are you getting certified or skilled in?</div>
                <textarea
                  className="ob-ta" rows={2}
                  placeholder="e.g. ACCA F3, exam in November, currently on chapter 4 of 12"
                  value={data.certSkill}
                  onChange={e => set('certSkill', e.target.value)}
                />
                <div className="ob-lbl">Exam body, institution, or platform</div>
                <textarea
                  className="ob-ta" rows={1}
                  placeholder="e.g. ICAEW, British Council, Coursera"
                  value={data.certBody}
                  onChange={e => set('certBody', e.target.value)}
                  style={{ resize: 'none' }}
                />
              </>
            )}

            {data.persona === 'changer' && (
              <>
                <div className="ob-lbl" style={{ marginTop: '10px' }}>What role or industry are you moving toward?</div>
                <textarea
                  className="ob-ta" rows={2}
                  placeholder="e.g. UX design at a Lagos fintech, full-time within 8 months"
                  value={data.changerRole}
                  onChange={e => set('changerRole', e.target.value)}
                />
                <div className="ob-lbl">Where are you coming from?</div>
                <textarea
                  className="ob-ta" rows={2}
                  placeholder="e.g. 4 years in customer service, no design experience yet"
                  value={data.changerBackground}
                  onChange={e => set('changerBackground', e.target.value)}
                  style={{ resize: 'none' }}
                />
              </>
            )}
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(4)}>Continue</button>
          </div>
        </>
      )}

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
              <div key={opt.id} className={`ob-opt${data.prior === opt.id ? ' sel' : ''}`} onClick={() => { set('prior', opt.id); set('priorDetail', '') }}>
                <div className="oi">{opt.emoji}</div>
                <div><div className="ol">{opt.label}</div><div className="os">{opt.sub}</div></div>
              </div>
            ))}

            {data.prior === 'zero' && (
              <>
                <div className="ob-lbl">What do you currently have in place?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                  {['No accounts set up', 'Have accounts, no content', 'Have an idea only', 'Completely blank'].map(chip => (
                    <button key={chip} className={`ob-chip${data.priorChips.includes(chip) ? ' sel' : ''}`} onClick={() => toggleChip(chip)}>{chip}</button>
                  ))}
                </div>
              </>
            )}

            {data.prior === 'started' && (
              <>
                <div className="ob-lbl">Tell Dash exactly where you got to</div>
                <textarea
                  className="ob-ta" rows={4}
                  placeholder="Current numbers, how often you work on this, and what usually stops you."
                  value={data.priorDetail}
                  onChange={e => set('priorDetail', e.target.value)}
                />
              </>
            )}

            {data.prior === 'reset' && (
              <>
                <div className="ob-lbl">What has not worked so far?</div>
                <textarea
                  className="ob-ta" rows={4}
                  placeholder="What you tried, how long, and why you think it did not work."
                  value={data.priorDetail}
                  onChange={e => set('priorDetail', e.target.value)}
                />
              </>
            )}
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(5)}>Continue</button>
          </div>
        </>
      )}

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
              placeholder="What changes in your life if this works?"
              value={data.bigPrize}
              onChange={e => set('bigPrize', e.target.value)}
            />

            <div className="ob-lbl" style={{ marginTop: '10px' }}>Does this goal have a deadline?</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[{ id: 'yes', emoji: '📅', label: 'Yes, it does' }, { id: 'no', emoji: '🔄', label: 'No, ongoing goal' }].map(opt => (
                <div key={opt.id} onClick={() => set('hasDeadline', opt.id)}
                  style={{ border: `1.5px solid ${data.hasDeadline === opt.id ? '#1a1a2e' : '#eee'}`, borderRadius: '14px', padding: '14px 10px', cursor: 'pointer', textAlign: 'center' as const, background: data.hasDeadline === opt.id ? '#f5f5fa' : '#fff', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '22px', marginBottom: '5px' }}>{opt.emoji}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{opt.label}</div>
                </div>
              ))}
            </div>

            {data.hasDeadline === 'yes' && (
              <>
                <div className="ob-lbl">When is the deadline?</div>
                <input type="date" className="ob-ta" value={data.deadline} onChange={e => set('deadline', e.target.value)} style={{ cursor: 'pointer' }} />
              </>
            )}

            <div className="ob-lbl" style={{ marginTop: '10px' }}>In your own words, why does this matter?</div>
            <textarea
              className="ob-ta" rows={3}
              placeholder="Why does this matter to you personally?"
              value={data.personalWhy}
              onChange={e => set('personalWhy', e.target.value)}
            />
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(6)}>Continue</button>
          </div>
        </>
      )}

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
              <div key={c.id} className={`ob-opt${data.coachStyle === c.id ? ' sel' : ''}`} onClick={() => set('coachStyle', c.id)}>
                <div className="oi">{c.emoji}</div>
                <div><div className="ol">{c.label}</div><div className="os">{c.sub}</div></div>
              </div>
            ))}
          </div>
          <div className="ob-foot">
            <button className="ob-btn" disabled={!canContinue()} onClick={() => setStep(7)}>Continue</button>
          </div>
        </>
      )}

      {step === 7 && (
        <>
          <div className="ob-head">
            <button className="ob-back" onClick={() => setStep(6)}>←</button>
            <div className="ob-prog">{dots}</div>
            <div className="ob-step">Step 7 of {totalSteps}</div>
            <div className="ob-title">On a typical day, how much time do you actually have?</div>
            <div className="ob-sub">Dash uses this to size your tasks. No judgment.</div>
          </div>
          <div className="ob-body">
            {TIME_OPTIONS.map(t => (
              <div key={t.id} className={`ob-opt${data.dailyTime === t.id ? ' sel' : ''}`} onClick={() => set('dailyTime', t.id)}>
                <div className="oi">{t.emoji}</div>
                <div><div className="ol">{t.label}</div></div>
              </div>
            ))}
          </div>
          <div className="ob-foot">
            <button
              className="ob-btn"
              disabled={!canContinue() || isFinishing}
              onClick={handleFinish}
            >
              {isFinishing ? 'Setting things up...' : 'Lock it in 🔒'}
            </button>
          </div>
        </>
      )}

    </div>
  )
}
