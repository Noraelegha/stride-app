'use client'
import BottomNav from '@/components/BottomNav'

const MEMBERS = [
  { name: 'Nora (you)', initial: 'N', color: '#F5A623', streak: 7 },
  { name: 'Ruth',       initial: 'R', color: '#4A9EDB', streak: 11 },
  { name: 'Melody',     initial: 'M', color: '#9B59B6', streak: 9 },
  { name: 'Abimbola',   initial: 'A', color: '#E67E22', streak: 5 },
]

export default function CommunityPage() {
  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>
      <div style={{ background: '#1a1a2e', padding: '52px 22px 20px', flexShrink: 0 }}>
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 900, marginBottom: '3px' }}>Community</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px' }}>People building alongside you</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* This week's numbers */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            This Week&apos;s Numbers
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { num: '147', ico: '✅', lbl: 'Tasks done',    color: '#F5A623' },
              { num: '11',  ico: '🔥', lbl: 'Best streak',   color: '#1a1a2e' },
              { num: '12',  ico: '⚡', lbl: 'Bonus tasks',   color: '#1a1a2e' },
              { num: '18',  ico: '👥', lbl: 'Active users',  color: '#1a1a2e' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '8px' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: s.color }}>{s.num}</div>
                <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                  <span>{s.ico}</span> {s.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dash message */}
        <div style={{ background: '#1a1a2e', borderRadius: '13px', padding: '14px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>DASH</div>
          <p style={{ fontSize: '13px', color: '#fff', lineHeight: 1.55, margin: 0 }}>
            147 tasks. 147 times someone chose their goal over the excuse. That is not a group chat. That is a movement. 🔒
          </p>
        </div>

        {/* Top streaks leaderboard */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Top Streaks This Week
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {MEMBERS.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', background: m.color,
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#fff',
                }}>
                  {m.initial}
                </div>
                <div style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{m.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px' }}>🔥</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e' }}>{m.streak}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}