'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Share2 } from 'lucide-react'

export default function MilestonePage() {
  const router = useRouter()
  const [showShare, setShowShare] = useState(false)

  const shareApps = ['WhatsApp', 'Instagram', 'X', 'Facebook', 'Messages', 'Copy link']

  return (
    <div style={{
      flex: 1, minHeight: '100vh',
      background: '#0f1623',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      {/* Milestone card */}
      <div style={{
        background: '#1a1a2e',
        borderRadius: '24px',
        padding: '32px 28px',
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center',
        border: '1px solid rgba(245,166,35,0.3)',
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔥</div>
        <div style={{ color: '#F5A623', fontSize: '64px', fontWeight: 900, lineHeight: 1 }}>7</div>
        <div style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '20px' }}>day streak</div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <p style={{ color: '#e2e8f0', fontSize: '15px', fontStyle: 'italic', lineHeight: 1.6 }}>
            I have shown up for my goal every single day for 7 days. No excuses. Just steps.
          </p>
        </div>
        <div style={{ marginTop: '20px', color: '#94a3b8', fontSize: '13px', letterSpacing: '2px' }}>
          STRIDE ⚡
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '360px' }}>
        <button onClick={() => router.push('/home')} className="ghost-btn" style={{ flex: 1 }}>
          Close
        </button>
        <button onClick={() => setShowShare(true)} style={{
          flex: 2, background: '#F5A623', color: '#0f1623', fontWeight: 700,
          border: 'none', borderRadius: '14px', padding: '16px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <Share2 size={16} />
          Share this
        </button>
      </div>

      {/* Share sheet */}
      {showShare && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end', zIndex: 999,
        }}>
          <div style={{
            background: '#1a1a2e', borderRadius: '20px 20px 0 0',
            padding: '24px', width: '100%', animation: 'slideUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ color: 'white', fontWeight: 700 }}>Share your milestone</h3>
              <button onClick={() => setShowShare(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {shareApps.map(app => (
                <button key={app} onClick={() => setShowShare(false)} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '14px 8px', cursor: 'pointer',
                  color: '#e2e8f0', fontSize: '12px', fontWeight: 500,
                }}>
                  {app}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}