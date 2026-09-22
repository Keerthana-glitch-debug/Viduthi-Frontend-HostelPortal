import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  HelpCircle, Search, Plus, CheckCircle2, ShieldCheck,
  Tag, MapPin, Calendar, Camera, Upload, X, ArrowRight,
} from 'lucide-react'
import { selectLostFoundItems, reportItem, claimItem, resolveClaim } from '../store/slices/lostFoundSlice'
import { selectAuth, selectUser } from '../store/slices/authSlice'
import { pushToast } from '../store/slices/uiSlice'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'

const CATEGORIES = ['All', 'Electronics', 'Keys', 'ID Cards', 'Books', 'Wearables', 'Other']

export default function LostAndFound() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const items = useSelector(selectLostFoundItems)

  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All') // 'All' | 'Lost' | 'Found'

  // Modals
  const [showReportModal, setShowReportModal] = useState(false)
  const [inspectingItem, setInspectingItem] = useState(null)
  const [claimingItem, setClaimingItem] = useState(null)
  const [claimProof, setClaimProof] = useState('')

  // Report Form State
  const [reportType, setReportType] = useState('Found')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Electronics')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleReportSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !location.trim()) {
      dispatch(pushToast('Please complete item title and location.', 'warn'))
      return
    }

    dispatch(
      reportItem({
        type: reportType,
        title,
        category,
        location,
        description,
        contact: contact || user.phone || '+91 98401 23456',
        reportedBy: user.name,
        imageUrl: imagePreview,
      })
    )

    dispatch(pushToast(`New ${reportType.toLowerCase()} item published to the campus board.`, 'ok'))
    setShowReportModal(false)
    setTitle('')
    setLocation('')
    setDescription('')
    setImagePreview('')
  }

  const handleClaimSubmit = (e) => {
    e.preventDefault()
    if (!claimProof.trim()) {
      dispatch(pushToast('Please specify a distinguishing feature or verification proof.', 'warn'))
      return
    }

    dispatch(
      claimItem({
        id: claimingItem.id,
        studentName: user.name,
        studentRoll: user.rollNo || '24104031',
        proofDescription: claimProof,
      })
    )

    dispatch(pushToast('Claim submitted for Chief Warden verification.', 'ok'))
    setClaimingItem(null)
    setClaimProof('')
  }

  const handleWardenResolve = (id, approved) => {
    dispatch(resolveClaim({ id, approved }))
    dispatch(pushToast(approved ? 'Claim approved — marked as Returned to Student.' : 'Claim rejected — reopened on board.', 'info'))
    setInspectingItem(null)
  }

  const filtered = items.filter((item) => {
    if (typeFilter !== 'All' && item.type !== typeFilter) return false
    if (activeCategory !== 'All' && item.category !== activeCategory) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return item.title.toLowerCase().includes(q) || item.location.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Campus Property Recovery</span>
          <h1>Lost &amp; Found Directory</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowReportModal(true)}>
            <Plus size={15} /> Report Lost / Found Item
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="panel">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search items, keywords, or campus locations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--line)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'Found', 'Lost'].map((t) => (
              <button
                key={t}
                type="button"
                className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Item Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map((item) => {
          const isLost = item.type === 'Lost'
          return (
            <div
              key={item.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 14,
                overflow: 'hidden',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
              }}
            >
              {item.imageUrl ? (
                <div style={{ height: 160, overflow: 'hidden', background: 'var(--bg-alt)' }}>
                  <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ height: 90, background: isLost ? '#FEF2F2' : 'var(--accent-soft)', display: 'grid', placeItems: 'center' }}>
                  <HelpCircle size={32} color={isLost ? '#DC2626' : 'var(--accent-border)'} />
                </div>
              )}

              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${isLost ? 'badge-bad' : 'badge-ok'}`}>
                    {item.type}
                  </span>
                  <span className="badge badge-info" style={{ fontSize: 11 }}>
                    {item.category}
                  </span>
                </div>

                <h4 style={{ fontSize: 15, fontWeight: 700, margin: '2px 0' }}>{item.title}</h4>
                <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.4, margin: 0, flex: 1 }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={12} /> {item.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={12} /> {item.date}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 6 }}>
                  <Badge tone={item.status === 'Claimed' ? 'ok' : item.status === 'Claim Pending' ? 'warn' : 'info'}>
                    {item.status}
                  </Badge>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setInspectingItem(item)}
                    >
                      Details
                    </button>
                    {item.type === 'Found' && item.status === 'Open' && role !== 'warden' && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setClaimingItem(item)}
                      >
                        Claim Item
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* REPORT LOST/FOUND MODAL */}
      {showReportModal && (
        <Modal
          title="Report an Article"
          subtitle="Publish a lost or found campus possession"
          onClose={() => setShowReportModal(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowReportModal(false)}>
                Cancel
              </button>
              <button type="submit" form="report-item-form" className="btn btn-primary">
                Submit Notice
              </button>
            </div>
          }
        >
          <form id="report-item-form" onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className={`btn btn-sm ${reportType === 'Found' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setReportType('Found')}
              >
                I Found An Item
              </button>
              <button
                type="button"
                className={`btn btn-sm ${reportType === 'Lost' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flex: 1 }}
                onClick={() => setReportType('Lost')}
              >
                I Lost An Item
              </button>
            </div>

            <div>
              <label>Item Name / Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Casio fx-991CW Calculator, Blue Water Bottle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label>Location Discovered / Lost</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mess Hall Table 4"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label>Detailed Description</label>
              <textarea
                rows={2}
                placeholder="Provide distinctive markings, color, brand, or condition..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label>Contact Phone / Room Number</label>
              <input
                type="text"
                placeholder={user.phone || '+91 98401 23456'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            <div>
              <label>Attach Photo Preview (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div style={{ marginTop: 8, height: 100, borderRadius: 8, overflow: 'hidden' }}>
                  <img src={imagePreview} alt="Preview" style={{ height: '100%', objectFit: 'contain' }} />
                </div>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* CLAIM ITEM MODAL */}
      {claimingItem && (
        <Modal
          title={`Claim: ${claimingItem.title}`}
          subtitle={`Found at: ${claimingItem.location}`}
          onClose={() => setClaimingItem(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setClaimingItem(null)}>
                Cancel
              </button>
              <button type="submit" form="claim-form" className="btn btn-primary">
                Submit Claim Proof
              </button>
            </div>
          }
        >
          <form id="claim-form" onSubmit={handleClaimSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontSize: 13, color: 'var(--ink)' }}>
              To claim this item, please provide a distinctive proof of ownership (e.g. passcode, specific sticker, serial number, or exact contents inside).
            </p>
            <div>
              <label>Distinguishing Feature / Ownership Proof</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. The calculator has a green Batman sticker on the battery cover..."
                value={claimProof}
                onChange={(e) => setClaimProof(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* DETAILS / WARDEN INSPECTION MODAL */}
      {inspectingItem && (
        <Modal
          title={inspectingItem.title}
          subtitle={`Category: ${inspectingItem.category} · Status: ${inspectingItem.status}`}
          onClose={() => setInspectingItem(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setInspectingItem(null)}>
                Close
              </button>
              {role === 'warden' && inspectingItem.status === 'Claim Pending' && (
                <>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleWardenResolve(inspectingItem.id, false)}
                  >
                    Reject Claim
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleWardenResolve(inspectingItem.id, true)}
                  >
                    Approve &amp; Return to Student
                  </button>
                </>
              )}
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {inspectingItem.imageUrl && (
              <div style={{ height: 180, borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                <img src={inspectingItem.imageUrl} alt={inspectingItem.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--surface-2)', padding: 12, borderRadius: 8 }}>
              <div><span className="profile-detail-label">Reported By:</span> <strong>{inspectingItem.reportedBy}</strong></div>
              <div><span className="profile-detail-label">Location:</span> <strong>{inspectingItem.location}</strong></div>
              <div><span className="profile-detail-label">Date:</span> <strong>{inspectingItem.date}</strong></div>
              <div><span className="profile-detail-label">Contact:</span> <strong>{inspectingItem.contact}</strong></div>
            </div>
            <div>
              <span className="profile-detail-label">Description:</span>
              <p style={{ marginTop: 4, fontSize: 13.5, color: 'var(--ink)' }}>{inspectingItem.description}</p>
            </div>
            {inspectingItem.claimProof && (
              <div style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-border)', textTransform: 'uppercase' }}>
                  Student Claim Proof Submitted by {inspectingItem.claimedBy}:
                </span>
                <p style={{ fontSize: 13, color: 'var(--ink)', marginTop: 4 }}>"{inspectingItem.claimProof}"</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
