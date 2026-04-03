'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  const isAdmin = pathname === '/admin'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav style={{
      background: isAdmin ? '#0A0A0A' : '#FFFFFF',
      borderBottom: `1px solid ${scrolled ? (isAdmin ? 'rgba(245,197,24,0.12)' : '#EBEBEB') : 'transparent'}`,
      boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', color: isAdmin ? '#fff' : '#0A0A0A', letterSpacing: '-0.02em' }}>
              UGC
            </span>
            <span style={{ fontFamily: 'Syne', fontWeight: 400, fontSize: '1.1rem', color: isAdmin ? 'rgba(255,255,255,0.4)' : '#A8A8A4' }}>
              360
            </span>
            <span style={{
              background: '#F5C518',
              color: '#0A0A0A',
              fontFamily: 'Syne',
              fontWeight: 700,
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              marginLeft: '0.15rem',
            }}>
              MKT
            </span>
          </Link>

          {/* Admin button */}
          <Link
            href="/admin"
            style={{
              fontFamily: 'Syne',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: isAdmin ? '#F5C518' : '#6B6B6B',
              textDecoration: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              background: isAdmin ? 'rgba(245,197,24,0.08)' : '#F4F4F1',
              border: isAdmin ? '1px solid rgba(245,197,24,0.2)' : '1px solid transparent',
              transition: 'all 0.15s',
              letterSpacing: '0.02em',
            }}
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}
