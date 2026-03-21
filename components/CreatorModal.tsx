'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Creator, Package } from '@/types'

interface Props {
  creator: Creator
  userEmail: string | null
  onClose: () => void
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

export default function CreatorModal({ creator, userEmail, onClose }: Props) {
  const [step, setStep] = useState<'profile' | 'hire'>('profile')
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null)
  const [brief, setBrief] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState(userEmail || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleHire = async () => {
    if (!selectedPkg || !brief || !clientEmail || !clientName) {
      setError('Completa todos los campos')
      return
    }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('hiring_requests').insert({
      creator_id: creator.id,
      client_email: clientEmail,
      client_name: clientName,
      package_name: selectedPkg.name,
      package_price: selectedPkg.price,
      brief,
      status: 'pendiente',
    })

    if (err) {
      setError('Error al enviar. Intenta de nuevo.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  const packages: Package[] = Array.isArray(creator.packages) ? creator.packages : []

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#111',
          border: '1px solid rgba(245,197,24,0.15)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(245,197,24,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '52px', height: '52px',
              background: 'rgba(245,197,24,0.08)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem',
            }}>
              {creator.emoji}
            </div>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                {creator.name}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>@{creator.handle} · {creator.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              width: '32px', height: '32px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.1rem',
            }}
          >×</button>
        </div>

        {/* Tabs */}
        {!success && (
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(245,197,24,0.08)',
          }}>
            {(['profile', 'hire'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: step === s ? '2px solid #F5C518' : '2px solid transparent',
                  color: step === s ? '#F5C518' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'Syne',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {s === 'profile' ? 'Perfil' : 'Contratar'}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1 }} className="scrollbar-hide">
          {success ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontFamily: 'Syne', fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>
                ¡Solicitud enviada!
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {creator.name} recibirá tu brief. Te contactaremos a <span style={{ color: '#F5C518' }}>{clientEmail}</span> pronto.
              </p>
              <button
                onClick={onClose}
                className="btn-gold"
                style={{ marginTop: '2rem', padding: '0.75rem 2rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Cerrar
              </button>
            </div>
          ) : step === 'profile' ? (
            <div style={{ padding: '1.5rem' }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Seguidores', value: fmt(creator.followers) },
                  { label: 'Engagement', value: `${creator.engagement}%` },
                  { label: 'Desde', value: `$${creator.price.toLocaleString('es-CO')}` },
                ].map((s) => (
                  <div key={s.label} style={{
                    background: '#1A1A1A',
                    borderRadius: '10px',
                    padding: '0.875rem',
                    textAlign: 'center',
                    border: '1px solid rgba(245,197,24,0.08)',
                  }}>
                    <div style={{ color: '#F5C518', fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem' }}>{s.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', marginTop: '0.2rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Bio */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'Syne', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Bio
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.7 }}>{creator.bio}</p>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'Syne', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Especialidades
                </h4>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {creator.tags?.map((tag) => (
                    <span key={tag} style={{
                      background: 'rgba(245,197,24,0.06)',
                      color: 'rgba(245,197,24,0.8)',
                      border: '1px solid rgba(245,197,24,0.15)',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      padding: '0.25rem 0.65rem',
                    }}>#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Packages */}
              <div>
                <h4 style={{ fontFamily: 'Syne', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Paquetes
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {packages.map((pkg) => (
                    <div key={pkg.name} style={{
                      background: '#1A1A1A',
                      border: '1px solid rgba(245,197,24,0.1)',
                      borderRadius: '12px',
                      padding: '1rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontFamily: 'Syne', fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{pkg.name}</span>
                        <span style={{ color: '#F5C518', fontFamily: 'Syne', fontWeight: 700 }}>${pkg.price.toLocaleString('es-CO')}</span>
                      </div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {pkg.deliverables?.map((d) => (
                          <li key={d} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', padding: '0.1rem 0' }}>
                            <span style={{ color: '#F5C518', marginRight: '0.4rem' }}>·</span>{d}
                          </li>
                        ))}
                      </ul>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                        Entrega: {pkg.turnaround}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('hire')}
                className="btn-gold"
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Contratar a {creator.name} →
              </button>
            </div>
          ) : (
            <div style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', fontSize: '1rem' }}>
                Selecciona un paquete
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {packages.map((pkg) => (
                  <button
                    key={pkg.name}
                    onClick={() => setSelectedPkg(pkg)}
                    style={{
                      background: selectedPkg?.name === pkg.name ? 'rgba(245,197,24,0.08)' : '#1A1A1A',
                      border: selectedPkg?.name === pkg.name ? '1px solid rgba(245,197,24,0.4)' : '1px solid rgba(245,197,24,0.1)',
                      borderRadius: '10px',
                      padding: '0.875rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontFamily: 'Syne', color: '#fff', fontSize: '0.9rem' }}>{pkg.name}</span>
                    <span style={{ color: '#F5C518', fontFamily: 'Syne', fontWeight: 700 }}>${pkg.price.toLocaleString('es-CO')}</span>
                  </button>
                ))}
              </div>

              {/* Form fields */}
              {[
                { label: 'Tu nombre', value: clientName, onChange: setClientName, placeholder: 'María García', type: 'text' },
                { label: 'Tu email', value: clientEmail, onChange: setClientEmail, placeholder: 'tu@empresa.com', type: 'email' },
              ].map((field) => (
                <div key={field.label} style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.78rem',
                    fontFamily: 'Syne',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.4rem',
                  }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%',
                      background: '#1A1A1A',
                      border: '1px solid rgba(245,197,24,0.15)',
                      borderRadius: '8px',
                      padding: '0.7rem 0.9rem',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.78rem',
                  fontFamily: 'Syne',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.4rem',
                }}>Brief de campaña</label>
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Describe tu producto, objetivo, tono de comunicación, referencias..."
                  rows={4}
                  style={{
                    width: '100%',
                    background: '#1A1A1A',
                    border: '1px solid rgba(245,197,24,0.15)',
                    borderRadius: '8px',
                    padding: '0.7rem 0.9rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}

              <button
                onClick={handleHire}
                disabled={loading}
                className="btn-gold"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
