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

  try {
    const now = new Date()
    const hour = now.getUTCHours()

    // Get all users who have a onesignal_id
    const { data: users } = await supabase
      .from('stride_users')
      .select('email, name, onesignal_id, timezone, morning_reminder, evening_reminder')
      .not('onesignal_id', 'is', null)

    if (!users || users.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    let sent = 0

    for (const user of users) {
      const userTimezone = user.timezone || 'Africa/Lagos'
      const localHour = new Date(now.toLocaleString('en-US', { timeZone: userTimezone })).getHours()

      // Check if this is their morning reminder hour (default 8am)
      const morningHour = parseInt((user.morning_reminder || '08:00').split(':')[0])
      const eveningHour = parseInt((user.evening_reminder || '20:00').split(':')[0])

      let message = ''

      if (localHour === morningHour) {
        // Check if they already have a task for today
        const today = new Date().toISOString().split('T')[0]
        const { data: todayTask } = await supabase
          .from('daily_tasks')
          .select('task_text, status')
          .eq('user_email', user.email)
          .eq('task_date', today)
          .single()

        if (todayTask?.status === 'completed') continue

        message = todayTask
          ? `Day ${user.name.split(' ')[0]}. Your task is waiting. 5 minutes. Go. ⚡`
          : `Good morning ${user.name.split(' ')[0]}. Your Stride task is ready. ⚡`
      } else if (localHour === eveningHour) {
        const today = new Date().toISOString().split('T')[0]
        const { data: todayTask } = await supabase
          .from('daily_tasks')
          .select('status')
          .eq('user_email', user.email)
          .eq('task_date', today)
          .single()

        if (todayTask?.status === 'completed') continue

        message = `${user.name.split(' ')[0]}, the day is not over yet. One task. Streak on the line. ⏳`
      }

      if (!message) continue

      // Send via OneSignal
      await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        },
        body: JSON.stringify({
          app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          include_aliases: { external_id: [user.email] },
          target_channel: 'push',
          headings: { en: 'Stride ⚡' },
          contents: { en: message },
        }),
      })

      sent++
    }

    return NextResponse.json({ sent })
  } catch (error) {
    console.error('Send reminders error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}