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

  return (
    <div className="min-h-screen" style={{ background: '#FAFAF8' }}>
      <Navbar />
      <CatalogClient creators={creators || []} />
    </div>
  )
}
