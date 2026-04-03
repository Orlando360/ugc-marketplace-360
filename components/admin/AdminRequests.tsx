'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HiringRequest } from '@/types'

interface Props {
  requests: HiringRequest[]
  setRequests: (r: HiringRequest[]) => void
}

const STATUS_OPTIONS = ['pendiente', 'negociacion', 'cerrado'] as const

export default function AdminRequests({ requests, setRequests }: Props) {
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    const { error } = await supabase
      .from('hiring_requests')
      .update({ status })
      .eq('id', id)

    if (!error) {
      setRequests(requests.map((r) => r.id === id ? { ...r, status: status as HiringRequest['status'] } : r))
    }
    setUpdating(null)
  }

  if (requests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#A8A8A4' }}>
        <p style={{ fontFamily: 'Syne', fontSize: '1.1rem' }}>No hay solicitudes aún</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {requests.map((req) => {
        const creator = req.ugc_creators as { name: string; emoji: string; category: string } | undefined
        return (
          <div key={req.id} style={{
            background: '#fff',
            border: '1px solid #EBEBEB',
            borderRadius: '14px',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Left */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {creator && <span style={{ fontSize: '1.5rem' }}>{creator.emoji}</span>}
                  <div>
                    <p style={{ fontFamily: 'Syne', color: '#0A0A0A', fontWeight: 600, fontSize: '0.95rem' }}>
                      {req.client_name}
                    </p>
                    <p style={{ color: '#A8A8A4', fontSize: '0.8rem' }}>{req.client_email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {creator && (
                    <span style={{
                      background: '#F4F4F1',
                      border: '1px solid #EBEBEB',
                      color: '#6B6B6B',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      padding: '0.15rem 0.6rem',
                    }}>
                      {creator.name}
                    </span>
                  )}
                  <span style={{
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    color: '#92400E',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.6rem',
                  }}>
                    {req.package_name} · ${req.package_price.toLocaleString('es-CO')}
                  </span>
                </div>

                <p style={{
                  color: '#6B6B6B',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                }}>
                  {req.brief}
                </p>

                <p style={{ color: '#A8A8A4', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  {new Date(req.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Status selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ color: '#A8A8A4', fontSize: '0.72rem', fontFamily: 'Syne', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Estado
                </label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      disabled={updating === req.id}
                      onClick={() => updateStatus(req.id, s)}
                      className={`status-${s}`}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontFamily: 'Syne',
                        fontSize: '0.75rem',
                        opacity: req.status !== s ? 0.4 : 1,
                        fontWeight: req.status === s ? 600 : 400,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
