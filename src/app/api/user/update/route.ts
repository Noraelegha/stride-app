import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, updates, upsert } = await req.json()
    if (!email || !updates) return NextResponse.json({ error: 'Email and updates required' }, { status: 400 })

    let result
    if (upsert) {
      result = await supabase.from('stride_users').upsert({ email, ...updates })
    } else {
      result = await supabase.from('stride_users').update(updates).eq('email', email)
    }

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('user/update error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}