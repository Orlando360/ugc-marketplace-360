export default function SkeletonCard() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EBEBEB',
      borderRadius: '20px',
      overflow: 'hidden',
    }}>
      {/* Photo area */}
      <div className="skeleton" style={{ height: '220px', borderRadius: 0 }} />
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div className="skeleton" style={{ height: '18px', width: '55%' }} />
          <div className="skeleton" style={{ height: '18px', width: '24%' }} />
        </div>
        <div className="skeleton" style={{ height: '13px', width: '35%', marginBottom: '1rem' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <div className="skeleton" style={{ height: '56px', borderRadius: '10px' }} />
          <div className="skeleton" style={{ height: '56px', borderRadius: '10px' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem' }}>
          <div className="skeleton" style={{ height: '22px', width: '60px', borderRadius: '100px' }} />
          <div className="skeleton" style={{ height: '22px', width: '70px', borderRadius: '100px' }} />
          <div className="skeleton" style={{ height: '22px', width: '50px', borderRadius: '100px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: '24px', width: '35%' }} />
          <div className="skeleton" style={{ height: '36px', width: '30%', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  )
}
