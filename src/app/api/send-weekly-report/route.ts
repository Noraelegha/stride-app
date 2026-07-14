import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const sendPush = async (onesignalId: string, message: string) => {
  return fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      include_subscription_ids: [onesignalId],
      headings: { en: 'Dash' },
      contents: { en: message },
    }),
  })
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all users with an email
    const { data: users } = await supabase
      .from('stride_users')
      .select('*')
      .not('email', 'is', null)

    if (!users || users.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)
    const weekStartStr = weekStart.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })

    // Calculate week number since joined
    let emailsSent = 0
    let pushSent = 0

    for (const user of users) {
      try {
        const firstName = user.name?.split(' ')[0] || 'there'

        // Fetch this week's tasks
        const { data: weekTasks } = await supabase
          .from('daily_tasks')
          .select('task_text, status, workstream, task_date, bonus_completed')
          .eq('user_email', user.email)
          .gte('task_date', weekStartStr)
          .lt('task_date', todayStr)
          .order('task_date', { ascending: true })

        // Fetch all time stats
        const { data: allTasks } = await supabase
          .from('daily_tasks')
          .select('status, bonus_completed')
          .eq('user_email', user.email)

        const completedThisWeek = weekTasks?.filter(t =>
          t.status === 'completed' || t.status === 'partial'
        ).length || 0

        const totalTasksDone = allTasks?.filter(t =>
          t.status === 'completed' || t.status === 'partial'
        ).length || 0

        const totalTasksThisWeek = weekTasks?.length || 0
        const completionRate = totalTasksThisWeek > 0
          ? Math.round((completedThisWeek / totalTasksThisWeek) * 100)
          : 0

        const bonusThisWeek = weekTasks?.filter(t => t.bonus_completed).length || 0

        // Workstream breakdown
        const workstreamMap: Record<string, number> = {}
        weekTasks?.forEach(t => {
          if (t.workstream && (t.status === 'completed' || t.status === 'partial')) {
            workstreamMap[t.workstream] = (workstreamMap[t.workstream] || 0) + 1
          }
        })
        const workstreams = Object.entries(workstreamMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)

        const maxWorkstreamCount = workstreams[0]?.[1] || 1

        const isActive = completedThisWeek > 0
        const streak = user.streak || 0

        // Generate Dash's weekly message via Haiku
        const coachDescriptions: Record<string, string> = {
          tough: 'No-nonsense. Direct. Unfiltered.',
          strategic: 'Strategic partner. Professional. ROI-focused.',
          friend: 'Sarcastic best friend. Warm but will call you out.',
          mentor: 'Gentle mentor. Encouragement first.',
        }

        const messagePrompt = isActive
          ? `You are Dash, an AI accountability coach. Write a weekly recap message for ${firstName}.
Coach style: ${coachDescriptions[user.coach_style] || 'direct and warm'}
This week: ${completedThisWeek} tasks completed out of ${totalTasksThisWeek}. Current streak: ${streak} days. Top workstream: ${workstreams[0]?.[0] || 'varied'}.
Goal: ${user.goal || 'their goal'}

Write exactly 3 short messages in the user's coach style:
1. A one-line opener referencing the week (max 12 words)
2. A one-line observation about their specific stats or workstream (max 15 words)  
3. A one-line forward-looking closer seeding next week (max 12 words, end with ⚡)

Return valid JSON only: {"msg1": "...", "msg2": "...", "msg3": "..."}`
          : `You are Dash, an AI accountability coach. Write a re-engagement message for ${firstName} who completed 0 tasks this week.
Coach style: ${coachDescriptions[user.coach_style] || 'direct and warm'}
Total tasks ever completed: ${totalTasksDone}. Goal: ${user.goal || 'their goal'}

Write exactly 3 short messages in the user's coach style:
1. A one-line opener acknowledging the quiet week (max 10 words, no guilt-tripping)
2. A one-line that references their total task history as proof they can do this (max 15 words)
3. A one-line call to action for tomorrow (max 12 words, end with ⚡)

Return valid JSON only: {"msg1": "...", "msg2": "...", "msg3": "..."}`

        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 300,
            messages: [{ role: 'user', content: messagePrompt }],
          }),
        })

        const aiData = await aiRes.json()
        const rawText = aiData.content?.[0]?.text?.trim()
        const jsonMatch = rawText?.match(/\{[\s\S]*\}/)
        let msgs = { msg1: '', msg2: '', msg3: '' }
        if (jsonMatch) {
          try { msgs = JSON.parse(jsonMatch[0]) } catch (e) {}
        }

        // Fallback messages if AI fails
        if (!msgs.msg1) {
          msgs = isActive
            ? {
                msg1: `${firstName}. Week done.`,
                msg2: `${completedThisWeek} tasks completed. The work is adding up.`,
                msg3: `Week ${Math.floor(totalTasksDone / 7) + 1} starts tomorrow. ⚡`,
              }
            : {
                msg1: `${firstName}. This week was quiet.`,
                msg2: `${totalTasksDone} tasks completed before this week. That does not disappear.`,
                msg3: `One task tomorrow. That is all it takes. ⚡`,
              }
        }

        // Sanitize em dashes
        const sanitize = (s: string) => s?.replace(/—/g, ' ') || s
        msgs.msg1 = sanitize(msgs.msg1)
        msgs.msg2 = sanitize(msgs.msg2)
        msgs.msg3 = sanitize(msgs.msg3)

        const preheaderPadding = '&nbsp;&zwj;'.repeat(60)
        const subject = isActive
          ? `${firstName}, your Week ${Math.ceil(totalTasksDone / 7)} report is here 📊`
          : `${firstName}, Dash noticed this week was quiet.`

        const htmlContent = isActive
          ? celebratoryEmail(firstName, msgs, completedThisWeek, totalTasksThisWeek, streak, completionRate, bonusThisWeek, workstreams, maxWorkstreamCount, preheaderPadding)
          : reengagementEmail(firstName, msgs, totalTasksDone, user.goal || '', preheaderPadding)

        // Send email via Brevo
        const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY!,
          },
          body: JSON.stringify({
            sender: { name: 'Dash from Stride', email: 'trystrideapp@gmail.com' },
            to: [{ email: user.email, name: user.name }],
            subject,
            htmlContent,
          }),
        })

        if (emailRes.ok) emailsSent++

        // Send push notification if user has onesignal_id
        if (user.onesignal_id) {
          const pushMsg = isActive
            ? `${firstName}, your weekly report just landed in your inbox. ${completedThisWeek} tasks done this week. ⚡`
            : `${firstName}, Dash has your weekly check-in. This week was quiet. Next week does not have to be.`

          const pushRes = await sendPush(user.onesignal_id, pushMsg)
          if (pushRes.ok) {
            await supabase.from('notification_logs').insert({
              user_email: user.email,
              tier: 'weekly',
              message: pushMsg,
              sent_at: new Date().toISOString(),
            })
            pushSent++
          }
        }
      } catch (e) {
        console.error(`Weekly report failed for ${user.email}:`, e)
        continue
      }
    }

    return NextResponse.json({ emailsSent, pushSent })
  } catch (error) {
    console.error('Weekly report error:', error)
    return NextResponse.json({ error: 'Failed to send weekly reports' }, { status: 500 })
  }
}

