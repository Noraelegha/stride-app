'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeColor from '@/components/ThemeColor'

export default function LockedInPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [notifRequesting, setNotifRequesting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const handleAllowNotifications = async () => {
    setNotifRequesting(true)
    try {
      const OneSignal = (await import('react-onesignal')).default
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: true,
      })
      await OneSignal.Notifications.requestPermission()
      const stored = localStorage.getItem('stride_user')
      if (stored) {
        const userData = JSON.parse(stored)
        await OneSignal.login(userData.email)
      }
    } catch (e) {
      console.error('Notification setup failed:', e)
    }
    router.push('/home')
  }

  return (
    <div style={{
      flex: 1, minHeight: '100vh',
      background: '#4CAF50',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 24px 40px',
      textAlign: 'center',
      gap: '18px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <ThemeColor color="#4CAF50" />

      <div style={{
        background: '#fff', borderRadius: '20px', padding: '7px 18px',
        fontSize: '13px', fontWeight: 800, color: '#4CAF50', display: 'inline-block',
      }}>GOOD JOB! 🎉</div>

      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        {[
          { bg: '#F5A623', left: '4%',  top: '20%', delay: '0s',   size: 7 },
          { bg: '#fff',    left: '85%', top: '10%', delay: '.3s',  size: 5 },
          { bg: '#fff',    left: '18%', top: '5%',  delay: '.6s',  size: 9 },
          { bg: '#F5A623', left: '75%', top: '30%', delay: '.9s',  size: 5 },
          { bg: '#fff',    left: '50%', top: '2%',  delay: '.45s', size: 7 },
          { bg: '#F5A623', left: '30%', top: '80%', delay: '1s',   size: 5 },
          { bg: '#fff',    left: '70%', top: '75%', delay: '.75s', size: 9 },
        ].map((c, i) => (
          <div key={i} className="cd" style={{
            background: c.bg, left: c.left, top: c.top,
            animationDelay: c.delay, width: c.size, height: c.size,
            borderRadius: i === 2 || i === 6 ? '2px' : '50%',
          }} />
        ))}
        <div style={{
          width: '96px', height: '96px',
          background: 'rgba(255,255,255,0.25)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'cel .5s ease-in-out infinite alternate',
        }}>
          <svg viewBox="0 0 24 24" fill="white" width="44" height="44">
            <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
          </svg>
        </div>
      </div>

      <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
        You are locked in. 🔒
      </div>
      <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxWidth: '300px' }}>
        Dash has your full briefing. The trail is set. Your first task is ready now.
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.18)', borderRadius: '16px',
        padding: '16px', width: '100%', textAlign: 'left',
        border: '1px solid rgba(255,255,255,0.25)',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
          What happens next
        </div>
        {[
          { icon: '🕐', text: 'Your first task is waiting on the home screen' },
          { icon: '✓',  text: 'Complete it and your streak starts' },
          { icon: '⚡', text: 'Dash checks in at 8 AM and 8 PM' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: i < 2 ? '9px' : 0 }}>
            <span style={{ fontSize: '14px', width: '18px', textAlign: 'center', color: '#fff', fontWeight: item.icon === '✓' ? 700 : 400 }}>{item.icon}</span>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)' }}>{item.text}</span>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.18)', borderRadius: '16px',
        padding: '15px', width: '100%', textAlign: 'left',
        border: '1px solid rgba(255,255,255,0.25)',
      }}>
        <div style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Your goal</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{user?.goalShort || user?.goal || 'Your goal'}</div>
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>Your big prize</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{user?.prizeShort || user?.bigPrize || 'Your big prize'}</div>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.18)', borderRadius: '16px',
        padding: '16px', width: '100%', textAlign: 'left',
        border: '1px solid rgba(255,255,255,0.25)',
      }}>
        <div style={{ fontSize: '22px', marginBottom: '8px' }}>🔔</div>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '5px' }}>
          One last thing.
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, marginBottom: '14px' }}>
          Dash shows up daily at 8am with your task. Allow notifications so you never miss it.
        </div>
        <button
          onClick={handleAllowNotifications}
          disabled={notifRequesting}
          style={{
            width: '100%', background: '#fff', color: '#4CAF50',
            border: 'none', borderRadius: '12px', padding: '14px',
            fontSize: '15px', fontWeight: 700, cursor: 'pointer',
            opacity: notifRequesting ? 0.7 : 1,
          }}
        >
          {notifRequesting ? 'Setting up...' : 'Allow notifications ⚡'}
        </button>
      </div>

    </div>
  )
}