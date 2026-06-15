import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

      // Count consecutive missed days by checking recent task history
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

      // Personalised missed-day anchors
      const whyAnchor = user.personal_why
        ? user.personal_why.split('.')[0].trim()
        : null
      const prizeAnchor = user.big_prize
        ? user.big_prize.split('.')[0].trim()
        : null

      // If no task row exists yet for today, still send morning reminder
      if (!todayTask && tier === 'morning') {
        let message = ''

        if (consecutiveMissed >= 8) {
          // Ultra-gentle, every 3 days — handled by skipping non-multiples
          // For simplicity cron still runs daily but message is softer
          message = `${firstName}. No pressure. Dash is still here. The goal has not changed. Whenever you are ready. ⚡`
        } else if (consecutiveMissed >= 4) {
          message = whyAnchor
            ? `${firstName}. You said: "${whyAnchor}." Dash has not forgotten. One step today. That is all.`
            : `${firstName}. Dash is still here. No lecture. Just one step today when you are ready. ⚡`
        } else if (missedYesterday) {
          message = prizeAnchor
            ? `${firstName}, yesterday slipped. "${prizeAnchor}" still needs you. One task today. ⚡`
            : `${firstName}, yesterday slipped. Today is the reset. Open Stride. ⚡`
        } else {
          message = `${firstName}. Your Stride task is ready. Open the app. ⚡`
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
          message = `${firstName}. No pressure. Dash is still here. One step today changes the direction.`
        } else if (consecutiveMissed >= 4) {
          message = whyAnchor
            ? `${firstName}. "${whyAnchor}." That reason is still real. One task today. ⚡`
            : `${firstName}. Dash is still here. No lecture. One step today.`
        } else if (missedYesterday) {
          message = prizeAnchor
            ? `${firstName}, yesterday slipped. "${prizeAnchor}" still needs you. One task today. ⚡`
            : `${firstName}, yesterday didn't get done. Today is the reset. Your task is ready. ⚡`
        } else {
          message = todayTask?.morning_reminder
            || `${firstName}. Your Stride task is ready. One step closer. ⚡`
        }
      }

      if (tier === 'midday') {
        if (isCompleted) continue

        if (consecutiveMissed >= 4) {
          message = prizeAnchor
            ? `${firstName}. Still time today. "${prizeAnchor}" starts with one task. Right now.`
            : `${firstName}. Still here. Still time today. One task is all it takes.`
        } else if (missedYesterday) {
          message = prizeAnchor
            ? `${firstName}, you said you want "${prizeAnchor}." That does not happen without today. Still time. ⏰`
            : `${firstName}, two days is a pattern starting to form. Still time today.`
        } else {
          message = todayTask?.midday_reminder
            || `${firstName}, still time to knock this out. Task is waiting. ⏰`
        }
      }

      if (tier === 'afternoon') {
        if (isCompleted) continue

        if (consecutiveMissed >= 4) {
          message = whyAnchor
            ? `${firstName}. "${whyAnchor}." You meant that. One task. This afternoon. ⏳`
            : `${firstName}. One task. This afternoon. That is all Dash is asking. ⏳`
        } else if (missedYesterday) {
          message = `${firstName}. One task. That is all that stands between you and the streak restarting right now. ⏳`
        } else {
          message = todayTask?.afternoon_reminder
            || `${firstName}. Afternoon check. Task not done yet. Clock is ticking. ⏳`
        }
      }

      if (tier === 'evening') {
        if (isCompleted && hasPendingBonus) {
          message = `${firstName}, your bonus task is still open. Expires at midnight. One more push. ⚡`
        } else if (isCompleted) {
          continue
        } else if (consecutiveMissed >= 4) {
          message = whyAnchor
            ? `${firstName}. Evening. "${whyAnchor}." The reason has not changed. One task before midnight.`
            : `${firstName}. Dash is still here. Evening. One task before midnight.`
        } else if (missedYesterday) {
          message = `${firstName}. Two days now. The gap widens every day you wait. One thing tonight. ⏳`
        } else {
          message = todayTask?.evening_reminder_incomplete
            || `${firstName}, the day is not over. One task. Streak on the line. ⏳`
        }
      }

      if (tier === 'night') {
        if (isCompleted && hasPendingBonus) {
          message = `Last call ${firstName}. Bonus task expires at midnight. Want the extra mile? ⚡`
        } else if (isCompleted) {
          continue
        } else if (consecutiveMissed >= 4) {
          message = prizeAnchor
            ? `${firstName}. Final call tonight. "${prizeAnchor}" is waiting on the other side of one task. Now.`
            : `${firstName}. Final call. One task. Tonight. Dash is not giving up on you.`
        } else if (missedYesterday) {
          message = prizeAnchor
            ? `${firstName}. Final call. "${prizeAnchor}" does not move without you. One task. Now or first thing tomorrow. No more gaps.`
            : `Last call ${firstName}. Two days unfinished. One task tonight changes the direction.`
        } else {
          message = todayTask?.night_reminder
            || `Last call ${firstName}. One task. Do it now.`
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