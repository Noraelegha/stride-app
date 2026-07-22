import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, updates, filters, insert } = await req.json()
    if (!email || !updates) return NextResponse.json({ error: 'Email and updates required' }, { status: 400 })

    let result
    if (insert) {
      result = await supabase.from('daily_tasks').insert({ user_email: email, ...updates })
    } else {
      let query = supabase.from('daily_tasks').update(updates).eq('user_email', email)
      if (filters) {
        for (const [col, val] of Object.entries(filters)) {
          query = query.eq(col, val as string)
        }
      }
      result = await query
    }

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('tasks/update error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}