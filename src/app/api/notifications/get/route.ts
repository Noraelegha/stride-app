import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, limit } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const { data, error } = await supabase
      .from('notification_logs')
      .select('tier, message, sent_at')
      .eq('user_email', email)
      .order('sent_at', { ascending: false })
      .limit(limit || 100)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e) {
    console.error('notifications/get error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}