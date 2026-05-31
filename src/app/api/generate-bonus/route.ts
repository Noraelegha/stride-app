import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { DASH_SYSTEM_PROMPT } from '@/lib/dashPrompt'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const { user, taskData } = await req.json()

    if (!taskData?.task_text) {
      return NextResponse.json(
        { error: 'Missing task context' },
        { status: 400 }
      )
    }

    // Build a rich context message so Dash generates something
    // specific to the exact task the user just completed — not generic advice
    const userMessage = `
MOMENTUM WINDOW — BONUS TASK GENERATION

The user just completed today's task and has energy to go further. Generate ONE bonus task.

USER PROFILE:
- Goal: ${user.goal || 'Not specified'}
- Domain: ${user.domain || ''}
- Personal why: ${user.personalWhy || user.personal_why || ''}
- Prior context: ${user.priorDetail || user.prior_detail || ''}
- Day number: ${(user.tasksDone || 0) + 1}
- Current streak: ${user.streak || 0} days

TODAY'S COMPLETED TASK (this is what the bonus must build directly on):
"${taskData.task_text}"

Task status: ${taskData.status}
${taskData.hint_text ? `User's note: "${taskData.hint_text}"` : ''}

RULES:
- The bonus task must be the exact next physical action after completing the task above
- Name the specific action — never say "go deeper", "build on what you did", or "take the next step"
- Must be startable within 60 seconds, under 20 minutes total
- Slightly harder than the completed task but still achievable tonight
- If the task was posting content, the bonus is about that specific content (e.g. reply to comments, DM people who liked it)
- If the task was writing something, the bonus is the next paragraph or the next piece — name it exactly
- If the task was sending an outreach, the bonus is the follow-up or a second outreach to a named platform

Respond ONLY with valid JSON. No preamble. No markdown. No backticks. Just the object:

{
  "bonusTaskText": "the exact specific action the user does next — must be 1 sentence, named action, no generics",
  "dashMessage": "1 sentence max. Specific to what they just did. No filler. No banned phrases."
}
`.trim()

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: DASH_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const block = response.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type from Anthropic')

    // Strip any accidental markdown fences before parsing
    const cleaned = block.text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
    const bonus = JSON.parse(cleaned)

    if (!bonus?.bonusTaskText) {
      throw new Error('bonusTaskText missing from parsed response')
    }

    return NextResponse.json({ bonus })
  } catch (err) {
    console.error('[generate-bonus] Error:', err)
    return NextResponse.json(
      { error: 'Failed to generate bonus task' },
      { status: 500 }
    )
  }
}