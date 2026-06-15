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
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })

    const { data: users } = await supabase
      .from('stride_users')
      .select('*')
      .not('onesignal_id', 'is', null)

    if (!users || users.length === 0) {
      return NextResponse.json({ generated: 0 })
    }

    let generated = 0

    for (const user of users) {
      // Check if tomorrow's task already exists
      const { data: existingTask } = await supabase
        .from('daily_tasks')
        .select('id')
        .eq('user_email', user.email)
        .eq('task_date', tomorrowStr)
        .single()

      if (existingTask) continue // already generated, skip

      // Fetch full task history
      const { data: history } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_email', user.email)
        .order('task_date', { ascending: true })

      // Map user DB fields to the shape generate-task expects
      const userData = {
        email: user.email,
        name: user.name,
        persona: user.persona,
        goal: user.goal,
        goalShort: user.goal_short,
        bigPrize: user.big_prize,
        prizeShort: user.prize_short,
        personalWhy: user.personal_why,
        coachStyle: user.coach_style,
        dailyTime: user.daily_time,
        domain: user.domain,
        prior: user.prior,
        priorDetail: user.prior_detail,
        hasDeadline: user.has_deadline,
        deadline: user.deadline,
        streak: user.streak || 0,
        phase: user.phase || 1,
        tasksDone: user.tasks_done || 0,
        score: user.score || 0,
        shields: user.shields || 0,
        bonusTasks: user.bonus_tasks || 0,
        sprintTheme: user.sprint_theme,
        sprintDay: user.sprint_day,
        sprintStartDate: user.sprint_start_date,
        joinedAt: user.created_at,
        timezone: user.timezone || 'Africa/Lagos',
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: userData, taskHistory: history || [] }),
        })

        if (!res.ok) continue

        const { task } = await res.json()
        if (!task) continue

        await supabase.from('daily_tasks').insert({
          user_email: user.email,
          day_number: (history?.length || 0) + 1,
          task_text: task.taskText,
          dash_message: task.dashMessage,
          task_date: tomorrowStr,
          status: 'pending',
          chip1: task.chip1,
          chip2: task.chip2,
          chip_type: task.chipType || 'standard',
          morning_reminder: task.morningReminder || null,
          midday_reminder: task.middayReminder || null,
          afternoon_reminder: task.afternoonReminder || null,
          evening_reminder_complete: task.eveningReminderComplete || null,
          evening_reminder_incomplete: task.eveningReminderIncomplete || null,
          night_reminder: task.nightReminder || null,
          goal_achieved: task.goalAchieved || false,
        })

        generated++
      } catch (e) {
        console.error(`Pre-generation failed for ${user.email}:`, e)
        continue
      }
    }

    return NextResponse.json({ generated, tomorrow: tomorrowStr })
  } catch (error) {
    console.error('Pre-generate tasks error:', error)
    return NextResponse.json({ error: 'Failed to pre-generate tasks' }, { status: 500 })
  }
}