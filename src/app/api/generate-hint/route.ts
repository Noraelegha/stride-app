import { NextRequest, NextResponse } from 'next/server'
import { DASH_SYSTEM_PROMPT } from '@/lib/dashPrompt'

export async function POST(req: NextRequest) {
  try {
    const { user, taskText, dashMessage, hintType } = await req.json()

    if (!user || !taskText || !hintType) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    const hintInstructions: Record<string, string> = {
      simplifier: `The user says the task feels too big. Generate a SIMPLIFIER hint.
Your job: break the task into the single smallest physical action possible.
This is NOT a summary of the task. It is a genuinely smaller starting action.
Example: if the task is "Post a TikTok video about your errand service", the simplifier is NOT "Post a shorter video". It is "Open TikTok right now. Press the plus button. That is all you need to do right now."
The floor is: what is the one physical action that starts the task without requiring any output yet?
Return:
- hintMessage: Dash's voice, 1-2 sentences max, direct, no filler, matches coach style
- hintTask: the simplified micro-action, specific and physical, under 60 seconds to start`,

      toolDrop: `The user does not know where to start. Generate a TOOL DROP hint.
Your job: give them a specific named resource, search term, platform feature, or technique they may not know about that makes this task easier to start.
This is NOT a restatement of the task. It must give the user something new — a specific place to go, a specific search to run, or a specific shortcut.
Example: if the task is "Find a motion design studio to apply to", the tool drop is NOT "Open LinkedIn and search". It is "Go to motionographer.com/jobs — it is the most active job board for motion designers. Filter by full-time. Pick one studio."
Return:
- hintMessage: Dash's voice, 1-2 sentences, names the specific resource or technique
- hintTask: the exact action using that resource, specific enough that they can start in 30 seconds`,

      permissionSlip: `The user is overthinking it. Generate a PERMISSION SLIP hint.
Your job: remove the perfectionism blocker by giving them explicit permission AND a concrete example of what "good enough" looks like for this specific task.
This is NOT just saying "done beats perfect". It must give a real example of what an imperfect but acceptable version looks like.
Example: if the task is "Leave a comment on a LinkedIn post offering a quick win", the permission slip is NOT "Your comment doesn't have to be perfect." It is "Something like this is enough: 'Have you tried posting your client results as a carousel? Works really well for service businesses.' Two sentences. Not clever. Not polished. Just real. Post it."
Return:
- hintMessage: Dash's voice, 1-2 sentences, gives explicit permission
- hintTask: shows a real concrete example of what good enough looks like for THIS specific task`,
    }

    const coachDescriptions: Record<string, string> = {
      tough: 'No-nonsense coach. Direct. Unfiltered. Pure execution.',
      strategic: 'Strategic partner. Professional. ROI-focused. Peer-to-peer.',
      friend: 'Sarcastic best friend. Jokes with accountability. Warm but will call you out.',
      mentor: 'Gentle mentor. Encouragement first. Patient and warm.',
    }

    const prompt = `USER CONTEXT:
Name: ${user.name}
Goal: ${user.goal}
Big Prize: ${user.bigPrize}
Coach Style: ${coachDescriptions[user.coachStyle] || user.coachStyle}

TODAY'S TASK:
${taskText}

DASH MESSAGE FOR THIS TASK:
${dashMessage || ''}

HINT TYPE REQUESTED: ${hintType.toUpperCase()}

${hintInstructions[hintType]}

Respond in valid JSON only:
{
  "hintMessage": "Dash's message in the user's coach style, 1-2 sentences, specific to this task",
  "hintTask": "The actual reduced or reframed task the user should do now"
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 400,
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

    const hint = JSON.parse(jsonMatch[0])
    hint.hintMessage = hint.hintMessage?.replace(/—/g, ' ')
hint.hintTask = hint.hintTask?.replace(/—/g, ' ')
    return NextResponse.json({ hint })

  } catch (error) {
    console.error('Generate hint error:', error)
    return NextResponse.json({ error: 'Failed to generate hint' }, { status: 500 })
  }
}