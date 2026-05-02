import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { user, dayNumber } = await request.json()

    const systemPrompt = `You are Dash, the accountability engine of Stride. You are a Relentless Catalyst — high-energy, deeply empathetic, slightly edgy. Your job: reduce friction until it falls below the user's motivation. One task only. Never use the words plan, organise, research, or prepare. Tasks must take under 5 minutes. Always end with a reply question.`

    const userPrompt = `Generate Day ${dayNumber} task email for:
Name: ${user.name}
Goal: ${user.goal}
Big Prize: ${user.bigPrize}
Coach style: ${user.coachStyle}
Persona: ${user.persona}
Daily time available: ${user.dailyTime} minutes
Prior progress: ${user.priorDetail || 'Starting fresh'}

Return ONLY a JSON object with these fields:
{
  "dashMessage": "short Dash greeting (1-2 lines, punchy)",
  "taskText": "the specific micro-task (clear, actionable, under 5 min)",
  "hintText": "a permission slip or simplifier for if they get stuck",
  "replyQuestion": "one curiosity-driven question tied to the task"
}
No other text. Just the JSON.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const task = JSON.parse(clean)

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Task generation error:', error)
    return NextResponse.json({ error: 'Failed to generate task' }, { status: 500 })
  }
}