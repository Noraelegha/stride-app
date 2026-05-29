import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { user, taskData } = await req.json()

    const coachStyles: Record<string, string> = {
      tough:     'direct, no-nonsense, zero fluff',
      strategic: 'professional, ROI-focused, peer-to-peer energy',
      friend:    'sarcastic best friend with real accountability',
      mentor:    'warm, encouraging, gentle push forward',
    }

    const style = coachStyles[user?.coachStyle] || 'professional'
    const mainTask = taskData?.task_text || 'their main task today'

    const prompt = `You are Dash, an AI accountability coach. Your tone is ${style}.

The user just completed: "${mainTask}"
Their goal: ${user?.goal || 'not specified'}
Day number: ${(user?.tasksDone || 0) + 1}

Write a bonus task that builds DIRECTLY on what they just completed. Rules:
- Specific and actionable, not vague
- Maximum 15 minutes
- Feels like natural momentum, not extra homework
- References what they just did

Respond ONLY with valid JSON, no markdown, no backticks:
{
  "bonusTaskText": "the specific bonus task instruction here",
  "dashMessage": "1 short motivating sentence from Dash in your coach style"
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const clean = raw.replace(/```json|```/g, '').trim()
    const bonus = JSON.parse(clean)

    return NextResponse.json({ bonus })
  } catch (err) {
    console.error('Generate bonus failed:', err)
    return NextResponse.json({
      bonus: {
        bonusTaskText: 'Take the very next step from what you just completed. Spend 10 minutes on it right now.',
        dashMessage: 'You are on a roll. Build on the momentum while it is still warm.',
      }
    })
  }
}