'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeColor from '@/components/ThemeColor'

export default function MilestonePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [streak, setStreak] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) {
      const u = JSON.parse(stored)
      setUser(u)
      setStreak(u.streak || 0)
    }
    setTimeout(() => setVisible(true), 80)
  }, [])

  const getMilestoneIcon = (s: number) => {
    if (s >= 90) return '🌟'
    if (s >= 60) return '👑'
    if (s >= 30) return '🏆'
    if (s >= 21) return '💪'
    if (s >= 14) return '👏'
    return '🔥'
  }

  const getMilestoneHook = (s: number, name: string) => {
    const first = name?.split(' ')[0] || 'Hey'
    if (s >= 90) return `${first}, 90 days. That's it.`
    if (s >= 60) return `${first}, two months of showing up.`
    if (s >= 30) return `${first}, one full month.`
    if (s >= 21) return `${first}, 21 days in.`
    if (s >= 14) return `${first}, two weeks straight.`
    return `${first}, one week already?`
  }

  const getMilestoneCloser = (s: number, coachStyle: string) => {
    const style = coachStyle || 'mentor'

    const closers: Record<number, Record<string, string>> = {
      7: {
        friend:   'You actually did it. Genuinely shocked.',
        tough:    'Seven days. No fuss. That is the standard now.',
        strategic:'Week one complete. The compound effect starts here.',
        mentor:   'Look at what you built in seven days. I hope you are proud.',
      },
      14: {
        friend:   'Two weeks and you have not quit on yourself. Wild.',
        tough:    'Fourteen days. The excuses are quieter now, are they not.',
        strategic:'Two weeks of consistent data. The pattern is real.',
        mentor:   'You showed up fourteen times. That is not nothing.',
      },
      21: {
        friend:   'Three weeks. You are actually that person now.',
        tough:    '21 days. The habit is yours. Do not waste it.',
        strategic:'21 days in. Neurologically, this is embedding.',
        mentor:   'Three weeks of choosing yourself. Every single day.',
      },
      30: {
        friend:   'A whole month. Who even are you right now.',
        tough:    '30 days. Most people do not make it here. You did.',
        strategic:'Month one complete. Everything compounds from here.',
        mentor:   'One month. You kept every promise you made to yourself.',
      },
      60: {
        friend:   'Two months. You are not the same person who started.',
        tough:    '60 days. This is who you are now. Act like it.',
        strategic:'60 days of execution. This is how legacies are built.',
        mentor:   'Two months of showing up. The goal can feel you coming.',
      },
      90: {
        friend:   'The goal called. It wants to know what took you so long.',
        tough:    '90 days. Most people are still planning. You are already there.',
        strategic:'90 days. You have outperformed 95% of people with the same goal.',
        mentor:   'Whatever happens next, you have already proved something real.',
      },
    }

    const milestoneKey = s >= 90 ? 90 : s >= 60 ? 60 : s >= 30 ? 30 : s >= 21 ? 21 : s >= 14 ? 14 : 7
    return closers[milestoneKey]?.[style] || closers[milestoneKey]?.['mentor'] || ''
  }

  const getSocialProof = (s: number) => {
    if (s >= 90) return 'Top 5% of Stride users'
    if (s >= 60) return 'Top 7% of Stride users'
    if (s >= 30) return 'Top 10% of Stride users'
    if (s >= 21) return 'Top 12% of Stride users'
    if (s >= 14) return 'Top 15% of Stride users'
    return 'Top 20% of Stride users'
  }

  const isFireMilestone = (s: number) => s < 14

  const shareText = `${streak} days. No excuses. Just steps. I have been showing up for my goal every single day on Stride. ⚡`
  const shareUrl = 'https://stride-app-one.vercel.app'

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText, url: shareUrl }) } catch (e) {}
    } else {
      try { await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`) } catch (e) {}
    }
  }

  const shapes = [
    { color: '#F5A623', size: 10, top: '9%',  left: '7%',  delay: '0s',    dur: '2.6s', r: 12,   type: 'sq' },
    { color: '#4CAF50', size: 7,  top: '15%', left: '85%', delay: '0.35s', dur: '2.8s', r: 0,    type: 'c'  },
    { color: '#fff',    size: 9,  top: '6%',  left: '57%', delay: '0.7s',  dur: '2.4s', r: -8,   type: 'sq' },
    { color: '#F5A623', size: 6,  top: '23%', left: '21%', delay: '0.15s', dur: '3s',   r: 0,    type: 'c'  },
    { color: '#4A9EDB', size: 8,  top: '71%', left: '8%',  delay: '0.55s', dur: '2.7s', r: 20,   type: 'sq' },
    { color: '#fff',    size: 6,  top: '67%', left: '85%', delay: '0.9s',  dur: '2.5s', r: 0,    type: 'c'  },
    { color: '#F5A623', size: 11, top: '79%', left: '54%', delay: '0.25s', dur: '2.9s', r: -15,  type: 'sq' },
    { color: '#4CAF50', size: 7,  top: '84%', left: '25%', delay: '0.65s', dur: '3.1s', r: 0,    type: 'c'  },
    { color: '#4A9EDB', size: 9,  top: '34%', left: '92%', delay: '0.45s', dur: '2.6s', r: 10,   type: 'sq' },
    { color: '#fff',    size: 6,  top: '53%', left: '3%',  delay: '0.8s',  dur: '2.8s', r: 0,    type: 'c'  },
    { color: '#F5A623', size: 7,  top: '44%', left: '79%', delay: '0.1s',  dur: '3.2s', r: -20,  type: 'sq' },
    { color: '#4CAF50', size: 5,  top: '89%', left: '71%', delay: '1.1s',  dur: '2.5s', r: 0,    type: 'c'  },
  ]

  if (!user) return null

  const icon = getMilestoneIcon(streak)
  const hook = getMilestoneHook(streak, user.name)
  const closer = getMilestoneCloser(streak, user.coachStyle)
  const socialProof = getSocialProof(streak)
  const tasksDone = user.tasksDone || streak
  const bonusTasks = user.bonusTasks || 0
  const shields = user.shields || 0

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px 44px',
      position: 'relative',
      overflow: 'hidden',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s ease',
    }}>
      <ThemeColor color="#1a1a2e" />

      <style>{`
        @keyframes floatShape {
          0%,100%{transform:translateY(0) rotate(var(--ms-r,0deg));opacity:0.4}
          50%{transform:translateY(-13px) rotate(calc(var(--ms-r,0deg) + 10deg));opacity:0.65}
        }
        @keyframes iconPulse {
          0%,100%{transform:scale(1) rotate(-3deg)}
          50%{transform:scale(1.16) rotate(3deg)}
        }
        @keyframes sparkRise {
          0%{transform:translateY(0) scale(1);opacity:0.9}
          100%{transform:translateY(-52px) scale(0.15);opacity:0}
        }
        @keyframes numberPop {
          0%{transform:scale(0.4);opacity:0}
          65%{transform:scale(1.1);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes badgePop {
          0%{transform:scale(0.7);opacity:0}
          70%{transform:scale(1.06);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
        @keyframes statsPop {
          0%{transform:scale(0.85);opacity:0}
          70%{transform:scale(1.03);opacity:1}
          100%{transform:scale(1);opacity:1}
        }
      `}</style>

      {/* Floating confetti shapes */}
      {shapes.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: s.top, left: s.left,
          width: s.size, height: s.size,
          background: s.color,
          borderRadius: s.type === 'c' ? '50%' : '2px',
          opacity: 0.4,
          animation: `floatShape ${s.dur} ease-in-out infinite`,
          animationDelay: s.delay,
          ['--ms-r' as any]: `${s.r}deg`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Close X */}
      <button
        onClick={() => router.push('/home')}
        style={{
          position: 'absolute', top: 18, right: 18,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50%', width: 34, height: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
          fontSize: 15, lineHeight: '1',
        }}
      >✕</button>

      {/* Icon with rising sparks (fire only for 7 days) */}
      <div style={{
        position: 'relative',
        marginBottom: 10,
        animation: 'iconPulse 1.6s ease-in-out infinite',
        fontSize: 76,
        lineHeight: 1,
      }}>
        {icon}
        {isFireMilestone(streak) && (
          <>
            <div style={{ position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: '#F5A623', left: '30%', top: '10%', animation: 'sparkRise 1.4s ease-out infinite', animationDelay: '0s' }} />
            <div style={{ position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: '#fff', left: '55%', top: '5%', animation: 'sparkRise 1.6s ease-out infinite', animationDelay: '0.45s' }} />
            <div style={{ position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: '#F5A623', left: '18%', top: '20%', animation: 'sparkRise 1.3s ease-out infinite', animationDelay: '0.85s' }} />
            <div style={{ position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: '#FFD580', left: '68%', top: '15%', animation: 'sparkRise 1.5s ease-out infinite', animationDelay: '0.25s' }} />
          </>
        )}
      </div>

      {/* Number */}
      <div style={{
        fontSize: 96, fontWeight: 900, color: '#F5A623',
        lineHeight: 1,
        animation: 'numberPop 0.55s cubic-bezier(.34,1.56,.64,1) 0.15s both',
        marginBottom: 4,
      }}>
        {streak}
      </div>

      {/* day streak label */}
      <div style={{
        fontSize: 17, fontWeight: 600,
        color: 'rgba(255,255,255,0.5)',
        letterSpacing: '0.03em',
        marginBottom: 18,
        animation: 'fadeUp 0.4s ease 0.3s both',
      }}>
        day streak
      </div>

      {/* Social proof badge */}
      <div style={{ animation: 'badgePop 0.5s cubic-bezier(.34,1.56,.64,1) 0.45s both', marginBottom: 20 }}>
        <div style={{
          background: 'rgba(245,166,35,0.12)',
          border: '1px solid rgba(245,166,35,0.28)',
          borderRadius: 20, padding: '6px 14px',
          fontSize: 12, fontWeight: 600,
          color: '#F5A623', letterSpacing: '0.02em',
        }}>
          {socialProof}
        </div>
      </div>

      {/* Stats pills */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        justifyContent: 'center', marginBottom: 22,
        animation: 'statsPop 0.5s cubic-bezier(.34,1.56,.64,1) 0.6s both',
      }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
          ✅ {tasksDone} tasks done
        </div>
        {bonusTasks > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            ⚡ {bonusTasks} bonus {bonusTasks === 1 ? 'task' : 'tasks'}
          </div>
        )}
        {shields > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            🛡️ {shields} {shields === 1 ? 'shield' : 'shields'} earned
          </div>
        )}
      </div>

      {/* Personalised message */}
      <div style={{
        animation: 'fadeUp 0.5s ease 0.75s both',
        textAlign: 'center', maxWidth: 268,
        marginBottom: 48, lineHeight: 1.65,
      }}>
        <span style={{ fontSize: 19, fontWeight: 700, fontStyle: 'italic', color: '#fff' }}>
          {hook}
        </span>
        <br />
        <span style={{ fontSize: 16, fontWeight: 400, fontStyle: 'italic', color: 'rgba(255,255,255,0.72)' }}>
          {closer}
        </span>
      </div>

      {/* Share button full width */}
      <div style={{ width: '100%', maxWidth: 320, animation: 'fadeUp 0.5s ease 0.9s both' }}>
        <button
          onClick={handleShare}
          style={{
            width: '100%', background: '#F5A623',
            border: 'none', borderRadius: 16,
            padding: '17px', fontSize: 16, fontWeight: 700,
            color: '#1a1a2e', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 9,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share this
        </button>
      </div>
    </div>
  )
}