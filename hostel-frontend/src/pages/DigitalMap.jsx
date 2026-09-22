import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Compass, MapPin, ZoomIn, ZoomOut, RotateCcw, UtensilsCrossed,
  Dumbbell, ShieldAlert, ShieldCheck, Navigation, Home, Sparkles,
  CheckCircle2, Users, Clock, Info, BookOpen
} from 'lucide-react'
import { initialCampusMapNodes } from '../data/seedData'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import Badge from '../components/common/Badge'
import './DigitalMap.css'

const BADGE_COLORS = {
  MESS: { bg: '#F59E0B', text: '#FFFFFF', border: '#D97706', chipBg: '#FEF3C7', chipInk: '#92400E', label: 'Dining Mess' },
  G: { bg: '#10B981', text: '#FFFFFF', border: '#059669', chipBg: '#D1FAE5', chipInk: '#065F46', label: 'Gym & Sports' },
  III: { bg: '#F43F5E', text: '#FFFFFF', border: '#E11D48', chipBg: '#FFE4E6', chipInk: '#9F1239', label: '3rd Year Hostel' },
  RR: { bg: '#06B6D4', text: '#FFFFFF', border: '#0891B2', chipBg: '#CFFAFE', chipInk: '#155E75', label: 'Common Restroom' },
  I: { bg: '#3B82F6', text: '#FFFFFF', border: '#2563EB', chipBg: '#DBEAFE', chipInk: '#1E40AF', label: '1st Year Hostel' },
  II: { bg: '#3B82F6', text: '#FFFFFF', border: '#2563EB', chipBg: '#DBEAFE', chipInk: '#1E40AF', label: '2nd Year Hostel' },
  S: { bg: '#8B5CF6', text: '#FFFFFF', border: '#7C3AED', chipBg: '#EDE9FE', chipInk: '#5B21B6', label: 'Study Hall' },
  ARTS: { bg: '#84CC16', text: '#FFFFFF', border: '#65A30D', chipBg: '#ECFCCB', chipInk: '#3F6212', label: 'Arts Wing' },
  IV: { bg: '#6366F1', text: '#FFFFFF', border: '#4F46E5', chipBg: '#E0E7FF', chipInk: '#3730A3', label: '4th Year Hostel' },
  R: { bg: '#EF4444', text: '#FFFFFF', border: '#DC2626', chipBg: '#FEE2E2', chipInk: '#991B1B', label: 'Reception Gate' },
}

