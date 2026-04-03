'use client'

import { useState } from 'react'
import type { Creator, HiringRequest } from '@/types'
import AdminMetrics from './AdminMetrics'
import AdminCreators from './AdminCreators'
import AdminRequests from './AdminRequests'

interface Props {
  creators: Creator[]
  requests: HiringRequest[]
}

type Tab = 'metrics' | 'creators' | 'requests'

export default function AdminDashboard({ creators: initialCreators, requests: initialRequests }: Props) {
  const [tab, setTab] = useState<Tab>('metrics')
  const [creators, setCreators] = useState(initialCreators)
  const [requests, setRequests] = useState(initialRequests)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'metrics', label: 'Métricas' },
    { id: 'creators', label: 'Creadoras' },
    { id: 'requests', label: 'Solicitudes' },
  ]

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          color: '#A8A8A4', fontFamily: 'Syne', fontSize: '0.78rem',
          letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem',
        }}>
          Panel de administración
        </p>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: '#0A0A0A', letterSpacing: '-0.03em' }}>
          Dashboard
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '100px',
              border: `1.5px solid ${tab === t.id ? '#0A0A0A' : '#EBEBEB'}`,
              background: tab === t.id ? '#0A0A0A' : '#fff',
              color: tab === t.id ? '#fff' : '#6B6B6B',
              fontFamily: 'DM Sans',
              fontSize: '0.85rem',
              fontWeight: tab === t.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'metrics' && <AdminMetrics creators={creators} requests={requests} />}
      {tab === 'creators' && <AdminCreators creators={creators} setCreators={setCreators} requests={requests} />}
      {tab === 'requests' && <AdminRequests requests={requests} setRequests={setRequests} />}
    </div>
  )
}
