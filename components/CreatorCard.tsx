'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Creator } from '@/types'

function diceBearUrl(name: string): string {
  const seed = encodeURIComponent(name || 'creator')
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=F0E6D3`
}

function parseFollowers(val: unknown): string {
  if (typeof val === 'number') {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`
    return String(val)
  }
  return String(val || '0')
}

function parseEngagement(val: unknown): number {
  if (typeof val === 'number') return val
  const num = parseFloat(String(val).replace('%', ''))
  return isNaN(num) ? 0 : num
}

function calcScore(creator: Creator, searchTerm: string): number {
  const eng = parseEngagement(creator.engagement)
  if (!searchTerm.trim()) {
    const engScore = Math.min(eng * 8, 40)
    return Math.round(55 + engScore)
  }
  const term = searchTerm.toLowerCase()
  let score = 50
  if (creator.category?.toLowerCase().includes(term)) score += 25
  const tagMatches = creator.tags?.filter(t => t.toLowerCase().includes(term) || term.includes(t.toLowerCase())).length ?? 0
  score += tagMatches * 10
  if (creator.name?.toLowerCase().includes(term)) score += 10
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
  const [imgError, setImgError] = useState(false)
  const engDisplay = parseEngagement(creator.engagement)
  const handle = creator.handle?.replace(/^@/, '').trim()

  const hasRealPhoto = !!creator.photo_url
  const avatarUrl = diceBearUrl(creator.name)

  return (
    <div
      className="card-light animate-fade-up"
      onClick={onClick}
      style={{ cursor: 'pointer', overflow: 'hidden' }}
    >
      {/* Photo header */}
      <div className="creator-photo-wrap" style={{ height: '220px', background: '#F0E6D3' }}>
        {hasRealPhoto && !imgError ? (
          <Image
            src={creator.photo_url!}
            alt={creator.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 380px"
            onError={() => setImgError(true)}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={avatarUrl}
            alt={creator.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #F0E6D3 0%, #E8DCCC 100%)',
            }}
          />
        )}

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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', color: '#3D2314', lineHeight: 1.2 }}>
              {creator.name}
            </h3>
            <p style={{ color: '#B8977A', fontSize: '0.78rem', marginTop: '0.1rem', fontFamily: "'Inter', sans-serif" }}>
              {handle ? `@${handle}` : ''}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.75rem' }}>
            <div className="font-mono-metric" style={{ fontWeight: 400, fontSize: '1.1rem', color: score >= 80 ? '#3D2314' : '#8B5E3C' }}>
              {score}%
            </div>
            <div style={{ fontSize: '0.62rem', color: '#B8977A', fontFamily: "'Inter', sans-serif" }}>match</div>
          </div>
        </div>

        <div className="score-bar" style={{ marginBottom: '1rem' }}>
          <div className="score-bar-fill" style={{ width: `${score}%` }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { label: 'Seguidores', value: parseFollowers(creator.followers) },
            { label: 'Engagement', value: `${engDisplay}%` },
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

        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
          {creator.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ color: '#B8977A', fontSize: '0.72rem', fontFamily: "'Inter', sans-serif" }}>Desde</span>
            <div className="font-mono-metric" style={{ fontWeight: 400, fontSize: '1.15rem', color: '#3D2314', letterSpacing: '-0.02em' }}>
              ${(creator.price || 0).toLocaleString('es-CO')}
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
