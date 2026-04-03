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
      background: isAdmin ? '#3D2314' : '#FAF7F2',
      borderBottom: `1px solid ${scrolled ? (isAdmin ? 'rgba(196,135,58,0.2)' : '#F0E6D3') : 'transparent'}`,
      boxShadow: scrolled ? '0 1px 12px rgba(61,35,20,0.06)' : 'none',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.2rem', color: isAdmin ? '#FAF7F2' : '#3D2314', letterSpacing: '-0.01em' }}>
              UGC
            </span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, fontSize: '1.2rem', color: isAdmin ? 'rgba(250,247,242,0.4)' : '#B8977A' }}>
              360
            </span>
            <span style={{
              background: '#C4873A',
              color: '#FFFFFF',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '0.58rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0.12rem 0.45rem',
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
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.82rem',
              fontWeight: 600,
              color: isAdmin ? '#C4873A' : '#8B5E3C',
              textDecoration: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              background: isAdmin ? 'rgba(196,135,58,0.08)' : '#F0E6D3',
              border: isAdmin ? '1px solid rgba(196,135,58,0.2)' : '1px solid #C4873A',
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
