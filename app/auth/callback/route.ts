import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'totin52@gmail.com'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const role = data.user.email === ADMIN_EMAIL ? 'admin' : 'cliente'

      // Use admin client to bypass RLS — guarantees the profile is always created
      const adminClient = createAdminClient()
      await adminClient.from('profiles').upsert({
        id: data.user.id,
        role,
        full_name: data.user.email?.split('@')[0] ?? null,
      }, { onConflict: 'id', ignoreDuplicates: false })

      if (role === 'admin') {
        return NextResponse.redirect(`${origin}/admin`)
      }
      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback`)
}
