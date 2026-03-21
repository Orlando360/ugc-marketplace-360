'use client'

import type { Creator } from '@/types'

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

interface Props {
  creator: Creator
  onClick: () => void
}

export default function CreatorCard({ creator, onClick }: Props) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ cursor: 'pointer', overflow: 'hidden' }}
    >
      {/* Header gradient */}
      <div style={{
        height: '120px',
        background: `linear-gradient(135deg, rgba(245,197,24,0.08) 0%, rgba(245,197,24,0.02) 100%)`,
        borderBottom: '1px solid rgba(245,197,24,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3.5rem',
      }}>
        {creator.emoji}
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* Name & handle */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
              {creator.name}
            </h3>
            {creator.available && (
              <span style={{
                background: 'rgba(74,222,128,0.1)',
                color: '#4ADE80',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: '100px',
                fontSize: '0.7rem',
                padding: '0.15rem 0.6rem',
                fontFamily: 'Syne',
              }}>
                Disponible
              </span>
            )}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>@{creator.handle}</p>
        </div>

        {/* Category badge */}
        <span style={{
          background: 'rgba(245,197,24,0.08)',
          color: '#F5C518',
          border: '1px solid rgba(245,197,24,0.2)',
          borderRadius: '6px',
          fontSize: '0.72rem',
          padding: '0.2rem 0.6rem',
          fontFamily: 'Syne',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
          display: 'inline-block',
        }}>
          {creator.category}
        </span>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}>
          <div style={{
            background: '#1A1A1A',
            borderRadius: '8px',
            padding: '0.6rem',
            textAlign: 'center',
          }}>
            <div style={{ color: '#F5C518', fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem' }}>
              {fmt(creator.followers)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>Seguidores</div>
          </div>
          <div style={{
            background: '#1A1A1A',
            borderRadius: '8px',
            padding: '0.6rem',
            textAlign: 'center',
          }}>
            <div style={{ color: '#F5C518', fontFamily: 'Syne', fontWeight: 700, fontSize: '1rem' }}>
              {creator.engagement}%
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem' }}>Engagement</div>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {creator.tags?.slice(0, 3).map((tag) => (
            <span key={tag} style={{
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.45)',
              borderRadius: '4px',
              fontSize: '0.7rem',
              padding: '0.15rem 0.5rem',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Desde</span>
            <div style={{ color: '#F5C518', fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem' }}>
              ${creator.price.toLocaleString('es-CO')}
            </div>
          </div>
          <button
            className="btn-gold"
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Ver perfil →
          </button>
        </div>
      </div>
    </div>
  )
}
