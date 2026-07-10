import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { DASH_SYSTEM_PROMPT } from '@/lib/dashPrompt'

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

    // Only pre-generate for users active in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: users } = await supabase
      .from('stride_users')
      .select('*')
      .not('onesignal_id', 'is', null)
      .gte('last_active', sevenDaysAgo.toISOString())

    if (!users || users.length === 0) {
      return NextResponse.json({ generated: 0, skipped: 'no active users' })
    }

    let generated = 0
    let recoveryGenerated = 0

    for (const user of users) {
      const { data: existingTask } = await supabase
        .from('daily_tasks')
        .select('id')
        .eq('user_email', user.email)
        .eq('task_date', tomorrowStr)
        .single()

      if (existingTask) continue

      const { data: history } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_email', user.email)
        .order('task_date', { ascending: true })

      const todayTask = history?.find((t: any) => t.task_date === today)
      const todayMissed = todayTask &&
        todayTask.status !== 'completed' &&
        todayTask.status !== 'partial'

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
        const extraContext = todayMissed
          ? `MISSED DAY CONTEXT: This user did not complete today's task. They have missed ${consecutiveMissed} consecutive day(s). The reminders generated must reflect this — morning_reminder through night_reminder should be missed-day recovery messages, not task delivery messages. Reference their Big Prize and Personal Why directly. Match their coach style exactly. Escalate urgency progressively across the five tiers. Do not mention the task as if it is new — acknowledge the gap and call them back.`
          : ''

        // Build the same prompt generate-task uses
        const allTasks = history || []
        const recentTasks = allTasks.slice(-7)
        const olderTasks = allTasks.slice(0, Math.max(0, allTasks.length - 7))

        const recentHistory = recentTasks.length > 0
          ? recentTasks.map((t: any) => {
              const status = t.status === 'completed' ? '✅' : t.bonus_completed ? '⬆️' : t.status === 'partial' ? '🔄' : '❌'
              const chip = t.user_reply ? ` — Reply: ${t.user_reply}` : ''
              const note = t.hint_text ? ` — Note: ${t.hint_text}` : ''
              return `Day ${t.day_number || '?'} — ${status} — "${t.task_text}"${chip}${note}`
            }).join('\n')
          : 'No tasks yet. This is Day 1.'

        const compactHistory = olderTasks.length > 0
          ? olderTasks.map((t: any) => {
              const status = t.status === 'completed' ? '✅' : t.bonus_completed ? '⬆️' : t.status === 'partial' ? '🔄' : '❌'
              return `Day ${t.day_number || '?'} ${status}`
            }).join(' | ')
          : ''

        const now = new Date()
        const localDateStr = now.toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        const localTimeStr = now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', minute: '2-digit' })
        const isWeekend = [0, 6].includes(new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' })).getDay())

        const coachDescriptions: Record<string, string> = {
          tough: 'No-nonsense coach. Direct. Unfiltered. Pure execution.',
          strategic: 'Strategic partner. Professional. ROI-focused. Peer-to-peer.',
          friend: 'Sarcastic best friend. Jokes with accountability. Warm but will call you out.',
          mentor: 'Gentle mentor. Encouragement first. Patient and warm.',
        }

        const yesterday = recentTasks[recentTasks.length - 1]
        const yesterdayOutputNote = yesterday?.hint_text &&
          yesterday?.user_reply !== 'blocked' &&
          yesterday?.hint_type !== 'blocked'
            ? yesterday.hint_text.trim()
            : null

        const userContext = `${(userData.tasksDone || 0) >= 5 ? `CRITICAL RULE: This user has completed ${userData.tasksDone} tasks already. They are NOT a new user. Do NOT generate any diagnostic or onboarding tasks. Pick up directly from where the task history left off.` : ''}
USER PROFILE:
Name: ${userData.name}
Persona: ${userData.persona}
Goal: ${userData.goal}
Big Prize: ${userData.bigPrize}
Personal Why: ${userData.personalWhy}
Domain/Niche: ${userData.domain || 'not specified'}
Coach Style: ${coachDescriptions[userData.coachStyle] || userData.coachStyle}
Daily Time Available: ${userData.dailyTime}

CURRENT STATUS:
Today is Day ${(userData.tasksDone || 0) + 1} for ${userData.name}
Current Streak: ${userData.streak} days
Phase: ${userData.phase}
Completion Score: ${userData.score}%
Shields Available: ${userData.shields}
Consecutive Missed Days: ${consecutiveMissed}

TODAY'S CONTEXT:
Date: ${localDateStr}
Time: ${localTimeStr}
Weekend: ${isWeekend ? 'YES — avoid tasks requiring going out or calls' : 'No'}

TASK HISTORY:
${compactHistory ? `Full history: ${compactHistory}\n\n` : ''}Recent detail (last 7 days):
${recentHistory}
${yesterdayOutputNote ? `
USER OUTPUT FROM YESTERDAY — CRITICAL:
The user shared this after completing yesterday's task: "${yesterdayOutputNote}"
Build tomorrow's task as the direct natural next step from what they shared.` : ''}

Generate today's task. Return valid JSON only.
${extraContext ? `\nSPECIAL INSTRUCTION:\n${extraContext}` : ''}`

        // Use Haiku for pre-generation — cheaper, runs at midnight when user isn't watching
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1500,
            system: DASH_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userContext }],
          }),
        })

        if (!response.ok) continue

        const data = await response.json()
        const rawText = data.content?.[0]?.text?.trim()
        const jsonMatch = rawText?.match(/\{[\s\S]*\}/)
        if (!jsonMatch) continue

        const task = JSON.parse(jsonMatch[0])

        // Sanitize em dashes
        const sanitize = (str: string) => str?.replace(/—/g, ' ') || str
        if (task.taskText) task.taskText = sanitize(task.taskText)
        if (task.dashMessage) task.dashMessage = sanitize(task.dashMessage)
        if (task.chip1) task.chip1 = sanitize(task.chip1)
        if (task.chip2) task.chip2 = sanitize(task.chip2)
        if (task.morningReminder) task.morningReminder = sanitize(task.morningReminder)
        if (task.middayReminder) task.middayReminder = sanitize(task.middayReminder)
        if (task.afternoonReminder) task.afternoonReminder = sanitize(task.afternoonReminder)
        if (task.eveningReminderComplete) task.eveningReminderComplete = sanitize(task.eveningReminderComplete)
        if (task.eveningReminderIncomplete) task.eveningReminderIncomplete = sanitize(task.eveningReminderIncomplete)
        if (task.nightReminder) task.nightReminder = sanitize(task.nightReminder)
        if (task.completionMessage) task.completionMessage = sanitize(task.completionMessage)
        if (task.bonusInviteMessage) task.bonusInviteMessage = sanitize(task.bonusInviteMessage)

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
          workstream: task.workstream || null,
          goal_protection_flagged: task.goalProtectionFlagged || false,
          completion_message: task.completionMessage || null,
          bonus_invite_message: task.bonusInviteMessage || null,
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