'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0A0A0A' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <span style={{ color: '#F5C518', fontFamily: 'Syne', fontSize: '1.5rem', fontWeight: 700 }}>
              UGC
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Syne', fontSize: '1.5rem' }}>
              Marketplace 360
            </span>
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            Acceder
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'DM Sans', fontSize: '0.95rem' }}>
            Te enviamos un link mágico a tu correo
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#111111',
          border: '1px solid rgba(245,197,24,0.12)',
          borderRadius: '20px',
          padding: '2.5rem',
        }}>
          {sent ? (
            <div className="text-center">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
              <h2 style={{ fontFamily: 'Syne', fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                Revisa tu correo
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Enviamos un link de acceso a <span style={{ color: '#F5C518' }}>{email}</span>.
                Expira en 1 hora.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  fontFamily: 'Syne',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@correo.com"
                  style={{
                    width: '100%',
                    background: '#1A1A1A',
                    border: '1px solid rgba(245,197,24,0.15)',
                    borderRadius: '10px',
                    padding: '0.875rem 1rem',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(245,197,24,0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(245,197,24,0.15)'}
                />
              </div>

              {error && (
                <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3 rounded-xl text-sm"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Enviando...' : 'Enviar link de acceso'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
