import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Map, Navigation, Building2, UtensilsCrossed, WashingMachine,
  Dumbbell, ShieldAlert, HeartPulse, DoorOpen, Info, CheckCircle2,
  Phone, Users, Clock, AlertTriangle, Layers,
} from 'lucide-react'
import { initialCampusMapNodes } from '../data/seedData'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'

const TYPE_ICONS = {
  Residential: Building2,
  Dining: UtensilsCrossed,
  Utility: WashingMachine,
  Recreation: Dumbbell,
  Administration: DoorOpen,
  Medical: HeartPulse,
  Security: ShieldAlert,
  'Emergency Exit': Navigation,
}

const TYPE_COLORS = {
  Residential: '#059669',
  Dining: '#D97706',
  Utility: '#0284C7',
  Recreation: '#7CFC00',
  Administration: '#6366F1',
  Medical: '#DC2626',
  Security: '#475569',
  'Emergency Exit': '#EF4444',
}

export default function DigitalMap() {
  const [selectedNode, setSelectedNode] = useState(initialCampusMapNodes[0])
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredNodes = activeFilter === 'All'
    ? initialCampusMapNodes
    : initialCampusMapNodes.filter((n) => {
        if (activeFilter === 'Residential') return n.type === 'Residential'
        if (activeFilter === 'Dining & Utility') return n.type === 'Dining' || n.type === 'Utility'
        if (activeFilter === 'Recreation') return n.type === 'Recreation'
        if (activeFilter === 'Safety & Exits') return n.type === 'Emergency Exit' || n.type === 'Medical' || n.type === 'Security'
        return true
      })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-border)' }}>
            <Map size={14} /> Interactive Campus Spatial Layout
          </span>
          <h1>Interactive Digital Hostel Map</h1>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-ok">
            <span className="badge-dot" /> Live Facilities Tracking Active
          </span>
        </div>
      </div>

      {/* Layer Filters */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
        {['All', 'Residential', 'Dining & Utility', 'Recreation', 'Safety & Exits'].map((f) => (
          <button
            key={f}
            type="button"
            className={`btn btn-sm ${activeFilter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="two-col" style={{ alignItems: 'start' }}>
        {/* INTERACTIVE 2D/2.5D VECTOR MAP CANVAS */}
        <div className="panel" style={{ padding: 18, position: 'relative' }}>
          <div className="panel-head">
            <div>
              <h3>Vidudhi Campus Living Quadrangle</h3>
              <p>Click any block, dining hall, or utility hub to inspect live occupancy and operational details</p>
            </div>
          </div>

          <div
            style={{
              width: '100%',
              height: 480,
              background: 'radial-gradient(circle at 50% 50%, var(--surface-2) 0%, var(--bg-alt) 100%)',
              border: '2px solid var(--line-strong)',
              borderRadius: 14,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.06)',
            }}
          >
            {/* Campus Pathways Grid Lines (SVG) */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              {/* Walking Promenade Pathways */}
              <line x1="18%" y1="22%" x2="50%" y2="20%" stroke="var(--line-strong)" strokeWidth="4" strokeDasharray="6 4" />
              <line x1="50%" y1="20%" x2="80%" y2="24%" stroke="var(--line-strong)" strokeWidth="4" strokeDasharray="6 4" />
              <line x1="18%" y1="22%" x2="28%" y2="38%" stroke="var(--line-strong)" strokeWidth="4" />
              <line x1="28%" y1="38%" x2="42%" y2="55%" stroke="var(--line-strong)" strokeWidth="5" />
              <line x1="50%" y1="20%" x2="62%" y2="44%" stroke="var(--line-strong)" strokeWidth="4" />
              <line x1="62%" y1="44%" x2="42%" y2="55%" stroke="var(--line-strong)" strokeWidth="4" />
              <line x1="42%" y1="55%" x2="22%" y2="72%" stroke="var(--line-strong)" strokeWidth="5" />
              <line x1="42%" y1="55%" x2="74%" y2="65%" stroke="var(--line-strong)" strokeWidth="5" />
              <line x1="42%" y1="55%" x2="48%" y2="88%" stroke="var(--line-strong)" strokeWidth="6" />

              {/* Central Courtyard Greenery Patch */}
              <circle cx="50%" cy="42%" r="35" fill="rgba(124, 252, 0, 0.08)" stroke="rgba(124, 252, 0, 0.3)" strokeWidth="2" strokeDasharray="4 4" />
              <text x="50%" y="43%" textAnchor="middle" fill="var(--ink-faint)" fontSize="11" fontWeight="600">
                Central Lawn Quad
              </text>
            </svg>

            {/* Clickable Interactive Nodes */}
            {filteredNodes.map((node) => {
              const Icon = TYPE_ICONS[node.type] || Building2
              const isSelected = selectedNode?.id === node.id
              const color = TYPE_COLORS[node.type] || '#059669'

              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node)}
                  style={{
                    position: 'absolute',
                    left: `${node.coords.x}%`,
                    top: `${node.coords.y}%`,
                    transform: 'translate(-50%, -50%)',
                    background: isSelected ? 'var(--accent)' : 'var(--surface)',
                    color: isSelected ? 'var(--accent-ink)' : 'var(--ink)',
                    border: `2px solid ${isSelected ? 'var(--accent-border)' : color}`,
                    borderRadius: 12,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 4px rgba(124, 252, 0, 0.35), var(--shadow-lift)' : 'var(--shadow-tag)',
                    zIndex: isSelected ? 10 : 2,
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  title={node.name}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: isSelected ? 'rgba(0,0,0,0.1)' : `${color}18`,
                      color: isSelected ? 'var(--accent-ink)' : color,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{node.code}</div>
                    <div style={{ fontSize: 10, opacity: 0.8, whiteSpace: 'nowrap' }}>{node.status}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* DETAILS SIDEBAR FOR SELECTED FACILITY */}
        {selectedNode ? (
          <div className="panel" style={{ border: '2px solid var(--accent-border)' }}>
            <div className="panel-head">
              <div>
                <span className="badge badge-info" style={{ marginBottom: 6 }}>
                  {selectedNode.type}
                </span>
                <h3>{selectedNode.name}</h3>
                <p className="mono">Code: {selectedNode.code}</p>
              </div>
              <Badge tone="ok">{selectedNode.status}</Badge>
            </div>

            <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5, marginBottom: 16 }}>
              {selectedNode.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {selectedNode.capacity && (
                <div className="card" style={{ padding: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                    Capacity / Beds
                  </span>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{selectedNode.capacity} Units</div>
                </div>
              )}

              {selectedNode.occupancy && (
                <div className="card" style={{ padding: 12 }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                    Live Occupancy
                  </span>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent-border)' }}>
                    {selectedNode.occupancy}
                  </div>
                </div>
              )}

              {selectedNode.timings && (
                <div className="card" style={{ padding: 12, gridColumn: 'span 2' }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                    Operational Hours
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={13} /> {selectedNode.timings}
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6 }}>
                Facility In-Charge &amp; Emergency Lead
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedNode.supervisor || 'Campus Operations Desk'}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Ext: 1104</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Info size={32} color="var(--ink-faint)" style={{ margin: '0 auto 10px' }} />
            <h4>Select a Campus Node</h4>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
              Click any block or facility marker on the digital map to inspect detailed status and evacuation guidance.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
