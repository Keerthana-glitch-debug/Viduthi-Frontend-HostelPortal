// src/api/client.js — unified HTTP client for Vidudhi Hostel Resident Portal backend
// Strictly authenticates requests with JWT Bearer tokens and propagates genuine server errors

// Dynamic Base URL resolver:
// In deployed environments (Render, Cloud, mobile web) or production builds,
// requests must target relative '/api' to avoid localhost connection failures.
function resolveBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL
  if (typeof window !== 'undefined' && window.location) {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (!isLocalhost && (envUrl?.includes('localhost') || envUrl?.includes('127.0.0.1'))) {
      return '/api'
    }
  }
  return envUrl || '/api'
}

const BASE_URL = resolveBaseUrl()

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
    const err = new Error('Cannot connect to backend server. Please check your network or server status.')
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
