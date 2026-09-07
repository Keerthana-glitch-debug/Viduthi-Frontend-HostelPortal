import { useNavigate } from 'react-router-dom'
import { Users2 } from 'lucide-react'
import { blocks } from '../../data/seedData'
import Badge from '../common/Badge'
import './RoomGrid.css'

export default function RoomGrid({ rooms, onSelect }) {
  const navigate = useNavigate()

  const handleClick = (room) => {
    if (onSelect) onSelect(room)
    else navigate(`/app/rooms/${room.roomId}`)
  }

  return (
    <div className="room-grid-wrap">
      {blocks.map((block) => {
        const blockRooms = rooms.filter((r) => r.block === block)
        if (!blockRooms.length) return null
        return (
          <div key={block} className="room-grid-block">
            <span className="room-grid-block-label mono">{block}</span>
            <div className="room-card-grid">
              {blockRooms.map((room) => (
                <button
                  key={room.roomId}
                  type="button"
                  className="room-card-box"
                  onClick={() => handleClick(room)}
                >
                  <div className="room-card-head">
                    <span className="room-card-number mono">{room.roomNumber}</span>
                    <Badge>{room.status}</Badge>
                  </div>

                  <div className="room-card-type">
                    {room.roomType} · Floor {room.floor}
                  </div>

                  <div className="room-card-occupancy">
                    <div className="room-bed-dots">
                      {Array.from({ length: room.capacity }).map((_, i) => (
                        <span
                          key={i}
                          className={`room-bed-dot ${i < room.occupied ? 'is-occupied' : 'is-empty'}`}
                          title={i < room.occupied ? 'Occupied' : 'Vacant'}
                        />
                      ))}
                    </div>
                    <span className="room-occupancy-text mono">
                      <Users2 size={12} /> {room.occupied}/{room.capacity}
                    </span>
                  </div>

                  <div className="room-card-tenants">
                    {room.roommates && room.roommates.length > 0 ? (
                      <span className="tenants-preview" title={room.roommates.join(', ')}>
                        {room.roommates.join(', ')}
                      </span>
                    ) : (
                      <span className="tenants-empty">Vacant · Ready</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
