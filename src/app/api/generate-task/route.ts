import { NextRequest, NextResponse } from 'next/server'
import { DASH_SYSTEM_PROMPT } from '@/lib/dashPrompt'

export async function POST(req: NextRequest) {
  try {
    const { user, taskHistory } = await req.json()

    if (!user) {
      return NextResponse.json({ error: 'User data required' }, { status: 400 })
    }

    // Build compact task history
    const allTasks: any[] = taskHistory || []
    const recentTasks = allTasks.slice(-7)
    const olderTasks = allTasks.slice(0, Math.max(0, allTasks.length - 7))

    const recentHistory = recentTasks.length > 0
      ? recentTasks.map((t: any) => {
          const status = t.completed ? '✅' : t.bonus_completed ? '⬆️' : '❌'
          const chip = t.feedback_type ? ` — Chip: ${t.feedback_type}` : ''
          const note = t.wall_note ? ` — Note: ${t.wall_note}` : ''
          return `Day ${t.day_number} — ${status} — "${t.task_text}"${chip}${note}`
        }).join('\n')
      : 'No tasks yet — this is Day 1.'

    const compactHistory = olderTasks.length > 0
      ? olderTasks.map((t: any) => {
          const status = t.completed ? '✅' : t.bonus_completed ? '⬆️' : '❌'
          return `Day ${t.day_number} ${status}`
        }).join(' | ')
      : ''

    // Get current date and time in user's timezone
    const now = new Date()
    const userTimezone = user.timezone || 'Africa/Lagos'
    const localDateStr = now.toLocaleDateString('en-GB', { timeZone: userTimezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const localTimeStr = now.toLocaleTimeString('en-GB', { timeZone: userTimezone, hour: '2-digit', minute: '2-digit' })
    const isWeekend = [0, 6].includes(new Date(now.toLocaleString('en-US', { timeZone: userTimezone })).getDay())

    // Coach style full descriptions
    const coachDescriptions: Record<string, string> = {
      tough:     'No-nonsense coach — direct, unfiltered, pure execution. No sympathy, only results.',
      strategic: 'Strategic partner — professional, ROI-focused, peer-to-peer energy. Treats the user as an equal.',
      friend:    'Sarcastic best friend — jokes with accountability, warm but will call you out.',
      mentor:    'Gentle mentor — encouragement first, pressure second. Patient, warm, belief-driven.',
    }

    // Build background context (compact after 7 days)
    const backgroundContext = user.tasksDone > 7
      ? `Started as: ${user.prior || 'fresh start'}. Key context: ${(user.priorDetail || '').slice(0, 100)}`
      : `Prior context: ${user.prior || 'starting fresh'}. ${user.priorDetail || ''}`

    // Sprint context for business users
    const sprintContext = user.sprintTheme
      ? `ACTIVE SPRINT: Theme: "${user.sprintTheme}" | Sprint Day: ${user.sprintDay || 1} of 7 | Started: ${user.sprintStartDate}`
      : 'No active sprint.'

    const userContext = `
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
Today is Day ${(user.tasksDone || 0) + 1} for ${user.name}
Current Streak: ${user.streak || 0} days
Phase: ${user.phase || 1}
Completion Score: ${user.score || 0}%
Shields Available: ${user.shields || 0}
Bonus Tasks Completed Total: ${user.bonusTasks || 0}
${sprintContext}

TODAY'S CONTEXT:
Date: ${localDateStr}
Time: ${localTimeStr}
Timezone: ${userTimezone}
Weekend: ${isWeekend ? 'YES — avoid tasks requiring going out or making calls' : 'No'}

TASK HISTORY (all time):
${compactHistory ? `Full history: ${compactHistory}\n\n` : ''}Recent detail (last 7 days):
${recentHistory}

Generate today's task for ${user.name}. Return valid JSON only.
`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: DASH_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContext }],
      }),
    })

    const data = await response.json()

    if (!data.content?.[0]?.text) {
      return NextResponse.json({ error: 'No response from Dash' }, { status: 500 })
    }

    // Parse JSON response
    const rawText = data.content[0].text.trim()
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 })
    }

    const task = JSON.parse(jsonMatch[0])
    return NextResponse.json({ task })

  } catch (error) {
    console.error('Generate task error:', error)
    return NextResponse.json({ error: 'Failed to generate task' }, { status: 500 })
  }
}