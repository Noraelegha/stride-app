import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, message } = await req.json()

    if (!email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        include_aliases: { external_id: [email] },
        target_channel: 'push',
        headings: { en: 'Stride ⚡' },
        contents: { en: message },
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}