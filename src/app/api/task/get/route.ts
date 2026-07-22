import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { email, fields, filters, order, limit, single } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    let query = supabase
      .from('daily_tasks')
      .select(fields || '*')
      .eq('user_email', email)

    if (filters) {
      for (const [col, val] of Object.entries(filters)) {
        query = query.eq(col, val as string)
      }
    }
    if (order) {
      query = query.order(order.column, { ascending: order.ascending ?? true })
    }
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = single ? await query.maybeSingle() : await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (e) {
    console.error('tasks/get error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}