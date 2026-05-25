'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { supabase } from '@/lib/supabase'

type Panel = 'task' | 'hint' | 'srp' | 'streakShow' | 'bonus' | 'locked'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [panel, setPanel] = useState<Panel>('task')
  const [showTut, setShowTut] = useState(true)
  const [pickedChip, setPickedChip] = useState('')
  const [showWall, setShowWall] = useState(false)
  const [pickedWall, setPickedWall] = useState('')
  const [wallNote, setWallNote] = useState('')
  const [bonusCompleted, setBonusCompleted] = useState(false)
  const [taskData, setTaskData] = useState<any>(null)
  const [taskLoading, setTaskLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const cardRef = useRef<HTMLDivElement>(null)
  const bgDoneRef = useRef<HTMLDivElement>(null)
  const bgHintRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, curX: 0 })
  const engagedReplyRef = useRef(false)

  const checkMissedDays = (userData: any, lastActiveDate: string | null): number => {
    if (!lastActiveDate) return 0
    const last = new Date(lastActiveDate)
    const today = new Date()
    last.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff - 1)
  }

  const fetchTodayTask = async (userData: any) => {
    try {
      setTaskLoading(true)

      const { data: history } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_email', userData.email)
        .order('task_date', { ascending: true })

      const today = new Date().toISOString().split('T')[0]
      const todayTask = history?.find((t: any) => t.task_date === today)

      if (todayTask) {
        setTaskData(todayTask)
        setTaskLoading(false)
        return
      }

      const res = await fetch('/api/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userData, taskHistory: history || [] }),
      })

      const { task } = await res.json()

      if (!task) {
        setTaskLoading(false)
        return
      }

      const { error: insertError } = await supabase.from('daily_tasks').insert({
        user_email: userData.email,
        day_number: (userData.tasksDone || 0) + 1,
        task_text: task.taskText,
        dash_message: task.dashMessage,
        task_date: today,
        status: 'pending',
        chip1: task.chip1,
        chip2: task.chip2,
        chip_type: task.chipType || 'standard',
      })

      if (insertError) {
        console.error('Task insert failed:', insertError)
        setTaskLoading(false)
        return
      }

      const { data: insertedTask } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_email', userData.email)
        .eq('task_date', today)
        .single()

      setTaskData(insertedTask)
      setTaskLoading(false)
    } catch (e) {
      console.error('Task fetch failed:', e)
      setTaskLoading(false)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('stride_user')
    if (!stored) { router.push('/onboarding'); return }
    const userData = JSON.parse(stored)

    const runChecks = async () => {
      const fromRecovery = localStorage.getItem('stride_from_recovery')
      if (fromRecovery) {
        localStorage.removeItem('stride_from_recovery')
        setUser(userData)
        fetchTodayTask(userData)
        return
      }

      const { data: dbUser } = await supabase
        .from('stride_users')
        .select('last_active, shields')
        .eq('email', userData.email)
        .single()

      const missedDays = checkMissedDays(userData, dbUser?.last_active)
      const shields = dbUser?.shields ?? userData.shields ?? 0

      if (missedDays >= 3) {
        router.push('/return')
        return
      }

      if (missedDays === 2) {
        router.push('/recovery')
        return
      }

      if (missedDays === 1 && shields > 0) {
        await supabase
          .from('stride_users')
          .update({ shields: shields - 1 })
          .eq('email', userData.email)

        const updated = { ...userData, shields: shields - 1 }
        localStorage.setItem('stride_user', JSON.stringify(updated))
        router.push('/unfreeze')
        return
      }

      if (missedDays === 1 && shields === 0) {
        await supabase
          .from('stride_users')
          .update({ streak: 0 })
          .eq('email', userData.email)

        const updated = { ...userData, streak: 0 }
        localStorage.setItem('stride_user', JSON.stringify(updated))
        setUser(updated)
        fetchTodayTask(updated)
        return
      }

      setUser(userData)
      fetchTodayTask(userData)

      const dayLocked = localStorage.getItem('stride_day_locked')
      if (dayLocked === 'true') {
        setPanel('locked')
        localStorage.removeItem('stride_day_locked')
      }
    }

    runChecks()
  }, [router])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h >= 5  && h < 12) return { text: 'Good morning',   emoji: '🌞' }
    if (h >= 12 && h < 17) return { text: 'Good afternoon', emoji: '☀️' }
    if (h >= 17 && h < 21) return { text: 'Good evening',   emoji: '🌅' }
    return                         { text: 'Good night',     emoji: '🌙' }
  }

  const now = new Date()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - now.getDay() + i)
    return {
      day: dayNames[d.getDay()],
      num: d.getDate(),
      isToday: d.toDateString() === now.toDateString(),
    }
  })

  const startDrag = (x: number) => {
    if (panel !== 'task') return
    drag.current = { active: true, startX: x, curX: x }
  }
  const moveDrag = (x: number) => {
    if (!drag.current.active) return
    drag.current.curX = x
    const dx = x - drag.current.startX
    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${dx}px) rotate(${dx * 0.03}deg)`
      cardRef.current.style.transition = 'none'
    }
    const r = Math.min(Math.abs(dx) / 100, 1)
    if (bgDoneRef.current) bgDoneRef.current.style.opacity = dx > 0 ? String(r) : '0'
    if (bgHintRef.current) bgHintRef.current.style.opacity = dx < 0 ? String(r) : '0'
  }
  const endDrag = () => {
    if (!drag.current.active) return
    drag.current.active = false
    const dx = drag.current.curX - drag.current.startX
    if (dx > 80) {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform .28s ease-in, opacity .28s'
        cardRef.current.style.transform = 'translateX(500px) rotate(20deg)'
        cardRef.current.style.opacity = '0'
      }
      setTimeout(() => {
        setPanel('srp')
        if (bgDoneRef.current) bgDoneRef.current.style.opacity = '0'
      }, 300)
    } else if (dx < -80) {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform .28s ease-in, opacity .28s'
        cardRef.current.style.transform = 'translateX(-500px) rotate(-20deg)'
        cardRef.current.style.opacity = '0'
      }
      setTimeout(() => {
        setPanel('hint')
        if (bgHintRef.current) bgHintRef.current.style.opacity = '0'
      }, 300)
    } else {
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform .36s cubic-bezier(.34,1.56,.64,1)'
        cardRef.current.style.transform = 'none'
      }
      if (bgDoneRef.current) bgDoneRef.current.style.opacity = '0'
      if (bgHintRef.current) bgHintRef.current.style.opacity = '0'
    }
  }

  const wallPlaceholders: Record<string, string> = {
    more:    'What did you do beyond the task? Even small details help Dash build on it tomorrow',
    blocked: 'What got in the way? Could not start, something came up, or got stuck mid task?',
    partial: 'Where did you get to and what is left? Dash will pick it up from there tomorrow',
  }

  const canSubmit =
    !!pickedChip &&
    (!showWall || (!!pickedWall && wallNote.trim().length >= 5))

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitError('')

    try {
      setSubmitting(true)

      const today = new Date().toISOString().split('T')[0]

      const isCompleted = pickedChip === 'chip1' || pickedWall === 'more'
      const isPartial = pickedChip === 'chip2' || pickedWall === 'partial'
      const isBlocked = pickedWall === 'blocked'

      const status = isCompleted ? 'completed' : isPartial ? 'partial' : isBlocked ? 'blocked' : 'partial'

      engagedReplyRef.current = isCompleted

      if (user && taskData) {
        const { error: dailyTaskError } = await supabase
          .from('daily_tasks')
          .update({
            status,
            completed_at: isCompleted ? new Date().toISOString() : null,
            swipe_direction: panel === 'hint' ? 'left' : 'right',
            user_reply: pickedWall || pickedChip,
            hint_type: pickedWall || null,
            hint_text: wallNote.trim() || null,
          })
          .eq('user_email', user.email)
          .eq('task_date', today)

        if (dailyTaskError) {
          console.error('daily_tasks update failed:', dailyTaskError)
          setSubmitError('Something went wrong saving your response. Please try again.')
          return
        }
      }

      if (user && (isCompleted || isPartial)) {
        const newTasksDone = (user.tasksDone || 0) + 1
        const newStreak = (user.streak || 0) + 1
        const newScore = Math.min(Math.round((newTasksDone / newStreak) * 100), 100)
        const currentShields = user.shields || 0
        const newShields = newStreak % 5 === 0 && currentShields < 2
          ? currentShields + 1
          : currentShields

        const { error: userUpdateError } = await supabase
          .from('stride_users')
          .update({
            tasks_done: newTasksDone,
            streak: newStreak,
            score: newScore,
            shields: newShields,
            last_active: new Date().toISOString(),
          })
          .eq('email', user.email)

        if (userUpdateError) {
          console.error('stride_users update failed:', userUpdateError)
          setSubmitError('Something went wrong updating your stats. Please try again.')
          return
        }

        const updatedUser = {
          ...user,
          tasksDone: newTasksDone,
          streak: newStreak,
          score: newScore,
          shields: newShields,
        }

        localStorage.setItem('stride_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }

      if (isBlocked) {
        const { error: blockedError } = await supabase
          .from('stride_users')
          .update({ last_active: new Date().toISOString() })
          .eq('email', user.email)

        if (blockedError) {
          console.error('blocked update failed:', blockedError)
          setSubmitError('Something went wrong. Please try again.')
          return
        }
      }

      setPanel('streakShow')
    } catch (err) {
      console.error('Submit failed:', err)
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) return null

  const currentDay = (user.tasksDone || 0) + 1
  const currentStreak = user.streak || 0
  const taskText = taskData?.task_text || taskData?.taskText || null
  const dashMessage = taskData?.dash_message || taskData?.dashMessage || null
  const timeEstimate = taskData?.timeEstimate || `~${user.dailyTime === 'under10' ? '5' : user.dailyTime === '10to30' ? '15' : '30'} minutes`
  const chip1Label = taskData?.chip1 || 'Completed it'
  const chip2Label = taskData?.chip2 || 'Partially done'
  const chipType = taskData?.chip_type || taskData?.chipType || 'standard'

  if (panel === 'streakShow') {
    return (
      <div style={{ flex: 1, minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center', gap: '14px' }}>
        <div style={{ width: 72, height: 72, background: '#FF9500', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
          <svg viewBox="0 0 28 28" width="32" height="32" fill="none">
            <polyline points="5,14 11,20 23,8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px' }}>🔥</span>
          <span style={{ fontSize: '32px', fontWeight: 900, color: '#1a1a2e' }}>{currentStreak} days</span>
        </div>
        <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.6, maxWidth: '300px', margin: 0 }}>
          {currentStreak} days. You are in the top tier of people who say they will do something and actually do it. Dash sees you. 🏆
        </p>
        {engagedReplyRef.current && (
          <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: '16px', padding: '16px', width: '100%', maxWidth: '320px', textAlign: 'left' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e', marginBottom: '5px' }}>Momentum window open ⚡</div>
            <div style={{ fontSize: '13px', color: '#777', lineHeight: 1.5, marginBottom: '14px' }}>
              Want to go deeper today? Bonus task expires at midnight.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setPanel('bonus')} style={{ flex: 1, background: '#1a1a2e', border: 'none', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
                Yes, more
              </button>
              <button onClick={() => setPanel('locked')} style={{ flex: 1, background: '#fff', border: '1.5px solid #eee', padding: '12px', borderRadius: '12px', fontSize: '14px', color: '#888', cursor: 'pointer' }}>
                Not today
              </button>
            </div>
          </div>
        )}
        {!engagedReplyRef.current && (
          <button onClick={() => setPanel('locked')} style={{ background: '#1a1a2e', border: 'none', padding: '14px 40px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, color: '#fff', cursor: 'pointer', marginTop: '8px' }}>
            See you tomorrow ☀️
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="screen" style={{ background: '#f5f5f7' }}>
      <div style={{ background: '#1a1a2e', padding: '52px 22px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '11px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.45)', marginBottom: '2px' }}>
              {getGreeting().text} {getGreeting().emoji}
            </div>
            <div style={{ fontSize: '21px', fontWeight: 800, color: '#fff' }}>Hi, {user.name || 'there'}</div>
          </div>
          <div style={{ width: 40, height: 40, background: '#F5A623', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#1a1a2e' }}>
            {(user.name || 'S')[0].toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '11px' }}>
          {weekDates.map((d, i) => (
            <div key={i} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '7px 4px', borderRadius: '10px',
              background: d.isToday ? '#F5A623' : 'transparent',
            }}>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 500, color: d.isToday ? 'rgba(26,26,46,.6)' : 'rgba(255,255,255,.4)' }}>
                {d.day}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: d.isToday ? '#1a1a2e' : '#fff' }}>
                {d.num}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,.1)', borderRadius: '16px', padding: '5px 11px' }}>
            <span>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{currentStreak} days</span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>streak</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Phase {user.phase || 1}</span>
            <div style={{ width: 54, height: 3, background: 'rgba(255,255,255,.12)', borderRadius: 2 }}>
              <div style={{ width: `${user.score || 0}%`, height: '100%', background: '#F5A623', borderRadius: 2 }} />
            </div>
            <strong style={{ fontSize: 10, color: '#F5A623' }}>{user.score || 0}%</strong>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '15px 18px', display: 'flex', flexDirection: 'column', gap: '13px' }}>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '9px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e' }}>Today&apos;s task</div>
              <div style={{ fontSize: '12px', color: '#888' }}>See all</div>
            </div>

            {/* Task card container — dynamic height, no fixed 320px */}
            <div style={{ position: 'relative', borderRadius: '20px', minHeight: '220px' }}>

              <div ref={bgDoneRef} style={{
                position: 'absolute', inset: 0, background: '#4CAF50', borderRadius: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                paddingRight: '26px', opacity: 0, zIndex: 1, pointerEvents: 'none',
              }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 7 }}>✅ Done!</div>
              </div>

              <div ref={bgHintRef} style={{
                position: 'absolute', inset: 0, background: '#f0f0f5', border: '1.5px solid #ddd',
                borderRadius: '20px', display: 'flex', alignItems: 'center',
                justifyContent: 'flex-start', paddingLeft: '26px', opacity: 0, zIndex: 1, pointerEvents: 'none',
              }}>
                <div style={{ color: '#888', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>💡 Help</div>
              </div>

              {panel === 'task' && (
                <div
                  ref={cardRef}
                  onMouseDown={e => startDrag(e.clientX)}
                  onMouseMove={e => moveDrag(e.clientX)}
                  onMouseUp={endDrag}
                  onMouseLeave={endDrag}
                  onTouchStart={e => startDrag(e.touches[0].clientX)}
                  onTouchMove={e => moveDrag(e.touches[0].clientX)}
                  onTouchEnd={endDrag}
                  style={{
                    position: 'relative', background: '#fff',
                    borderRadius: '20px', border: '1.5px solid #1a1a2e',
                    padding: '16px 18px 20px', cursor: 'grab', userSelect: 'none',
                    zIndex: 2, display: 'flex', flexDirection: 'column', gap: '10px',
                  }}
                >
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    Day {currentDay} ⚡
                  </div>
                  <div style={{ background: '#f9f9f9', borderRadius: '9px', borderBottomLeftRadius: '2px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '2px' }}>Dash</div>
                    <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.45, margin: 0 }}>
                      {taskLoading ? 'Dash is thinking...' : dashMessage || `Day ${currentDay}. Let's go.`}
                    </p>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5 }}>
                    {taskLoading ? 'Your personalised task is loading...' : taskText || 'Your task is ready. Pull to refresh if it does not appear.'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: '#f5f5f7', borderRadius: '20px', padding: '4px 10px',
                      fontSize: '11px', color: '#888', fontWeight: 600,
                    }}>
                      ⏱ {timeEstimate}
                    </div>
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <span style={{ fontSize: '10px', color: '#ccc' }}>← Help</span>
                      <span style={{ fontSize: '10px', color: '#ccc' }}>Done →</span>
                    </div>
                  </div>
                </div>
              )}

              {panel === 'hint' && (
                <div style={{
                  position: 'relative', background: '#fff',
                  borderRadius: '20px', border: '1.5px solid #F5A623',
                  padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 5,
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', letterSpacing: '.1em', textTransform: 'uppercase' }}>Hint from Dash 💡</div>
                  <div style={{ background: '#fffbf0', borderLeft: '3px solid #F5A623', borderRadius: '0 10px 10px 0', padding: '10px 12px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: '#F5A623', textTransform: 'uppercase', marginBottom: '2px' }}>Dash</div>
                    <p style={{ fontSize: '12px', color: '#444', lineHeight: 1.45, margin: 0 }}>
                      It does not have to be perfect. Done beats perfect every single time. Forget the full task. Here is the smaller version.
                    </p>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5 }}>
                    {taskText ? `Smaller version: just do the first step of "${taskText}" and nothing more.` : 'Pick the smallest possible action related to your goal and spend just 5 minutes on it.'}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f5f5f7', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', color: '#888', fontWeight: 600, alignSelf: 'flex-start' }}>
                    ⏱ ~5 minutes
                  </div>
                  <button
                    onClick={() => setPanel('srp')}
                    style={{ background: '#1a1a2e', border: 'none', padding: '13px', borderRadius: '13px', fontSize: '14px', fontWeight: 700, color: '#fff', cursor: 'pointer', marginTop: '4px' }}
                  >
                    Done
                  </button>
                </div>
              )}

              <div style={{
                position: panel === 'srp' ? 'relative' : 'absolute',
                inset: panel === 'srp' ? 'unset' : 0,
                background: '#fff',
                borderRadius: '20px', border: '1.5px solid #1a1a2e',
                padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px',
                overflowY: 'auto',
                opacity: panel === 'srp' ? 1 : 0,
                pointerEvents: panel === 'srp' ? 'auto' : 'none',
                transition: 'opacity .3s ease',
                zIndex: panel === 'srp' ? 20 : 0,
                minHeight: panel === 'srp' ? 'unset' : '220px',
              }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', letterSpacing: '.1em', textTransform: 'uppercase' }}>Dash</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>How did it go today?</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {chipType === 'checkin' ? (
                    <>
                      <div
                        onClick={() => { setPickedChip('chip1'); setShowWall(false) }}
                        style={{ border: `1.5px solid ${pickedChip === 'chip1' ? '#1a1a2e' : '#eee'}`, borderRadius: '12px', padding: '10px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', background: pickedChip === 'chip1' ? '#f5f5fa' : '#fff', transition: 'all .15s' }}
                      >
                        <span style={{ fontSize: 17, width: 24, textAlign: 'center' }}>✅</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{chip1Label}</span>
                      </div>
                      <div
                        onClick={() => { setPickedChip('chip2'); setShowWall(false) }}
                        style={{ border: `1.5px solid ${pickedChip === 'chip2' ? '#1a1a2e' : '#eee'}`, borderRadius: '12px', padding: '10px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', background: pickedChip === 'chip2' ? '#f5f5fa' : '#fff', transition: 'all .15s' }}
                      >
                        <span style={{ fontSize: 17, width: 24, textAlign: 'center' }}>⏳</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{chip2Label}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        onClick={() => { setPickedChip('chip1'); setShowWall(false) }}
                        style={{ border: `1.5px solid ${pickedChip === 'chip1' ? '#1a1a2e' : '#eee'}`, borderRadius: '12px', padding: '10px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', background: pickedChip === 'chip1' ? '#f5f5fa' : '#fff', transition: 'all .15s' }}
                      >
                        <span style={{ fontSize: 17, width: 24, textAlign: 'center' }}>✅</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{chip1Label}</span>
                      </div>
                      <div
                        onClick={() => { setPickedChip('chip2'); setShowWall(false) }}
                        style={{ border: `1.5px solid ${pickedChip === 'chip2' ? '#1a1a2e' : '#eee'}`, borderRadius: '12px', padding: '10px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', background: pickedChip === 'chip2' ? '#f5f5fa' : '#fff', transition: 'all .15s' }}
                      >
                        <span style={{ fontSize: 17, width: 24, textAlign: 'center' }}>⏱</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{chip2Label}</span>
                      </div>
                      <div
                        onClick={() => { setPickedChip('other'); setShowWall(true); setPickedWall(''); setWallNote('') }}
                        style={{ border: `1.5px solid ${pickedChip === 'other' ? '#1a1a2e' : '#eee'}`, borderRadius: '12px', padding: '10px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', background: pickedChip === 'other' ? '#f5f5fa' : '#fff', transition: 'all .15s' }}
                      >
                        <span style={{ fontSize: 17, width: 24, textAlign: 'center' }}>💬</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>Something else happened.</span>
                      </div>
                    </>
                  )}
                </div>

                {showWall && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a2e' }}>What happened?</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'more',    ico: '🔥', lbl: 'Did more' },
                        { id: 'blocked', ico: '🚧', lbl: 'Hit a wall' },
                        { id: 'partial', ico: '⏸',  lbl: 'Partial' },
                      ].map(w => (
                        <div
                          key={w.id}
                          onClick={() => setPickedWall(w.id)}
                          style={{ border: `1.5px solid ${pickedWall === w.id ? '#1a1a2e' : '#eee'}`, borderRadius: '20px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: pickedWall === w.id ? '#1a1a2e' : '#555', cursor: 'pointer', background: pickedWall === w.id ? '#f5f5fa' : '#fff', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          {w.ico} {w.lbl}
                        </div>
                      ))}
                    </div>
                    {pickedWall && (
                      <>
                        <textarea
                          rows={2}
                          placeholder={wallPlaceholders[pickedWall]}
                          value={wallNote}
                          onChange={e => setWallNote(e.target.value)}
                          style={{ border: '1.5px solid #eee', borderRadius: '10px', padding: '8px 11px', fontSize: '12px', color: '#1a1a2e', outline: 'none', fontFamily: 'inherit', resize: 'none', width: '100%' }}
                        />
                        {wallNote.trim().length < 5 && (
                          <div style={{ fontSize: '11px', color: '#999' }}>
                            Please add a little more detail so Dash can adapt tomorrow better.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {submitError && (
                  <div style={{ fontSize: '12px', color: '#f44', textAlign: 'center', padding: '6px 0' }}>
                    {submitError}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  style={{ background: '#1a1a2e', border: 'none', padding: '11px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#fff', cursor: canSubmit && !submitting ? 'pointer' : 'default', opacity: canSubmit && !submitting ? 1 : 0.3, marginTop: 'auto', transition: 'opacity .2s' }}
                >
                  {submitting ? 'Saving...' : 'Submit'}
                </button>
              </div>

              {panel === 'bonus' && (
                <div style={{
                  position: 'relative', background: '#fff',
                  borderRadius: '20px', border: '1.5px solid #F5A623',
                  padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 5,
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#F5A623', letterSpacing: '.1em', textTransform: 'uppercase' }}>⚡ Bonus task</div>
                  <div style={{ background: '#f9f9f9', borderRadius: '9px', borderBottomLeftRadius: '2px', padding: '8px 10px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: '#1a1a2e', textTransform: 'uppercase', marginBottom: '2px' }}>Dash</div>
                    <p style={{ fontSize: '12px', color: '#555', lineHeight: 1.45, margin: 0 }}>You are on a roll. Build on what you just did. Expires at midnight.</p>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.5 }}>
                    {taskData?.bonus_task_text || 'Go one level deeper on what you just completed. Ten more minutes. That is all.'}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f5f5f7', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', color: '#888', fontWeight: 600, alignSelf: 'flex-start' }}>
                    ⏱ ~10 minutes
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button onClick={() => { setBonusCompleted(false); setPanel('locked') }} style={{ flex: 1, border: '1.5px solid #eee', background: '#fff', padding: '12px', borderRadius: '13px', fontSize: '13px', color: '#888', cursor: 'pointer' }}>Skip</button>
                    <button onClick={() => { setBonusCompleted(true); setPanel('locked') }} style={{ flex: 2, background: '#1a1a2e', border: 'none', padding: '12px', borderRadius: '13px', fontSize: '14px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Done</button>
                  </div>
                </div>
              )}

              {panel === 'locked' && (
                <div style={{
                  position: 'relative', background: '#fff',
                  borderRadius: '20px', border: `1.5px solid ${bonusCompleted ? '#F5A623' : '#4CAF50'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', gap: '10px', padding: '40px 24px', textAlign: 'center', zIndex: 5,
                }}>
                  <div style={{ fontSize: '44px' }}>🔒</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '22px' }}>🔥</span>
                    <span style={{ fontSize: '28px', fontWeight: 900, color: '#1a1a2e' }}>{currentStreak} days</span>
                  </div>
                  <p style={{ color: '#555', fontSize: '15px', margin: 0, fontWeight: 500 }}>
                    {bonusCompleted ? 'Bonus locked. Extra mile taken today.' : 'Streak locked. The goal is moving.'}
                  </p>
                </div>
              )}

              {showTut && panel === 'task' && (
                <div
                  onClick={() => setShowTut(false)}
                  style={{
                    position: 'absolute', inset: 0, background: 'rgba(26,26,46,.88)',
                    borderRadius: '20px', zIndex: 30, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px', color: '#F5A623' }}>←</span>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Swipe left for help</span>
                  </div>
                  <div style={{ width: '40px', height: '1.5px', background: 'rgba(255,255,255,.2)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Swipe right for done</span>
                    <span style={{ fontSize: '22px', color: '#F5A623' }}>→</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginTop: '6px' }}>Tap anywhere to dismiss</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', marginBottom: '9px' }}>Your progress</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '22px', marginBottom: '5px' }}>🔥</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#F5A623' }}>{currentStreak}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Day streak</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '14px' }}>
                <div style={{ marginBottom: '5px' }}>
                  <span style={{ display: 'inline-flex', width: '26px', height: '26px', background: '#4CAF50', borderRadius: '6px', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
                      <polyline points="3,8 6.5,12 13,5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e' }}>{user.tasksDone || 0}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Tasks done</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '22px', marginBottom: '5px' }}>📊</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e' }}>{user.score ? `${user.score}%` : '0%'}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Score</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '22px', color: '#FF9500', marginBottom: '5px' }}>⚡</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a1a2e' }}>{user.bonusTasks || 0}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Bonus tasks</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '14px', borderLeft: '3px solid #4A9EDB' }}>
                <div style={{ fontSize: '22px', marginBottom: '5px' }}>💧</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#4A9EDB' }}>{user.shields || 0}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Shields left</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <BottomNav />
    </div>
  )
}