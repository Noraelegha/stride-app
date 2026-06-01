'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Share2 } from 'lucide-react'
import ThemeColor from '@/components/ThemeColor'

export default function MilestonePage() {
  const router = useRouter()
  const [showShare, setShowShare] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const streak = user?.streak || 7
  const shareText = `${streak} days. No excuses. Just steps. I have been showing up for my goal every single day on Stride. ⚡ stride-app-one.vercel.app`

  const handleShare = async (platform: string) => {
    const encoded = encodeURIComponent(shareText)
    const url = 'https://stride-app-one.vercel.app'

    const links: Record<string, string> = {
      WhatsApp: `https://wa.me/?text=${encoded}`,
      X: `https://twitter.com/intent/tweet?text=${encoded}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encoded}`,
      Instagram: '',
      Messages: `sms:?body=${encoded}`,
    }

    if (platform === 'Instagram') {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setShowShare(false)
      return
    }

    if (platform === 'Copy link') {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setShowShare(false)
      return
    }

    if (platform === 'Native share' && navigator.share) {
      await navigator.share({ text: shareText, url })
      setShowShare(false)
      return
    }

    if (links[platform]) {
      window.open(links[platform], '_blank')
      setShowShare(false)
    }
  }

  const shareApps = [
    { name: 'WhatsApp', emoji: '💬' },
    { name: 'X', emoji: '✖️' },
    { name: 'Facebook', emoji: '📘' },
    { name: 'Messages', emoji: '💌' },
    { name: 'Instagram', emoji: '📸' },
    { name: 'Copy link', emoji: '🔗' },
  ]

  const milestoneMessage = () => {
    if (streak >= 30) return 'One month of showing up. That is rare.'
    if (streak >= 14) return 'Two weeks. The habit is real now.'
    if (streak >= 7) return 'One week in. You are building something.'
    return 'Keep going. Every day counts.'
  }

  return (
    <div style={{
      flex: 1, minHeight: '100vh',
      background: '#0f1623',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', position: 'relative',
    }}>
      <ThemeColor color="#0f1623" />

      {copied && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%',
          transform: 'translateX(-50%)',
          background: '#4CAF50', color: '#fff',
          padding: '10px 20px', borderRadius: '20px',
          fontSize: '13px', fontWeight: 700, zIndex: 9999,
        }}>
          Copied to clipboard ✓
        </div>
      )}

      {/* Milestone card */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f1623 100%)',
        borderRadius: '24px', padding: '32px 28px',
        width: '100%', maxWidth: '360px',
        textAlign: 'center',
        border: '1px solid rgba(245,166,35,0.3)',
        marginBottom: '20px',
        boxShadow: '0 0 40px rgba(245,166,35,0.08)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔥</div>
        <div style={{
          color: '#F5A623', fontSize: '72px', fontWeight: 900,
          lineHeight: 1, letterSpacing: '-2px',
        }}>
          {streak}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginBottom: '20px', letterSpacing: '0.05em' }}>
          day streak
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
          <p style={{
            color: 'rgba(255,255,255,0.8)', fontSize: '15px',
            fontStyle: 'italic', lineHeight: 1.6, margin: 0,
          }}>
            {milestoneMessage()}
          </p>
        </div>
        <div style={{
          marginTop: '20px', color: 'rgba(255,255,255,0.25)',
          fontSize: '12px', letterSpacing: '3px', fontWeight: 700,
        }}>
          STRIDE ⚡
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '360px' }}>
        <button
          onClick={() => router.push('/home')}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)',
            borderRadius: '14px', padding: '16px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Close
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ text: shareText, url: 'https://stride-app-one.vercel.app' })
            } else {
              setShowShare(true)
            }
          }}
          style={{
            flex: 2, background: '#F5A623', color: '#0f1623', fontWeight: 800,
            border: 'none', borderRadius: '14px', padding: '16px',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px', fontSize: '14px',
          }}
        >
          <Share2 size={16} />
          Share this
        </button>
      </div>

      {/* Share sheet */}
      {showShare && (
        <div
          onClick={() => setShowShare(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'flex-end', zIndex: 999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a2e', borderRadius: '20px 20px 0 0',
              padding: '24px', width: '100%',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '16px' }}>Share your milestone</h3>
              <button
                onClick={() => setShowShare(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {shareApps.map(app => (
                <button
                  key={app.name}
                  onClick={() => handleShare(app.name)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px', padding: '16px 8px',
                    cursor: 'pointer', color: '#e2e8f0',
                    fontSize: '12px', fontWeight: 600,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '22px' }}>{app.emoji}</span>
                  {app.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}