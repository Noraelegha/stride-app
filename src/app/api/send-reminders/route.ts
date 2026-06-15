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
      .select('email, name, onesignal_id, timezone, morning_reminder, evening_reminder')
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

      const isCompleted = todayTask?.status === 'completed'
      const firstName = user.name.split(' ')[0]
      const hasPendingBonus = todayTask?.bonus_task_active && todayTask?.bonus_task_status === 'pending'
      const missedYesterday = yesterdayTask &&
        yesterdayTask.status !== 'completed' &&
        yesterdayTask.status !== 'partial'

      // If no task row exists yet for today, still send morning reminder
      if (!todayTask && tier === 'morning') {
        const message = missedYesterday
          ? `${firstName}, yesterday didn't get done. Today is the reset. Open the app. ⚡`
          : `${firstName}. Your Stride task is ready. Open the app. ⚡`
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
        if (missedYesterday) {
          message = `${firstName}, yesterday didn't get done. Today is the reset. Your task is ready. ⚡`
        } else {
          message = todayTask?.morning_reminder
            || `${firstName}. Your Stride task is ready. 5 minutes. Go.`
        }
      }

      if (tier === 'midday') {
        if (isCompleted) continue
        if (missedYesterday) {
          message = `${firstName}, two days is a pattern starting to form. Still time today. Open the app.`
        } else {
          message = todayTask?.midday_reminder
            || `${firstName}, still time to knock this out. Task is waiting. ⏰`
        }
      }

      if (tier === 'afternoon') {
        if (isCompleted) continue
        if (missedYesterday) {
          message = `${firstName}. Yesterday and today. Don't let it become the default. One task. Right now.`
        } else {
          message = todayTask?.afternoon_reminder
            || `${firstName}. Afternoon check. Task not done yet. Clock is ticking. ⏳`
        }
      }

      if (tier === 'evening') {
        if (isCompleted && hasPendingBonus) {
          message = `${firstName}, your bonus task is still open. Expires at midnight. One more push. ⚡`
        } else if (isCompleted) {
          continue // already received personalised confirmation the moment they submitted
        } else if (missedYesterday) {
          message = `${firstName}. Two days now. The streak is waiting to restart. One task closes both. ⏳`
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
        } else if (missedYesterday) {
          message = `${firstName}. Final call. Two days unfinished. One task tonight changes the direction. Now.`
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