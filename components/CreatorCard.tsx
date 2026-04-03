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
    // base score from engagement + followers scale
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
      <div className="creator-photo-wrap" style={{ height: '220px', background: '#F4F4F1' }}>
        {creator.photo_url ? (
          <Image
            src={creator.photo_url}
            alt={creator.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 380px"
          />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '5rem',
            background: 'linear-gradient(135deg, #F4F4F1 0%, #EBEBEB 100%)',
          }}>
            {creator.emoji}
          </div>
        )}

        {/* Hover overlay */}
        <div className="creator-photo-overlay">
          <span style={{
            color: '#fff',
            fontFamily: 'Syne',
            fontWeight: 700,
            fontSize: '0.82rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
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
            background: '#fff',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontFamily: 'Syne',
            fontSize: '0.68rem',
            fontWeight: 600,
            padding: '0.2rem 0.6rem',
            borderRadius: '100px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            ● Disponible
          </div>
        )}

        {/* Category badge */}
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          background: 'rgba(10,10,10,0.75)',
          backdropFilter: 'blur(6px)',
          color: '#fff',
          fontFamily: 'Syne',
          fontSize: '0.68rem',
          fontWeight: 600,
          padding: '0.2rem 0.6rem',
          borderRadius: '100px',
          letterSpacing: '0.05em',
        }}>
          {creator.category}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '1.1rem 1.25rem 1.25rem' }}>
        {/* Name + handle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#0A0A0A', lineHeight: 1.2 }}>
              {creator.name}
            </h3>
            <p style={{ color: '#A8A8A4', fontSize: '0.78rem', marginTop: '0.1rem' }}>@{creator.handle}</p>
          </div>
          {/* Match score */}
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.75rem' }}>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.1rem', color: score >= 80 ? '#0A0A0A' : '#6B6B6B' }}>
              {score}%
            </div>
            <div style={{ fontSize: '0.62rem', color: '#A8A8A4', fontFamily: 'DM Sans' }}>match</div>
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
              background: '#F4F4F1',
              borderRadius: '10px',
              padding: '0.625rem',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '0.95rem', color: '#0A0A0A' }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: '#A8A8A4', marginTop: '0.1rem' }}>{s.label}</div>
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
            <span style={{ color: '#A8A8A4', fontSize: '0.72rem', fontFamily: 'DM Sans' }}>Desde</span>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.15rem', color: '#0A0A0A', letterSpacing: '-0.02em' }}>
              ${creator.price.toLocaleString('es-CO')}
            </div>
          </div>
          <button
            className="btn-gold"
            style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem' }}
          >
            Contratar
          </button>
        </div>
      </div>
    </div>
  )
}
