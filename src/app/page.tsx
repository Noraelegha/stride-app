'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Screen = 'loading' | 'welcome' | 'login'

export default function SplashPage() {
  const router = useRouter()
  const [screen, setScreen] = useState<Screen>('loading')
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('stride_user')
    if (user) {
      const t = setTimeout(() => router.push('/home'), 1800)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setScreen('welcome'), 1000)
      return () => clearTimeout(t)
    }
  }, [router])

  const handleLogin = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setChecking(true)
    setError('')

    try {
      const { data, error: dbError } = await supabase
        .from('stride_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (dbError || !data) {
        setError('No account found with that email. Check the address or get started below.')
        setChecking(false)
        return
      }

      const userProfile = {
        name: data.name,
        email: data.email,
        goalShort: data.goal_short,
        prizeShort: data.prize_short,
        persona: data.persona,
        goal: data.goal,
        bigPrize: data.big_prize,
        personalWhy: data.personal_why,
        coachStyle: data.coach_style,
        dailyTime: data.daily_time,
        domain: data.domain,
        prior: data.prior,
        priorDetail: data.prior_detail,
        hasDeadline: data.has_deadline,
        deadline: data.deadline,
        streak: data.streak || 0,
        phase: data.phase || 1,
        tasksDone: data.tasks_done || 0,
        score: data.score || 0,
        bonusTasks: data.bonus_tasks || 0,
        shields: data.shields || 1,
        morningReminder: data.morning_reminder || '08:00',
        eveningReminder: data.evening_reminder || '20:00',
        joinedAt: data.joined_at,
      }

      localStorage.setItem('stride_user', JSON.stringify(userProfile))
      router.push('/home')
    } catch {
      setError('Something went wrong. Please try again.')
      setChecking(false)
    }
  }

  return (
    <div style={{
      flex: 1,
      minHeight: '100vh',
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      padding: '40px 32px',
      textAlign: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    }}>
      <style>{`
        @keyframes floatBolt {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes dotPulse {
          0%,100% { opacity: 0.3; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1.15); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Bolt */}
      <div style={{
        width: '96px', height: '96px',
        borderRadius: '50%', background: '#F5A623',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'floatBolt 3s ease-in-out infinite',
      }}>
        <svg viewBox="0 0 24 24" fill="#1a1a2e" width="46" height="46">
          <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
        </svg>
      </div>

      {/* STRIDE */}
      <h1 style={{
        fontSize: '40px', fontWeight: 800, color: '#F5A623',
        letterSpacing: '4px', margin: 0, lineHeight: 1,
        animation: 'fadeUp 0.6s ease 0.2s both',
      }}>
        STRIDE
      </h1>

      {/* Tagline */}
      <p style={{
        fontSize: '13px', color: 'rgba(255,255,255,0.45)',
        letterSpacing: '0.8px', margin: '-4px 0 0',
        animation: 'fadeUp 0.6s ease 0.4s both',
      }}>
        Stop guessing. Start stepping.
      </p>

      {/* Loading dots */}
      {screen === 'loading' && (
        <div style={{ display: 'flex', gap: '9px', marginTop: '20px', animation: 'fadeUp 0.6s ease 0.8s both' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '7px', height: '7px', borderRadius: '50%', background: '#F5A623',
              animation: `dotPulse 0.9s ease-in-out ${i * 0.18}s infinite`,
            }} />
          ))}
        </div>
      )}

      {/* Welcome buttons */}
      {screen === 'welcome' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '12px', marginTop: '14px', width: '100%', maxWidth: '300px',
          animation: 'fadeUp 0.5s ease both',
        }}>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              width: '100%', background: '#F5A623', color: '#1a1a2e',
              fontSize: '17px', fontWeight: 700, padding: '15px 0',
              borderRadius: '50px', border: 'none', cursor: 'pointer',
            }}
          >
            Get started
          </button>

          <button
            onClick={() => { setScreen('login'); setError('') }}
            style={{
              width: '100%', background: 'transparent',
              color: 'rgba(255,255,255,0.65)', fontSize: '15px', fontWeight: 600,
              padding: '14px 0', borderRadius: '50px', cursor: 'pointer',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}
          >
            Log in
          </button>
        </div>
      )}

      {/* Login form */}
      {screen === 'login' && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '12px', marginTop: '14px', width: '100%', maxWidth: '300px',
          animation: 'fadeUp 0.4s ease both',
        }}>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>
            Enter the email address you used to sign up.
          </p>

          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="you@example.com"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.08)',
              border: `1.5px solid ${error ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: '14px', padding: '14px 16px',
              fontSize: '15px', color: '#fff', outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          {error && (
            <p style={{ fontSize: '12px', color: '#f87171', margin: 0, lineHeight: 1.5, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={checking}
            style={{
              width: '100%', background: '#F5A623', color: '#1a1a2e',
              fontSize: '16px', fontWeight: 700, padding: '15px 0',
              borderRadius: '50px', border: 'none',
              cursor: checking ? 'default' : 'pointer',
              opacity: checking ? 0.7 : 1,
            }}
          >
            {checking ? 'Checking...' : 'Continue →'}
          </button>

          <button
            onClick={() => { setScreen('welcome'); setError(''); setEmail('') }}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.35)', fontSize: '13px',
              cursor: 'pointer', textDecoration: 'underline', padding: '4px',
            }}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}