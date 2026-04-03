'use client'

import { useState } from 'react'
import type { Creator, HiringRequest } from '@/types'

interface Props {
  creators: Creator[]
  requests: HiringRequest[]
}

export default function AdminMetrics({ creators, requests }: Props) {
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)

  const pendiente = requests.filter((r) => r.status === 'pendiente').length
  const negociacion = requests.filter((r) => r.status === 'negociacion').length
  const cerrado = requests.filter((r) => r.status === 'cerrado').length
  const ingresos = requests
    .filter((r) => r.status === 'cerrado')
    .reduce((acc, r) => acc + r.package_price, 0)

  const ranking = creators
    .map((c) => ({
      ...c,
      count: requests.filter((r) => r.creator_id === c.id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const metrics = [
    { label: 'Creadoras', value: String(creators.length) },
    { label: 'Pendientes', value: String(pendiente) },
    { label: 'En negociación', value: String(negociacion) },
    { label: 'Cerradas', value: String(cerrado) },
    { label: 'Ingresos estimados', value: `$${ingresos.toLocaleString('es-CO')}` },
  ]

  const runSummary = async () => {
    setSummaryLoading(true)
    setSummary('')
    try {
      const requestsData = requests.map((r) => ({
        id: r.id,
        creator_name: creators.find((c) => c.id === r.creator_id)?.name || 'Desconocida',
        client_name: r.client_name,
        package_name: r.package_name,
        package_price: r.package_price,
        status: r.status,
        brief: r.brief,
        created_at: r.created_at,
      }))
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: requestsData }),
      })
      if (res.ok) {
        const data = await res.json()
        setSummary(data.summary || '')
      }
    } catch {
      setSummary('Error generando resumen.')
    }
    setSummaryLoading(false)
  }

  return (
    <div>
      {/* Metric cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: '#fff',
            border: '1px solid #EBEBEB',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
          }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#0A0A0A',
              display: 'block',
              marginBottom: '0.25rem',
              letterSpacing: '-0.02em',
            }}>
              {m.value}
            </span>
            <span style={{ color: '#A8A8A4', fontSize: '0.78rem', fontFamily: 'DM Sans' }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* AI Daily Summary */}
      <div style={{
        background: '#fff',
        border: '1px solid #EBEBEB',
        borderLeft: '3px solid #F5C518',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: summary ? '1rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: '#F5C518', color: '#0A0A0A', borderRadius: '6px', padding: '0.15rem 0.4rem', fontSize: '0.65rem', fontFamily: 'Syne', fontWeight: 700 }}>IA</span>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0A0A0A', fontSize: '0.95rem' }}>
              Resumen del día
            </h3>
          </div>
          <button
            onClick={runSummary}
            disabled={summaryLoading}
            className="btn-gold"
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              opacity: summaryLoading ? 0.6 : 1,
              cursor: summaryLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {summaryLoading ? 'Analizando...' : '✦ Generar resumen'}
          </button>
        </div>
        {summary && (
          <div style={{
            background: '#FAFAF8',
            border: '1px solid #EBEBEB',
            borderRadius: '10px',
            padding: '1rem',
            color: '#6B6B6B',
            fontSize: '0.88rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}>
            {summary}
          </div>
        )}
        {!summary && !summaryLoading && (
          <p style={{ color: '#A8A8A4', fontSize: '0.82rem', marginTop: '0.75rem' }}>
            Genera un análisis inteligente de las solicitudes de hoy con IA.
          </p>
        )}
      </div>

      {/* Ranking */}
      <div style={{
        background: '#fff',
        border: '1px solid #EBEBEB',
        borderRadius: '16px',
        padding: '1.5rem',
      }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#0A0A0A', marginBottom: '1.25rem', fontSize: '1rem' }}>
          Ranking de creadoras
        </h3>
        {ranking.length === 0 ? (
          <p style={{ color: '#A8A8A4', fontSize: '0.9rem' }}>Sin solicitudes aún</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {ranking.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                background: i === 0 ? '#FAFAF8' : '#fff',
                border: `1px solid ${i === 0 ? '#0A0A0A' : '#EBEBEB'}`,
                borderRadius: '10px',
              }}>
                <span style={{
                  fontFamily: 'Syne',
                  fontWeight: 700,
                  color: i === 0 ? '#F5C518' : '#A8A8A4',
                  fontSize: '0.9rem',
                  width: '1.5rem',
                }}>
                  #{i + 1}
                </span>
                <span style={{ fontSize: '1.4rem' }}>{c.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne', color: '#0A0A0A', fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                  <div style={{ color: '#A8A8A4', fontSize: '0.75rem' }}>{c.category}</div>
                </div>
                <span style={{
                  background: '#F4F4F1',
                  color: '#0A0A0A',
                  borderRadius: '6px',
                  padding: '0.2rem 0.6rem',
                  fontFamily: 'Syne',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}>
                  {c.count} solicitud{c.count !== 1 ? 'es' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
