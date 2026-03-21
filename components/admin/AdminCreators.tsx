'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Creator } from '@/types'

interface Props {
  creators: Creator[]
  setCreators: (c: Creator[]) => void
}

const EMPTY: Omit<Creator, 'id' | 'created_at'> = {
  name: '',
  handle: '',
  category: 'Beauty',
  followers: 0,
  engagement: 0,
  price: 0,
  emoji: '✨',
  bio: '',
  tags: [],
  available: true,
  packages: [],
}

const CATEGORIES = ['Beauty', 'Lifestyle', 'Fitness', 'Tech', 'Food', 'Fashion']

export default function AdminCreators({ creators, setCreators }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Creator | null>(null)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)
  const [tagsInput, setTagsInput] = useState('')
  const [packagesInput, setPackagesInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setTagsInput('')
    setPackagesInput('[]')
    setShowForm(true)
    setError('')
  }

  const openEdit = (c: Creator) => {
    setEditing(c)
    setForm({
      name: c.name,
      handle: c.handle,
      category: c.category,
      followers: c.followers,
      engagement: c.engagement,
      price: c.price,
      emoji: c.emoji,
      bio: c.bio,
      tags: c.tags,
      available: c.available,
      packages: c.packages,
    })
    setTagsInput(c.tags?.join(', ') || '')
    setPackagesInput(JSON.stringify(c.packages, null, 2))
    setShowForm(true)
    setError('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta creadora?')) return
    const { error } = await supabase.from('ugc_creators').delete().eq('id', id)
    if (!error) setCreators(creators.filter((c) => c.id !== id))
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')

    let packages
    try {
      packages = JSON.parse(packagesInput || '[]')
    } catch {
      setError('Paquetes: JSON inválido')
      setLoading(false)
      return
    }

    const data = {
      ...form,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      packages,
    }

    if (editing) {
      const { error } = await supabase.from('ugc_creators').update(data).eq('id', editing.id)
      if (error) { setError(error.message); setLoading(false); return }
      setCreators(creators.map((c) => c.id === editing.id ? { ...c, ...data } : c))
    } else {
      const { data: row, error } = await supabase.from('ugc_creators').insert(data).select().single()
      if (error) { setError(error.message); setLoading(false); return }
      setCreators([row, ...creators])
    }

    setShowForm(false)
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Syne', color: '#fff', fontWeight: 700 }}>
          {creators.length} creadoras
        </h2>
        <button
          onClick={openNew}
          className="btn-gold"
          style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          + Nueva creadora
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {creators.map((c) => (
          <div key={c.id} style={{
            background: '#111',
            border: '1px solid rgba(245,197,24,0.1)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <span style={{ fontSize: '2rem' }}>{c.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'Syne', color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>@{c.handle}</span>
                {!c.available && (
                  <span style={{
                    background: 'rgba(248,113,113,0.1)',
                    color: '#f87171',
                    border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: '100px',
                    fontSize: '0.68rem',
                    padding: '0.1rem 0.5rem',
                  }}>No disponible</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>{c.category}</span>
                <span style={{ color: '#F5C518', fontSize: '0.8rem' }}>${c.price.toLocaleString('es-CO')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => openEdit(c)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(245,197,24,0.2)',
                  color: '#F5C518',
                  borderRadius: '7px',
                  padding: '0.35rem 0.75rem',
                  cursor: 'pointer',
                  fontFamily: 'Syne',
                  fontSize: '0.8rem',
                }}
              >Editar</button>
              <button
                onClick={() => handleDelete(c.id)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(248,113,113,0.2)',
                  color: '#f87171',
                  borderRadius: '7px',
                  padding: '0.35rem 0.75rem',
                  cursor: 'pointer',
                  fontFamily: 'Syne',
                  fontSize: '0.8rem',
                }}
              >Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          onClick={() => setShowForm(false)}
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
              overflowY: 'auto',
              padding: '1.75rem',
            }}
            className="scrollbar-hide"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Syne', color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                {editing ? 'Editar creadora' : 'Nueva creadora'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{
                background: 'rgba(255,255,255,0.05)', border: 'none',
                color: 'rgba(255,255,255,0.5)', borderRadius: '8px',
                width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem',
              }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { key: 'name', label: 'Nombre', type: 'text', placeholder: 'Valeria Gómez' },
                { key: 'handle', label: 'Handle', type: 'text', placeholder: 'valeriagomez' },
                { key: 'emoji', label: 'Emoji', type: 'text', placeholder: '✨' },
                { key: 'price', label: 'Precio base', type: 'number', placeholder: '500000' },
                { key: 'followers', label: 'Seguidores', type: 'number', placeholder: '50000' },
                { key: 'engagement', label: 'Engagement %', type: 'number', placeholder: '4.5', step: '0.1' },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={(form as Record<string, unknown>)[f.key] as string | number}
                    onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value } as typeof EMPTY)}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', background: '#1A1A1A',
                      border: '1px solid rgba(245,197,24,0.15)', borderRadius: '8px',
                      padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.875rem', outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Category */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{
                  width: '100%', background: '#1A1A1A',
                  border: '1px solid rgba(245,197,24,0.15)', borderRadius: '8px',
                  padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.875rem', outline: 'none',
                }}
              >
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Bio */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                style={{
                  width: '100%', background: '#1A1A1A',
                  border: '1px solid rgba(245,197,24,0.15)', borderRadius: '8px',
                  padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.875rem', outline: 'none', resize: 'vertical',
                }}
              />
            </div>

            {/* Tags */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Tags (separados por coma)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="skincare, cremas, rutina"
                style={{
                  width: '100%', background: '#1A1A1A',
                  border: '1px solid rgba(245,197,24,0.15)', borderRadius: '8px',
                  padding: '0.65rem 0.85rem', color: '#fff', fontSize: '0.875rem', outline: 'none',
                }}
              />
            </div>

            {/* Packages JSON */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>
                Paquetes (JSON)
              </label>
              <textarea
                value={packagesInput}
                onChange={(e) => setPackagesInput(e.target.value)}
                rows={6}
                style={{
                  width: '100%', background: '#1A1A1A',
                  border: '1px solid rgba(245,197,24,0.15)', borderRadius: '8px',
                  padding: '0.65rem 0.85rem', color: '#4ADE80', fontSize: '0.8rem', outline: 'none', resize: 'vertical',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {/* Available toggle */}
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                id="available"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              <label htmlFor="available" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                Disponible para contratar
              </label>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1, background: 'transparent',
                  border: '1px solid rgba(245,197,24,0.2)', color: 'rgba(255,255,255,0.6)',
                  borderRadius: '10px', padding: '0.75rem', cursor: 'pointer', fontFamily: 'Syne', fontSize: '0.875rem',
                }}
              >Cancelar</button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-gold"
                style={{
                  flex: 2, border: 'none', borderRadius: '10px',
                  padding: '0.75rem', cursor: 'pointer', fontSize: '0.875rem',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear creadora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
