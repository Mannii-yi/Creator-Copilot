import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CURRENT_FY = '2024-25'

function fmt(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

function InputCard({ label, sublabel, value, onChange, icon }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-carbon)' }}>{label}</p>
          <p style={{ fontSize: '12px', color: 'var(--color-smoke)' }}>{sublabel}</p>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', fontWeight: 600, color: 'var(--color-smoke)' }}>₹</span>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          style={{
            width: '100%', padding: '12px 14px 12px 30px',
            border: '1px solid var(--color-fog)', borderRadius: '10px',
            fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-ui)',
            color: 'var(--color-carbon)', background: 'var(--color-paper)',
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--color-charcoal)'}
          onBlur={e => e.target.style.borderColor = 'var(--color-fog)'}
        />
      </div>
    </div>
  )
}

function ResultRow({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid rgba(8,51,0,0.12)',
    }}>
      <p style={{ fontSize: '13px', color: highlight ? 'var(--color-forest-ink)' : 'rgba(8,51,0,0.7)', fontWeight: highlight ? 600 : 400 }}>{label}</p>
      <p style={{ fontSize: highlight ? '18px' : '14px', fontWeight: 700, color: 'var(--color-forest-ink)' }}>{value}</p>
    </div>
  )
}

export default function Compliance() {
  const [fees, setFees]   = useState('')
  const [gifts, setGifts] = useState('')
  const [ledger, setLedger] = useState([])

  const feesNum  = Number(fees)  || 0
  const giftsNum = Number(gifts) || 0

  // 194J calculation: 10% if fees > 30,000; 2% for technical services
  const tdsRate     = feesNum > 30000 ? 0.10 : 0.02
  const tds194j     = feesNum * tdsRate
  const netReceive  = feesNum - tds194j
  // 194R: gifts > ₹20,000 trigger separate TDS
  const flag194r    = giftsNum > 20000
  const tds194r     = flag194r ? giftsNum * 0.10 : 0
  const totalTds    = tds194j + tds194r
  const hasInputs   = feesNum > 0 || giftsNum > 0

  useEffect(() => {
    // Only fetch if we have data to calculate
    if (feesNum === 0 && giftsNum === 0) return;

    fetch(`${API}/api/compliance/calculate-tax`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        gross_amount: feesNum, 
        include_gst: true, 
        tds_rate_percentage: 10.0 
      })
    })
      .then(r => r.json())
      .then(data => {
        // You'll need to decide how to map this response to your 'ledger' state
        console.log("Calculated Tax Data:", data);
        // If your ledger needs this specific format, map it here:
        // setLedger(...) 
      })
      .catch(err => console.error("Tax calc failed:", err));
  }, [feesNum, giftsNum]); // This will re-run whenever the user types a new amount
  const downloadLedger = async () => {
    try {
      const res = await fetch(`${API}/api/compliance/pdf`)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `creator-copilot-ledger-${CURRENT_FY}.pdf`; a.click()
    } catch {
      alert('PDF export requires backend connection.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--color-paper)', borderBottom: '1px solid var(--color-fog)', padding: '48px 0 40px' }}>
        <div className="page-container">
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-smoke)', marginBottom: '12px' }}>
            Tax Compliance — FY {CURRENT_FY}
          </p>
          <h1 className="text-heading" style={{ marginBottom: '10px' }}>
            No TDS surprises.<br />Ever.
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-smoke)', maxWidth: '520px' }}>
            Calculate your Section 194J and 194R exposure in real time. Know what the brand owes you after deductions.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>

        {/* Calculator */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: hasInputs ? '24px' : '48px' }}>
          <InputCard
            label="Professional Fees Received"
            sublabel="Section 194J — 2% or 10% TDS"
            value={fees}
            onChange={setFees}
            icon="💼"
          />
          <InputCard
            label="Gifts & Products Value"
            sublabel="Section 194R — TDS if > ₹20,000/year"
            value={gifts}
            onChange={setGifts}
            icon="🎁"
          />
        </div>

        {/* Results */}
        {hasInputs && (
          <div style={{ marginBottom: '48px', animation: 'fade-in 0.3s ease' }}>

            {/* 194R alert */}
            {flag194r && (
              <div style={{
                background: '#ffe5e5', border: '1px solid #dc354530', borderLeft: '4px solid #dc3545',
                borderRadius: '10px', padding: '14px 18px', marginBottom: '16px',
                display: 'flex', alignItems: 'flex-start', gap: '10px',
              }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#8b0000', marginBottom: '3px' }}>Section 194R Triggered</p>
                  <p style={{ fontSize: '13px', color: '#8b0000' }}>
                    Gifts/products value of {fmt(giftsNum)} exceeds the ₹20,000 annual threshold. The brand must deduct 10% TDS ({fmt(tds194r)}) on the gift value separately before payout.
                  </p>
                </div>
              </div>
            )}

            {/* Result card */}
            <div style={{ background: 'var(--color-spring-wash)', border: '1px solid var(--color-forest-ink)30', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-forest-ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  FY {CURRENT_FY} Calculation
                </p>
                <span style={{ fontSize: '11px', background: 'var(--color-forest-ink)', color: 'var(--color-lime-spark)', padding: '3px 10px', borderRadius: '99px', fontWeight: 600 }}>
                  {tdsRate * 100}% rate applied
                </span>
              </div>

              <ResultRow label="Gross Professional Fees"         value={fmt(feesNum)}         />
              <ResultRow label={`TDS under Sec. 194J (${tdsRate * 100}%)`} value={`− ${fmt(tds194j)}`}  />
              {flag194r && <ResultRow label="TDS under Sec. 194R (10%)" value={`− ${fmt(tds194r)}`} />}
              <ResultRow label="Gifts / Products Value"          value={fmt(giftsNum)}         />
              <ResultRow label="Net Amount You Receive"          value={fmt(netReceive)}       highlight />
              <ResultRow label="Total TDS Receivable (Form 16A)" value={fmt(totalTds)}         highlight />
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-smoke)', marginTop: '10px' }}>
              * This is an estimate. Consult a CA for your exact tax liability. Rates: Sec. 194J — 2% (technical services) or 10% above ₹30k. Sec. 194R — 10% above ₹20k/year.
            </p>
          </div>
        )}

        {/* Ledger table */}
        {ledger.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-smoke)' }}>
                Income Ledger — FY {CURRENT_FY}
              </p>
              <button onClick={downloadLedger} className="btn-ghost" style={{ fontSize: '12px', padding: '8px 16px' }}>
                ↓ Download PDF
              </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '10px 20px', background: 'var(--color-mist)', borderBottom: '1px solid var(--color-fog)' }}>
                {['Month', 'Income', 'TDS Deducted', 'Gifts Value'].map(h => (
                  <p key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-smoke)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</p>
                ))}
              </div>
              {ledger.map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    padding: '14px 20px', borderBottom: i < ledger.length - 1 ? '1px solid var(--color-fog)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-mist)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <p style={{ fontSize: '13px', color: 'var(--color-carbon)', fontWeight: 500 }}>{row.month}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-carbon)' }}>{fmt(row.income)}</p>
                  <p style={{ fontSize: '13px', color: '#dc3545' }}>− {fmt(row.tds)}</p>
                  <p style={{ fontSize: '13px', color: row.gifts > 20000 ? '#fd7e14' : 'var(--color-charcoal)' }}>
                    {row.gifts > 0 ? fmt(row.gifts) : '—'}
                    {row.gifts > 20000 && <span style={{ fontSize: '10px', marginLeft: '5px', color: '#fd7e14' }}>⚠</span>}
                  </p>
                </div>
              ))}
              {/* Totals row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '14px 20px', background: 'var(--color-spring-wash)', borderTop: '1px solid var(--color-forest-ink)20' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-forest-ink)', textTransform: 'uppercase' }}>Total</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-forest-ink)' }}>
                  {fmt(ledger.reduce((s, r) => s + r.income, 0))}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#dc3545' }}>
                  − {fmt(ledger.reduce((s, r) => s + r.tds, 0))}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-forest-ink)' }}>
                  {fmt(ledger.reduce((s, r) => s + r.gifts, 0))}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}