function celebratoryEmail(
  firstName: string,
  msgs: { msg1: string; msg2: string; msg3: string },
  completedThisWeek: number,
  totalTasksThisWeek: number,
  streak: number,
  completionRate: number,
  bonusThisWeek: number,
  workstreams: [string, number][],
  maxWorkstreamCount: number,
  preheaderPadding: string
): string {
  const workstreamColors = ['#F5A623', '#4A9EDB', '#4CAF50', '#9B59B6', '#E74C3C']

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${completedThisWeek} tasks done this week. Dash has the full breakdown.${preheaderPadding}
  </div>
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header — conversational -->
    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:12px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #f0f0f0;">
        <tr>
          <td style="width:50px;vertical-align:middle;padding:0 10px 0 0;">
            <div style="width:40px;height:40px;background:#F5A623;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">⚡</div>
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:14px;font-weight:800;color:#1a1a2e;">DASH</div>
            <div style="font-size:11px;color:#888;">Weekly check-in &middot; Sunday</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="display:inline-block;width:7px;height:7px;background:#22c55e;border-radius:50%;margin-right:4px;vertical-align:middle;"></span>
            <span style="font-size:11px;color:#22c55e;font-weight:500;vertical-align:middle;">online</span>
          </td>
        </tr>
      </table>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="background:#f5f5f7;border-radius:4px 16px 16px 16px;padding:12px 16px;max-width:88%;">
          <p style="font-size:13px;color:#333;line-height:1.65;margin:0;">${msgs.msg1}</p>
        </div>
        <div style="background:#f5f5f7;border-radius:4px 16px 16px 16px;padding:12px 16px;max-width:88%;">
          <p style="font-size:13px;color:#333;line-height:1.65;margin:0;">${msgs.msg2}</p>
        </div>
        <div style="background:#1a1a2e;border-radius:4px 16px 16px 16px;padding:12px 16px;max-width:88%;">
          <p style="font-size:13px;color:#F5A623;font-weight:700;line-height:1.65;margin:0;">${msgs.msg3}</p>
        </div>
      </div>
    </div>

    <!-- Stats grid -->
    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:12px;">
      <div style="font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">This week</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:50%;padding:0 6px 10px 0;">
            <div style="background:#f9f9f9;border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:32px;font-weight:900;color:#F5A623;">${completedThisWeek}</div>
              <div style="font-size:11px;color:#888;margin-top:3px;">tasks completed</div>
            </div>
          </td>
          <td style="width:50%;padding:0 0 10px 6px;">
            <div style="background:#f9f9f9;border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:28px;font-weight:900;color:#1a1a2e;">${streak} 🔥</div>
              <div style="font-size:11px;color:#888;margin-top:3px;">day streak</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="width:50%;padding:0 6px 0 0;">
            <div style="background:#f9f9f9;border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:32px;font-weight:900;color:#4CAF50;">${completionRate}%</div>
              <div style="font-size:11px;color:#888;margin-top:3px;">completion rate</div>
            </div>
          </td>
          <td style="width:50%;padding:0 0 0 6px;">
            <div style="background:#f9f9f9;border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:32px;font-weight:900;color:#4A9EDB;">${bonusThisWeek}</div>
              <div style="font-size:11px;color:#888;margin-top:3px;">bonus tasks</div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    ${workstreams.length > 0 ? `
    <!-- Workstreams -->
    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:12px;">
      <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:14px;">What you worked on</div>
      <table style="width:100%;border-collapse:collapse;">
        ${workstreams.map(([name, count], idx) => `
        <tr>
          <td style="width:80px;font-size:12px;color:#555;padding:0 10px 10px 0;text-transform:capitalize;">${name}</td>
          <td style="padding:0 10px 10px 0;">
            <div style="height:8px;background:#f0f0f0;border-radius:4px;">
              <div style="width:${Math.round((count / maxWorkstreamCount) * 100)}%;height:100%;background:${workstreamColors[idx] || '#F5A623'};border-radius:4px;"></div>
            </div>
          </td>
          <td style="width:20px;font-size:12px;font-weight:700;color:#888;text-align:right;padding:0 0 10px 0;">${count}</td>
        </tr>`).join('')}
      </table>
    </div>` : ''}

    <!-- CTA -->
    <div style="text-align:center;">
      <a href="https://stride.vercel.app/home" style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:16px 40px;border-radius:14px;">
        See my task ⚡
      </a>
    </div>

  </div>
</body>
</html>`
}

function reengagementEmail(
  firstName: string,
  msgs: { msg1: string; msg2: string; msg3: string },
  totalTasksDone: number,
  goal: string,
  preheaderPadding: string
): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    This week was quiet. Dash noticed. Next week does not have to be the same.${preheaderPadding}
  </div>
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header — conversational -->
    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:12px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #f0f0f0;">
        <tr>
          <td style="width:50px;vertical-align:middle;padding:0 10px 0 0;">
            <div style="width:40px;height:40px;background:#F5A623;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">⚡</div>
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:14px;font-weight:800;color:#1a1a2e;">DASH</div>
            <div style="font-size:11px;color:#888;">Weekly check-in &middot; Sunday</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="display:inline-block;width:7px;height:7px;background:#F5A623;border-radius:50%;margin-right:4px;vertical-align:middle;"></span>
            <span style="font-size:11px;color:#F5A623;font-weight:500;vertical-align:middle;">waiting</span>
          </td>
        </tr>
      </table>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="background:#f5f5f7;border-radius:4px 16px 16px 16px;padding:12px 16px;max-width:88%;">
          <p style="font-size:13px;color:#333;line-height:1.65;margin:0;">${msgs.msg1}</p>
        </div>
        <div style="background:#f5f5f7;border-radius:4px 16px 16px 16px;padding:12px 16px;max-width:88%;">
          <p style="font-size:13px;color:#333;line-height:1.65;margin:0;">${msgs.msg2}</p>
        </div>
        <div style="background:#1a1a2e;border-radius:4px 16px 16px 16px;padding:12px 16px;max-width:88%;">
          <p style="font-size:13px;color:#F5A623;font-weight:700;line-height:1.65;margin:0;">${msgs.msg3}</p>
        </div>
      </div>
    </div>

    <!-- Goal reminder -->
    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:12px;">
      <div style="font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">What you are working toward</div>
      <div style="background:#f9f9f9;border-left:3px solid #F5A623;border-radius:0 10px 10px 0;padding:13px 15px;">
        <div style="font-size:10px;font-weight:700;color:#F5A623;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Your goal</div>
        <div style="font-size:13px;color:#1a1a2e;line-height:1.5;">${goal}</div>
      </div>
    </div>

    <!-- Stats -->
    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:12px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:50%;padding:0 6px 0 0;">
            <div style="background:#fff8ec;border:1.5px solid #F5A623;border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:32px;font-weight:900;color:#F5A623;">0</div>
              <div style="font-size:11px;color:#888;margin-top:3px;">tasks this week</div>
            </div>
          </td>
          <td style="width:50%;padding:0 0 0 6px;">
            <div style="background:#f9f9f9;border-radius:12px;padding:16px;text-align:center;">
              <div style="font-size:32px;font-weight:900;color:#1a1a2e;">${totalTasksDone}</div>
              <div style="font-size:11px;color:#888;margin-top:3px;">total tasks done</div>
            </div>
          </td>
        </tr>
      </table>
      <div style="margin-top:10px;background:#fff8ec;border-radius:10px;padding:12px 14px;text-align:center;">
        <div style="font-size:12px;color:#F5A623;font-weight:600;">${totalTasksDone} tasks completed before this week. That work does not disappear. Pick it back up.</div>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align:center;">
      <a href="https://stride.vercel.app/home" style="display:inline-block;background:#F5A623;color:#1a1a2e;text-decoration:none;font-size:15px;font-weight:800;padding:16px 40px;border-radius:14px;">
        See my task ⚡
      </a>
    </div>

  </div>
</body>
</html>`
}