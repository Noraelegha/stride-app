import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function capitalizeName(name: string): string {
  return name.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, goal } = await req.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const properName = capitalizeName(name)
    const firstName = properName.split(' ')[0]

    // Save to Supabase
    const { error: dbError } = await supabase.from('waitlist').upsert({
      name: properName,
      email: email.toLowerCase().trim(),
      goal: goal?.trim() || null,
    }, { onConflict: 'email', ignoreDuplicates: false })

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
          FIRSTNAME: firstName,
          LASTNAME: properName.split(' ').slice(1).join(' ') || '',
          GOAL: goal?.trim() || '',
        },
        listIds: [3],
        updateEnabled: true,
      }),
    })

    // Send waitlist welcome email
    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: 'Dash from Stride', email: 'trystrideapp@gmail.com' },
        to: [{ email: email.toLowerCase().trim(), name: properName }],
        subject: `${firstName}, your journey with Stride starts now 🎉`,
        htmlContent: waitlistEmailHTML(firstName, goal?.trim() || ''),
        headers: {
          'X-Preheader': "You're locked in! 🔒",
        },
      }),
    })

    const emailResult = await emailRes.json()
    console.log('Brevo email result:', JSON.stringify(emailResult))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Waitlist error:', error)
    return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 })
  }
}

function waitlistEmailHTML(firstName: string, goal: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your journey with Stride starts now</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <!-- Preheader text (hidden but shows in inbox preview) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    You're locked in! 🔒 Dash is ready. Early access is coming.
  </div>

  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:#1a1a2e;border-radius:20px;padding:36px 28px;text-align:center;margin-bottom:16px;">
      <div style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 14px 0;line-height:1.3;">
        Hey ${firstName}, I'm <span style="color:#F5A623;letter-spacing:0.05em;">DASH</span>.
      </div>
      <p style="color:rgba(255,255,255,0.82);font-size:14px;margin:0;line-height:1.7;">
        My job is to help you close the gap between where you are now and where you want to be. One task at a time.
      </p>
    </div>

    <!-- Main -->
    <div style="background:#ffffff;border-radius:20px;padding:28px;margin-bottom:12px;">
      <p style="color:#1a1a2e;font-size:15px;font-weight:700;margin:0 0 10px 0;">Here is what just happened.</p>
      <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 16px 0;">
        You joined the Stride waitlist. That is not nothing. Most people with a goal like yours stay in the "I'll start soon" zone indefinitely. You didn't.
      </p>
      ${goal ? `<div style="background:#f9f9f9;border-left:3px solid #F5A623;border-radius:0 10px 10px 0;padding:14px 16px;margin-bottom:16px;">
        <div style="font-size:10px;font-weight:700;color:#F5A623;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Your goal</div>
        <div style="font-size:14px;color:#1a1a2e;line-height:1.6;">${goal}</div>
      </div>` : ''}
      <p style="color:#555;font-size:14px;line-height:1.7;margin:0;">
        When Stride opens early access, you are first in. Dash will be ready with your first task on day one.
      </p>
    </div>

    <!-- What happens next -->
    <div style="background:#ffffff;border-radius:20px;padding:28px;margin-bottom:12px;">
      <p style="color:#1a1a2e;font-size:15px;font-weight:700;margin:0 0 16px 0;">What happens next</p>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:46px;vertical-align:top;padding:0 12px 16px 0;">
            <div style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;text-align:center;line-height:36px;font-size:18px;">⚡</div>
          </td>
          <td style="vertical-align:top;padding:0 0 16px 0;">
            <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">Early access invite</div>
            <div style="font-size:13px;color:#888;line-height:1.5;">You will be first to know when Stride opens. No waiting in a general queue.</div>
          </td>
        </tr>
        <tr>
          <td style="width:46px;vertical-align:top;padding:0 12px 16px 0;">
            <div style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;text-align:center;line-height:36px;font-size:18px;">🎯</div>
          </td>
          <td style="vertical-align:top;padding:0 0 16px 0;">
            <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">14 days of full Pro free</div>
            <div style="font-size:13px;color:#888;line-height:1.5;">Every early access member gets two weeks of the full Stride experience at no cost.</div>
          </td>
        </tr>
        <tr>
          <td style="width:46px;vertical-align:top;padding:0 12px 0 0;">
            <div style="width:36px;height:36px;background:#f5f5f7;border-radius:8px;text-align:center;line-height:36px;font-size:18px;">💬</div>
          </td>
          <td style="vertical-align:top;padding:0;">
            <div style="font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:3px;">Community access now</div>
            <div style="font-size:13px;color:#888;line-height:1.5;">The Stride WhatsApp community is live. Early members are already building daily.</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Community CTA -->
    <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:20px;padding:24px 28px;margin-bottom:12px;text-align:center;">
      <p style="color:#1a1a2e;font-size:15px;font-weight:700;margin:0 0 8px 0;">Don't wait alone.</p>
      <p style="color:#555;font-size:13px;line-height:1.6;margin:0 0 16px 0;">The Stride community is already active. Come meet the people building toward their goals right now.</p>
      <a href="https://chat.whatsapp.com/DDE9BOhMmauCnTkkpFxY5A" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:100px;">
        💬 Join the community
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#ffffff;border-radius:20px;padding:22px 28px;text-align:center;">
      <p style="color:#888;font-size:13px;line-height:1.7;margin:0 0 6px 0;">
        You joined the Stride waitlist. Questions? Reply to this email.
      </p>
      <p style="color:#F5A623;font-size:13px;font-weight:700;margin:0;">Dash is watching the clock. ⚡</p>
    </div>

  </div>
</body>
</html>`
}