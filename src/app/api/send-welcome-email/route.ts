import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, goal, coachStyle } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    function capitalizeName(n: string): string {
      return n.trim().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    }

    const properName = capitalizeName(name)
    const firstName = properName.split(' ')[0]

    const coachOpener: Record<string, string> = {
      tough: `No slow start. No easing in. Your first task is live and it will not wait long.`,
      strategic: `One task, high signal, starting today. Dash has mapped your first move.`,
      friend: `Okay fine, you actually did it. You signed up. Dash is genuinely impressed. Let's not waste it.`,
      mentor: `Every journey that mattered started exactly like this. One decision, one step. Dash is here for all of them.`,
    }

    const opener = coachOpener[coachStyle] || coachOpener.mentor

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: 'Dash from Stride', email: 'trystrideapp@gmail.com' },
        to: [{ email: email.toLowerCase().trim(), name: properName }],
        subject: `Your first task is waiting, ${firstName}. ⚡`,
        htmlContent: welcomeEmailHTML(firstName, goal?.trim() || '', opener),
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
  }
}

function welcomeEmailHTML(firstName: string, goal: string, opener: string): string {
  const preheaderPadding = '&nbsp;&zwj;'.repeat(60)
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your first task is waiting</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Dash is ready. Are you?${preheaderPadding}
  </div>

  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header — Conversational -->
    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #f0f0f0;">
        <tr>
          <td style="width:50px;vertical-align:middle;padding:0 10px 0 0;">
            <div style="width:40px;height:40px;background:#F5A623;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">⚡</div>
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:14px;font-weight:800;color:#1a1a2e;">DASH</div>
            <div style="font-size:11px;color:#888;">from Stride &middot; just now</div>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="display:inline-block;width:7px;height:7px;background:#22c55e;border-radius:50%;margin-right:4px;vertical-align:middle;"></span>
            <span style="font-size:11px;color:#22c55e;font-weight:500;vertical-align:middle;">online</span>
          </td>
        </tr>
      </table>

      <div style="margin-bottom:10px;">
        <div style="background:#f5f5f7;border-radius:4px 16px 16px 16px;padding:12px 16px;max-width:88%;margin-bottom:10px;">
          <p style="font-size:13px;color:#333;line-height:1.65;margin:0;">Hey ${firstName}. You signed up. That already puts you ahead of 90% of people who said they would.</p>
        </div>
        <div style="background:#f5f5f7;border-radius:4px 16px 16px 16px;padding:12px 16px;max-width:88%;margin-bottom:10px;">
          <p style="font-size:13px;color:#333;line-height:1.65;margin:0;">I'm <strong style="color:#F5A623;">DASH</strong>. ${opener}</p>
        </div>
        <div style="background:#1a1a2e;border-radius:4px 16px 16px 16px;padding:12px 16px;max-width:88%;">
          <p style="font-size:13px;color:#F5A623;font-weight:700;line-height:1.65;margin:0;">Your Day 1 task is waiting. ⚡</p>
        </div>
      </div>
    </div>

    <!-- Goal card -->
    ${goal ? `<div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:12px;">
      <p style="color:#1a1a2e;font-size:14px;font-weight:700;margin:0 0 12px 0;">What Dash is working with</p>
      <div style="background:#f9f9f9;border-left:3px solid #F5A623;border-radius:0 10px 10px 0;padding:13px 15px;margin-bottom:10px;">
        <div style="font-size:10px;font-weight:700;color:#F5A623;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;">Your goal</div>
        <div style="font-size:13px;color:#1a1a2e;line-height:1.5;">${goal}</div>
      </div>
      <p style="color:#888;font-size:12px;line-height:1.6;margin:0;">Dash has this. Every task from here is built around it.</p>
    </div>` : ''}

    <!-- How Stride works -->
    <div style="background:#ffffff;border-radius:20px;padding:24px;margin-bottom:12px;">
      <p style="color:#1a1a2e;font-size:14px;font-weight:700;margin:0 0 16px 0;">Here is how Stride works</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:46px;vertical-align:top;padding:0 12px 16px 0;">
            <div style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;text-align:center;line-height:36px;font-size:17px;">🎯</div>
          </td>
          <td style="vertical-align:top;padding:0 0 16px 0;">
            <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">One task. Every day.</div>
            <div style="font-size:12px;color:#888;line-height:1.5;">Dash generates your task each morning. Under 5 minutes. Built specifically for your goal.</div>
          </td>
        </tr>
        <tr>
          <td style="width:46px;vertical-align:top;padding:0 12px 16px 0;">
            <div style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;text-align:center;line-height:36px;font-size:17px;">🔥</div>
          </td>
          <td style="vertical-align:top;padding:0 0 16px 0;">
            <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">Your streak is live.</div>
            <div style="font-size:12px;color:#888;line-height:1.5;">Every day you complete your task, your streak grows. Miss one and Dash will notice.</div>
          </td>
        </tr>
        <tr>
          <td style="width:46px;vertical-align:top;padding:0 12px 16px 0;">
            <div style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;text-align:center;line-height:36px;font-size:17px;">🛡️</div>
          </td>
          <td style="vertical-align:top;padding:0 0 16px 0;">
            <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">Shields protect your streak.</div>
            <div style="font-size:12px;color:#888;line-height:1.5;">Earn a shield every 5 days. It covers you if life gets in the way.</div>
          </td>
        </tr>
        <tr>
          <td style="width:46px;vertical-align:top;padding:0 12px 0 0;">
            <div style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;text-align:center;line-height:36px;font-size:17px;">💡</div>
          </td>
          <td style="vertical-align:top;padding:0;">
            <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">Hit a wall? Swipe left.</div>
            <div style="font-size:12px;color:#888;line-height:1.5;">Dash will break the task down until it is impossible to say no to.</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:12px;padding:8px 0;">
      <a href="https://stride.vercel.app/home" style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:16px 40px;border-radius:14px;">
        See my task ⚡
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#ffffff;border-radius:20px;padding:20px 24px;text-align:center;">
      <p style="color:#888;font-size:12px;line-height:1.7;margin:0 0 6px 0;">You signed up for Stride. Questions? Reply to this email.</p>
      <p style="color:#F5A623;font-size:12px;font-weight:700;margin:0;">Dash is watching. ⚡</p>
    </div>

  </div>
</body>
</html>`
}