import { useEffect, useMemo, useState } from 'react'
import NotificationBell from '../../components/admin/NotificationBell'
import NotificationCard from '../../components/admin/NotificationCard'

export default function Notifications({ notifications = [] }) {
  const [items, setItems] = useState(notifications)

  useEffect(() => {
    setItems(notifications)
  }, [notifications])

  const unreadCount = useMemo(() => items.filter((note) => note.unread !== false).length, [items])

  const toggleRead = (id) => {
    setItems((current) => current.map((note) => (note.id === id ? { ...note, unread: !note.unread } : note)))
  }

  const clearAll = () => {
    setItems((current) => current.map((note) => ({ ...note, unread: false })))
  }

  const rendered = items.length > 0 ? items : [
    {
      id: 'sample-feedback-event',
      title: 'New hostel complaint submitted',
      summary: 'A fresh hostel feedback ticket arrived from CSE with a 2-star rating.',
      category: 'Hostel',
      severity: 'warning',
      timestamp: new Date().toISOString(),
      unread: true,
    },
    {
      id: 'sample-negative-sentiment',
      title: 'Negative faculty sentiment detected',
      summary: 'AI detected increasing negative sentiment for a faculty member in the CSE stream.',
      category: 'Faculty',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      unread: true,
    },
  ]

  return (
    <section className="admin-page-shell">
      <div className="page-hero glass admin-hero">
        <div>
          <span className="eyebrow">Admin Notification Hub</span>
          <h2>Real-time campus activity and AI signal alerts.</h2>
          <p>See every important event, system message, and sentiment alert as it arrives.</p>
        </div>
        <NotificationBell notifications={rendered} onClearAll={clearAll} />
      </div>

      <div className="admin-summary-bar glass neon">
        <div>
          <span className="eyebrow">Live Activity</span>
          <h3>{unreadCount} unread notifications</h3>
          <p>New campus feedback, AI insight suggestions, and critical event alerts are grouped here.</p>
        </div>
        <button type="button" className="primary-btn" onClick={clearAll}>
          Clear all notifications
        </button>
      </div>

      <div className="notifications-grid">
        {rendered.map((note) => (
          <NotificationCard key={note.id} notification={note} onToggleRead={toggleRead} />
        ))}
      </div>
    </section>
  )
}
