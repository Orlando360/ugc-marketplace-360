import { createClient } from '@/lib/supabase/server'
import CatalogClient from '@/components/CatalogClient'
import Navbar from '@/components/Navbar'

export default async function HomePage() {
  const supabase = createClient()
  const { data: creators } = await supabase
    .from('ugc_creators')
    .select('*')
    .eq('available', true)
    .order('created_at', { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  let role = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <Navbar user={user} role={role} />
      <CatalogClient creators={creators || []} userEmail={user?.email || null} />
    </div>
  )
}
