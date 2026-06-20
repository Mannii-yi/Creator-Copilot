import { useState, useEffect } from 'react'
import KanbanCard from '../components/KanbanCard.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const COLUMNS = [
  { id: 'inbound',     label: 'Inbound',     color: '#71737a' },
  { id: 'negotiating', label: 'Negotiating', color: '#7d5a00' },
  { id: 'contracted',  label: 'Contracted',  color: '#0c5460' },
  { id: 'invoiced',    label: 'Invoiced',    color: '#083300' },
  { id: 'paid',        label: 'Paid',        color: '#166534' },
]

const MOCK_DEALS = [
  { id: '1', brand_name: 'Noise India',     campaign_name: 'Q3 Headphones',    deal_amount: 45000, status: 'negotiating' },
  { id: '2', brand_name: 'mCaffeine',       campaign_name: 'Skincare Collab',  deal_amount: 28000, status: 'contracted'  },
  { id: '3', brand_name: 'boAt Lifestyle',  campaign_name: 'Festive Campaign', deal_amount: 75000, status: 'invoiced'    },
  { id: '4', brand_name: 'Mamaearth',       campaign_name: 'Winter Care',      deal_amount: 35000, status: 'paid'        },
  { id: '5', brand_name: 'Lenskart',        campaign_name: 'Vision Brand Day', deal_amount: 22000, status: 'inbound'     },
  { id: '6', brand_name: 'SUGAR Cosmetics', campaign_name: 'Lip Gloss Range',  deal_amount: 18000, status: 'inbound'     },
]

function AddDealModal({ column, onAdd, onClose }) {
  const [form, setForm] = useState({ brand_name: '', campaign_name: '', deal_amount: '' })

  const submit = () => {
  if (!form.brand_name || !form.deal_amount) return
  // Don't generate ID here; the backend does it.
  onAdd({ 
    brand_name: form.brand_name, 
    campaign_name: form.campaign_name, 
    deal_amount: Number(form.deal_amount), 
    status: column.id 
  })
  onClose()
}
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,10,9,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '28px', margin: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-carbon)' }}>Add Deal to {column.label}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--color-smoke)' }}>×</button>
        </div>
        {[
          { key: 'brand_name',    label: 'Brand Name',     placeholder: 'e.g. Noise India' },
          { key: 'campaign_name', label: 'Campaign',       placeholder: 'e.g. Q3 Product Launch' },
          { key: 'deal_amount',   label: 'Deal Amount (₹)', placeholder: 'e.g. 25000', type: 'number' },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
              {f.label}
            </label>
            <input
              type={f.type || 'text'}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{
                width: '100%', padding: '10px 14px',
                border: '1px solid var(--color-fog)', borderRadius: '10px',
                fontSize: '14px', fontFamily: 'var(--font-ui)',
                color: 'var(--color-carbon)', background: 'var(--color-paper)',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-charcoal)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-fog)'}
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={submit} className="btn-primary" style={{ flex: 1 }}>Add Deal</button>
        </div>
      </div>
    </div>
  )
}

