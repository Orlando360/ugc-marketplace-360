'use client'

import { useState } from 'react'
import type { Creator } from '@/types'
import CreatorCard from './CreatorCard'
import CreatorModal from './CreatorModal'

const CATEGORIES = ['Todos', 'Beauty', 'Lifestyle', 'Fitness', 'Tech', 'Food', 'Fashion']

interface Props {
  creators: Creator[]
  userEmail: string | null
}

export default function CatalogClient({ creators, userEmail }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [selected, setSelected] = useState<Creator | null>(null)

  const filtered = creators.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchCat = category === 'Todos' || c.category === category
    return matchSearch && matchCat
  })

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <p style={{
          color: '#F5C518',
          fontFamily: 'Syne',
          fontSize: '0.8rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '0.75rem',
        }}>
          Creadoras verificadas
        </p>
        <h1 style={{
          fontFamily: 'Syne',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.1,
          marginBottom: '1rem',
        }}>
          Contenido UGC que<br />
          <span style={{ color: '#F5C518' }}>convierte de verdad</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
          Conecta con las mejores creadoras de contenido auténtico para tu marca.
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginBottom: '2.5rem',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
          <span style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.3)',
            pointerEvents: 'none',
          }}>
            ⌕
          </span>
          <input
            type="text"
            placeholder="Buscar creadora, categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: '#111',
              border: '1px solid rgba(245,197,24,0.15)',
              borderRadius: '10px',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '100px',
                border: category === cat ? '1px solid #F5C518' : '1px solid rgba(245,197,24,0.15)',
                background: category === cat ? 'rgba(245,197,24,0.1)' : 'transparent',
                color: category === cat ? '#F5C518' : 'rgba(255,255,255,0.5)',
                fontFamily: 'DM Sans',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}>
        {filtered.map((creator) => (
          <CreatorCard
            key={creator.id}
            creator={creator}
            onClick={() => setSelected(creator)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
          <p style={{ fontFamily: 'Syne', fontSize: '1.1rem' }}>No se encontraron creadoras</p>
        </div>
      )}

      {selected && (
        <CreatorModal
          creator={selected}
          userEmail={userEmail}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
