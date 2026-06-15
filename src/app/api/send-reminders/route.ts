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
      const { data: todayTask } = await supabase
        .from('daily_tasks')
        .select('task_text, status, morning_reminder, midday_reminder, afternoon_reminder, evening_reminder_complete, evening_reminder_incomplete, night_reminder, bonus_task_active, bonus_task_status, bonus_task_text')
        .eq('user_email', user.email)
        .eq('task_date', today)
        .single()

      const { data: yesterdayTask } = await supabase
        .from('daily_tasks')
        .select('status')
        .eq('user_email', user.email)
        .eq('task_date', yesterday)
        .single()

      const { data: recentTasks } = await supabase
        .from('daily_tasks')
        .select('task_date, status')
        .eq('user_email', user.email)
        .order('task_date', { ascending: false })
        .limit(10)

      let consecutiveMissed = 0
      if (recentTasks) {
        for (const t of recentTasks) {
          if (t.task_date === today) continue
          if (t.status === 'completed' || t.status === 'partial') break
          consecutiveMissed++
        }
      }

      const isCompleted = todayTask?.status === 'completed'
      const firstName = user.name.split(' ')[0]
      const hasPendingBonus = todayTask?.bonus_task_active && todayTask?.bonus_task_status === 'pending'
      const missedYesterday = yesterdayTask &&
        yesterdayTask.status !== 'completed' &&
        yesterdayTask.status !== 'partial'

      const whyAnchor = user.personal_why
        ? user.personal_why.split('.')[0].trim()
        : null
      const prizeAnchor = user.big_prize
        ? user.big_prize.split('.')[0].trim()
        : null

      // No task row yet — send morning reminder anyway
      if (!todayTask && tier === 'morning') {
        let message = ''

        if (consecutiveMissed >= 8) {
          message = truncate(`${firstName}. No pressure. Dash is still here. One step today. ⚡`)
        } else if (consecutiveMissed >= 4) {
          message = truncate(whyAnchor
            ? `${firstName}. "${whyAnchor}." One step today. That is all.`
            : `${firstName}. Still here. One step today when you are ready. ⚡`)
        } else if (missedYesterday) {
          message = truncate(prizeAnchor
            ? `${firstName}, yesterday slipped. "${prizeAnchor}" still needs you. ⚡`
            : `${firstName}, yesterday slipped. Today is the reset. ⚡`)
        } else {
          message = truncate(`${firstName}. Your Stride task is ready. One step closer. ⚡`)
        }

        await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          },
          body: JSON.stringify({
            app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            include_subscription_ids: [user.onesignal_id],
            headings: { en: 'Dash' },
            contents: { en: message },
          }),
        })
        sent++
        continue
      }

      if (!todayTask) continue

      let message = ''

      if (tier === 'morning') {
        if (isCompleted) continue

        if (consecutiveMissed >= 8) {
          message = truncate(`${firstName}. No pressure. One step today changes the direction.`)
        } else if (consecutiveMissed >= 4) {
          message = truncate(whyAnchor
            ? `${firstName}. "${whyAnchor}." One task today. ⚡`
            : `${firstName}. Dash is still here. One step today.`)
        } else if (missedYesterday) {
          message = truncate(prizeAnchor
            ? `${firstName}, yesterday slipped. "${prizeAnchor}" still needs you. ⚡`
            : `${firstName}, yesterday didn't get done. Today is the reset. ⚡`)
        } else {
          message = truncate(todayTask?.morning_reminder
            || `${firstName}. Your Stride task is ready. One step closer. ⚡`)
        }
      }

      if (tier === 'midday') {
        if (isCompleted) continue

        if (consecutiveMissed >= 4) {
          message = truncate(prizeAnchor
            ? `${firstName}. Still time. "${prizeAnchor}" starts with one task.`
            : `${firstName}. Still here. Still time today.`)
        } else if (missedYesterday) {
          message = truncate(prizeAnchor
            ? `${firstName}, "${prizeAnchor}" needs today. Still time. ⏰`
            : `${firstName}, two days forming a pattern. Still time today.`)
        } else {
          message = truncate(todayTask?.midday_reminder
            || `${firstName}, still time to knock this out. ⏰`)
        }
      }

      if (tier === 'afternoon') {
        if (isCompleted) continue

        if (consecutiveMissed >= 4) {
          message = truncate(whyAnchor
            ? `${firstName}. "${whyAnchor}." One task. This afternoon. ⏳`
            : `${firstName}. One task. This afternoon. That is all. ⏳`)
        } else if (missedYesterday) {
          message = truncate(`${firstName}. One task. Streak restarts right now. ⏳`)
        } else {
          message = truncate(todayTask?.afternoon_reminder
            || `${firstName}. Afternoon check. Still not done. ⏳`)
        }
      }

      if (tier === 'evening') {
        if (isCompleted && hasPendingBonus) {
          message = truncate(`${firstName}, bonus task still open. Expires midnight. ⚡`)
        } else if (isCompleted) {
          continue
        } else if (consecutiveMissed >= 4) {
          message = truncate(whyAnchor
            ? `${firstName}. "${whyAnchor}." One task before midnight.`
            : `${firstName}. Still here. One task before midnight.`)
        } else if (missedYesterday) {
          message = truncate(`${firstName}. Two days now. One task tonight closes both. ⏳`)
        } else {
          message = truncate(todayTask?.evening_reminder_incomplete
            || `${firstName}, day not over. One task. Streak on the line. ⏳`)
        }
      }

      if (tier === 'night') {
        if (isCompleted && hasPendingBonus) {
          message = truncate(`Last call ${firstName}. Bonus task expires midnight. ⚡`)
        } else if (isCompleted) {
          continue
        } else if (consecutiveMissed >= 4) {
          message = truncate(prizeAnchor
            ? `${firstName}. Final call. "${prizeAnchor}" needs tonight.`
            : `${firstName}. Final call. One task. Dash is not giving up.`)
        } else if (missedYesterday) {
          message = truncate(prizeAnchor
            ? `${firstName}. Final call. "${prizeAnchor}" needs you. Now.`
            : `Last call ${firstName}. Two days unfinished. One task. Now.`)
        } else {
          message = truncate(todayTask?.night_reminder
            || `Last call ${firstName}. One task. Do it now.`)
        }
      }

      if (!message) continue

      await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          include_subscription_ids: [user.onesignal_id],
          headings: { en: 'Dash' },
          contents: { en: message },
        }),
      })

      sent++
    }

    return NextResponse.json({ sent, tier })
  } catch (error) {
    console.error('Send reminders error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}