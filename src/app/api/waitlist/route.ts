import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { name, email, goal } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Save to Supabase
    const { error: dbError } = await supabase.from('waitlist').upsert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      goal: goal?.trim() || null,
    }, { onConflict: 'email' })

    if (dbError) console.error('Waitlist DB error:', dbError)

    // Add to Brevo contacts
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        attributes: {
          FIRSTNAME: name.trim().split(' ')[0],
          LASTNAME: name.trim().split(' ').slice(1).join(' ') || '',
          GOAL: goal?.trim() || '',
        },
        listIds: [3], // your waitlist list ID in Brevo — update if different
        updateEnabled: true,
      }),
    })

    // Send waitlist welcome email
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: 'Dash from Stride', email: 'trystrideapp@gmail.com' },
        to: [{ email: email.toLowerCase().trim(), name: name.trim() }],
        subject: `${name.trim().split(' ')[0]}, Dash has your briefing. ⚡`,
        htmlContent: waitlistEmailHTML(name.trim().split(' ')[0], goal?.trim() || ''),
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}

function waitlistEmailHTML(firstName: string, goal: string): string {
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
      You are locked in, ${firstName}.
    </h1>
    <p style="color:rgba(255,255,255,0.6);font-size:15px;margin:0;line-height:1.6;">
      Dash has your briefing. You will hear from us before anyone else.
    </p>
  </div>

  <!-- Main -->
  <div style="background:#ffffff;border-radius:20px;padding:32px;margin-bottom:16px;">
    <p style="color:#1a1a2e;font-size:16px;font-weight:700;margin:0 0 12px 0;">Here is what just happened.</p>
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
      You joined the Stride waitlist. That is not nothing. Most people with a goal like yours stay in the "I'll start soon" zone indefinitely. You did not.
    </p>
    ${goal ? `<div style="background:#f9f9f9;border-left:3px solid #F5A623;border-radius:0 10px 10px 0;padding:14px 18px;margin-bottom:16px;">
      <div style="font-size:11px;font-weight:700;color:#F5A623;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Your goal</div>
      <div style="font-size:14px;color:#1a1a2e;line-height:1.6;">${goal}</div>
    </div>` : ''}
    <p style="color:#555;font-size:15px;line-height:1.7;margin:0;">
      When Stride opens early access, you are first in. Dash will be ready with your first task on day one.
    </p>
  </div>

  <!-- What to expect -->
  <div style="background:#ffffff;border-radius:20px;padding:32px;margin-bottom:16px;">
    <p style="color:#1a1a2e;font-size:15px;font-weight:700;margin:0 0 16px 0;">What happens next</p>
    ${[
      ['⚡', 'Early access invite', 'You will be first to know when Stride opens. No waiting in a general queue.'],
      ['🎯', '14 days of full Pro free', 'Every early access member gets two weeks of the full Stride experience at no cost.'],
      ['💬', 'Community access now', 'While you wait, the Stride WhatsApp community is live. Early members are already building daily.'],
    ].map(([ico, title, desc]) => `
    <div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:16px;">
      <div style="width:36px;height:36px;background:#f5f5f7;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${ico}</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">${title}</div>
        <div style="font-size:13px;color:#888;line-height:1.5;">${desc}</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- Community CTA -->
  <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:20px;padding:24px 32px;margin-bottom:24px;text-align:center;">
    <p style="color:#1a1a2e;font-size:15px;font-weight:700;margin:0 0 8px 0;">Don't wait alone.</p>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px 0;">The Stride community is already active. Come meet the people building toward their goals right now.</p>
    <a href="https://chat.whatsapp.com/DDE9BOhMmauCnTkkpFxY5A" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:100px;">
      💬 Join the community
    </a>
  </div>

  <!-- Footer -->
  <div style="background:#ffffff;border-radius:20px;padding:24px 32px;text-align:center;">
    <p style="color:#888;font-size:13px;line-height:1.7;margin:0 0 8px 0;">
      You joined the Stride waitlist. Questions? Reply to this email.
    </p>
    <p style="color:#F5A623;font-size:13px;font-weight:700;margin:0;">Dash is watching the clock. ⚡</p>
  </div>

</div>
</body>
</html>`
}