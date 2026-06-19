import { useState, useEffect } from 'react'
import MetricCard from '../components/MetricCard.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const QUICK_ACTIONS = [
  { href: '/negotiate', icon: '⚡', label: 'Analyse a Deal', desc: 'Paste any brand offer for instant AI valuation' },
  { href: '/contracts', icon: '📄', label: 'Scan a Contract', desc: 'Upload PDF/DOCX to detect red flags' },
  { href: '/pipeline',  icon: '📋', label: 'Open Pipeline',  desc: 'View and move deals across stages' },
]

const MOCK_DEALS = [
  { id: 1, brand_name: 'Noise India',   campaign_name: 'Q3 Headphones Launch', deal_amount: 45000, status: 'negotiating', updated_at: '2025-06-18' },
  { id: 2, brand_name: 'mCaffeine',     campaign_name: 'Skincare Awareness',    deal_amount: 28000, status: 'contracted',  updated_at: '2025-06-17' },
  { id: 3, brand_name: 'boAt Lifestyle', campaign_name: 'Festive Campaign',     deal_amount: 75000, status: 'invoiced',    updated_at: '2025-06-16' },
  { id: 4, brand_name: 'Mamaearth',     campaign_name: 'Winter Care Series',    deal_amount: 35000, status: 'paid',        updated_at: '2025-06-14' },
]

const STATUS_STYLE = {
  inbound:     { bg: '#f2f1f0', color: '#71737a' },
  negotiating: { bg: '#fff3cd', color: '#7d5a00' },
  contracted:  { bg: '#d1ecf1', color: '#0c5460' },
  invoiced:    { bg: '#e6ffc8', color: '#083300' },
  paid:        { bg: '#d6ffa6', color: '#083300' },
}

export default function Dashboard() {
  const [deals, setDeals] = useState(MOCK_DEALS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API}/api/deals`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setDeals(data) })
      .catch(() => {}) // silently keep mock data
  }, [])

  const totalEarned    = deals.filter(d => d.status === 'paid').reduce((s, d) => s + Number(d.deal_amount), 0)
  const activeDeals    = deals.filter(d => !['paid'].includes(d.status)).length
  const pendingInvoice = deals.filter(d => d.status === 'invoiced').reduce((s, d) => s + Number(d.deal_amount), 0)
  const tdsReceivable  = Math.round(totalEarned * 0.1)

  return (
    <div>
      {/* Hero header */}
      <div style={{ background: 'var(--color-paper)', borderBottom: '1px solid var(--color-fog)', padding: '48px 0 40px' }}>
        <div className="page-container">
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-smoke)', marginBottom: '12px' }}>
            Creator Dashboard
          </p>
          <h1 className="text-heading" style={{ marginBottom: '10px' }}>
            Your deal, your terms.
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-smoke)', maxWidth: '480px' }}>
            Every brand deal, contract, and rupee — in one place. No more WhatsApp chaos.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          <MetricCard label="Total Earned"      value={`₹${(totalEarned / 1000).toFixed(0)}k`} trend="up"   trendLabel="+12% this month" />
          <MetricCard label="Active Deals"      value={activeDeals}                              trend="up"   trendLabel={`${deals.length} total`} />
          <MetricCard label="Pending Invoices"  value={`₹${(pendingInvoice / 1000).toFixed(0)}k`} trend="down" trendLabel="Awaiting payment" />
          <MetricCard label="TDS Receivable"    value={`₹${(tdsReceivable / 1000).toFixed(0)}k`} trend="up"   trendLabel="Sec. 194J" />
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-smoke)', marginBottom: '16px' }}>
            Quick Actions
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {QUICK_ACTIONS.map(a => (
              <a
                key={a.href}
                href={a.href}
                style={{
                  display: 'block',
                  padding: '20px',
                  border: '1.5px dashed var(--color-fog)',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                  background: 'transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-lime-spark)'; e.currentTarget.style.background = '#f9ffe8' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-fog)'; e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}>{a.icon}</span>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-carbon)', marginBottom: '4px' }}>{a.label}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-smoke)' }}>{a.desc}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Recent deals */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-smoke)' }}>
              Recent Deals
            </p>
            <a href="/pipeline" style={{ fontSize: '13px', color: 'var(--color-charcoal)', textDecoration: 'none', borderBottom: '1px solid var(--color-fog)' }}>
              View all →
            </a>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {deals.map((deal, i) => {
              const s = STATUS_STYLE[deal.status] || STATUS_STYLE.inbound
              return (
                <div
                  key={deal.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: i < deals.length - 1 ? '1px solid var(--color-fog)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-mist)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-carbon)', marginBottom: '2px' }}>{deal.brand_name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-smoke)' }}>{deal.campaign_name}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-carbon)' }}>
                      ₹{Number(deal.deal_amount).toLocaleString('en-IN')}
                    </span>
                    <span style={{ background: s.bg, color: s.color, fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {deal.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}