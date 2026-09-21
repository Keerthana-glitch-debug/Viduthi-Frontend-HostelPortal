import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  ShieldAlert, Radio, CheckCircle2, User, MapPin, Clock,
  Flame, HeartPulse, Send, AlertTriangle, ShieldCheck,
} from 'lucide-react'
import { selectSosAlerts, dispatchPatrol, resolveSosAlert } from '../store/slices/sosSlice'
import { selectAuth } from '../store/slices/authSlice'
import { pushToast } from '../store/slices/uiSlice'
import Modal from '../components/common/Modal'
import Badge from '../components/common/Badge'

export default function SosMonitor() {
  const dispatch = useDispatch()
  const { role } = useSelector(selectAuth)
  const alerts = useSelector(selectSosAlerts)

  const [dispatchModalAlert, setDispatchModalAlert] = useState(null)
  const [unitName, setUnitName] = useState('Campus Rapid Response Patrol #1')
  const [dispatchNotes, setDispatchNotes] = useState('')

  const [resolveModalAlert, setResolveModalAlert] = useState(null)
  const [resolutionNotes, setResolutionNotes] = useState('')

  if (role !== 'warden') {
    return (
      <div className="page">
        <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <ShieldAlert size={48} color="#DC2626" style={{ margin: '0 auto 16px' }} />
          <h2>Warden Emergency Dispatch Console</h2>
          <p style={{ color: 'var(--ink-soft)', maxWidth: 460, margin: '8px auto 20px' }}>
            Live emergency distress monitoring is restricted exclusively to the Chief Warden and active Security Dispatchers.
          </p>
          <span className="badge badge-bad">Access Level: Warden Role Required</span>
        </div>
      </div>
    )
  }

  const handleDispatchSubmit = (e) => {
    e.preventDefault()
    if (!dispatchModalAlert) return
    dispatch(
      dispatchPatrol({
        id: dispatchModalAlert.id,
        unitName,
        notes: dispatchNotes || 'Patrol unit dispatched to room on immediate response.',
      })
    )
    dispatch(pushToast(`Patrol unit dispatched to Room ${dispatchModalAlert.roomNumber}!`, 'ok'))
    setDispatchModalAlert(null)
    setDispatchNotes('')
  }

  const handleResolveSubmit = (e) => {
    e.preventDefault()
    if (!resolveModalAlert) return
    dispatch(
      resolveSosAlert({
        id: resolveModalAlert.id,
        resolutionNotes: resolutionNotes || 'Assistance confirmed and incident resolved by Warden.',
      })
    )
    dispatch(pushToast(`Alert ${resolveModalAlert.id} marked as resolved.`, 'ok'))
    setResolveModalAlert(null)
    setResolutionNotes('')
  }

  const activeAlerts = alerts.filter((a) => a.status === 'Active Distress Beacon' || a.status === 'Patrol Dispatched' || a.status === 'Queued (Offline)')
  const resolvedAlerts = alerts.filter((a) => a.status === 'Resolved')

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#DC2626' }}>
            <Radio size={14} className="spin-slow" /> Warden Emergency Operations Desk
          </span>
          <h1>Hostel Emergency SOS Monitor</h1>
        </div>
        <div className="page-header-actions">
          <span className={`badge ${activeAlerts.length > 0 ? 'badge-bad' : 'badge-ok'}`}>
            <span className="badge-dot" /> {activeAlerts.length} Active Distress Incidents
          </span>
        </div>
      </div>

      {/* Active Incidents Alert Feed */}
      <div className="panel" style={{ border: activeAlerts.length > 0 ? '2px solid #DC2626' : '1px solid var(--line)' }}>
        <div className="panel-head">
          <div>
            <h3>Active Distress Feeds</h3>
            <p>Immediate live distress calls requiring campus patrol response</p>
          </div>
        </div>

        {activeAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle2 size={36} color="var(--accent-border)" style={{ margin: '0 auto 10px' }} />
            <h4 style={{ margin: 0 }}>All Clear — No Active Emergency Distress Signals</h4>
            <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4 }}>
              Hostel surveillance and security patrol networks are reporting optimal status across Blocks A, B, and C.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeAlerts.map((a) => (
              <div
                key={a.id}
                style={{
                  border: '1.5px solid #DC2626',
                  borderRadius: 12,
                  padding: 16,
                  background: '#FEF2F2',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldAlert size={18} color="#DC2626" />
                    <span style={{ fontWeight: 800, fontSize: 14.5, color: '#991B1B' }}>
                      {a.alertType}
                    </span>
                    <span className="mono" style={{ fontSize: 12, color: '#7F1D1D' }}>
                      #{a.id}
                    </span>
                  </div>
                  <span className="badge badge-bad" style={{ fontSize: 11 }}>
                    {a.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, fontSize: 12.5, color: '#7F1D1D' }}>
                  <div><strong>Student:</strong> {a.studentName} ({a.studentRoll})</div>
                  <div><strong>Location:</strong> Room {a.roomNumber} · {a.block}</div>
                  <div><strong>Reported At:</strong> {a.timestamp}</div>
                </div>

                {a.notes && (
                  <div style={{ fontSize: 12, color: '#991B1B', background: '#FEE2E2', padding: 8, borderRadius: 6 }}>
                    <strong>Dispatch Note:</strong> {a.notes}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                  {a.status !== 'Patrol Dispatched' && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => setDispatchModalAlert(a)}
                    >
                      <Send size={13} /> Dispatch Response Patrol
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    style={{ borderColor: '#DC2626', color: '#DC2626' }}
                    onClick={() => setResolveModalAlert(a)}
                  >
                    <CheckCircle2 size={13} /> Mark Incident Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Resolved Log */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Resolved Emergency Logs</h3>
            <p>Verified post-incident reports and action summaries</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Resident</th>
                <th>Room</th>
                <th>Emergency Type</th>
                <th>Logged Time</th>
                <th>Assigned Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {resolvedAlerts.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  <td><strong>{r.studentName}</strong></td>
                  <td className="mono">{r.roomNumber} ({r.block})</td>
                  <td>{r.alertType}</td>
                  <td className="mono">{r.timestamp}</td>
                  <td>{r.dispatchedTo || 'Clinic Staff'}</td>
                  <td><Badge tone="ok">{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPATCH PATROL MODAL */}
      {dispatchModalAlert && (
        <Modal
          title={`Dispatch Patrol for #${dispatchModalAlert.id}`}
          subtitle={`Room ${dispatchModalAlert.roomNumber} (${dispatchModalAlert.block}) · ${dispatchModalAlert.studentName}`}
          onClose={() => setDispatchModalAlert(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setDispatchModalAlert(null)}>
                Cancel
              </button>
              <button type="submit" form="dispatch-form" className="btn btn-primary">
                Send Patrol Now
              </button>
            </div>
          }
        >
          <form id="dispatch-form" onSubmit={handleDispatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Select Response Unit</label>
              <select value={unitName} onChange={(e) => setUnitName(e.target.value)}>
                <option>Campus Rapid Response Patrol #1</option>
                <option>Campus Rapid Response Patrol #2</option>
                <option>Campus Medical Emergency Ambulance &amp; Paramedic</option>
                <option>Hostel Electrical &amp; Facilities Quick Response Team</option>
              </select>
            </div>
            <div>
              <label>Radio / Dispatch Instructions</label>
              <textarea
                rows={3}
                placeholder="e.g. Proceed directly to Block A 1st floor corridor. Contact resident phone upon arrival."
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* RESOLVE ALERT MODAL */}
      {resolveModalAlert && (
        <Modal
          title={`Resolve Incident #${resolveModalAlert.id}`}
          subtitle={`Resident: ${resolveModalAlert.studentName}`}
          onClose={() => setResolveModalAlert(null)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setResolveModalAlert(null)}>
                Cancel
              </button>
              <button type="submit" form="resolve-form" className="btn btn-primary">
                Confirm Resolution
              </button>
            </div>
          }
        >
          <form id="resolve-form" onSubmit={handleResolveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>Resolution Summary &amp; Action Taken</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Paramedic arrived at 21:20. Student treated for allergic reaction. Cleared safe by doctor."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
