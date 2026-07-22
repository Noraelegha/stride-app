import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, fields } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const selectFields = fields || '*'
    const { data, error } = await supabase
      .from('stride_users')
      .select(selectFields)
      .eq('email', email)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e) {
    console.error('user/get error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}