'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Creator, Package, HiringRequest } from '@/types'

interface Props {
  creators: Creator[]
  setCreators: (c: Creator[]) => void
  requests: HiringRequest[]
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
  photo_url: null,
}

const EMPTY_PKG: Package = { name: '', price: 0, deliverables: [], turnaround: '' }

const CATEGORIES = ['Beauty', 'Lifestyle', 'Fitness', 'Tech', 'Food', 'Fashion']

const labelStyle = {
  display: 'block' as const,
  color: '#A8A8A4',
  fontSize: '0.75rem',
  fontFamily: 'Syne',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  marginBottom: '0.3rem',
}

const inputStyle = {
  width: '100%',
  background: '#FAFAF8',
  border: '1px solid #EBEBEB',
  borderRadius: '8px',
  padding: '0.65rem 0.85rem',
  color: '#0A0A0A',
  fontSize: '0.875rem',
  outline: 'none' as const,
}

export default function AdminCreators({ creators, setCreators, requests }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Creator | null>(null)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)
  const [tagsInput, setTagsInput] = useState('')
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadTarget, setUploadTarget] = useState<Creator | null>(null)
  const [metricsCreator, setMetricsCreator] = useState<Creator | null>(null)

  const supabase = createClient()

  const handlePhotoUpload = async (file: File, creator: Creator) => {
    setUploading(creator.id)
    const ext = file.name.split('.').pop()
    const path = `${creator.id}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('ugc-photos')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) { setUploading(null); return }

    const { data: { publicUrl } } = supabase.storage.from('ugc-photos').getPublicUrl(path)
    const photoUrl = `${publicUrl}?v=${Date.now()}`

    await supabase.from('ugc_creators').update({ photo_url: photoUrl }).eq('id', creator.id)
    setCreators(creators.map((c) => c.id === creator.id ? { ...c, photo_url: photoUrl } : c))
    setUploading(null)
  }

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY)
    setTagsInput('')
    setPackages([{ ...EMPTY_PKG }])
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
      photo_url: c.photo_url,
    })
    setTagsInput(c.tags?.join(', ') || '')
    setPackages(c.packages?.length ? c.packages.map(p => ({ ...p })) : [{ ...EMPTY_PKG }])
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

    const validPackages = packages
      .filter(p => p.name.trim() !== '')
      .map(p => ({
        name: p.name.trim(),
        price: p.price,
        deliverables: p.deliverables.filter(d => d.trim() !== ''),
        turnaround: p.turnaround.trim(),
      }))

    const data = {
      ...form,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      packages: validPackages,
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

  // Package helpers
  const updatePkg = (idx: number, field: keyof Package, value: string | number | string[]) => {
    setPackages(packages.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  const addDeliverable = (idx: number) => {
    setPackages(packages.map((p, i) => i === idx ? { ...p, deliverables: [...p.deliverables, ''] } : p))
  }

  const updateDeliverable = (pkgIdx: number, delIdx: number, value: string) => {
    setPackages(packages.map((p, i) => {
      if (i !== pkgIdx) return p
      const dels = [...p.deliverables]
      dels[delIdx] = value
      return { ...p, deliverables: dels }
    }))
  }

  const removeDeliverable = (pkgIdx: number, delIdx: number) => {
    setPackages(packages.map((p, i) => {
      if (i !== pkgIdx) return p
      return { ...p, deliverables: p.deliverables.filter((_, j) => j !== delIdx) }
    }))
  }

  // Metrics helpers
  const getCreatorRequests = (creatorId: string) => requests.filter(r => r.creator_id === creatorId)
  const getCreatorRevenue = (creatorId: string) =>
    getCreatorRequests(creatorId).filter(r => r.status === 'cerrado').reduce((acc, r) => acc + r.package_price, 0)
  const getCreatorConversion = (creatorId: string) => {
    const reqs = getCreatorRequests(creatorId)
    if (reqs.length === 0) return 0
    return Math.round((reqs.filter(r => r.status === 'cerrado').length / reqs.length) * 100)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Syne', color: '#0A0A0A', fontWeight: 700 }}>
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && uploadTarget) handlePhotoUpload(file, uploadTarget)
          e.target.value = ''
        }}
      />

      {/* Creator List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {creators.map((c) => {
          const reqs = getCreatorRequests(c.id)
          const revenue = getCreatorRevenue(c.id)
          return (
            <div key={c.id} style={{
              background: '#fff',
              border: '1px solid #EBEBEB',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
              onClick={() => setMetricsCreator(metricsCreator?.id === c.id ? null : c)}
            >
              {/* Avatar */}
              <div
                style={{
                  width: '48px', height: '48px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#F4F4F1',
                  border: '1px solid #EBEBEB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', flexShrink: 0,
                }}
                title="Cambiar foto"
                onClick={(e) => { e.stopPropagation(); setUploadTarget(c); fileInputRef.current?.click() }}
              >
                {c.photo_url ? (
                  <Image src={c.photo_url} alt={c.name} fill style={{ objectFit: 'cover' }} sizes="48px" />
                ) : (
                  <span style={{ fontSize: '1.6rem' }}>{c.emoji}</span>
                )}
                {uploading === c.id && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(255,255,255,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', color: '#0A0A0A',
                  }}>...</div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'Syne', color: '#0A0A0A', fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</span>
                  <span style={{ color: '#A8A8A4', fontSize: '0.8rem' }}>@{c.handle}</span>
                  {!c.available && (
                    <span style={{
                      background: '#FEF2F2', color: '#DC2626',
                      border: '1px solid #FECACA', borderRadius: '100px',
                      fontSize: '0.68rem', padding: '0.1rem 0.5rem',
                    }}>No disponible</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.2rem', alignItems: 'center' }}>
                  <span style={{ color: '#A8A8A4', fontSize: '0.8rem' }}>{c.category}</span>
                  <span style={{ color: '#F5C518', fontSize: '0.8rem' }}>${c.price.toLocaleString('es-CO')}</span>
                  {reqs.length > 0 && (
                    <>
                      <span style={{ color: '#EBEBEB' }}>|</span>
                      <span style={{ color: '#6B6B6B', fontSize: '0.75rem' }}>
                        {reqs.length} solicitud{reqs.length !== 1 ? 'es' : ''}
                      </span>
                      {revenue > 0 && (
                        <span style={{ color: '#16A34A', fontSize: '0.75rem', fontWeight: 600 }}>
                          ${revenue.toLocaleString('es-CO')}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => { setUploadTarget(c); fileInputRef.current?.click() }}
                  disabled={uploading === c.id}
                  style={{
                    background: '#fff', border: '1px solid #EBEBEB', color: '#6B6B6B',
                    borderRadius: '7px', padding: '0.35rem 0.75rem',
                    cursor: 'pointer', fontFamily: 'Syne', fontSize: '0.8rem',
                  }}
                >{uploading === c.id ? '...' : 'Foto'}</button>
                <button
                  onClick={() => openEdit(c)}
                  style={{
                    background: '#fff', border: '1px solid #EBEBEB', color: '#0A0A0A',
                    borderRadius: '7px', padding: '0.35rem 0.75rem',
                    cursor: 'pointer', fontFamily: 'Syne', fontSize: '0.8rem',
                  }}
                >Editar</button>
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{
                    background: '#fff', border: '1px solid #FECACA', color: '#DC2626',
                    borderRadius: '7px', padding: '0.35rem 0.75rem',
                    cursor: 'pointer', fontFamily: 'Syne', fontSize: '0.8rem',
                  }}
                >Eliminar</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Creator Metrics Panel (expands below selected creator) */}
      {metricsCreator && (() => {
        const c = metricsCreator
        const reqs = getCreatorRequests(c.id)
        const revenue = getCreatorRevenue(c.id)
        const conversion = getCreatorConversion(c.id)
        const pendiente = reqs.filter(r => r.status === 'pendiente').length
        const negociacion = reqs.filter(r => r.status === 'negociacion').length
        const cerrado = reqs.filter(r => r.status === 'cerrado').length
        const avgTicket = cerrado > 0 ? Math.round(revenue / cerrado) : 0

        return (
          <div style={{
            background: '#FAFAF8',
            border: '1px solid #EBEBEB',
            borderRadius: '16px',
            padding: '1.5rem',
            marginTop: '0.75rem',
            marginBottom: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{c.emoji}</span>
                <div>
                  <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0A0A0A', fontSize: '1.05rem' }}>
                    {c.name}
                  </h3>
                  <p style={{ color: '#A8A8A4', fontSize: '0.8rem' }}>Métricas detalladas</p>
                </div>
              </div>
              <button
                onClick={() => setMetricsCreator(null)}
                style={{
                  background: '#fff', border: '1px solid #EBEBEB',
                  borderRadius: '8px', width: '32px', height: '32px',
                  cursor: 'pointer', fontSize: '1rem', color: '#6B6B6B',
                }}
              >×</button>
            </div>

            {/* Metric Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}>
              {[
                { label: 'Total solicitudes', value: String(reqs.length), color: '#0A0A0A' },
                { label: 'Pendientes', value: String(pendiente), color: '#F59E0B' },
                { label: 'En negociación', value: String(negociacion), color: '#3B82F6' },
                { label: 'Cerradas', value: String(cerrado), color: '#16A34A' },
                { label: 'Revenue', value: `$${revenue.toLocaleString('es-CO')}`, color: '#16A34A' },
                { label: 'Ticket promedio', value: avgTicket > 0 ? `$${avgTicket.toLocaleString('es-CO')}` : '—', color: '#0A0A0A' },
                { label: 'Conversión', value: reqs.length > 0 ? `${conversion}%` : '—', color: '#0A0A0A' },
                { label: 'Engagement', value: `${c.engagement}%`, color: '#F5C518' },
              ].map(m => (
                <div key={m.label} style={{
                  background: '#fff',
                  border: '1px solid #EBEBEB',
                  borderRadius: '12px',
                  padding: '1rem',
                }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: m.color,
                    display: 'block',
                    marginBottom: '0.15rem',
                    letterSpacing: '-0.02em',
                  }}>
                    {m.value}
                  </span>
                  <span style={{ color: '#A8A8A4', fontSize: '0.7rem', fontFamily: 'DM Sans' }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Requests */}
            {reqs.length > 0 && (
              <div>
                <h4 style={{ fontFamily: 'Syne', fontWeight: 600, color: '#0A0A0A', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                  Últimas solicitudes
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {reqs.slice(0, 5).map(r => (
                    <div key={r.id} style={{
                      background: '#fff',
                      border: '1px solid #EBEBEB',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontFamily: 'Syne', fontWeight: 600, color: '#0A0A0A', fontSize: '0.85rem' }}>{r.client_name}</span>
                          <span style={{ color: '#A8A8A4', fontSize: '0.75rem' }}>{r.client_email}</span>
                        </div>
                        <p style={{
                          color: '#6B6B6B', fontSize: '0.78rem', marginTop: '0.2rem',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{r.brief}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <span style={{
                          background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E',
                          borderRadius: '6px', fontSize: '0.72rem', padding: '0.15rem 0.5rem',
                        }}>
                          {r.package_name} · ${r.package_price.toLocaleString('es-CO')}
                        </span>
                        <span style={{
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.5rem',
                          fontWeight: 600,
                          background: r.status === 'cerrado' ? '#F0FDF4' : r.status === 'negociacion' ? '#EFF6FF' : '#FFFBEB',
                          color: r.status === 'cerrado' ? '#16A34A' : r.status === 'negociacion' ? '#3B82F6' : '#F59E0B',
                          border: `1px solid ${r.status === 'cerrado' ? '#BBF7D0' : r.status === 'negociacion' ? '#BFDBFE' : '#FDE68A'}`,
                        }}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reqs.length === 0 && (
              <p style={{ color: '#A8A8A4', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                Sin solicitudes aún para esta creadora
              </p>
            )}
          </div>
        )
      })()}

      {/* Form Modal */}
      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
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
              background: '#fff',
              border: '1px solid #EBEBEB',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem',
            }}
            className="scrollbar-hide"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Syne', color: '#0A0A0A', fontWeight: 700, fontSize: '1.1rem' }}>
                {editing ? 'Editar creadora' : 'Nueva creadora'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{
                background: '#F4F4F1', border: 'none',
                color: '#6B6B6B', borderRadius: '8px',
                width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem',
              }}>×</button>
            </div>

            {/* Basic fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { key: 'name', label: 'Nombre', type: 'text', placeholder: 'Valeria Gómez' },
                { key: 'handle', label: 'Handle', type: 'text', placeholder: 'valeriagomez' },
                { key: 'emoji', label: 'Emoji', type: 'text', placeholder: '✨' },
                { key: 'price', label: 'Precio base', type: 'number', placeholder: '500000' },
                { key: 'followers', label: 'Seguidores', type: 'number', placeholder: '50000' },
                { key: 'engagement', label: 'Engagement %', type: 'number', placeholder: '4.5' },
              ].map((f) => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as Record<string, unknown>)[f.key] as string | number}
                    onChange={(e) => setForm({ ...form, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value } as typeof EMPTY)}
                    placeholder={f.placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            {/* Category */}
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={inputStyle}
              >
                {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Bio */}
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Especialista en skincare y makeup..."
                style={{ ...inputStyle, resize: 'vertical' as const }}
              />
            </div>

            {/* Tags */}
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Tags (separados por coma)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="skincare, cremas, rutina"
                style={inputStyle}
              />
            </div>

            {/* Visual Package Builder */}
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Paquetes</label>
                <button
                  type="button"
                  onClick={() => setPackages([...packages, { ...EMPTY_PKG }])}
                  style={{
                    background: '#F4F4F1', border: '1px solid #EBEBEB', color: '#0A0A0A',
                    borderRadius: '6px', padding: '0.3rem 0.7rem',
                    cursor: 'pointer', fontFamily: 'Syne', fontSize: '0.75rem', fontWeight: 600,
                  }}
                >
                  + Agregar paquete
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {packages.map((pkg, idx) => (
                  <div key={idx} style={{
                    background: '#FAFAF8',
                    border: '1px solid #EBEBEB',
                    borderRadius: '14px',
                    padding: '1rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 600, color: '#0A0A0A', fontSize: '0.85rem' }}>
                        Paquete {idx + 1}
                      </span>
                      {packages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPackages(packages.filter((_, i) => i !== idx))}
                          style={{
                            background: '#fff', border: '1px solid #FECACA', color: '#DC2626',
                            borderRadius: '6px', padding: '0.2rem 0.5rem',
                            cursor: 'pointer', fontSize: '0.72rem',
                          }}
                        >
                          Quitar
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '0.68rem' }}>Nombre</label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => updatePkg(idx, 'name', e.target.value)}
                          placeholder="Starter"
                          style={{ ...inputStyle, background: '#fff', fontSize: '0.82rem', padding: '0.5rem 0.7rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '0.68rem' }}>Precio (COP)</label>
                        <input
                          type="number"
                          value={pkg.price || ''}
                          onChange={(e) => updatePkg(idx, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="420000"
                          style={{ ...inputStyle, background: '#fff', fontSize: '0.82rem', padding: '0.5rem 0.7rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '0.65rem' }}>
                      <label style={{ ...labelStyle, fontSize: '0.68rem' }}>Tiempo de entrega</label>
                      <input
                        type="text"
                        value={pkg.turnaround}
                        onChange={(e) => updatePkg(idx, 'turnaround', e.target.value)}
                        placeholder="5 días"
                        style={{ ...inputStyle, background: '#fff', fontSize: '0.82rem', padding: '0.5rem 0.7rem' }}
                      />
                    </div>

                    {/* Deliverables */}
                    <div style={{ marginTop: '0.65rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <label style={{ ...labelStyle, fontSize: '0.68rem', marginBottom: 0 }}>Entregables</label>
                        <button
                          type="button"
                          onClick={() => addDeliverable(idx)}
                          style={{
                            background: 'none', border: 'none', color: '#F5C518',
                            cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'Syne', fontWeight: 600,
                          }}
                        >
                          + Agregar
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {pkg.deliverables.map((d, dIdx) => (
                          <div key={dIdx} style={{ display: 'flex', gap: '0.35rem' }}>
                            <input
                              type="text"
                              value={d}
                              onChange={(e) => updateDeliverable(idx, dIdx, e.target.value)}
                              placeholder="1 video UGC 30s"
                              style={{ ...inputStyle, background: '#fff', fontSize: '0.82rem', padding: '0.45rem 0.7rem', flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => removeDeliverable(idx, dIdx)}
                              style={{
                                background: '#fff', border: '1px solid #EBEBEB', color: '#A8A8A4',
                                borderRadius: '6px', width: '30px',
                                cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0,
                              }}
                            >×</button>
                          </div>
                        ))}
                        {pkg.deliverables.length === 0 && (
                          <button
                            type="button"
                            onClick={() => addDeliverable(idx)}
                            style={{
                              background: '#fff', border: '1px dashed #EBEBEB', color: '#A8A8A4',
                              borderRadius: '8px', padding: '0.5rem',
                              cursor: 'pointer', fontSize: '0.78rem', textAlign: 'center',
                            }}
                          >
                            + Agregar entregable
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available toggle */}
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input
                type="checkbox"
                id="available"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
              />
              <label htmlFor="available" style={{ color: '#6B6B6B', fontSize: '0.875rem' }}>
                Disponible para contratar
              </label>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '0.75rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1, background: '#fff',
                  border: '1px solid #EBEBEB', color: '#6B6B6B',
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
