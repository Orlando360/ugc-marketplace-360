'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Creator } from '@/types'

interface Props {
  creators: Creator[]
  onClose: () => void
  onSelectCreator: (c: Creator) => void
}

type Step = 'q1' | 'q2' | 'q3' | 'loading' | 'results'

interface Answers {
  product: string
  goal: string
  budget: string
}

interface MatchResult {
  creatorId: string
  reason: string
  score: number
}

export default function MatchFinderModal({ creators, onClose, onSelectCreator }: Props) {
  const [step, setStep] = useState<Step>('q1')
  const [answers, setAnswers] = useState<Answers>({ product: '', goal: '', budget: '' })
  const [results, setResults] = useState<MatchResult[]>([])
  const [error, setError] = useState('')

  const runMatch = async (finalAnswers: Answers) => {
    setStep('loading')
    setError('')
    try {
      const res = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers,
          creators: creators.map(c => ({
            id: c.id,
            name: c.name,
            category: c.category,
            tags: c.tags,
            bio: c.bio,
            followers: c.followers,
            engagement: c.engagement,
            price: c.price,
          })),
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResults(data.matches || [])
      setStep('results')
    } catch {
      setError('No se pudo obtener recomendación. Verifica la API key de Anthropic.')
      setStep('q3')
    }
  }

  const matchedCreators = results
    .map(r => ({ ...r, creator: creators.find(c => c.id === r.creatorId) }))
    .filter(r => r.creator)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(10,10,10,0.5)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          background: '#fff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.14)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #EBEBEB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#F5C518', color: '#0A0A0A', borderRadius: '6px', padding: '0.15rem 0.4rem', fontSize: '0.65rem', fontFamily: 'Syne', fontWeight: 700 }}>IA</span>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.05rem', color: '#0A0A0A' }}>
                Encontrar mi creadora ideal
              </h2>
            </div>
            <p style={{ color: '#A8A8A4', fontSize: '0.8rem', marginTop: '0.2rem' }}>3 preguntas · 30 segundos</p>
          </div>
          <button onClick={onClose} style={{
            background: '#F4F4F1', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem', color: '#6B6B6B',
          }}>×</button>
        </div>

        {/* Progress bar */}
        {step !== 'results' && step !== 'loading' && (
          <div style={{ height: '2px', background: '#EBEBEB' }}>
            <div style={{
              height: '100%',
              background: '#F5C518',
              width: step === 'q1' ? '33%' : step === 'q2' ? '66%' : '100%',
              transition: 'width 0.4s ease',
            }} />
          </div>
        )}

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.75rem' }} className="scrollbar-hide">

          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
              <p style={{ fontFamily: 'Syne', fontWeight: 600, color: '#0A0A0A', marginBottom: '0.5rem' }}>
                Analizando el match perfecto...
              </p>
              <p style={{ color: '#A8A8A4', fontSize: '0.85rem' }}>La IA está evaluando compatibilidad con cada creadora</p>
            </div>
          )}

          {step === 'q1' && (
            <div className="animate-fade-in">
              <p style={{ color: '#A8A8A4', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'Syne' }}>
                Pregunta 1 de 3
              </p>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.15rem', color: '#0A0A0A', marginBottom: '1.25rem', lineHeight: 1.3 }}>
                ¿Qué producto o servicio quieres promocionar?
              </h3>
              <textarea
                className="input-light"
                rows={3}
                placeholder="Ej: Crema hidratante natural para piel sensible, app de meditación..."
                value={answers.product}
                onChange={e => setAnswers(a => ({ ...a, product: e.target.value }))}
              />
              <button
                className="btn-gold"
                disabled={!answers.product.trim()}
                onClick={() => setStep('q2')}
                style={{ width: '100%', marginTop: '1rem', padding: '0.875rem', borderRadius: '12px', fontSize: '0.9rem', opacity: !answers.product.trim() ? 0.5 : 1 }}
              >
                Siguiente →
              </button>
            </div>
          )}

          {step === 'q2' && (
            <div className="animate-fade-in">
              <p style={{ color: '#A8A8A4', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'Syne' }}>
                Pregunta 2 de 3
              </p>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.15rem', color: '#0A0A0A', marginBottom: '1.25rem', lineHeight: 1.3 }}>
                ¿Cuál es tu objetivo principal?
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Aumentar ventas directas', 'Reconocimiento de marca', 'Construir comunidad', 'Lanzar un producto nuevo', 'Mejorar confianza / reseñas'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setAnswers(a => ({ ...a, goal: opt })); setStep('q3') }}
                    style={{
                      padding: '0.875rem 1rem',
                      background: answers.goal === opt ? '#0A0A0A' : '#F4F4F1',
                      color: answers.goal === opt ? '#fff' : '#0A0A0A',
                      border: '1.5px solid transparent',
                      borderRadius: '10px',
                      fontFamily: 'DM Sans',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'q3' && (
            <div className="animate-fade-in">
              <p style={{ color: '#A8A8A4', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem', fontFamily: 'Syne' }}>
                Pregunta 3 de 3
              </p>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.15rem', color: '#0A0A0A', marginBottom: '1.25rem', lineHeight: 1.3 }}>
                ¿Cuál es tu presupuesto aproximado?
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Hasta $500.000', '$500.000 – $1.000.000', '$1.000.000 – $2.000.000', 'Más de $2.000.000', 'No definido'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      const final = { ...answers, budget: opt }
                      setAnswers(final)
                      runMatch(final)
                    }}
                    style={{
                      padding: '0.875rem 1rem',
                      background: '#F4F4F1',
                      color: '#0A0A0A',
                      border: '1.5px solid transparent',
                      borderRadius: '10px',
                      fontFamily: 'DM Sans',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {error && <p style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '0.75rem' }}>{error}</p>}
            </div>
          )}

          {step === 'results' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>✦</span>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.05rem', color: '#0A0A0A' }}>
                  Tus mejores matches
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {matchedCreators.map(({ creator, reason, score }, i) => (
                  <div
                    key={creator!.id}
                    onClick={() => onSelectCreator(creator!)}
                    style={{
                      background: i === 0 ? '#FAFAF8' : '#fff',
                      border: `1.5px solid ${i === 0 ? '#0A0A0A' : '#EBEBEB'}`,
                      borderRadius: '14px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      gap: '0.875rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{
                      width: '52px', height: '52px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#F4F4F1',
                      position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.8rem',
                    }}>
                      {creator!.photo_url ? (
                        <Image src={creator!.photo_url} alt={creator!.name} fill style={{ objectFit: 'cover' }} sizes="52px" />
                      ) : creator!.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0A0A0A' }}>
                          {i === 0 && <span style={{ color: '#F5C518', marginRight: '0.3rem' }}>★</span>}
                          {creator!.name}
                        </span>
                        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', color: '#0A0A0A' }}>{score}%</span>
                      </div>
                      <p style={{ color: '#6B6B6B', fontSize: '0.8rem', lineHeight: 1.5 }}>{reason}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep('q1')}
                className="btn-outline"
                style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem', borderRadius: '10px', fontSize: '0.875rem' }}
              >
                Buscar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
