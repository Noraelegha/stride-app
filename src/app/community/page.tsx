'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

type Member = { name: string; streak: number }

const WEEKLY_MESSAGES = [
  (tasks: number, streak: number) => `${tasks} tasks done across this community. ${tasks} times someone chose the goal over the excuse. That is not a group chat. That is a movement. 🔒`,
  (tasks: number, streak: number) => `The best streak in this group is ${streak} days. Someone set that bar. The question is who beats it next. 🏆`,
  (tasks: number, streak: number) => `Every person here started with just one task. The people at the top simply refused to stop. Keep going. ⚡`,
  (tasks: number, streak: number) => `Progress is not always linear. But showing up is. You are here. That already makes you different. 🔥`,
  (tasks: number, streak: number) => `${tasks} tasks done. Every single one was a choice. The right one. Build on it this week. 💪`,
  (tasks: number, streak: number) => `The gap between where you are and where you want to be is filled with daily tasks. One at a time. 🎯`,
  (tasks: number, streak: number) => `You do not rise to the level of your goals. You fall to the level of your systems. Stride is your system. 🔒`,
  (tasks: number, streak: number) => `${streak} days at the top. That is what commitment actually looks like. Match it. Then beat it. 🔥`,
]

const getWeeklyMessage = (totalTasks: number, bestStreak: number) => {
  const weekNum = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7)) % WEEKLY_MESSAGES.length
  return WEEKLY_MESSAGES[weekNum](totalTasks, bestStreak)
}

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<Member[]>([])
  const [totalTasks, setTotalTasks] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [activeUsers, setActiveUsers] = useState(0)
  const [bonusTotal, setBonusTotal] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (stored) setUser(JSON.parse(stored))

    const fetchCommunity = async () => {
      try {
        const { data } = await supabase
          .from('stride_users')
          .select('name, streak, tasks_done, bonus_tasks')
          .order('streak', { ascending: false })

        if (data && data.length > 0) {
          setLeaderboard(data.map((u: any) => ({ name: u.name, streak: u.streak || 0 })))
          setTotalTasks(data.reduce((sum: number, u: any) => sum + (u.tasks_done || 0), 0))
          setBestStreak(Math.max(...data.map((u: any) => u.streak || 0)))
          setActiveUsers(data.filter((u: any) => (u.streak || 0) > 0).length)
          setBonusTotal(data.reduce((sum: number, u: any) => sum + (u.bonus_tasks || 0), 0))
        }
      } catch (e) {
        console.error('Community fetch failed:', e)
      }
    }

    fetchCommunity()
  }, [])

  const avatarColors = ['#F5A623', '#4CAF50', '#9c27b0', '#e91e63', '#2196f3', '#ff5722', '#00bcd4']

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>
      <div style={{ background: '#1a1a2e', padding: '52px 22px 20px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, marginBottom: '3px' }}>Community</h1>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.45)', margin: 0 }}>People building alongside you</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* This week's numbers */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            This week&apos;s numbers
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
            {[
              { val: totalTasks || 0,  lbl: 'Tasks done',   ico: '✅', gold: true },
              { val: bestStreak || 0,  lbl: 'Best streak',  ico: '🔥' },
              { val: bonusTotal || 0,  lbl: 'Bonus tasks',  ico: '⚡' },
              { val: activeUsers || 0, lbl: 'Active users', ico: '👥' },
            ].map((n, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: n.gold ? '#F5A623' : '#1a1a2e' }}>{n.val}</div>
                <div style={{ fontSize: '11px', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                  <span>{n.ico}</span><span>{n.lbl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly rotating Dash message */}
        <div style={{ background: '#1a1a2e', borderRadius: '13px', padding: '14px 16px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '5px' }}>Dash</div>
          <p style={{ fontSize: '13px', color: '#fff', lineHeight: 1.55, margin: 0 }}>
            {getWeeklyMessage(totalTasks, bestStreak)}
          </p>
        </div>

        {/* Leaderboard */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Top Streaks This Week
          </div>
          {leaderboard.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>Loading community data...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {leaderboard.map((m, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: '14px', padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  border: m.name === user?.name ? '1.5px solid #F5A623' : '1px solid transparent',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: avatarColors[i % avatarColors.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0,
                  }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>
                      {m.name}{m.name === user?.name ? ' (you)' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🔥</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#F5A623' }}>{m.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      <BottomNav />
    </div>
  )
}