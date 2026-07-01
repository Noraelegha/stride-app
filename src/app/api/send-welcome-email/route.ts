import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, goal, coachStyle } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const firstName = name.trim().split(' ')[0]

    const coachIntro: Record<string, string> = {
      tough: `No slow start. No easing in. Dash has your first task ready and it will not wait long.`,
      strategic: `Dash has mapped your first move. One task, high signal, starting today.`,
      friend: `Okay ${firstName}, you actually did it. You signed up. Dash is genuinely impressed. Let's not waste it.`,
      mentor: `Every journey that mattered started exactly like this. One decision, one step. Dash is here for all of them.`,
    }

    const intro = coachIntro[coachStyle] || coachIntro.mentor

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: 'Dash from Stride', email: 'trystrideapp@gmail.com' },
        to: [{ email: email.toLowerCase().trim(), name: name.trim() }],
        subject: `Your first task is waiting, ${firstName}. ⚡`,
        htmlContent: welcomeEmailHTML(firstName, goal?.trim() || '', intro),
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Welcome email error:', error)
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 })
  }
}

function welcomeEmailHTML(firstName: string, goal: string, intro: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">

  <!-- Header -->
  <div style="background:#1a1a2e;border-radius:20px;padding:40px 32px;text-align:center;margin-bottom:24px;">
    <div style="font-size:36px;margin-bottom:12px;">⚡</div>
    <div style="font-size:13px;font-weight:700;color:#F5A623;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Dash here</div>
    <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 12px 0;line-height:1.2;">
      Welcome to Stride, ${firstName}.
    </h1>
    <p style="color:rgba(255,255,255,0.6);font-size:15px;margin:0;line-height:1.6;">
      ${intro}
    </p>
  </div>

  <!-- Goal card -->
  ${goal ? `<div style="background:#ffffff;border-radius:20px;padding:32px;margin-bottom:16px;">
    <p style="color:#1a1a2e;font-size:15px;font-weight:700;margin:0 0 12px 0;">What Dash is working with</p>
    <div style="background:#f9f9f9;border-left:3px solid #F5A623;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:12px;">
      <div style="font-size:11px;font-weight:700;color:#F5A623;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Your goal</div>
      <div style="font-size:14px;color:#1a1a2e;line-height:1.6;">${goal}</div>
    </div>
    <p style="color:#888;font-size:13px;line-height:1.6;margin:0;">Dash has this. Every task from here is built around it.</p>
  </div>` : ''}

  <!-- What to expect -->
  <div style="background:#ffffff;border-radius:20px;padding:32px;margin-bottom:16px;">
    <p style="color:#1a1a2e;font-size:15px;font-weight:700;margin:0 0 16px 0;">Here is how Stride works</p>
    ${[
      ['🎯', 'One task. Every day.', 'Dash generates your task each morning. Under 5 minutes. Built specifically for your goal.'],
      ['🔥', 'Your streak is live.', 'Every day you complete your task, your streak grows. Miss one and Dash will notice.'],
      ['🛡️', 'Shields protect your streak.', 'Earn a shield every 5 days. It covers you if life gets in the way.'],
      ['⚡', 'Dash pushes back.', 'If you hit a wall, swipe left. Dash will break the task down until it is impossible to say no to.'],
    ].map(([ico, title, desc]) => `
    <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:16px;">
      <div style="width:36px;height:36px;background:#f5f5f7;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${ico}</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">${title}</div>
        <div style="font-size:13px;color:#888;line-height:1.5;">${desc}</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- CTA -->
  <div style="text-align:center;margin-bottom:24px;">
    <a href="https://stride.vercel.app/home" style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;font-size:16px;font-weight:800;padding:16px 40px;border-radius:14px;">
      See my task ⚡
    </a>
    <p style="color:#888;font-size:13px;margin-top:12px;">Opens Stride directly. Task is already waiting.</p>
  </div>

  <!-- Footer -->
  <div style="background:#ffffff;border-radius:20px;padding:24px 32px;text-align:center;">
    <p style="color:#888;font-size:13px;line-height:1.7;margin:0 0 8px 0;">
      You signed up for Stride. Questions? Reply to this email.
    </p>
    <p style="color:#F5A623;font-size:13px;font-weight:700;margin:0;">Dash is watching. ⚡</p>
  </div>

</div>
</body>
</html>`
}