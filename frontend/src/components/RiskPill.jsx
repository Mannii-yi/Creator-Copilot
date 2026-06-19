export default function RiskPill({ level, label }) {
  const styles = {
    high:   { background: '#ffe5e5', color: '#8b0000', dot: '#dc3545' },
    medium: { background: '#fff3cd', color: '#7d5a00', dot: '#fd7e14' },
    low:    { background: '#e6ffc8', color: '#083300', dot: '#4a8f00' },
  }
  const s = styles[level] || styles.low

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      background: s.background,
      color: s.color,
      fontSize: '11px',
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: '9999px',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      <span style={{
        width: '5px', height: '5px',
        borderRadius: '50%',
        background: s.dot,
        flexShrink: 0,
      }} />
      {label}
    </span>
  )
}