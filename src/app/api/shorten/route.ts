import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { text, type } = await req.json()

  if (!text) {
    return NextResponse.json({ shortened: '' }, { status: 400 })
  }

  const prompt = type === 'goal'
    ? `Shorten this goal to 6 words or less. Keep it punchy and meaningful. Return only the shortened text, nothing else.\n\nGoal: ${text}`
    : `Shorten this big prize/reward to 6 words or less. Keep it punchy and meaningful. Return only the shortened text, nothing else.\n\nBig prize: ${text}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  const shortened = data.content?.[0]?.text?.trim() || text

  return NextResponse.json({ shortened })
}