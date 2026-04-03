'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
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
  const [generatingBrief, setGeneratingBrief] = useState(false)
  const [briefContext, setBriefContext] = useState('')
  const briefRef = useRef<HTMLTextAreaElement>(null)

  const supabase = createClient()
  const packages: Package[] = Array.isArray(creator.packages) ? creator.packages : []

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const generateBrief = async () => {
    if (!briefContext.trim()) return
    setGeneratingBrief(true)
    setBrief('')
    try {
      const res = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          briefContext: briefContext,
          creator: { name: creator.name, category: creator.category, tags: creator.tags },
          package: selectedPkg?.name,
        }),
      })
      if (!res.ok || !res.body) throw new Error()
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        accumulated += chunk
        setBrief(accumulated)
        briefRef.current?.focus()
      }
    } catch {
      setBrief('No se pudo generar el brief. Escríbelo manualmente.')
    }
    setGeneratingBrief(false)
  }

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
    if (err) setError('Error al enviar. Intenta de nuevo.')
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,10,10,0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          background: '#FAFAF8',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.14)',
        }}
      >
        {/* Photo header */}
        <div style={{ position: 'relative', height: '200px', background: '#F4F4F1', flexShrink: 0 }}>
          {creator.photo_url ? (
            <Image src={creator.photo_url} alt={creator.name} fill style={{ objectFit: 'cover' }} sizes="600px" />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
              {creator.emoji}
            </div>
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,10,10,0.65) 0%, transparent 55%)',
          }} />
          <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.35rem', color: '#fff', lineHeight: 1.1 }}>{creator.name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginTop: '0.2rem' }}>@{creator.handle}</p>
            </div>
            <span style={{
              background: '#F5C518',
              color: '#0A0A0A',
              fontFamily: 'Syne',
              fontWeight: 700,
              fontSize: '0.72rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '100px',
              letterSpacing: '0.04em',
            }}>
              {creator.category}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)',
              border: 'none', borderRadius: '8px',
              width: '32px', height: '32px', cursor: 'pointer',
              fontSize: '1rem', color: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>

        {/* Tabs */}
        {!success && (
          <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #EBEBEB', flexShrink: 0 }}>
            {(['profile', 'hire'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStep(s)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: step === s ? '2px solid #0A0A0A' : '2px solid transparent',
                  color: step === s ? '#0A0A0A' : '#A8A8A4',
                  fontFamily: 'Syne',
                  fontWeight: step === s ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {s === 'profile' ? 'Perfil' : 'Contratar'}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }} className="scrollbar-hide">
          {success ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem',
                margin: '0 auto 1.25rem',
              }}>✓</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.2rem', color: '#0A0A0A', marginBottom: '0.5rem' }}>¡Solicitud enviada!</h3>
              <p style={{ color: '#6B6B6B', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {creator.name} recibirá tu brief.<br />Te contactaremos a <strong>{clientEmail}</strong> pronto.
              </p>
              <button onClick={onClose} className="btn-gold" style={{ marginTop: '1.75rem', padding: '0.75rem 2rem', borderRadius: '10px', fontSize: '0.9rem' }}>
                Cerrar
              </button>
            </div>
          ) : step === 'profile' ? (
            <div style={{ padding: '1.5rem' }}>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { label: 'Seguidores', value: fmt(creator.followers) },
                  { label: 'Engagement', value: `${creator.engagement}%` },
                  { label: 'Desde', value: `$${creator.price.toLocaleString('es-CO')}` },
                ].map(s => (
                  <div key={s.label} style={{
                    background: '#fff',
                    border: '1px solid #EBEBEB',
                    borderRadius: '12px',
                    padding: '0.875rem',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', color: '#0A0A0A' }}>{s.value}</div>
                    <div style={{ color: '#A8A8A4', fontSize: '0.68rem', marginTop: '0.2rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Bio */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'Syne', fontSize: '0.72rem', color: '#A8A8A4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Sobre mí</h4>
                <p style={{ color: '#6B6B6B', fontSize: '0.9rem', lineHeight: 1.7 }}>{creator.bio}</p>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontFamily: 'Syne', fontSize: '0.72rem', color: '#A8A8A4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Especialidades</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {creator.tags?.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Packages */}
              <div>
                <h4 style={{ fontFamily: 'Syne', fontSize: '0.72rem', color: '#A8A8A4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Paquetes</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {packages.map(pkg => (
                    <div key={pkg.name} style={{
                      background: '#fff',
                      border: '1px solid #EBEBEB',
                      borderRadius: '14px',
                      padding: '1.1rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0A0A0A', fontSize: '0.9rem' }}>{pkg.name}</span>
                        <span style={{ fontFamily: 'Syne', fontWeight: 800, color: '#0A0A0A', fontSize: '1rem' }}>${pkg.price.toLocaleString('es-CO')}</span>
                      </div>
                      <ul style={{ listStyle: 'none' }}>
                        {pkg.deliverables?.map(d => (
                          <li key={d} style={{ color: '#6B6B6B', fontSize: '0.8rem', padding: '0.1rem 0', display: 'flex', gap: '0.4rem' }}>
                            <span style={{ color: '#F5C518' }}>·</span>{d}
                          </li>
                        ))}
                      </ul>
                      <p style={{ color: '#A8A8A4', fontSize: '0.75rem', marginTop: '0.4rem' }}>⏱ {pkg.turnaround}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('hire')}
                className="btn-gold"
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem', borderRadius: '12px', fontSize: '0.95rem' }}
              >
                Contratar a {creator.name} →
              </button>
            </div>
          ) : (
            <div style={{ padding: '1.5rem' }}>
              {/* Package selector */}
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.875rem', fontSize: '0.95rem' }}>Selecciona un paquete</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {packages.map(pkg => (
                  <button
                    key={pkg.name}
                    onClick={() => setSelectedPkg(pkg)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.875rem 1rem',
                      background: selectedPkg?.name === pkg.name ? '#0A0A0A' : '#fff',
                      border: `1.5px solid ${selectedPkg?.name === pkg.name ? '#0A0A0A' : '#EBEBEB'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontFamily: 'Syne', fontWeight: 600, color: selectedPkg?.name === pkg.name ? '#fff' : '#0A0A0A', fontSize: '0.9rem' }}>{pkg.name}</span>
                    <span style={{ fontFamily: 'Syne', fontWeight: 800, color: selectedPkg?.name === pkg.name ? '#F5C518' : '#0A0A0A' }}>${pkg.price.toLocaleString('es-CO')}</span>
                  </button>
                ))}
              </div>

              {/* Client info */}
              {[
                { label: 'Tu nombre', value: clientName, setter: setClientName, placeholder: 'María García', type: 'text' },
                { label: 'Tu email', value: clientEmail, setter: setClientEmail, placeholder: 'tu@empresa.com', type: 'email' },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '0.72rem', color: '#A8A8A4', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{f.label}</label>
                  <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} className="input-light" />
                </div>
              ))}

              {/* Brief generator */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontFamily: 'Syne', fontSize: '0.72rem', color: '#A8A8A4', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Brief de campaña</label>
                  <span style={{
                    background: '#F5C518',
                    color: '#0A0A0A',
                    fontFamily: 'Syne',
                    fontWeight: 700,
                    fontSize: '0.58rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                  }}>IA</span>
                </div>

                {/* AI brief helper */}
                <div style={{
                  background: '#F4F4F1',
                  border: '1px solid #EBEBEB',
                  borderRadius: '10px',
                  padding: '0.875rem',
                  marginBottom: '0.75rem',
                }}>
                  <p style={{ color: '#6B6B6B', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    Describe tu producto brevemente y la IA genera el brief completo:
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={briefContext}
                      onChange={e => setBriefContext(e.target.value)}
                      placeholder="Ej: Serum vitamina C para pieles opacas..."
                      className="input-light"
                      style={{ flex: 1, fontSize: '0.85rem' }}
                      onKeyDown={e => e.key === 'Enter' && generateBrief()}
                    />
                    <button
                      onClick={generateBrief}
                      disabled={generatingBrief || !briefContext.trim()}
                      style={{
                        background: '#0A0A0A',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0 1rem',
                        fontFamily: 'Syne',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        cursor: generatingBrief ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: generatingBrief ? 0.6 : 1,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {generatingBrief ? (
                        <span style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                          <span className="typing-dot" />
                        </span>
                      ) : '✦ Generar'}
                    </button>
                  </div>
                </div>

                <textarea
                  ref={briefRef}
                  value={brief}
                  onChange={e => setBrief(e.target.value)}
                  placeholder="Escribe o genera el brief de tu campaña aquí..."
                  rows={4}
                  className="input-light"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>

              {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{error}</p>}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setStep('profile')}
                  className="btn-outline"
                  style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', fontSize: '0.875rem' }}
                >
                  ← Volver
                </button>
                <button
                  onClick={handleHire}
                  disabled={loading}
                  className="btn-gold"
                  style={{ flex: 2, padding: '0.875rem', borderRadius: '12px', fontSize: '0.875rem', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
