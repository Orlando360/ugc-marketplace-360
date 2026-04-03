import { createClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/admin/AdminDashboard'
import Navbar from '@/components/Navbar'

export default async function AdminPage() {
  const supabase = createClient()

  const [{ data: creators }, { data: requests }] = await Promise.all([
    supabase.from('ugc_creators').select('*').order('created_at', { ascending: false }),
    supabase.from('hiring_requests').select('*, ugc_creators(name, emoji, category)').order('created_at', { ascending: false }),
  ])

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <Navbar />
      <AdminDashboard creators={creators || []} requests={requests || []} />
    </div>
  )
}
