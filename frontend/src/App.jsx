import { useEffect, useMemo, useRef, useState } from 'react'
import { api, WS_URL } from './services/api'
import NavBar from './components/NavBar'
import MetricsCards from './components/MetricsCards'
import FeedbackForm from './components/FeedbackForm'
import DistributionChart from './components/DistributionChart'
import TrendChart from './components/TrendChart'
import LiveFeed from './components/LiveFeed'
import AlertsPanel from './components/AlertsPanel'
import HomePage from './pages/HomePage'
import FeedbackPage from './pages/FeedbackPage'
import DashboardPage from './pages/DashboardPage'
import AlertsPage from './pages/AlertsPage'

const emptyDashboard = {
  distribution: { positive: 0, negative: 0, neutral: 0 },
  aggregate: { hours: 24, series: [] },
  feedbacks: { items: [] },
  alerts: { items: [] },
  health: { status: 'loading' },
}

export default function App() {
  const [page, setPage] = useState('home')
  const [data, setData] = useState(emptyDashboard)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  const loadDashboard = async () => {
    try {
      const [health, distribution, aggregate, feedbacks, alerts] = await Promise.all([
        api.health().catch(() => ({ status: 'degraded' })),
        api.distribution().catch(() => ({ positive: 0, negative: 0, neutral: 0 })),
        api.aggregate().catch(() => ({ hours: 24, series: [] })),
        api.feedbacks({ limit: 20 }).catch(() => ({ items: [] })),
        api.alerts({ limit: 20 }).catch(() => ({ items: [] })),
      ])
      setData({ health, distribution, aggregate, feedbacks, alerts })
    } catch {
      setData(emptyDashboard)
    }
  }

  useEffect(() => {
    loadDashboard()
    const interval = setInterval(loadDashboard, 5000)
    return () => clearInterval(interval)
  }, [])

  const connectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close()
    }
    
    const socket = new WebSocket(WS_URL)
    socketRef.current = socket
    
    socket.onopen = () => {
      setConnected(true)
      console.log('WebSocket connected')
    }
    
    socket.onclose = () => {
      setConnected(false)
      console.log('WebSocket disconnected')
      // Attempt reconnection after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000)
    }
    
    socket.onerror = (error) => {
      setConnected(false)
      console.error('WebSocket error:', error)
    }
    
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.event === 'connection') {
          console.log('Connected to WebSocket channel:', payload.channel)
        } else if (['new_feedback', 'metrics_refresh', 'alert'].includes(payload.event)) {
          loadDashboard()
        }
        if (payload.event === 'alert' && payload.details) {
          setData((current) => ({
            ...current,
            alerts: { items: [payload.details, ...(current.alerts?.items ?? [])] },
          }))
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }
  }

  useEffect(() => {
    connectWebSocket()
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  const summary = useMemo(() => {
    const distribution = data.distribution ?? { positive: 0, negative: 0, neutral: 0 }
    const total = distribution.positive + distribution.negative + distribution.neutral
    return { total, ...distribution }
  }, [data.distribution])

  const handleSubmitFeedback = async (payload) => {
    try {
      const result = await api.submitFeedback(payload)
      const optimisticFeedback = {
        feedback_id: result.feedback_id ?? `local_${Date.now()}`,
        student_name: payload.student_name,
        hall_ticket: payload.hall_ticket,
        department: payload.department,
        year: payload.year,
        category: payload.category,
        rating: payload.rating,
        feedback_message: payload.feedback_message,
        created_at: new Date().toISOString(),
        ingested_at: null,
        sentiment_label: 'pending',
        confidence_score: null,
        emotion: 'pending',
      }
      setData((current) => ({
        ...current,
        feedbacks: {
          items: [optimisticFeedback, ...(current.feedbacks?.items ?? [])].slice(0, 20),
        },
      }))
      await loadDashboard()
      setPage('dashboard')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  return (
    <div className="app-shell">
      <div className="ambient-glow" aria-hidden="true">
        <div className="blob blue" />
        <div className="blob pink" />
        <div className="blob purple" />
      </div>
      <NavBar page={page} setPage={setPage} connected={connected} health={data.health?.status} />
      <main className="container">
        {page === 'home' && <HomePage summary={summary} onGoFeedback={() => setPage('feedback')} onGoDashboard={() => setPage('dashboard')} />}
        {page === 'feedback' && <FeedbackPage onSubmit={handleSubmitFeedback} />}
        {page === 'dashboard' && (
          <DashboardPage
            summary={summary}
            distribution={data.distribution}
            aggregate={data.aggregate}
            feedbacks={data.feedbacks?.items ?? []}
            alerts={data.alerts?.items ?? []}
          />
        )}
        {page === 'alerts' && <AlertsPage alerts={data.alerts?.items ?? []} />}
      </main>
    </div>
  )
}
