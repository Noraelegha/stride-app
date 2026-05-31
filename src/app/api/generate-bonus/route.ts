import { NextRequest, NextResponse } from 'next/server'
import { DASH_SYSTEM_PROMPT } from '@/lib/dashPrompt'

export async function POST(req: NextRequest) {
  try {
    const { user, taskData } = await req.json()

    if (!taskData?.task_text) {
      return NextResponse.json({ error: 'Missing task context' }, { status: 400 })
    }

    const userMessage = `
MOMENTUM WINDOW — BONUS TASK GENERATION

The user just completed today's task and has energy to go further. Generate ONE bonus task.

USER PROFILE:
- Name: ${user.name}
- Goal: ${user.goal || 'Not specified'}
- Domain/Niche: ${user.domain || 'not specified'}
- Personal why: ${user.personalWhy || ''}
- Prior context: ${user.priorDetail || user.prior_detail || ''}
- Day number: ${(user.tasksDone || 0) + 1}
- Current streak: ${user.streak || 0} days
- Phase: ${user.phase || 1}

TODAY'S COMPLETED TASK (the bonus must build directly on this):
"${taskData.task_text}"

Task status: ${taskData.status}
${taskData.hint_text ? `User's note: "${taskData.hint_text}"` : ''}

RULES FOR THE BONUS TASK:
- Must be the exact next physical action after the task above — name it specifically
- Never say "go deeper", "build on what you did", "take the next step", or anything generic
- Must be startable within 60 seconds, completable in under 20 minutes
- If the task was posting content: bonus is about that specific post (e.g. reply to comments, DM people who engaged)
- If the task was writing: bonus is the next named piece of writing (e.g. "Write the second paragraph of your about page")
- If the task was sending outreach: bonus is a follow-up or second outreach to a named platform
- If the task was research: bonus is the first physical action that uses that research

Respond ONLY with valid JSON. No preamble. No markdown. No backticks. Just the object:

{
  "bonusTaskText": "the exact specific action — 1 sentence, named, never generic",
  "dashMessage": "1 sentence max. Specific to what they just did. No filler. No em dashes."
}
`.trim()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 300,
        system: DASH_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    const data = await response.json()

    if (!data.content?.[0]?.text) {
      console.error('[generate-bonus] No text in response:', data)
      return NextResponse.json({ error: 'No response from Dash' }, { status: 500 })
    }

    const rawText = data.content[0].text.trim()
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('[generate-bonus] Could not parse JSON from:', rawText)
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 })
    }

    const bonus = JSON.parse(jsonMatch[0])

    if (!bonus?.bonusTaskText) {
      console.error('[generate-bonus] bonusTaskText missing:', bonus)
      return NextResponse.json({ error: 'bonusTaskText missing' }, { status: 500 })
    }

    return NextResponse.json({ bonus })

  } catch (error) {
    console.error('[generate-bonus] Error:', error)
    return NextResponse.json({ error: 'Failed to generate bonus task' }, { status: 500 })
  }
}