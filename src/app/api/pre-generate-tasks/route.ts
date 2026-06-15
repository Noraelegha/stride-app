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

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })

    const { data: users } = await supabase
      .from('stride_users')
      .select('*')
      .not('onesignal_id', 'is', null)

    if (!users || users.length === 0) {
      return NextResponse.json({ generated: 0 })
    }

    let generated = 0
    let recoveryGenerated = 0

    for (const user of users) {
      // Check if tomorrow's task already exists
      const { data: existingTask } = await supabase
        .from('daily_tasks')
        .select('id')
        .eq('user_email', user.email)
        .eq('task_date', tomorrowStr)
        .single()

      if (existingTask) continue

      // Fetch full task history
      const { data: history } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_email', user.email)
        .order('task_date', { ascending: true })

      // Check if today's task was completed
      const todayTask = history?.find((t: any) => t.task_date === today)
      const todayMissed = todayTask &&
        todayTask.status !== 'completed' &&
        todayTask.status !== 'partial'

      // Count consecutive missed days
      let consecutiveMissed = 0
      if (history) {
        const sorted = [...history].sort((a, b) =>
          new Date(b.task_date).getTime() - new Date(a.task_date).getTime()
        )
        for (const t of sorted) {
          if (t.task_date === tomorrowStr) continue
          if (t.status === 'completed' || t.status === 'partial') break
          consecutiveMissed++
        }
      }

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
        consecutiveMissed,
        todayMissed,
      }

      try {
        // If user missed today, generate Dash-written recovery reminders
        // alongside tomorrow's task so the cron has personalised missed-day text
        const extraContext = todayMissed
          ? `MISSED DAY CONTEXT: This user did not complete today's task. They have missed ${consecutiveMissed} consecutive day(s). The reminders generated must reflect this — morning_reminder through night_reminder should be missed-day recovery messages, not task delivery messages. Reference their Big Prize and Personal Why directly. Match their coach style exactly. Escalate urgency progressively across the five tiers. Do not mention the task as if it is new — acknowledge the gap and call them back.`
          : ''

        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate-task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: userData,
            taskHistory: history || [],
            extraContext,
          }),
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

        if (todayMissed) {
          recoveryGenerated++
        } else {
          generated++
        }
      } catch (e) {
        console.error(`Pre-generation failed for ${user.email}:`, e)
        continue
      }
    }

    return NextResponse.json({ generated, recoveryGenerated, tomorrow: tomorrowStr })
  } catch (error) {
    console.error('Pre-generate tasks error:', error)
    return NextResponse.json({ error: 'Failed to pre-generate tasks' }, { status: 500 })
  }
}