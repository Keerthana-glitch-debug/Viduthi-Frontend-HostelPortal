import { createSlice } from '@reduxjs/toolkit'
import { initialSosAlerts } from '../../data/seedData'

function readOfflineQueue() {
  try {
    const raw = window.localStorage.getItem('vidudhi:offline_sos_queue')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeOfflineQueue(queue) {
  try {
    window.localStorage.setItem('vidudhi:offline_sos_queue', JSON.stringify(queue))
  } catch {
    /* no-op */
  }
}

const initialState = {
  alerts: initialSosAlerts,
  offlineQueue: readOfflineQueue(),
}

const sosSlice = createSlice({
  name: 'sos',
  initialState,
  reducers: {
    triggerSosAlert: (state, action) => {
      const { studentName, studentRoll, roomNumber, block, alertType, isOffline } = action.payload
      const newAlert = {
        id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: studentName || 'Keerthana G.',
        studentRoll: studentRoll || '24104031',
        roomNumber: roomNumber || 'A-101',
        block: block || 'A Block',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        alertType: alertType || 'Emergency Assistance Required',
        status: isOffline ? 'Queued (Offline)' : 'Active Distress Beacon',
        dispatchedTo: null,
        notes: isOffline ? 'Recorded in offline mode. Queued for transmission.' : 'Live beacon broadcasted to Warden Command Center.',
      }

      state.alerts.unshift(newAlert)

      if (isOffline) {
        state.offlineQueue.push(newAlert)
        writeOfflineQueue(state.offlineQueue)
      }
    },
    syncOfflineSosQueue: (state) => {
      if (state.offlineQueue.length > 0) {
        state.offlineQueue.forEach((queued) => {
          const target = state.alerts.find((a) => a.id === queued.id)
          if (target) {
            target.status = 'Active Distress Beacon'
            target.notes = 'Synchronized from local storage queue upon network reconnection.'
          }
        })
        state.offlineQueue = []
        writeOfflineQueue([])
      }
    },
    dispatchPatrol: (state, action) => {
      const { id, unitName, notes } = action.payload
      const alert = state.alerts.find((a) => a.id === id)
      if (alert) {
        alert.status = 'Patrol Dispatched'
        alert.dispatchedTo = unitName || 'Campus Rapid Response Patrol #2'
        alert.notes = notes || 'Patrol unit en route to resident room.'
      }
    },
    resolveSosAlert: (state, action) => {
      const { id, resolutionNotes } = action.payload
      const alert = state.alerts.find((a) => a.id === id)
      if (alert) {
        alert.status = 'Resolved'
        alert.notes = resolutionNotes || 'Assistance provided and confirmed secure by warden.'
      }
    },
  },
})

export const {
  triggerSosAlert,
  syncOfflineSosQueue,
  dispatchPatrol,
  resolveSosAlert,
} = sosSlice.actions

export const selectSosAlerts = (state) => state.sos.alerts
export const selectOfflineQueue = (state) => state.sos.offlineQueue
export const selectActiveSosCount = (state) =>
  state.sos.alerts.filter((a) => a.status === 'Active Distress Beacon' || a.status === 'Patrol Dispatched').length

export default sosSlice.reducer
