'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeColor from '@/components/ThemeColor'
import { supabase } from '@/lib/supabase'

export default function GoalAchievedPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<'celebrate' | 'next'>('celebrate')
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
    setTimeout(() => setVisible(true), 80)
  }, [])

  const shareText = user
    ? `I just achieved my goal on Stride: "${user.goal}". ${user.tasksDone || 0} tasks. ${user.streak || 0} day streak. One step at a time. ⚡`
    : 'I just achieved my goal on Stride. One step at a time. ⚡'
  const shareUrl = 'https://stride-app-one.vercel.app'

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText, url: shareUrl }) } catch (e) {}
    } else {
      try { await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`) } catch (e) {}
    }
  }

  const handleStartNewGoal = async () => {
    if (!user || resetting) return
    setResetting(true)

    try {
      // Reset goal and phase fields only — preserve task history and stats
      await supabase.from('stride_users').update({
        goal: null,
        goal_short: null,
        big_prize: null,
        prize_short: null,
        personal_why: null,
        phase: 1,
        streak: 0,
        score: 0,
        sprint_theme: null,
        sprint_day: null,
        sprint_start_date: null,
        has_deadline: null,
        deadline: null,
      }).eq('email', user.email)

      // Clear goal fields from localStorage but keep identity and history stats
      const updated = {
        ...user,
        goal: null,
        goalShort: null,
        bigPrize: null,
        prizeShort: null,
        personalWhy: null,
        phase: 1,
        streak: 0,
        score: 0,
        sprintTheme: null,
        sprintDay: null,
        sprintStartDate: null,
        hasDeadline: null,
        deadline: null,
      }
      localStorage.setItem('stride_user', JSON.stringify(updated))

      // Push to onboarding — they'll fill in a new goal
      // tasksDone and daily_tasks history are preserved
      router.push('/onboarding')
    } catch (e) {
      console.error('Goal reset failed:', e)
      setResetting(false)
    }
  }

  const getCoachMessage = (coachStyle: string, goal: string) => {
    const style = coachStyle || 'mentor'
    const messages: Record<string, string> = {
      friend:    `${(goal || '').split(' ').slice(0, 4).join(' ')}… done. I cannot believe you actually pulled this off. Respect.`,
      tough:     `Goal reached. No celebration yet — you know what comes next. Set the bar higher.`,
      strategic: `Objective achieved. Every task, every day — that is how it compounds. You have the proof now.`,
      mentor:    `You did it. Not by accident. By showing up, one day at a time, until it became real.`,
    }
    return messages[style] || messages['mentor']
  }

  const getNextChapterMessage = (coachStyle: string, tasksDone: number) => {
    const style = coachStyle || 'mentor'
    const messages: Record<string, string> = {
      friend:    `Okay so you actually did it. ${tasksDone} tasks. Wild. So what's the next thing we're going to make you do? 😏`,
      tough:     `${tasksDone} tasks completed. That is your baseline now. The next goal needs to be bigger. What is it?`,
      strategic: `You have ${tasksDone} completed tasks as proof of concept. The system works. What is the next objective?`,
      mentor:    `${tasksDone} tasks. That is not a small thing. You have built something real here. What does the next chapter look like?`,
    }
    return messages[style] || messages['mentor']
  }

  const shapes = [
    { c: '#F5A623', s: 9,  t: '9%',  l: '8%',  r: 12,  d: '0s',    dur: '2.7s', sq: true  },
    { c: '#fff',    s: 6,  t: '14%', l: '87%', r: 0,   d: '0.4s',  dur: '3s',   sq: false },
    { c: '#F5A623', s: 8,  t: '6%',  l: '55%', r: -9,  d: '0.7s',  dur: '2.5s', sq: true  },
    { c: '#4CAF50', s: 5,  t: '22%', l: '20%', r: 0,   d: '0.2s',  dur: '3.2s', sq: false },
    { c: '#fff',    s: 7,  t: '74%', l: '8%',  r: 20,  d: '0.6s',  dur: '2.9s', sq: true  },
    { c: '#F5A623', s: 6,  t: '70%', l: '87%', r: 0,   d: '1s',    dur: '2.6s', sq: false },
    { c: '#4CAF50', s: 9,  t: '82%', l: '55%', r: -16, d: '0.3s',  dur: '3s',   sq: true  },
    { c: '#fff',    s: 6,  t: '86%', l: '25%', r: 0,   d: '0.7s',  dur: '3.3s', sq: false },
    { c: '#F5A623', s: 7,  t: '36%', l: '92%', r: 10,  d: '0.5s',  dur: '2.8s', sq: true  },
    { c: '#4CAF50', s: 5,  t: '52%', l: '4%',  r: 0,   d: '0.8s',  dur: '2.7s', sq: false },
  ]

  if (!user) return null

  const tasksDone = user.tasksDone || 0
  const streak = user.streak || 0
  const bonusTasks = user.bonusTasks || 0

  // PHASE 2 — What's next screen
  if (phase === 'next') {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#0f1623',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 28px 44px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <ThemeColor color="#0f1623" />

        {shapes.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: s.t, left: s.l,
            width: s.s, height: s.s,
            background: s.c,
            borderRadius: s.sq ? '2px' : '50%',
            opacity: 0.25,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Dash avatar */}
        <div style={{
          width: 64, height: 64,
          background: '#F5A623',
          borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, marginBottom: 24,
        }}>
          ⚡
        </div>

        {/* Dash label */}
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: 'rgba(245,166,35,0.65)',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Dash
        </div>

        {/* Message */}
        <div style={{
          fontSize: 18, fontWeight: 700, color: '#fff',
          textAlign: 'center', lineHeight: 1.6,
          maxWidth: 290, marginBottom: 12,
        }}>
          {getNextChapterMessage(user.coachStyle, tasksDone)}
        </div>

        {/* Proof line */}
        <div style={{
          fontSize: 13, color: 'rgba(255,255,255,0.4)',
          textAlign: 'center', lineHeight: 1.6,
          maxWidth: 260, marginBottom: 48,
        }}>
          Your {tasksDone} completed tasks stay on record. Dash remembers everything.
        </div>

        {/* Buttons */}
        <div style={{
          width: '100%', maxWidth: 320,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <button
            onClick={handleStartNewGoal}
            disabled={resetting}
            style={{
              width: '100%', background: '#F5A623',
              border: 'none', borderRadius: 16,
              padding: '17px', fontSize: 16, fontWeight: 700,
              color: '#1a1a2e', cursor: resetting ? 'default' : 'pointer',
              opacity: resetting ? 0.6 : 1,
            }}
          >
            {resetting ? 'Setting up...' : 'Set my next goal ⚡'}
          </button>
          <button
            onClick={() => router.push('/home')}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16, padding: '15px',
              fontSize: 15, fontWeight: 600,
              color: '#fff', cursor: 'pointer',
            }}
          >
            Back to home
          </button>
        </div>
      </div>
    )
  }

  // PHASE 1 — Celebration screen (your existing design, untouched)
  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0f1623',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 28px 44px',
      position: 'relative',
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease',
    }}>
      <ThemeColor color="#0f1623" />

      <style>{`
        @keyframes gaFloat {
          0%,100%{transform:translateY(0) rotate(var(--ga-r,0deg));opacity:0.4}
          50%{transform:translateY(-12px) rotate(calc(var(--ga-r,0deg)+8deg));opacity:0.65}
        }
        @keyframes gaOrbit {
          0%{transform:rotate(0deg) translateX(52px) rotate(0deg)}
          100%{transform:rotate(360deg) translateX(52px) rotate(-360deg)}
        }
        @keyframes gaOrbit2 {
          0%{transform:rotate(180deg) translateX(52px) rotate(-180deg)}
          100%{transform:rotate(540deg) translateX(52px) rotate(-540deg)}
        }
        @keyframes gaOrbit3 {
          0%{transform:rotate(90deg) translateX(52px) rotate(-90deg)}
          100%{transform:rotate(450deg) translateX(52px) rotate(-450deg)}
        }
        @keyframes gaIconIn {
          0%{transform:scale(0.4) rotate(-10deg);opacity:0}
          60%{transform:scale(1.12) rotate(4deg);opacity:1}
          100%{transform:scale(1) rotate(0deg);opacity:1}
        }
        @keyframes gaGlow {
          0%,100%{box-shadow:0 0 30px 8px rgba(245,166,35,0.25),0 0 60px 18px rgba(245,166,35,0.08)}
          50%{box-shadow:0 0 48px 14px rgba(245,166,35,0.45),0 0 80px 28px rgba(245,166,35,0.15)}
        }
        @keyframes gaNumPop {
          0%{transform:scale(0.4);opacity:0}
          65%{transform:scale(1.08);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
        @keyframes gaFadeUp {
          from{opacity:0;transform:translateY(11px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes gaCardIn {
          0%{transform:scale(0.88);opacity:0}
          70%{transform:scale(1.02);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
      `}</style>

      {shapes.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: s.t, left: s.l,
          width: s.s, height: s.s,
          background: s.c,
          borderRadius: s.sq ? '2px' : '50%',
          opacity: 0.4,
          animation: `gaFloat ${s.dur} ease-in-out infinite`,
          animationDelay: s.d,
          ['--ga-r' as any]: `${s.r}deg`,
          pointerEvents: 'none',
        }} />
      ))}

      <div style={{
        position: 'relative',
        width: 120, height: 120,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 22,
      }}>
        <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: '#F5A623', top: '50%', left: '50%', marginTop: -4, marginLeft: -4, animation: 'gaOrbit 5s linear infinite' }} />
        <div style={{ position: 'absolute', width: 6, height: 6, borderRadius: '50%', background: '#fff', opacity: 0.6, top: '50%', left: '50%', marginTop: -3, marginLeft: -3, animation: 'gaOrbit2 5s linear infinite' }} />
        <div style={{ position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: '#4CAF50', opacity: 0.8, top: '50%', left: '50%', marginTop: -2.5, marginLeft: -2.5, animation: 'gaOrbit3 7s linear infinite' }} />
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(245,166,35,0.18), rgba(245,166,35,0.04))',
          border: '2px solid rgba(245,166,35,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'gaIconIn 0.6s cubic-bezier(.34,1.56,.64,1) both, gaGlow 2.4s ease-in-out 0.6s infinite',
        }}>
          <span style={{ fontSize: 42, lineHeight: 1 }}>🌟</span>
        </div>
      </div>

      <div style={{
        fontSize: 12, fontWeight: 700,
        color: 'rgba(245,166,35,0.65)',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        marginBottom: 10,
        animation: 'gaFadeUp 0.4s ease 0.3s both',
      }}>
        You made it.
      </div>

      <div style={{
        fontSize: 20, fontWeight: 800, color: '#fff',
        textAlign: 'center', lineHeight: 1.4,
        maxWidth: 270, marginBottom: 24,
        animation: 'gaFadeUp 0.4s ease 0.45s both',
      }}>
        {user.goal || user.bigPrize || 'Goal achieved.'}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '16px 20px',
        width: '100%', maxWidth: 300,
        marginBottom: 22,
        animation: 'gaCardIn 0.5s cubic-bezier(.34,1.56,.64,1) 0.6s both',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.32)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          Your journey
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#F5A623' }}>{tasksDone}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>tasks done</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#F5A623' }}>{streak}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>day streak</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#F5A623' }}>{bonusTasks}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>bonus tasks</div>
          </div>
        </div>
      </div>

      <div style={{
        fontSize: 15, color: 'rgba(255,255,255,0.65)',
        textAlign: 'center', lineHeight: 1.7,
        fontStyle: 'italic', fontWeight: 500,
        maxWidth: 265, marginBottom: 40,
        animation: 'gaFadeUp 0.4s ease 0.78s both',
      }}>
        {getCoachMessage(user.coachStyle, user.goal)}
      </div>

      <div style={{
        width: '100%', maxWidth: 320,
        display: 'flex', flexDirection: 'column', gap: 10,
        animation: 'gaFadeUp 0.4s ease 0.92s both',
      }}>
        <button
          onClick={handleShare}
          style={{
            width: '100%', background: '#F5A623',
            border: 'none', borderRadius: 16,
            padding: '17px', fontSize: 16, fontWeight: 700,
            color: '#1a1a2e', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share this 🌟
        </button>
        <button
          onClick={() => setPhase('next')}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16, padding: '15px',
            fontSize: 15, fontWeight: 600,
            color: '#fff', cursor: 'pointer',
          }}
        >
          What&apos;s next? →
        </button>
      </div>
    </div>
  )
}