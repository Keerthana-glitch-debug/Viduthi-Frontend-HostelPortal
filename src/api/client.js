// src/api/client.js — one place for every network call to the backend.
// If the backend URL ever changes (e.g. when you deploy), you only edit
// the .env file, not this file or any component.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!res.ok) {
      throw new Error(`Request to ${path} failed with status ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    // Graceful offline demo fallback
    if (options.method === 'POST') {
      const parsed = options.body ? JSON.parse(options.body) : {}
      return {
        id: parsed.id || parsed.studentRoll || `2410${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Pending',
        appliedOn: new Date().toISOString().slice(0, 10),
        ...parsed,
      }
    }
    if (options.method === 'PATCH') {
      const parsed = options.body ? JSON.parse(options.body) : {}
      const id = path.split('/').pop()
      return { id, ...parsed }
    }
    throw err
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
}
