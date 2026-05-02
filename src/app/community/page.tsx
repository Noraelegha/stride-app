'use client'
import { Users, Flame } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const members = [
  { name: 'Nora',      streak: 7,  persona: 'Solo-Hustler' },
  { name: 'Ruth',      streak: 11, persona: 'Career Pivot' },
  { name: 'Nimi',      streak: 9,  persona: 'Learner' },
  { name: 'Abimbola',  streak: 6,  persona: 'Solo-Hustler' },
  { name: 'Melody',    streak: 4,  persona: 'Learner' },
  { name: 'Susan',     streak: 3,  persona: 'Solo-Hustler' },
  { name: 'Benjamin',  streak: 2,  persona: 'Learner' },
  { name: 'Patricia',  streak: 1,  persona: 'Solo-Hustler' },
]

export default function CommunityPage() {
  return (
    <div className="screen" style={{ background: '#0f1623' }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '52px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 900, marginBottom: '4px' }}>Community</h1>
        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Everyone showing up this week</p>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Stats */}
        <div style={{
          background: '#1a1a2e', borderRadius: '16px', padding: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
        }}>
          {[
            { label: 'Active this week', value: '8', emoji: '👥' },
            { label: 'Tasks completed', value: '147', emoji: '✅' },
            { label: 'Best streak', value: '11d', emoji: '🔥' },
            { label: 'Bonus tasks', value: '12', emoji: '⚡' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>{stat.emoji}</div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: '24px', lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Dash message */}
        <div style={{
          background: 'rgba(245,166,35,0.08)',
          border: '1px solid rgba(245,166,35,0.2)',
          borderRadius: '14px', padding: '16px',
        }}>
          <p style={{ color: '#F5A623', fontSize: '14px', lineHeight: 1.6 }}>
            147 tasks. 147 times someone chose their goal over the excuse. That is not a group chat. That is a movement. 🔒
          </p>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px' }}>— Dash ⚡</p>
        </div>

        {/* Leaderboard */}
        <div>
          <h3 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Streak Leaderboard
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.sort((a, b) => b.streak - a.streak).map((member, i) => (
              <div key={member.name} style={{
                background: '#1a1a2e', borderRadius: '12px', padding: '14px 16px',
                border: i === 0 ? '1.5px solid rgba(245,166,35,0.4)' : '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <span style={{
                  color: i === 0 ? '#F5A623' : '#94a3b8',
                  fontWeight: 700, fontSize: '14px', width: '20px',
                }}>
                  {i + 1}
                </span>
                <div style={{
                  width: '36px', height: '36px',
                  background: i === 0 ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.06)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i === 0 ? '#F5A623' : '#94a3b8', fontWeight: 800, fontSize: '14px',
                }}>
                  {member.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{member.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>{member.persona}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Flame size={14} color="#F5A623" fill="#F5A623" />
                  <span style={{ color: '#F5A623', fontWeight: 800, fontSize: '15px' }}>{member.streak}</span>
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