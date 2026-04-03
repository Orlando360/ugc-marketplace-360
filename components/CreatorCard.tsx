'use client'

import Image from 'next/image'
import type { Creator } from '@/types'

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

function calcScore(creator: Creator, searchTerm: string): number {
  if (!searchTerm.trim()) {
    const engScore = Math.min(creator.engagement * 8, 40)
    const base = 55
    return Math.round(base + engScore)
  }
  const term = searchTerm.toLowerCase()
  let score = 50
  if (creator.category.toLowerCase().includes(term)) score += 25
  const tagMatches = creator.tags?.filter(t => t.toLowerCase().includes(term) || term.includes(t.toLowerCase())).length ?? 0
  score += tagMatches * 10
  if (creator.name.toLowerCase().includes(term)) score += 10
  if (creator.bio?.toLowerCase().includes(term)) score += 8
  return Math.min(score, 99)
}

interface Props {
  creator: Creator
  onClick: () => void
  searchTerm?: string
}

export default function CreatorCard({ creator, onClick, searchTerm = '' }: Props) {
  const score = calcScore(creator, searchTerm)

  return (
    <div
      className="card-light animate-fade-up"
      onClick={onClick}
      style={{ cursor: 'pointer', overflow: 'hidden' }}
    >
      {/* Photo / Emoji header */}
      <div className="creator-photo-wrap" style={{ height: '220px', background: '#F0E6D3' }}>
        {(() => {
          const handle = creator.handle?.replace(/^@/, '').trim()
          const imgSrc = creator.photo_url || (handle ? `https://unavatar.io/instagram/${handle}` : null)
          return imgSrc ? (
            <Image
              src={imgSrc}
              alt={creator.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 380px"
              unoptimized={!creator.photo_url}
            />
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '5rem',
              background: 'linear-gradient(135deg, #F0E6D3 0%, #E8DCCC 100%)',
            }}>
              {creator.emoji}
            </div>
          )
        })()}

        {/* Hover overlay */}
        <div className="creator-photo-overlay">
          <span style={{
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '0.82rem',
            letterSpacing: '0.04em',
          }}>
            Ver perfil completo →
          </span>
        </div>

        {/* Available badge */}
        {creator.available && (
          <div style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'rgba(196,135,58,0.15)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(196,135,58,0.3)',
            color: '#3D2314',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.68rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}>
            <span className="pulse-dot" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#C4873A' }} />
            Disponible
          </div>
        )}

        {/* Category badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          background: '#FAF7F2',
          border: '1px solid #C4873A',
          color: '#8B5E3C',
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.68rem',
          fontWeight: 600,
          padding: '0.2rem 0.6rem',
          borderRadius: '100px',
          letterSpacing: '0.04em',
        }}>
          {creator.category}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '1.1rem 1.25rem 1.25rem' }}>
        {/* Name + handle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: '#3D2314', lineHeight: 1.2 }}>
              {creator.name}
            </h3>
            <p style={{ color: '#B8977A', fontSize: '0.78rem', marginTop: '0.1rem', fontFamily: "'Inter', sans-serif" }}>@{creator.handle}</p>
          </div>
          {/* Match score */}
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.75rem' }}>
            <div className="font-mono-metric" style={{ fontWeight: 400, fontSize: '1.1rem', color: score >= 80 ? '#3D2314' : '#8B5E3C' }}>
              {score}%
            </div>
            <div style={{ fontSize: '0.62rem', color: '#B8977A', fontFamily: "'Inter', sans-serif" }}>match</div>
          </div>
        </div>

        {/* Score bar */}
        <div className="score-bar" style={{ marginBottom: '1rem' }}>
          <div className="score-bar-fill" style={{ width: `${score}%` }} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { label: 'Seguidores', value: fmt(creator.followers) },
            { label: 'Engagement', value: `${creator.engagement}%` },
          ].map((s) => (
            <div key={s.label} style={{
              background: '#FAF7F2',
              border: '1px solid #E8DCCC',
              borderRadius: '10px',
              padding: '0.625rem',
              textAlign: 'center',
            }}>
              <div className="font-mono-metric" style={{ fontWeight: 400, fontSize: '0.95rem', color: '#3D2314' }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#B8977A', marginTop: '0.1rem', fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
          {creator.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ color: '#B8977A', fontSize: '0.72rem', fontFamily: "'Inter', sans-serif" }}>Desde</span>
            <div className="font-mono-metric" style={{ fontWeight: 400, fontSize: '1.15rem', color: '#3D2314', letterSpacing: '-0.02em' }}>
              ${creator.price.toLocaleString('es-CO')}
            </div>
          </div>
          <button
            className="btn-caramel"
            style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem' }}
          >
            Contratar
          </button>
        </div>
      </div>
    </div>
  )
}
