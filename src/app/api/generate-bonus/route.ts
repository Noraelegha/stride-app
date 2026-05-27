import { NextRequest, NextResponse } from 'next/server'
import { DASH_SYSTEM_PROMPT } from '@/lib/dashPrompt'

export async function POST(req: NextRequest) {
  try {
    const { user, completedTask } = await req.json()

    if (!user || !completedTask) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const prompt = `
The user just completed their main task for today.

USER: ${user.name}
GOAL: ${user.goal}
BIG PRIZE: ${user.bigPrize}
COACH STYLE: ${user.coachStyle}
TASK THEY JUST COMPLETED: "${completedTask}"

Generate a bonus task that builds DIRECTLY on what they just completed.
The bonus task must name the exact next physical action — not a direction.
Under 20 minutes. Expires at midnight.

Return valid JSON only:
{
  "bonusTaskText": "the exact specific bonus task",
  "dashMessage": "short celebratory message acknowledging completion and introducing the bonus"
}
`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        system: DASH_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const rawText = data.content?.[0]?.text?.trim()
    const jsonMatch = rawText?.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid response' }, { status: 500 })
    }

    const bonus = JSON.parse(jsonMatch[0])
    return NextResponse.json({ bonus })

  } catch (error) {
    console.error('Generate bonus error:', error)
    return NextResponse.json({ error: 'Failed to generate bonus' }, { status: 500 })
  }
}