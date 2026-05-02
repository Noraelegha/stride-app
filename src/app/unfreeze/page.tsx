'use client'
import { useRouter } from 'next/navigation'

export default function UnfreezePage() {
  const router = useRouter()

  return (
    <div style={{
      flex: 1, minHeight: '100vh',
      background: 'linear-gradient(160deg, #0a1628 0%, #0f2040 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
    }}
    onClick={() => router.push('/home')}
    >
      {/* Ice flame SVG */}
      <svg width="100" height="130" viewBox="0 0 100 130" style={{ marginBottom: '32px' }}>
        <defs>
          <radialGradient id="iceGlow" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="iceFire" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="110" rx="35" ry="8" fill="url(#iceGlow)" />
        <path d="M50,10 C35,30 20,50 25,75 C28,88 38,100 50,105 C62,100 72,88 75,75 C80,50 65,30 50,10Z"
          fill="url(#iceFire)" opacity="0.9" />
        <path d="M50,30 C42,45 38,60 40,75 C42,85 46,92 50,95 C54,92 58,85 60,75 C62,60 58,45 50,30Z"
          fill="#bfdbfe" opacity="0.5" />
        <polygon points="50,15 54,22 48,22" fill="white" opacity="0.8" />
        <polygon points="44,8 47,14 41,13" fill="#93c5fd" opacity="0.7" />
        <polygon points="56,11 58,17 52,16" fill="#93c5fd" opacity="0.7" />
      </svg>

      <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 900, marginBottom: '12px' }}>
        Shield used. Streak protected.
      </h2>
      <p style={{ color: '#93c5fd', fontSize: '15px', lineHeight: 1.6, marginBottom: '8px', maxWidth: '300px' }}>
        You missed yesterday but your streak is safe.
      </p>
      <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, maxWidth: '300px' }}>
        That shield was yours because you earned it. Now let us keep going.
      </p>

      <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '40px' }}>
        Tap anywhere to continue
      </p>
    </div>
  )
}