export default function Pipeline() {
  const [deals, setDeals]   = useState(MOCK_DEALS)
  const [modal, setModal]   = useState(null) // column id
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/deals`)
      .then(r => r.json())
      .then(data => { 
        if (Array.isArray(data)) {
          // MAP the database 'stage' to the UI's 'status'
          const formattedDeals = data.map(d => ({
            ...d,
            status: d.stage // This ensures the UI columns find the deals
          }));
          setDeals(formattedDeals);
        }
      })
      .catch(err => console.error("Error fetching deals:", err));
  }, []);

  const moveDeal = async (dealId, newStatus) => {
  // Optimistic update
  const previousDeals = [...deals];
  setDeals(ds => ds.map(d => d.id === dealId ? { ...d, status: newStatus } : d));

  try {
    const response = await fetch(`${API}/api/deals/${dealId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStatus }), // Change 'status' to 'stage'
    });
    if (!response.ok) throw new Error("Update failed");
  } catch (err) {
    setDeals(previousDeals); // Rollback if the database update fails
    alert("Could not update deal status in database.");
  }
}

  const addDeal = async (deal) => {
    try {
      const response = await fetch(`${API}/api/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: deal.brand_name,
          deal_amount: deal.deal_amount,
          // CRITICAL: Rename 'status' to 'stage' to match your Python Pydantic model
          stage: deal.status 
        }),
      });
      
      if (response.ok) {
        // Fetch the fresh list from the database to ensure ID is included
        const updatedDeals = await fetch(`${API}/api/deals`).then(r => r.json());
        setDeals(updatedDeals);
        setModal(null);
      }
    } catch (err) {
      console.error("Failed to add deal:", err);
    }
  }
  // Drag-and-drop (native HTML5 — no extra deps needed)
  const onDragStart = (e, dealId) => { setDragging(dealId); e.dataTransfer.effectAllowed = 'move' }
  const onDragEnd   = ()           => { setDragging(null); setDragOver(null) }
  const onDragOver  = (e, colId)   => { e.preventDefault(); setDragOver(colId) }
  const onDrop      = (e, colId)   => { e.preventDefault(); if (dragging) moveDeal(dragging, colId); setDragOver(null) }

  const totalPipeline = deals.reduce((s, d) => s + Number(d.deal_amount), 0)

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--color-paper)', borderBottom: '1px solid var(--color-fog)', padding: '48px 0 40px' }}>
        <div className="page-container">
          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-smoke)', marginBottom: '12px' }}>
            Deal Pipeline
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="text-heading" style={{ marginBottom: '10px' }}>Every deal, every stage.</h1>
              <p style={{ fontSize: '16px', color: 'var(--color-smoke)' }}>
                Drag cards to move deals. Pipeline total:{' '}
                <strong style={{ color: 'var(--color-carbon)' }}>₹{totalPipeline.toLocaleString('en-IN')}</strong>
              </p>
            </div>
            <button onClick={() => setModal(COLUMNS[0])} className="btn-primary">+ Add Deal</button>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div style={{ padding: '32px 24px', overflowX: 'auto' }}>
        <div className="kanban-board" style={{ minWidth: '1000px' }}>
          {COLUMNS.map(col => {
            const colDeals = deals.filter(d => d.status === col.id)
            const colTotal = colDeals.reduce((s, d) => s + Number(d.deal_amount), 0)
            return (
              <div
                key={col.id}
                className="kanban-column"
                style={{
                  background: dragOver === col.id ? 'var(--color-mint-mist)' : 'var(--color-mist)',
                  transition: 'background 0.15s',
                  outline: dragOver === col.id ? '2px dashed var(--color-lime-spark)' : 'none',
                }}
                onDragOver={e => onDragOver(e, col.id)}
                onDrop={e => onDrop(e, col.id)}
              >
                <div className="kanban-column-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                    {col.label}
                  </div>
                  <span style={{ fontSize: '10px', background: 'var(--color-fog)', color: 'var(--color-charcoal)', padding: '1px 7px', borderRadius: '99px', fontWeight: 600 }}>
                    {colDeals.length}
                  </span>
                </div>

                {colTotal > 0 && (
                  <p style={{ fontSize: '11px', color: 'var(--color-smoke)', marginBottom: '10px' }}>
                    ₹{colTotal.toLocaleString('en-IN')}
                  </p>
                )}

                {colDeals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={e => onDragStart(e, deal.id)}
                    onDragEnd={onDragEnd}
                    style={{ opacity: dragging === deal.id ? 0.4 : 1, transition: 'opacity 0.15s' }}
                  >
                    <KanbanCard deal={deal} onMove={moveDeal} columns={COLUMNS} />
                  </div>
                ))}

                <button
                  onClick={() => setModal(col)}
                  style={{
                    width: '100%', padding: '10px',
                    border: '1.5px dashed var(--color-fog)', borderRadius: '10px',
                    background: 'transparent', cursor: 'pointer',
                    fontSize: '12px', color: 'var(--color-smoke)',
                    marginTop: '4px', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-lime-spark)'; e.currentTarget.style.color = 'var(--color-forest-ink)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-fog)'; e.currentTarget.style.color = 'var(--color-smoke)' }}
                >
                  + Add deal
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {modal && <AddDealModal column={modal} onAdd={addDeal} onClose={() => setModal(null)} />}
    </div>
  )
}