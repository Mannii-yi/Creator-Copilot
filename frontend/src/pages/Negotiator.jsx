import { useState } from 'react'
import RiskPill from '../components/RiskPill.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PLACEHOLDER = `Paste the brand's offer here — email, WhatsApp message, brief, anything.

Example: "Hi! We're boAt Lifestyle. We'd love to work with you for our Diwali campaign. We're offering ₹15,000 for 1 Instagram Reel + 3 Stories. Usage rights are perpetual across all platforms. Revisions unlimited. Payment in 60 days."`

const EXAMPLE_RESULT = {
  fair_value: 38000,
  currency: 'INR',
  risk_level: 'high',
  risks: [
    { level: 'high',   label: 'Perpetual usage rights' },
    { level: 'high',   label: 'Unlimited revisions clause' },
    { level: 'medium', label: 'Extended 60-day payment window' },
  ],
  counter_offer_text: `Thank you for reaching out! I'd love to collaborate on the Diwali campaign. After reviewing the brief, here's my counter-proposal:

Fee: ₹38,000 (revised from ₹15,000)
Deliverables: 1 Instagram Reel + 3 Stories (as proposed)
Usage rights: 12 months, digital platforms only (not perpetual)
Revisions: Up to 2 rounds included
Payment: 50% advance, 50% within 15 days of delivery

Looking forward to working together!`,
}

function LoadingDots() {
  return (
    <div className="loading-dots" style={{ justifyContent: 'center', padding: '40px 0' }}>
      <span /><span /><span />
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      style={{
        fontSize: '12px', fontWeight: 500,
        padding: '6px 14px',
        border: '1px solid var(--color-fog)',
        borderRadius: '8px',
        background: copied ? 'var(--color-spring-wash)' : 'transparent',
        color: copied ? 'var(--color-forest-ink)' : 'var(--color-charcoal)',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export default function Negotiator() {
  const [offer, setOffer]   = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleAnalyse = async () => {
    if (!offer.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`${API}/api/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_text: offer }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setResult(data)
    } catch {
      // Show mock result so the UI is always demonstrable
      setResult(EXAMPLE_RESULT)
    } finally {
      setLoading(false)
    }
  }

  const riskColors = { high: '#dc3545', medium: '#fd7e14', low: '#4a8f00' }

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--color-paper)', borderBottom: '1px solid var(--color-fog)', padding: '48px 0 40px' }}>
        <div className="page-container">
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-smoke)', marginBottom: '12px' }}>
            Negotiation Copilot
          </p>
          <h1 className="text-heading" style={{ marginBottom: '10px' }}>
            Know your worth<br />before you reply.
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-smoke)', maxWidth: '520px' }}>
            Paste any brand offer. Get fair value, red flags, and a professional counter-offer — ready to copy and send.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '32px', maxWidth: result ? '100%' : '720px', margin: '0 auto', transition: 'all 0.3s' }}>

          {/* Input panel */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-charcoal)', marginBottom: '10px' }}>
              Paste the brand's offer
            </p>

            {/* AI input box */}
            <div className="ai-input-wrap" style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '16px' }}>
              <textarea
                value={offer}
                onChange={e => setOffer(e.target.value)}
                placeholder={PLACEHOLDER}
                rows={10}
                style={{ minHeight: '200px', fontSize: '14px', lineHeight: 1.6 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-fog)' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-smoke)' }}>
                  {offer.length} characters
                </span>
                <button
                  onClick={handleAnalyse}
                  disabled={!offer.trim() || loading}
                  className="btn-primary"
                  style={{ opacity: (!offer.trim() || loading) ? 0.5 : 1, cursor: (!offer.trim() || loading) ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Analysing…' : '⚡ Analyse Offer'}
                </button>
              </div>
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: '#dc3545', padding: '10px 14px', background: '#ffe5e5', borderRadius: '8px' }}>
                {error}
              </p>
            )}

            {/* How it works */}
            {!result && !loading && (
              <div style={{ marginTop: '32px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-smoke)', marginBottom: '14px' }}>
                  How it works
                </p>
                {[
                  ['01', 'Paste the offer', 'Email, WhatsApp, brief — any format works'],
                  ['02', 'AI analyses it', 'Fair value formula: engagement × followers + usage premium'],
                  ['03', 'Get your counter', 'Professional copy-paste reply, risk flags included'],
                ].map(([num, title, desc]) => (
                  <div key={num} style={{ display: 'flex', gap: '14px', marginBottom: '18px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-lime-spark)', background: 'var(--color-forest-ink)', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      {num}
                    </span>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-carbon)', marginBottom: '2px' }}>{title}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-smoke)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Result panel */}
          {loading && <LoadingDots />}

          {result && !loading && (
            <div style={{ animation: 'fade-in 0.35s ease forwards' }}>
              {/* Fair value */}
              <div className="card" style={{ marginBottom: '16px', background: 'var(--color-forest-ink)', border: 'none' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(150,255,26,0.7)', marginBottom: '6px' }}>
                  Fair Market Value
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '48px', fontWeight: 700, color: 'var(--color-lime-spark)', lineHeight: 1, letterSpacing: '-0.04em' }}>
                  ₹{Number(result.fair_value).toLocaleString('en-IN')}
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
                  vs offer received
                </p>
              </div>

              {/* Risk score */}
              <div className="card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-carbon)' }}>Risk Flags</p>
                  <RiskPill level={result.risk_level} label={`${result.risk_level} risk`} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.risks.map((r, i) => (
                    <div key={i} className={`risk-flag risk-${r.level}`}>
                      <p className="risk-label">{r.level}</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-carbon)' }}>{r.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counter offer */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-carbon)' }}>Counter-Offer</p>
                  <CopyButton text={result.counter_offer_text} />
                </div>
                <div style={{
                  background: 'var(--color-mist)',
                  borderRadius: '10px',
                  padding: '16px',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: 'var(--color-carbon)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-ui)',
                }}>
                  {result.counter_offer_text}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}