// src/api/client.js — unified HTTP client for Vidudhi Hostel Resident Portal backend
// Strictly authenticates requests with JWT Bearer tokens and propagates genuine server errors

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getAuthHeader() {
  try {
    const token = window.localStorage.getItem('vidudhi:jwt_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

async function request(path, options = {}) {
  const authHeader = getAuthHeader()
  let res

  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      },
    })
  } catch (networkError) {
    // Network failure (server is offline or unreachable)
    const err = new Error('Cannot connect to backend server at http://localhost:5000. Please ensure the backend is running.')
    err.isNetworkError = true
    throw err
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const errorMessage = errorData.message || `Server request to ${path} failed with status ${res.status}`
    const error = new Error(errorMessage)
    error.status = res.status
    error.data = errorData
    throw error
  }

  return await res.json()
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export default api
