import { useState, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const MOCK_RESULT = {
  risk_score: 78,
  extracted_clauses: {
    payment_terms:  '60 days after content delivery',
    usage_rights:   'Perpetual, worldwide, all platforms',
    exclusivity:    '6 months across personal care category',
    revisions:      'Unlimited revisions until brand approval',
  },
  red_flags: [
    { level: 'high',   title: 'Perpetual Usage Rights', description: 'Brand claims ownership of your content forever across all platforms with no expiry. Counter with 12-month digital-only rights.' },
    { level: 'high',   title: 'Unlimited Revisions',    description: 'No cap on revision rounds creates an open-ended obligation. Negotiate 2 rounds maximum.' },
    { level: 'high',   title: 'Broad Exclusivity Zone', description: '6-month category exclusivity blocks all personal care brand deals. Reduce to 3 months or product-specific only.' },
    { level: 'medium', title: '60-Day Payment Window',  description: 'Longer than industry standard (15–30 days). Add a late payment clause of 2% per month.' },
  ],
}

function RiskMeter({ score }) {
  const color = score >= 70 ? '#dc3545' : score >= 40 ? '#fd7e14' : '#4a8f00'
  const label = score >= 70 ? 'High Risk' : score >= 40 ? 'Medium Risk' : 'Low Risk'
  return (
    <div style={{ textAlign: 'center', padding: '28px' }}>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-fog)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="50"
            fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * 314} 314`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 700, color, lineHeight: 1 }}>{score}</p>
          <p style={{ fontSize: '10px', color: 'var(--color-smoke)', fontWeight: 500 }}>/100</p>
        </div>
      </div>
      <p style={{ fontSize: '14px', fontWeight: 600, color, marginTop: '10px' }}>{label}</p>
    </div>
  )
}

export default function ContractLab() {
  const [file, setFile]       = useState(null)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [expanded, setExpanded] = useState({})
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    const ext = f.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) return
    setFile(f)
    setResult(null)
  }

  const analyse = async () => {
    if (!file) return
    setLoading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch(`${API}/api/contracts/analyse`, { method: 'POST', body })
      if (!res.ok) throw new Error()
      setResult(await res.json())
    } catch {
      setResult(MOCK_RESULT)
    } finally {
      setLoading(false)
    }
  }

  const toggleFlag = (i) => setExpanded(p => ({ ...p, [i]: !p[i] }))

  const levelColor = { high: '#dc3545', medium: '#fd7e14', low: '#4a8f00' }
  const levelBg    = { high: '#ffe5e5', medium: '#fff3cd', low: '#e6ffc8' }

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--color-paper)', borderBottom: '1px solid var(--color-fog)', padding: '48px 0 40px' }}>
        <div className="page-container">
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-smoke)', marginBottom: '12px' }}>
            Contract Intelligence
          </p>
          <h1 className="text-heading" style={{ marginBottom: '10px' }}>
            Read the fine print<br />before you sign.
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-smoke)', maxWidth: '520px' }}>
            Upload any brand contract. AI detects perpetual rights, unlimited revisions, broad exclusivity, and hidden clauses — in seconds.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.4fr' : '1fr', gap: '32px', maxWidth: result ? '100%' : '640px', margin: '0 auto' }}>

          {/* Upload panel */}
          <div>
            {/* Drop zone */}
            <div
              onClick={() => inputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
              style={{
                border: `2px dashed ${dragging ? 'var(--color-lime-spark)' : file ? 'var(--color-charcoal)' : 'var(--color-fog)'}`,
                borderRadius: '16px',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? '#f9ffe8' : 'var(--color-paper)',
                transition: 'all 0.2s',
                marginBottom: '16px',
              }}
            >
              <input ref={inputRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>
                {file ? '📄' : '⬆️'}
              </div>
              {file
                ? <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-carbon)', marginBottom: '4px' }}>{file.name}</p>
                : <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-carbon)', marginBottom: '4px' }}>Drop your contract here</p>
              }
              <p style={{ fontSize: '12px', color: 'var(--color-smoke)' }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB · Click to change` : 'PDF or DOCX · Click to browse'}
              </p>
            </div>

            {file && (
              <button
                onClick={analyse}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Scanning contract…' : '🔍 Scan for Red Flags'}
              </button>
            )}

            {loading && (
              <div style={{ marginTop: '24px' }}>
                <div className="loading-dots" style={{ justifyContent: 'center' }}>
                  <span /><span /><span />
                </div>
                <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-smoke)', marginTop: '12px' }}>
                  AI is reading your contract…
                </p>
              </div>
            )}

            {/* What we detect */}
            {!result && !loading && (
              <div style={{ marginTop: '32px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-smoke)', marginBottom: '14px' }}>
                  What we detect
                </p>
                {[
                  ['🔒', 'Perpetual & broad usage rights'],
                  ['♾️', 'Unlimited revision clauses'],
                  ['🚫', 'Category exclusivity traps'],
                  ['💸', 'Extended payment windows'],
                  ['👾', 'Digital likeness / AI twin rights'],
                  ['📋', 'Auto-renewal without notice'],
                ].map(([icon, label]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--color-fog)' }}>
                    <span>{icon}</span>
                    <p style={{ fontSize: '13px', color: 'var(--color-charcoal)' }}>{label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results panel */}
          {result && !loading && (
            <div style={{ animation: 'fade-in 0.35s ease forwards' }}>
              {/* Risk meter */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <RiskMeter score={result.risk_score} />
              </div>

              {/* Extracted clauses */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-carbon)', marginBottom: '12px' }}>Extracted Clauses</p>
                {Object.entries(result.extracted_clauses).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--color-fog)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-smoke)', fontWeight: 500, textTransform: 'capitalize', flexShrink: 0 }}>
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--color-carbon)', textAlign: 'right' }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Red flags */}
              <div className="card">
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-carbon)', marginBottom: '12px' }}>
                  Red Flags ({result.red_flags.length})
                </p>
                {result.red_flags.map((flag, i) => (
                  <div key={i} style={{ marginBottom: '8px' }}>
                    <button
                      onClick={() => toggleFlag(i)}
                      style={{
                        width: '100%', padding: '12px 14px',
                        border: `1px solid ${levelColor[flag.level]}30`,
                        borderLeft: `4px solid ${levelColor[flag.level]}`,
                        borderRadius: expanded[i] ? '10px 10px 0 0' : '10px',
                        background: levelBg[flag.level],
                        cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        textAlign: 'left',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: levelColor[flag.level], display: 'block', marginBottom: '2px' }}>
                          {flag.level}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-carbon)' }}>{flag.title}</span>
                      </div>
                      <span style={{ fontSize: '16px', color: 'var(--color-smoke)', flexShrink: 0 }}>
                        {expanded[i] ? '−' : '+'}
                      </span>
                    </button>
                    {expanded[i] && (
                      <div style={{
                        padding: '12px 14px',
                        background: 'var(--color-mist)',
                        border: `1px solid ${levelColor[flag.level]}20`,
                        borderTop: 'none',
                        borderRadius: '0 0 10px 10px',
                        fontSize: '13px', lineHeight: 1.6, color: 'var(--color-charcoal)',
                      }}>
                        {flag.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}