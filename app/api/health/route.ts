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
    const { error } = await supabase.from('creators').select('id').limit(1)
    checks.supabase = error ? `error: ${error.message}` : 'ok'
    if (error) healthy = false
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
