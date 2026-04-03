'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Creator } from '@/types'
import CreatorCard from './CreatorCard'
import CreatorModal from './CreatorModal'
import SkeletonCard from './SkeletonCard'
import MatchFinderModal from './MatchFinderModal'

const CATEGORIES = ['Todos', 'Beauty', 'Lifestyle', 'Fitness', 'Tech', 'Food', 'Fashion']

interface Props {
  creators: Creator[]
}

export default function CatalogClient({ creators }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [selected, setSelected] = useState<Creator | null>(null)
  const [showMatch, setShowMatch] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiSuggestion, setAiSuggestion] = useState<string>('')
  const [aiSearching, setAiSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const runAiSearch = useCallback(async (term: string) => {
    if (!term.trim() || term.length < 3) { setAiSuggestion(''); return }
    setAiSearching(true)
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: term, creators: creators.map(c => ({ id: c.id, name: c.name, category: c.category, tags: c.tags, bio: c.bio })) }),
      })
      if (res.ok) {
        const data = await res.json()
        setAiSuggestion(data.suggestion || '')
      }
    } catch { /* ignore */ }
    setAiSearching(false)
  }, [creators])

  const handleSearch = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runAiSearch(val), 700)
  }

  const filtered = creators.filter((c) => {
    const term = search.toLowerCase()
    const matchSearch = !term ||
      c.name.toLowerCase().includes(term) ||
      c.handle.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term) ||
      c.tags?.some((t) => t.toLowerCase().includes(term)) ||
      c.bio?.toLowerCase().includes(term)
    const matchCat = category === 'Todos' || c.category === category
    return matchSearch && matchCat
  })

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1.5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#F0E6D3',
              border: '1px solid rgba(196,135,58,0.3)',
              borderRadius: '100px',
              padding: '0.3rem 0.9rem',
              marginBottom: '1.25rem',
            }}>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#8B5E3C',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Creadoras UGC verificadas · Colombia
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              color: '#3D2314',
              lineHeight: 1.0,
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
            }}>
              Contenido que<br />
              <span style={{ color: '#C4873A' }}>convierte.</span>
            </h1>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              color: '#8B5E3C',
              fontSize: '1rem',
              lineHeight: 1.7,
              maxWidth: '460px',
              marginBottom: '2rem',
            }}>
              Conecta con creadoras auténticas. La IA te ayuda a encontrar el match perfecto para tu marca.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setShowMatch(true)}
                className="btn-caramel"
                style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', fontSize: '0.9rem' }}
              >
                Encontrar mi creadora ideal
              </button>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#8B5E3C',
                fontSize: '0.82rem',
                fontFamily: "'Inter', sans-serif",
              }}>
                <span className="pulse-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#C4873A' }} />
                <span className="font-mono-metric">{creators.length}</span> creadoras activas
              </div>
            </div>
          </div>

          {/* Stats block */}
          <div style={{
            display: 'none',
            '@media (min-width: 768px)': { display: 'grid' },
          } as React.CSSProperties}>
            <div style={{
              display: 'grid',
              gap: '0.75rem',
              width: '200px',
            }}>
              {[
                { n: `${creators.length}`, label: 'Creadoras' },
                { n: '100%', label: 'Verificadas' },
                { n: '48h', label: 'Entrega express' },
              ].map((s) => (
                <div key={s.label} style={{
                  background: '#F0E6D3',
                  border: '1px solid #E8DCCC',
                  borderRadius: '14px',
                  padding: '1rem',
                  textAlign: 'center',
                }}>
                  <div className="font-mono-metric" style={{ fontWeight: 400, fontSize: '1.5rem', color: '#3D2314', letterSpacing: '-0.03em' }}>{s.n}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", color: '#8B5E3C', fontSize: '0.72rem', marginTop: '0.1rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 2.5rem' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <span style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            color: '#C4873A', fontSize: '1rem', pointerEvents: 'none',
          }}>
            {aiSearching ? '◌' : '⌕'}
          </span>
          <input
            type="text"
            placeholder="Busca por categoría, especialidad, nombre..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-light"
            style={{ paddingLeft: '2.5rem', fontSize: '0.95rem' }}
          />
          {aiSearching && (
            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#8B5E3C', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
              IA buscando...
            </span>
          )}
        </div>

        {/* AI suggestion */}
        {aiSuggestion && (
          <div style={{
            background: '#F0E6D3',
            border: '1px solid #E8DCCC',
            borderLeft: '3px solid #C4873A',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}>
            <span style={{ color: '#C4873A', fontSize: '0.9rem', flexShrink: 0 }}>✦</span>
            <p style={{ color: '#8B5E3C', fontSize: '0.85rem', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{aiSuggestion}</p>
          </div>
        )}

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '100px',
                border: `1.5px solid ${category === cat ? '#3D2314' : '#E8DCCC'}`,
                background: category === cat ? '#3D2314' : '#F0E6D3',
                color: category === cat ? '#FAF7F2' : '#8B5E3C',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.82rem',
                fontWeight: category === cat ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (category !== cat) {
                  (e.target as HTMLElement).style.background = '#C4873A';
                  (e.target as HTMLElement).style.color = '#fff';
                  (e.target as HTMLElement).style.borderColor = '#C4873A';
                }
              }}
              onMouseLeave={(e) => {
                if (category !== cat) {
                  (e.target as HTMLElement).style.background = '#F0E6D3';
                  (e.target as HTMLElement).style.color = '#8B5E3C';
                  (e.target as HTMLElement).style.borderColor = '#E8DCCC';
                }
              }}
            >
              {cat}
            </button>
          ))}
          <span className="font-mono-metric" style={{ marginLeft: 'auto', color: '#C4873A', fontSize: '0.78rem', alignSelf: 'center' }}>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </section>

      {/* ── Grid ── */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◌</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#3D2314', marginBottom: '0.5rem' }}>
              Sin resultados
            </h3>
            <p style={{ color: '#8B5E3C', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }}>
              Prueba con otra búsqueda o usa la IA para encontrar tu creadora ideal.
            </p>
            <button
              onClick={() => setShowMatch(true)}
              className="btn-caramel"
              style={{ marginTop: '1.5rem', padding: '0.65rem 1.5rem', borderRadius: '10px', fontSize: '0.875rem' }}
            >
              Usar IA para encontrar match
            </button>
          </div>
        ) : (
          <div
            className="stagger-children"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
          >
            {filtered.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onClick={() => setSelected(creator)}
                searchTerm={search}
              />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <CreatorModal
          creator={selected}
          userEmail={null}
          onClose={() => setSelected(null)}
        />
      )}

      {showMatch && (
        <MatchFinderModal
          creators={creators}
          onClose={() => setShowMatch(false)}
          onSelectCreator={(c) => { setShowMatch(false); setSelected(c) }}
        />
      )}
    </div>
  )
}
