'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface NavbarProps {
  user: User | null
  role: string | null
}

export default function Navbar({ user, role }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <nav style={{
      background: 'rgba(10,10,10,0.9)',
      borderBottom: '1px solid rgba(245,197,24,0.1)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ color: '#F5C518', fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem' }}>UGC</span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Syne', fontSize: '1.1rem' }}>360</span>
          </Link>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {role === 'admin' && (
              <Link href="/admin" style={{
                color: '#F5C518',
                fontFamily: 'Syne',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={handleSignOut}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(245,197,24,0.25)',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'DM Sans',
                  fontSize: '0.85rem',
                  padding: '0.4rem 0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Salir
              </button>
            ) : (
              <Link href="/auth/login" style={{
                background: '#F5C518',
                color: '#0A0A0A',
                fontFamily: 'Syne',
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: '8px',
                padding: '0.4rem 1rem',
                textDecoration: 'none',
              }}>
                Acceder
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
