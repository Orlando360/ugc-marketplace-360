import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'
import Navbar from '@/components/Navbar'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const [{ data: creators }, { data: requests }] = await Promise.all([
    supabase.from('ugc_creators').select('*').order('created_at', { ascending: false }),
    supabase.from('hiring_requests').select('*, ugc_creators(name, emoji, category)').order('created_at', { ascending: false }),
  ])

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <Navbar user={user} role="admin" />
      <AdminDashboard creators={creators || []} requests={requests || []} />
    </div>
  )
}
