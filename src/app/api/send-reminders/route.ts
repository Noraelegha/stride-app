import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const truncate = (msg: string): string => {
  const words = msg.trim().split(/\s+/)
  return words.length > 20 ? words.slice(0, 20).join(' ') + '.' : msg
}

const sendPush = async (onesignalId: string, message: string) => {
  return fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      include_subscription_ids: [onesignalId],
      headings: { en: 'Dash' },
      contents: { en: message },
    }),
  })
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tier = req.nextUrl.searchParams.get('tier') || 'morning'

  try {
    const { data: users } = await supabase
      .from('stride_users')
      .select('email, name, onesignal_id, timezone, big_prize, personal_why')
      .not('onesignal_id', 'is', null)

    if (!users || users.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    let sent = 0
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = yesterdayDate.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })

    for (const user of users) {
      const firstName = user.name.split(' ')[0]

      const { data: todayTask } = await supabase
        .from('daily_tasks')
        .select('task_text, status, morning_reminder, midday_reminder, afternoon_reminder, evening_reminder_complete, evening_reminder_incomplete, night_reminder, bonus_task_active, bonus_task_status, bonus_task_text')
        .eq('user_email', user.email)
        .eq('task_date', today)
        .maybeSingle()

      // Count actual consecutive missed days from task history
      const { data: recentTasks } = await supabase
        .from('daily_tasks')
        .select('task_date, status')
        .eq('user_email', user.email)
        .order('task_date', { ascending: false })
        .limit(14)

      let consecutiveMissed = 0
      if (recentTasks) {
        for (const t of recentTasks) {
          if (t.task_date === today) continue
          if (t.status === 'completed' || t.status === 'partial') break
          consecutiveMissed++
        }
      }

      const isCompleted = todayTask?.status === 'completed' || todayTask?.status === 'partial'
      const hasPendingBonus = todayTask?.bonus_task_active && todayTask?.bonus_task_status === 'pending'

      // Messages by tier and escalation level
      // Levels: 0 = normal, 1 = missed yesterday, 2 = missed 2 days,
      //         3 = missed 3 days, 4 = missed 4-6 days, 5 = missed 7+ days (re-engagement)

      let message = ''

      // No task row yet — generate morning message based on miss history
      if (!todayTask && tier === 'morning') {
        if (consecutiveMissed >= 7) {
          message = truncate(`${firstName}. Dash is still here. No streak needed to start again. One step today. ⚡`)
        } else if (consecutiveMissed >= 4) {
          message = truncate(`${firstName}. ${consecutiveMissed} days quiet. The goal hasn't moved on its own. Open the app.`)
        } else if (consecutiveMissed === 3) {
          message = truncate(`${firstName}. Three days. Dash has not given up. Neither should you. One task today.`)
        } else if (consecutiveMissed === 2) {
          message = truncate(`${firstName}. Two days slipped. Today is the one that matters. Open the app. ⚡`)
        } else if (consecutiveMissed === 1) {
          message = truncate(`${firstName}, yesterday slipped. Don't let it become the pattern. One task today.`)
        } else {
          message = truncate(`${firstName}. Your Stride task is ready. One step closer. ⚡`)
        }

        const res = await sendPush(user.onesignal_id, message)
        if (res.ok) {
          await supabase.from('notification_logs').insert({
            user_email: user.email, tier, message, sent_at: new Date().toISOString(),
          })
          sent++
        }
        continue
      }

      if (!todayTask) continue
      if (isCompleted && tier !== 'evening' && tier !== 'night') continue
      if (isCompleted && (tier === 'evening' || tier === 'night') && !hasPendingBonus) continue

      if (tier === 'morning') {
        if (consecutiveMissed >= 7) {
          message = truncate(`${firstName}. No pressure. One step today changes the direction. Dash is waiting. ⚡`)
        } else if (consecutiveMissed >= 4) {
          message = truncate(`${firstName}. ${consecutiveMissed} days without a step. Future you is watching what you do right now.`)
        } else if (consecutiveMissed === 3) {
          message = truncate(`${firstName}. Three days. One task right now stops the slide. Open the app.`)
        } else if (consecutiveMissed === 2) {
          message = truncate(`${firstName}. Two days quiet. This is the moment you decide which way this goes. ⚡`)
        } else if (consecutiveMissed === 1) {
          message = truncate(`${firstName}, yesterday slipped. Today is a clean shot. One task. Don't be the reason it stalls.`)
        } else {
          message = truncate(todayTask?.morning_reminder || `${firstName}. Your Stride task is ready. One step closer. ⚡`)
        }
      }

      if (tier === 'midday') {
        if (consecutiveMissed >= 7) {
          message = truncate(`${firstName}. Still here. Still time. One task this afternoon. ⏰`)
        } else if (consecutiveMissed >= 4) {
          message = truncate(`${firstName}. ${consecutiveMissed} days. Still time today to change the number. One task. ⏰`)
        } else if (consecutiveMissed === 3) {
          message = truncate(`${firstName}. Three days without a step. Lunchtime. One task. Right now. ⏰`)
        } else if (consecutiveMissed === 2) {
          message = truncate(`${firstName}. Two days unfinished. This afternoon breaks the pattern. Do it now. ⏰`)
        } else if (consecutiveMissed === 1) {
          message = truncate(`${firstName}, two days forming a pattern. Still time today. Don't let this slide. ⏰`)
        } else {
          message = truncate(todayTask?.midday_reminder || `${firstName}, still time to knock this out. ⏰`)
        }
      }

      if (tier === 'afternoon') {
        if (consecutiveMissed >= 7) {
          message = truncate(`${firstName}. The reason you started hasn't changed. One task this afternoon. ⏳`)
        } else if (consecutiveMissed >= 4) {
          message = truncate(`${firstName}. ${consecutiveMissed} days. One step this afternoon restarts everything. ⏳`)
        } else if (consecutiveMissed === 3) {
          message = truncate(`${firstName}. Three days. One task before evening. That's it. ⏳`)
        } else if (consecutiveMissed === 2) {
          message = truncate(`${firstName}. Two days quiet. An hour left in the afternoon. One task changes the week. ⏳`)
        } else if (consecutiveMissed === 1) {
          message = truncate(`${firstName}. One task. Streak restarts right now. This afternoon. ⏳`)
        } else {
          message = truncate(todayTask?.afternoon_reminder || `${firstName}. Afternoon check. Still not done. ⏳`)
        }
      }

      if (tier === 'evening') {
        if (isCompleted && hasPendingBonus) {
          message = truncate(`${firstName}, bonus task still open. Expires midnight. One more thing. ⚡`)
        } else if (consecutiveMissed >= 7) {
          message = truncate(`${firstName}. Evening. Still not too late. One task before midnight. ⏳`)
        } else if (consecutiveMissed >= 4) {
          message = truncate(`${firstName}. ${consecutiveMissed} days. Tonight is the one that breaks the silence. One task. ⏳`)
        } else if (consecutiveMissed === 3) {
          message = truncate(`${firstName}. Three days now. Do not let tonight pass the same way. One task. ⏳`)
        } else if (consecutiveMissed === 2) {
          message = truncate(`${firstName}. Two days unfinished. One task tonight closes both. The window is still open. ⏳`)
        } else if (consecutiveMissed === 1) {
          message = truncate(`${firstName}. Two days forming a habit. One task tonight stops it. ⏳`)
        } else {
          message = truncate(todayTask?.evening_reminder_incomplete || `${firstName}, day not over. One task. Streak on the line. ⏳`)
        }
      }

      if (tier === 'night') {
        if (isCompleted && hasPendingBonus) {
          message = truncate(`Last call ${firstName}. Bonus task expires midnight. This is it. ⚡`)
        } else if (consecutiveMissed >= 7) {
          message = truncate(`${firstName}. Final call. One task before midnight. Dash has not given up.`)
        } else if (consecutiveMissed >= 4) {
          message = truncate(`${firstName}. ${consecutiveMissed} days. Final call. One task before midnight ends this streak of silence.`)
        } else if (consecutiveMissed === 3) {
          message = truncate(`Last call ${firstName}. Three days. What would future you say about this moment right now?`)
        } else if (consecutiveMissed === 2) {
          message = truncate(`Last call ${firstName}. Two days quiet. One task before midnight. Do not let three become the number.`)
        } else if (consecutiveMissed === 1) {
          message = truncate(`Last call ${firstName}. Two days unfinished. What would future you say about tonight?`)
        } else {
          message = truncate(todayTask?.night_reminder || `Last call ${firstName}. One task. Do it now.`)
        }
      }

      if (!message) continue

      const res = await sendPush(user.onesignal_id, message)
      if (res.ok) {
        await supabase.from('notification_logs').insert({
          user_email: user.email, tier, message, sent_at: new Date().toISOString(),
        })
        sent++
      }
    }

    return NextResponse.json({ sent, tier })
  } catch (error) {
    console.error('Send reminders error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}