import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, string> = { app: 'ok' }
  let healthy = true

  // Check Supabase
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.from('ugc_creators').select('id').limit(1)
    if (error?.message?.includes('schema cache') || error?.message?.includes('does not exist')) {
      checks.supabase = 'connected (table pending setup)'
    } else if (error) {
      checks.supabase = `error: ${error.message}`
      healthy = false
    } else {
      checks.supabase = 'ok'
    }
  } catch (e) {
    checks.supabase = `error: ${(e as Error).message}`
    healthy = false
  }

  // Check Claude API key exists
  checks.claude_key = process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing'
  if (!process.env.ANTHROPIC_API_KEY) healthy = false

  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  )
}
