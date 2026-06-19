export default function MetricCard({ label, value, trend, trendLabel, prefix = '', suffix = '' }) {
  const isPositive = trend === 'up'
  const isNegative = trend === 'down'

  return (
    <div className="metric-card card-hover" style={{ transition: 'border-color 0.2s' }}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">
        {prefix}{value}{suffix}
      </p>
      {trendLabel && (
        <div style={{ marginTop: '10px' }}>
          <span
            className={`badge ${isPositive ? 'badge-green' : isNegative ? 'badge-red' : 'badge-gray'}`}
            style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
          >
            {isPositive && '↑'}
            {isNegative && '↓'}
            {trendLabel}
          </span>
        </div>
      )}
    </div>
  )
}