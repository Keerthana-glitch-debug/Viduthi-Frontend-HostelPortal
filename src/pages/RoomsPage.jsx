import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { DoorOpen, Users2, Layers, Wrench } from 'lucide-react'
import RoomGrid from '../components/dashboard/RoomGrid'
import Badge from '../components/common/Badge'
import Modal from '../components/common/Modal'
import { selectAuth } from '../store/slices/authSlice'
import { selectRooms, selectMyRoom, fetchRooms } from '../store/slices/roomsSlice'
import useFilter from '../hooks/useFilter'

function StatMini({ icon: Icon, label, value, tone = 'ok' }) {
  return (
    <div className="stat-card card">
      <div className={`stat-icon tone-${tone}`}><Icon size={19} strokeWidth={2} /></div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value" style={{ fontSize: 17 }}>{value}</span>
      </div>
    </div>
  )
}

export default function RoomsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { role } = useSelector(selectAuth)
  const room = useSelector(selectMyRoom)
  const rooms = useSelector(selectRooms)
  const { query, setQuery, status, setStatus, filtered } = useFilter(rooms, ['roomNumber', 'block', 'roomType'])

  useEffect(() => {
    dispatch(fetchRooms())
  }, [dispatch])

  const selected = roomId ? rooms.find((r) => String(r.roomId) === roomId) : null

  if (role !== 'admin') {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <span className="eyebrow">Accommodation</span>
            <h1>My Room</h1>
          </div>
        </div>

        <div className="two-col">
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Room {room.roomNumber}</h3>
                <p>{room.block} · Floor {room.floor}</p>
              </div>
              <Badge>{room.status}</Badge>
            </div>
            <div className="stat-grid" style={{ marginBottom: 18 }}>
              <StatMini icon={DoorOpen} label="Room type" value={room.roomType} tone="brass" />
              <StatMini icon={Users2} label="Occupancy" value={`${room.occupied}/${room.capacity}`} tone="ok" />
              <StatMini icon={Layers} label="Floor" value={room.floor} tone="info" />
            </div>
            <div className="entity-card-meta">
              For any maintenance issue in this room, raise a complaint from the Complaints tab
              and the facilities team will be notified directly.
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Roommates</h3>
                <p>{room.roommates.length} of {room.capacity - 1} bed(s) shared</p>
              </div>
            </div>
            <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
              {room.roommates.map((mate) => (
                <div className="entity-card card" key={mate}>
                  <div className="entity-card-head"><h4>{mate}</h4></div>
                  <span className="entity-card-id mono">Room {room.roomNumber}</span>
                </div>
              ))}
              {room.roommates.length === 0 && <p style={{ fontSize: 13 }}>You currently have this room to yourself.</p>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin view
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Accommodation</span>
          <h1>Rooms &amp; Occupancy</h1>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div><h3>Block map</h3><p>Click any room for full details</p></div>
        </div>
        <RoomGrid rooms={rooms} onSelect={(r) => navigate(`/app/rooms/${r.roomId}`)} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <div><h3>All rooms</h3><p>{filtered.length} of {rooms.length} rooms</p></div>
        </div>
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <input type="text" placeholder="Search room, block, type…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Room</th><th>Block</th><th>Floor</th><th>Type</th><th>Occupancy</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.roomId}>
                  <td className="mono">{r.roomNumber}</td>
                  <td>{r.block}</td>
                  <td>{r.floor}</td>
                  <td>{r.roomType}</td>
                  <td>{r.occupied}/{r.capacity}</td>
                  <td><Badge>{r.status}</Badge></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => navigate(`/app/rooms/${r.roomId}`)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Modal title={selected.roomNumber} subtitle={`${selected.block} · Floor ${selected.floor} · ${selected.roomType}`} onClose={() => navigate('/app/rooms')}>
          <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <StatMini icon={Users2} label="Occupancy" value={`${selected.occupied}/${selected.capacity}`} />
            <StatMini icon={Wrench} label="Status" value={selected.status} />
          </div>
          <div>
            <label>Residents</label>
            {selected.roommates.length ? (
              <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
                {selected.roommates.map((m) => <div className="entity-card card" key={m}><h4 style={{ fontSize: 13.5 }}>{m}</h4></div>)}
              </div>
            ) : <p style={{ fontSize: 13 }}>No residents currently assigned.</p>}
          </div>
        </Modal>
      )}
    </div>
  )
}
