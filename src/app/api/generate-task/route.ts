import { NextRequest, NextResponse } from 'next/server'
import { DASH_SYSTEM_PROMPT } from '@/lib/dashPrompt'

export async function POST(req: NextRequest) {
  try {
    const { user, taskHistory, extraContext } = await req.json()

    if (!user) {
      return NextResponse.json({ error: 'User data required' }, { status: 400 })
    }

    const allTasks: any[] = taskHistory || []

    // Fix null day_numbers by calculating from task_date
    const joinedAt = user.joinedAt ? new Date(user.joinedAt) : null
    const tasksWithDays = allTasks.map((t: any) => {
      if (t.day_number) return t
      if (t.task_date && joinedAt) {
        const taskDate = new Date(t.task_date)
        joinedAt.setHours(0, 0, 0, 0)
        taskDate.setHours(0, 0, 0, 0)
        const dayNum = Math.floor((taskDate.getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24)) + 1
        return { ...t, day_number: dayNum }
      }
      return t
    })

    const recentTasks = tasksWithDays.slice(-7)
    const olderTasks = tasksWithDays.slice(0, Math.max(0, tasksWithDays.length - 7))

    const recentHistory = recentTasks.length > 0
      ? recentTasks.map((t: any) => {
          const status = t.status === 'completed' ? '✅' : t.bonus_completed ? '⬆️' : t.status === 'partial' ? '🔄' : '❌'
          const chip = t.user_reply ? ` — Reply: ${t.user_reply}` : ''
          const note = t.hint_text ? ` — Note: ${t.hint_text}` : ''
          return `Day ${t.day_number || '?'} — ${status} — "${t.task_text}"${chip}${note}`
        }).join('\n')
      : 'No tasks yet. This is Day 1.'

    const yesterday = recentTasks[recentTasks.length - 1]
    const yesterdayOutputNote = yesterday?.hint_text &&
      yesterday?.user_reply !== 'blocked' &&
      yesterday?.hint_type !== 'blocked'
        ? yesterday.hint_text.trim()
        : null

    const compactHistory = olderTasks.length > 0
      ? olderTasks.map((t: any) => {
          const status = t.status === 'completed' ? '✅' : t.bonus_completed ? '⬆️' : t.status === 'partial' ? '🔄' : '❌'
          return `Day ${t.day_number || '?'} ${status}`
        }).join(' | ')
      : ''

    const now = new Date()
    const userTimezone = user.timezone || 'Africa/Lagos'
    const localDateStr = now.toLocaleDateString('en-GB', { timeZone: userTimezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const localTimeStr = now.toLocaleTimeString('en-GB', { timeZone: userTimezone, hour: '2-digit', minute: '2-digit' })
    const isWeekend = [0, 6].includes(new Date(now.toLocaleString('en-US', { timeZone: userTimezone })).getDay())

    const coachDescriptions: Record<string, string> = {
      tough:     'No-nonsense coach, direct, unfiltered, pure execution. No sympathy, only results.',
      strategic: 'Strategic partner, professional, ROI-focused, peer-to-peer energy. Treats the user as an equal.',
      friend:    'Sarcastic best friend, jokes with accountability, warm but will call you out.',
      mentor:    'Gentle mentor, encouragement first, pressure second. Patient, warm, belief-driven.',
    }

    const coachToneExamples: Record<string, string> = {
      tough:     'Example dashMessage tone: "26 days. No excuses today. Here is your move."',
      strategic: 'Example dashMessage tone: "Day 26. One action, high leverage. This is how momentum compounds."',
      friend:    'Example dashMessage tone: "Day 26 and you actually showed up again. Unbelievable. Let\'s go."',
      mentor:    'Example dashMessage tone: "26 days in. You have built something real here. One more step today."',
    }

    const backgroundContext = user.tasksDone > 7
      ? `Started as: ${user.prior || 'fresh start'}. Key context: ${(user.priorDetail || '').slice(0, 100)}`
      : `Prior context: ${user.prior || 'starting fresh'}. ${user.priorDetail || ''}`

    const sprintContext = user.sprintTheme
      ? `ACTIVE SPRINT: Theme: "${user.sprintTheme}" | Sprint Day: ${user.sprintDay || 1} of 7 | Started: ${user.sprintStartDate}`
      : 'No active sprint.'

    const todayDayNumber = (user.tasksDone || 0) + 1
    const isExperiencedUser = (user.tasksDone || 0) >= 5

    const userContext = `${isExperiencedUser ? `CRITICAL RULE: This user has completed ${user.tasksDone} tasks already. They are NOT a new user. Do NOT generate any diagnostic, clarification, or onboarding tasks. Do NOT ask them what they are building or who their audience is. You already know from their history. Pick up directly from where the task history left off.` : ''}
USER PROFILE:
Name: ${user.name}
Persona: ${user.persona} (${user.persona === 'builder' ? 'Solo-Hustler' : user.persona === 'learner' ? 'Learner' : 'Career Pivot-er'})
Goal: ${user.goal}
Big Prize: ${user.bigPrize}
Personal Why: ${user.personalWhy}
Domain/Niche: ${user.domain || 'not specified'}
Coach Style: ${coachDescriptions[user.coachStyle] || user.coachStyle}
Daily Time Available: ${user.dailyTime}
Background: ${backgroundContext}

CURRENT STATUS:
Today is Day ${todayDayNumber} for ${user.name}
Current Streak: ${user.streak || 0} days
Phase: ${user.phase || 1}
Completion Score: ${user.score || 0}%
Shields Available: ${user.shields || 0}
Bonus Tasks Completed Total: ${user.bonusTasks || 0}
Consecutive Missed Days: ${user.consecutiveMissed || 0}
${sprintContext}

TODAY'S CONTEXT:
Date: ${localDateStr}
Time: ${localTimeStr}
Timezone: ${userTimezone}
Weekend: ${isWeekend ? 'YES, avoid tasks requiring going out or making calls' : 'No'}

TASK HISTORY (all time):
${compactHistory ? `Full history: ${compactHistory}\n\n` : ''}Recent detail (last 7 days):
${recentHistory}
${yesterdayOutputNote ? `
USER OUTPUT FROM YESTERDAY — CRITICAL:
The user shared this after completing yesterday's task: "${yesterdayOutputNote}"
This is real output from their actual work — a bio they wrote, a link they created, a number they hit, something they typed out.
Your job today:
- Build tomorrow's task as the direct natural next step from what they shared. Do not start from scratch.
- Reference what they shared naturally in the dashMessage, the way a coach would who actually saw their work. Never quote it back mechanically.
- If what they shared reveals something that conflicts with their Big Prize or suggests they are drifting from their goal, flag it once using the Goal Protection System (set goalProtectionFlagged: true). One line, coach style, no lecture.
- If what they shared is strong work, acknowledge the specific thing that is strong — not generically.` : ''}

DASH MESSAGE RULES FOR THIS RESPONSE:
- Maximum 2 short sentences. Never more.
- No em dashes. Use a period or nothing instead.
- No generic motivational phrases.
- Must reference something specific: the day number, the streak, or something from their recent history.
- Tone must match coach style exactly: ${coachDescriptions[user.coachStyle] || user.coachStyle}
- ${coachToneExamples[user.coachStyle] || ''}

Generate today's task for ${user.name}. Return valid JSON only.
${extraContext ? `\n\nSPECIAL INSTRUCTION:\n${extraContext}` : ''}
`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        system: [
          {
            type: 'text',
            text: DASH_SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          }
        ],
        messages: [{ role: 'user', content: userContext }],
      }),
    })

    const data = await response.json()

    if (!data.content?.[0]?.text) {
      return NextResponse.json({ error: 'No response from Dash' }, { status: 500 })
    }

    const rawText = data.content[0].text.trim()
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 })
    }

    const task = JSON.parse(jsonMatch[0])

    const sanitize = (str: string) => str?.replace(/—/g, ' ') || str
    if (task.taskText) task.taskText = sanitize(task.taskText)
    if (task.dashMessage) task.dashMessage = sanitize(task.dashMessage)
    if (task.chip1) task.chip1 = sanitize(task.chip1)
    if (task.chip2) task.chip2 = sanitize(task.chip2)
    if (task.proofPrompt) task.proofPrompt = sanitize(task.proofPrompt)
    if (task.bonusTaskText) task.bonusTaskText = sanitize(task.bonusTaskText)
    if (task.morningReminder) task.morningReminder = sanitize(task.morningReminder)
    if (task.middayReminder) task.middayReminder = sanitize(task.middayReminder)
    if (task.afternoonReminder) task.afternoonReminder = sanitize(task.afternoonReminder)
    if (task.eveningReminderComplete) task.eveningReminderComplete = sanitize(task.eveningReminderComplete)
    if (task.eveningReminderIncomplete) task.eveningReminderIncomplete = sanitize(task.eveningReminderIncomplete)
    if (task.nightReminder) task.nightReminder = sanitize(task.nightReminder)
    if (task.completionMessage) task.completionMessage = sanitize(task.completionMessage)
    if (task.bonusInviteMessage) task.bonusInviteMessage = sanitize(task.bonusInviteMessage)

    return NextResponse.json({ task })

  } catch (error) {
    console.error('Generate task error:', error)
    return NextResponse.json({ error: 'Failed to generate task' }, { status: 500 })
  }
}