import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import Negotiator from './pages/Negotiator.jsx'
import ContractLab from './pages/ContractLab.jsx'
import Pipeline from './pages/Pipeline.jsx'
import Compliance from './pages/Compliance.jsx'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/',            label: 'Dashboard'  },
    { to: '/negotiate',   label: 'Negotiate'  },
    { to: '/pipeline',    label: 'Pipeline'   },
    { to: '/contracts',   label: 'Contracts'  },
    { to: '/compliance',  label: 'Compliance' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <a href="/" className="navbar-logo">
          <span className="logo-dot" />
          Creator Copilot
        </a>

        {/* Desktop links */}
        <ul className="navbar-links">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="#" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-charcoal)', textDecoration: 'none' }}>
            Log in
          </a>
          <a href="#" className="btn-pill-dark">Get Started</a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--color-carbon)',
            }}
            className="hamburger"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {menuOpen
                ? <path d="M4 4L18 18M18 4L4 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                : <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          background: 'var(--color-paper)',
          borderTop: '1px solid var(--color-fog)',
          padding: '16px 24px',
        }}>
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 0', fontSize: '15px', fontWeight: 500, color: 'var(--color-charcoal)', textDecoration: 'none', borderBottom: '1px solid var(--color-fog)' }}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/"           element={<Dashboard />}   />
          <Route path="/negotiate"  element={<Negotiator />}  />
          <Route path="/pipeline"   element={<Pipeline />}    />
          <Route path="/contracts"  element={<ContractLab />} />
          <Route path="/compliance" element={<Compliance />}  />
        </Routes>
      </main>
    </BrowserRouter>
  )
}