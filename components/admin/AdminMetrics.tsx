'use client'

import type { Creator, HiringRequest } from '@/types'

interface Props {
  creators: Creator[]
  requests: HiringRequest[]
}

export default function AdminMetrics({ creators, requests }: Props) {
  const pendiente = requests.filter((r) => r.status === 'pendiente').length
  const negociacion = requests.filter((r) => r.status === 'negociacion').length
  const cerrado = requests.filter((r) => r.status === 'cerrado').length
  const ingresos = requests
    .filter((r) => r.status === 'cerrado')
    .reduce((acc, r) => acc + r.package_price, 0)

  // Ranking
  const ranking = creators
    .map((c) => ({
      ...c,
      count: requests.filter((r) => r.creator_id === c.id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const metrics = [
    { label: 'Creadoras', value: creators.length, icon: '✦', color: '#F5C518' },
    { label: 'Pendientes', value: pendiente, icon: '○', color: '#F5C518' },
    { label: 'En negociación', value: negociacion, icon: '◆', color: '#60A5FA' },
    { label: 'Cerradas', value: cerrado, icon: '●', color: '#4ADE80' },
    { label: 'Ingresos estimados', value: `$${ingresos.toLocaleString('es-CO')}`, icon: '◈', color: '#F5C518' },
  ]

  return (
    <div>
      {/* Metric cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: '#111',
            border: '1px solid rgba(245,197,24,0.1)',
            borderRadius: '14px',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ color: m.color, fontSize: '1.2rem' }}>{m.icon}</span>
            </div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.75rem', color: m.color, marginBottom: '0.25rem' }}>
              {m.value}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Ranking */}
      <div style={{
        background: '#111',
        border: '1px solid rgba(245,197,24,0.1)',
        borderRadius: '14px',
        padding: '1.5rem',
      }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, color: '#fff', marginBottom: '1.25rem', fontSize: '1rem' }}>
          Ranking de creadoras
        </h3>
        {ranking.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Sin solicitudes aún</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ranking.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                background: '#1A1A1A',
                borderRadius: '10px',
              }}>
                <span style={{
                  fontFamily: 'Syne',
                  fontWeight: 700,
                  color: i === 0 ? '#F5C518' : 'rgba(255,255,255,0.3)',
                  fontSize: '0.9rem',
                  width: '1.5rem',
                }}>
                  #{i + 1}
                </span>
                <span style={{ fontSize: '1.5rem' }}>{c.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne', color: '#fff', fontSize: '0.9rem' }}>{c.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{c.category}</div>
                </div>
                <span style={{
                  background: 'rgba(245,197,24,0.08)',
                  color: '#F5C518',
                  border: '1px solid rgba(245,197,24,0.2)',
                  borderRadius: '6px',
                  padding: '0.2rem 0.6rem',
                  fontFamily: 'Syne',
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
