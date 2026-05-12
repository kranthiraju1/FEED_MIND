const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(detail || `Request failed with status ${response.status}`)
  }
  return response.json()
}

export const api = {
  health: () => request('/api/health'),
  submitFeedback: (payload) => request('/api/feedback', { method: 'POST', body: JSON.stringify(payload) }),
  feedbacks: (params = {}) => {
    const search = new URLSearchParams(params)
    return request(`/api/feedbacks?${search.toString()}`)
  },
  distribution: () => request('/api/sentiment/distribution'),
  aggregate: () => request('/api/sentiment/aggregate'),
  alerts: () => request('/api/alerts'),
  notifications: (params = {}) => {
    const search = new URLSearchParams(params)
    return request(`/api/notifications?${search.toString()}`)
  },
}

export const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws/feedmind'
