import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api, WS_URL } from './services/api'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import FeedbackPage from './pages/FeedbackPage'
import DashboardPage from './pages/DashboardPage'
import NotificationsPage from './pages/NotificationsPage'
import AdminAlertsPage from './pages/admin/Alerts'
import AdminNotificationsPage from './pages/admin/Notifications'
import LoginPage from './pages/LoginPage'
import AdminRoute from './components/AdminRoute'

const initialDashboard = {
  distribution: { positive: 0, negative: 0, neutral: 0 },
  aggregate: { hours: 24, series: [] },
  feedbacks: { items: [] },
  alerts: { items: [] },
  notifications: { items: [] },
  health: { status: 'loading' },
}

export default function App() {
  const initialPath = window.location.pathname === '/' ? '/home' : window.location.pathname
  const [path, setPath] = useState(initialPath)
  const [data, setData] = useState(initialDashboard)
  const [connected, setConnected] = useState(false)
  const [userRole, setUserRole] = useState(localStorage.getItem('feedmindRole') ?? 'student')
  const [userName, setUserName] = useState(localStorage.getItem('feedmindName') ?? 'Student')
  const socketRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  const loadDashboard = async () => {
    try {
      const [health, distribution, aggregate, feedbacks, alerts, notifications] = await Promise.all([
        api.health().catch(() => ({ status: 'degraded' })),
        api.distribution().catch(() => ({ positive: 0, negative: 0, neutral: 0 })),
        api.aggregate().catch(() => ({ hours: 24, series: [] })),
        api.feedbacks({ limit: 20 }).catch(() => ({ items: [] })),
        api.alerts({ limit: 20 }).catch(() => ({ items: [] })),
        api.notifications({ limit: 20 }).catch(() => ({ items: [] })),
      ])
      setData({ health, distribution, aggregate, feedbacks, alerts, notifications })
    } catch {
      setData(initialDashboard)
    }
  }

  useEffect(() => {
    loadDashboard()
    const interval = setInterval(loadDashboard, 5000)
    return () => clearInterval(interval)
  }, [])

  const navigate = (newPath) => {
    window.history.pushState({}, '', newPath)
    setPath(newPath)
  }

  useEffect(() => {
    const handlePop = () => {
      setPath(window.location.pathname === '/' ? '/home' : window.location.pathname)
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

  const activePath = path === '/' ? '/home' : path

  useEffect(() => {
    if (activePath.startsWith('/admin') && userRole !== 'admin') {
      navigate('/login')
    }
  }, [activePath, userRole])

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
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000)
    }

    socket.onerror = () => {
      setConnected(false)
    }

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.event === 'connection') return
        loadDashboard()
      } catch (err) {
        console.error('WebSocket parse error:', err)
      }
    }
  }

  useEffect(() => {
    connectWebSocket()
    return () => {
      socketRef.current?.close()
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

  const loginUser = (role, name) => {
    localStorage.setItem('feedmindRole', role)
    localStorage.setItem('feedmindName', name)
    setUserRole(role)
    setUserName(name)
    if (role === 'admin') {
      navigate('/admin/alerts')
    } else {
      navigate('/dashboard')
    }
  }

  const logoutUser = () => {
    localStorage.removeItem('feedmindRole')
    localStorage.removeItem('feedmindName')
    setUserRole('student')
    setUserName('Student')
    navigate('/login')
  }

  const handleSubmitFeedback = async (payload) => {
    try {
      const result = await api.submitFeedback(payload)
      const optimisticFeedback = {
        feedback_id: result.feedback_id ?? `local_${Date.now()}`,
        student_name: payload.student_name,
        hall_ticket: payload.hall_ticket,
        department: payload.department,
        year: payload.year,
        section: payload.section,
        faculty_name: payload.faculty_name,
        subject: payload.subject,
        category: payload.category,
        rating: payload.rating,
        reported_emotion: payload.emotion,
        feedback_message: payload.feedback_message,
        created_at: new Date().toISOString(),
        ingested_at: null,
        sentiment_label: 'pending',
        confidence_score: null,
        emotion: 'pending',
      }
      setData((current) => ({
        ...current,
        feedbacks: { items: [optimisticFeedback, ...(current.feedbacks?.items ?? [])].slice(0, 20) },
      }))
      await loadDashboard()
      navigate('/dashboard')
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
      <NavBar
        currentPath={path}
        navigate={navigate}
        connected={connected}
        health={data.health?.status}
        userRole={userRole}
        onLogout={logoutUser}
      />
      <main className="container">
        <AnimatePresence mode="wait">
          {activePath === '/home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <HomePage summary={summary} onGoFeedback={() => navigate('/feedback')} onGoDashboard={() => navigate('/dashboard')} />
            </motion.div>
          )}
          {activePath === '/login' && (
            <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <LoginPage
                message={path.startsWith('/admin') ? 'Admin authentication is required to access the protected analytics panels.' : undefined}
                onLogin={loginUser}
              />
            </motion.div>
          )}
          {activePath === '/feedback' && (
            <motion.div key="feedback" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <FeedbackPage onSubmit={handleSubmitFeedback} />
            </motion.div>
          )}
          {activePath === '/dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              <DashboardPage
                summary={summary}
                distribution={data.distribution}
                aggregate={data.aggregate}
                feedbacks={data.feedbacks?.items ?? []}
                alerts={data.alerts?.items ?? []}
              />
            </motion.div>
          )}
          {activePath === '/notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}>
              <NotificationsPage notifications={data.notifications?.items ?? []} />
            </motion.div>
          )}
          {activePath === '/admin/alerts' && (
            <motion.div key="admin-alerts" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
              <AdminRoute role={userRole} navigate={navigate}>
                <AdminAlertsPage
                  alerts={data.alerts?.items ?? []}
                  notifications={data.notifications?.items ?? []}
                  onClearNotifications={() => null}
                />
              </AdminRoute>
            </motion.div>
          )}
          {activePath === '/admin/notifications' && (
            <motion.div key="admin-notifications" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <AdminRoute role={userRole} navigate={navigate}>
                <AdminNotificationsPage notifications={data.notifications?.items ?? []} />
              </AdminRoute>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
