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

  const tabs = [
    { id: 'metrics' as Tab, label: 'Métricas' },
    { id: 'creators' as Tab, label: 'Creadoras' },
    { id: 'requests' as Tab, label: 'Solicitudes' },
  ]

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: '#F5C518', fontFamily: 'Syne', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Panel de administración
        </p>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: '#fff' }}>
          Dashboard
        </h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        background: '#111',
        border: '1px solid rgba(245,197,24,0.1)',
        borderRadius: '12px',
        padding: '0.3rem',
        marginBottom: '2rem',
        width: 'fit-content',
      }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: tab === t.id ? '#F5C518' : 'transparent',
              color: tab === t.id ? '#0A0A0A' : 'rgba(255,255,255,0.5)',
              fontFamily: 'Syne',
              fontWeight: tab === t.id ? 700 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'metrics' && <AdminMetrics creators={creators} requests={requests} />}
      {tab === 'creators' && <AdminCreators creators={creators} setCreators={setCreators} />}
      {tab === 'requests' && <AdminRequests requests={requests} setRequests={setRequests} />}
    </div>
  )
}
