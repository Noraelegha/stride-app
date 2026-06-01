import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { onesignal_id, email, title, message } = await req.json()

    if (!email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        include_aliases: { external_id: [email] },
        target_channel: 'push',
        ...(title ? { headings: { en: title } } : {}),
        contents: { en: message },
      }),
    })

    const data = await response.json()
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('[send-notification] Error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}