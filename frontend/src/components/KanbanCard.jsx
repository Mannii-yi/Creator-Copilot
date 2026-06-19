export default function KanbanCard({ deal, onMove, columns }) {
  const statusColors = {
    inbound:     { bg: '#f2f1f0', text: '#71737a' },
    negotiating: { bg: '#fff3cd', text: '#7d5a00' },
    contracted:  { bg: '#d1ecf1', text: '#0c5460' },
    invoiced:    { bg: '#e6ffc8', text: '#083300' },
    paid:        { bg: '#d6ffa6', text: '#083300' },
  }
  const color = statusColors[deal.status] || statusColors.inbound

  return (
    <div className="kanban-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <p className="deal-brand">{deal.brand_name}</p>
        <span
          className="badge"
          style={{ background: color.bg, color: color.text, fontSize: '10px', whiteSpace: 'nowrap', marginLeft: '6px' }}
        >
          {deal.status}
        </span>
      </div>

      <p className="deal-amount">₹{Number(deal.deal_amount).toLocaleString('en-IN')}</p>

      <p style={{ fontSize: '12px', color: 'var(--color-smoke)', marginBottom: '12px' }}>
        {deal.campaign_name}
      </p>

      {/* Move buttons */}
      {onMove && columns && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {columns
            .filter(c => c.id !== deal.status)
            .map(c => (
              <button
                key={c.id}
                onClick={() => onMove(deal.id, c.id)}
                style={{
                  fontSize: '10px',
                  padding: '3px 8px',
                  border: '1px solid var(--color-fog)',
                  borderRadius: '4px',
                  background: 'transparent',
                  color: 'var(--color-smoke)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--color-charcoal)'; e.target.style.color = 'var(--color-carbon)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--color-fog)'; e.target.style.color = 'var(--color-smoke)' }}
              >
                → {c.label}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}