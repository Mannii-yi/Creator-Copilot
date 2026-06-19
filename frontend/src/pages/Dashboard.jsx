import { useState, useEffect } from 'react'
import MetricCard from '../components/MetricCard.jsx'
import { apiRequest } from '../services/api'

const QUICK_ACTIONS = [
  {
    href: '/negotiate',
    icon: '⚡',
    label: 'Analyse a Deal',
    desc: 'Paste any brand offer for instant AI valuation'
  },
  {
    href: '/contracts',
    icon: '📄',
    label: 'Scan a Contract',
    desc: 'Upload PDF/DOCX to detect red flags'
  },
  {
    href: '/pipeline',
    icon: '📋',
    label: 'Open Pipeline',
    desc: 'View and move deals across stages'
  },
]

const MOCK_DEALS = [
  {
    id: 1,
    brand_name: 'Noise India',
    campaign_name: 'Q3 Headphones Launch',
    deal_amount: 45000,
    status: 'negotiating',
    updated_at: '2025-06-18'
  },
  {
    id: 2,
    brand_name: 'mCaffeine',
    campaign_name: 'Skincare Awareness',
    deal_amount: 28000,
    status: 'contracted',
    updated_at: '2025-06-17'
  },
  {
    id: 3,
    brand_name: 'boAt Lifestyle',
    campaign_name: 'Festive Campaign',
    deal_amount: 75000,
    status: 'invoiced',
    updated_at: '2025-06-16'
  },
  {
    id: 4,
    brand_name: 'Mamaearth',
    campaign_name: 'Winter Care Series',
    deal_amount: 35000,
    status: 'paid',
    updated_at: '2025-06-14'
  },
]

const STATUS_STYLE = {
  inbound: {
    bg: '#f2f1f0',
    color: '#71737a'
  },

  negotiating: {
    bg: '#fff3cd',
    color: '#7d5a00'
  },

  contracted: {
    bg: '#d1ecf1',
    color: '#0c5460'
  },

  invoiced: {
    bg: '#e6ffc8',
    color: '#083300'
  },

  paid: {
    bg: '#d6ffa6',
    color: '#083300'
  },
}

export default function Dashboard() {

  const [deals, setDeals] = useState(MOCK_DEALS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function loadDeals() {

      try {

        const data = await apiRequest(
          "/api/deals"
        )

        if (Array.isArray(data)) {

          setDeals(data)

        }

      }

      catch (error) {

        console.log(
          "Backend unavailable. Using mock data.",
          error
        )

      }

      finally {

        setLoading(false)

      }

    }

    loadDeals()

  }, [])

  const totalEarned =
    deals
      .filter(d => d.status === 'paid')
      .reduce(
        (sum, d) => sum + Number(d.deal_amount),
        0
      )

  const activeDeals =
    deals.filter(
      d => d.status !== 'paid'
    ).length

  const pendingInvoice =
    deals
      .filter(
        d => d.status === 'invoiced'
      )
      .reduce(
        (sum, d) => sum + Number(d.deal_amount),
        0
      )

  const tdsReceivable =
    Math.round(
      totalEarned * 0.1
    )

  if (loading) {

    return (
      <div className="p-10">
        Loading dashboard...
      </div>
    )

  }

  return (

    <div>

      <div
        style={{
          background: 'var(--color-paper)',
          borderBottom: '1px solid var(--color-fog)',
          padding: '48px 0 40px'
        }}
      >

        <div className="page-container">

          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-smoke)',
              marginBottom: '12px'
            }}
          >
            Creator Dashboard
          </p>

          <h1
            className="text-heading"
            style={{
              marginBottom: '10px'
            }}
          >
            Your deal, your terms.
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-smoke)',
              maxWidth: '480px'
            }}
          >
            Every brand deal, contract,
            and rupee — in one place.
            No more WhatsApp chaos.
          </p>

        </div>

      </div>

      <div
        className="page-container"
        style={{
          paddingTop: '40px',
          paddingBottom: '60px'
        }}
      >

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit,minmax(200px,1fr))',
            gap: '16px',
            marginBottom: '48px'
          }}
        >

          <MetricCard
            label="Total Earned"
            value={`₹${(totalEarned / 1000).toFixed(0)}k`}
            trend="up"
            trendLabel="+12% this month"
          />

          <MetricCard
            label="Active Deals"
            value={activeDeals}
            trend="up"
            trendLabel={`${deals.length} total`}
          />

          <MetricCard
            label="Pending Invoices"
            value={`₹${(pendingInvoice / 1000).toFixed(0)}k`}
            trend="down"
            trendLabel="Awaiting payment"
          />

          <MetricCard
            label="TDS Receivable"
            value={`₹${(tdsReceivable / 1000).toFixed(0)}k`}
            trend="up"
            trendLabel="Sec.194J"
          />

        </div>

      </div>

    </div>

  )

}