export default function DigitalMap() {
  const navigate = useNavigate()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)

  // Default to Keerthana's Block III (Room B-37)
  const [selectedNode, setSelectedNode] = useState(
    initialCampusMapNodes.find((n) => n.id === 'block-3') || initialCampusMapNodes[0]
  )

  // Zoom & Pan state for smooth mobile/desktop navigation
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.4, +(z + 0.35).toFixed(2)))
  const handleZoomOut = () => {
    setZoomLevel((z) => {
      const next = Math.max(1, +(z - 0.35).toFixed(2))
      if (next === 1) setPanOffset({ x: 0, y: 0 })
      return next
    })
  }
  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  // Touch and mouse drag handlers for panning
  const handlePointerDown = (e) => {
    if (zoomLevel <= 1) return
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y }
  }

  const handlePointerMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return
    const maxPan = (zoomLevel - 1) * 160
    const newX = Math.max(-maxPan, Math.min(maxPan, e.clientX - dragStartRef.current.x))
    const newY = Math.max(-maxPan, Math.min(maxPan, e.clientY - dragStartRef.current.y))
    setPanOffset({ x: newX, y: newY })
  }

  const handlePointerUp = () => setIsDragging(false)

  const activeColor = BADGE_COLORS[selectedNode.code] || {
    bg: '#10B981', text: '#FFFFFF', border: '#059669', chipBg: '#DCFCE7', chipInk: '#15803D'
  }

  return (
    <div className="page digital-map-page">
      {/* Clean Page Header - No Multiple Mini Tabs! */}
      <div className="digital-map-header">
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803D' }}>
            <Compass size={14} /> National Engineering College · Campus Grounds
          </span>
          <h1>Interactive Digital Hostel Map</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-ok">
            <span className="badge-dot" /> 11 Facilities Active
          </span>
        </div>
      </div>

      {/* Auto Layout Quick-Select Strip (Effortless 1-Tap Mobile Navigation) */}
      <div className="map-quick-strip" role="tablist" aria-label="Campus Buildings">
        {initialCampusMapNodes.map((node) => {
          const isSelected = selectedNode.id === node.id
          const colors = BADGE_COLORS[node.code] || activeColor

          return (
            <button
              key={node.id}
              type="button"
              className={`map-chip-btn ${isSelected ? 'active' : ''}`}
              style={{
                '--chip-color': colors.border,
                '--chip-bg': colors.chipBg,
                '--chip-ink': colors.chipInk,
              }}
              onClick={() => setSelectedNode(node)}
            >
              <span className="map-chip-badge" style={{ background: colors.bg }}>
                {node.code}
              </span>
              <span>
                {node.id === 'block-3' ? '3rd Year (B-37)' : node.id === 'sports-arena' ? 'Sports Arena' : node.name.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Main Auto Layout Grid: Map Canvas + Building Inspector */}
      <div className="map-auto-grid">
        {/* Map Viewport Card */}
        <div className="map-canvas-card">
          <div className="map-canvas-topbar">
            <div className="map-canvas-title">
              <MapPin size={16} color={activeColor.border} />
              <span>Campus Quadrangle &amp; Residence Grounds</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
              Tap building or chip to inspect
            </span>
          </div>

          {/* Interactive Map Viewport Frame */}
          <div
            className="map-viewport-frame"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <div
              className="map-interactive-stage"
              style={{
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              }}
            >
              {/* Base High-Resolution Campus Aerial View */}
              <img
                src="/campus-satellite.png"
                alt="Vidudhi Campus Aerial Map"
                className="map-base-satellite"
                draggable={false}
              />

              {/* Exact SVG Overlay for Building Polygons & Glowing Outlines */}
              <svg
                viewBox="0 0 513 427"
                className="map-svg-overlay"
                preserveAspectRatio="none"
              >
                {initialCampusMapNodes.map((node) => {
                  const isSelected = selectedNode.id === node.id
                  const nodeColors = BADGE_COLORS[node.code] || activeColor

                  return (
                    <path
                      key={node.id}
                      d={node.polygon}
                      className={`building-polygon ${isSelected ? 'active' : ''}`}
                      style={{ '--active-stroke': nodeColors.bg }}
                      onClick={() => setSelectedNode(node)}
                    >
                      <title>{node.name} ({node.code})</title>
                    </path>
                  )
                })}
              </svg>

              {/* Interactive Badge Pins Positioned on Exact Coordinates */}
              {initialCampusMapNodes.map((node) => {
                const isSelected = selectedNode.id === node.id
                const nodeColors = BADGE_COLORS[node.code] || activeColor

                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`map-hotspot-pin ${isSelected ? 'active' : ''}`}
                    style={{
                      left: `${node.coords.x}%`,
                      top: `${node.coords.y}%`,
                      background: nodeColors.bg,
                    }}
                    onClick={() => setSelectedNode(node)}
                    title={`Click to view ${node.name}`}
                  >
                    <span>{node.code}</span>
                  </button>
                )
              })}
            </div>

            {/* Floating Zoom & Reset Dock */}
            <div className="map-zoom-dock" aria-label="Zoom controls">
              <button
                type="button"
                className="map-zoom-btn"
                onClick={handleZoomIn}
                title="Zoom In"
                disabled={zoomLevel >= 2.4}
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                className="map-zoom-btn"
                onClick={handleZoomOut}
                title="Zoom Out"
                disabled={zoomLevel <= 1}
              >
                <ZoomOut size={16} />
              </button>
              {zoomLevel > 1 && (
                <button
                  type="button"
                  className="map-zoom-btn"
                  onClick={handleResetZoom}
                  title="Reset View"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Clean Legend Bar */}
          <div className="map-legend-bar">
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>Legend:</span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#F59E0B' }} />
              <strong>MESS</strong>: Dining
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#10B981' }} />
              <strong>G</strong>: Gym
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#F43F5E' }} />
              <strong>III</strong>: 3rd Yr (B-37)
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#06B6D4' }} />
              <strong>RR</strong>: Restrooms
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#3B82F6' }} />
              <strong>I, II</strong>: Hostels
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#8B5CF6' }} />
              <strong>S</strong>: Study Hall
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#84CC16' }} />
              <strong>ARTS</strong>: Cultural
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#F59E0B' }} />
              <strong>G</strong>: Sports
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#6366F1' }} />
              <strong>IV</strong>: 4th Yr
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#EF4444' }} />
              <strong>R</strong>: Gate
            </span>
          </div>
        </div>

        {/* Auto Layout Building Inspector Card */}
        <div className="map-inspector-card" style={{ borderColor: activeColor.border }}>
          <div className="map-inspector-head">
            <div>
              <div className="map-inspector-title">
                <span className="map-inspector-code" style={{ background: activeColor.bg }}>
                  {selectedNode.code}
                </span>
                <span className="badge badge-info" style={{ fontSize: '0.78rem' }}>
                  {selectedNode.type}
                </span>
              </div>
              <h2 className="map-inspector-name">{selectedNode.name}</h2>
            </div>
            <Badge tone="ok">{selectedNode.status || 'Active'}</Badge>
          </div>

          <p className="map-inspector-desc">{selectedNode.description}</p>

          {/* Key Parameters Meta Grid */}
          <div className="map-meta-grid">
            {selectedNode.studentYear ? (
              <div className="map-meta-item">
                <span className="map-meta-label">Resident Batch</span>
                <span className="map-meta-value" style={{ color: '#2563EB' }}>
                  {selectedNode.studentYear}
                </span>
              </div>
            ) : (
              <div className="map-meta-item">
                <span className="map-meta-label">Facility Type</span>
                <span className="map-meta-value">{selectedNode.type} Zone</span>
              </div>
            )}

            <div className="map-meta-item">
              <span className="map-meta-label">In-Charge / Supervisor</span>
              <span className="map-meta-value">{selectedNode.supervisor || 'Jeyanthi (Warden)'}</span>
            </div>

            <div className="map-meta-item">
              <span className="map-meta-label">Designed Capacity</span>
              <span className="map-meta-value">{selectedNode.capacity || 'N/A'} Persons</span>
            </div>

            <div className="map-meta-item">
              <span className="map-meta-label">Timings / Clearance</span>
              <span className="map-meta-value">{selectedNode.timings || '24/7 Open'}</span>
            </div>
          </div>

          {/* Live Occupancy Rate */}
          {selectedNode.occupancy && (
            <div className="map-occupancy-wrap">
              <div className="map-occupancy-header">
                <span style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Current Occupancy</span>
                <strong style={{ color: 'var(--ink)' }}>{selectedNode.occupancy}</strong>
              </div>
              <div className="map-occupancy-track">
                <div
                  className="map-occupancy-fill"
                  style={{
                    width: selectedNode.occupancy,
                    background: activeColor.bg,
                  }}
                />
              </div>
            </div>
          )}

          {/* Contextual Action Button */}
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            {selectedNode.code === 'MESS' ? (
              <button
                type="button"
                className="btn btn-primary map-action-btn"
                onClick={() => navigate('/app/mess')}
              >
                <UtensilsCrossed size={16} /> Open Annapoorna 7-Day Mess Menu
              </button>
            ) : selectedNode.code === 'G' && selectedNode.id === 'gym-facility' ? (
              <button
                type="button"
                className="btn btn-primary map-action-btn"
                onClick={() => navigate('/app/facilities')}
              >
                <Dumbbell size={16} /> View Gym Machinery &amp; Fitness
              </button>
            ) : selectedNode.code === 'G' && selectedNode.id === 'sports-arena' ? (
              <button
                type="button"
                className="btn btn-primary map-action-btn"
                onClick={() => navigate('/app/facilities')}
              >
                <Dumbbell size={16} /> View Sports Gear &amp; Inventory
              </button>
            ) : selectedNode.code === 'III' ? (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1.5px solid #10B981',
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 12.5,
                  color: '#065F46',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                }}
              >
                <ShieldCheck size={18} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>Keerthana's Registered Residence:</strong>
                  <div>Room B-37 is located on 2nd Floor, Block B (3rd Year Wing).</div>
                </div>
              </div>
            ) : selectedNode.code === 'R' ? (
              <button
                type="button"
                className="btn btn-primary map-action-btn"
                onClick={() => navigate('/app/leave')}
              >
                <ShieldAlert size={16} /> Digital Gate Pass &amp; Outpass Kiosk
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary map-action-btn"
                onClick={() => alert(`Directions mapped to ${selectedNode.name} from Main Reception R.`)}
              >
                <Navigation size={16} /> Walking Route from Gate R
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
