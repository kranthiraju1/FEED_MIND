import { useEffect, useMemo, useState } from 'react'
import { Bell } from 'lucide-react'

export default function NotificationBell({ notifications = [], onClearAll }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(notifications)

  useEffect(() => {
    setItems(notifications)
  }, [notifications])

  const unreadCount = useMemo(() => items.filter((note) => note.unread !== false).length, [items])
  const latest = useMemo(() => items.slice(0, 4), [items])

  const toggleRead = (id) => {
    setItems((current) => current.map((note) => (note.id === id ? { ...note, unread: !note.unread } : note)))
  }

  return (
    <div className="notification-bell-shell">
      <button type="button" className="notification-bell-btn glass" onClick={() => setOpen((value) => !value)}>
        <Bell size={20} />
        {unreadCount > 0 && <span className="badge badge-danger notification-dot">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-dropdown glass neon">
          <div className="notification-dropdown-header">
            <div>
              <strong>Live Notifications</strong>
              <p>{unreadCount} unread updates</p>
            </div>
            <button type="button" className="secondary-btn small" onClick={() => { onClearAll?.(); setItems((c) => c.map((note) => ({ ...note, unread: false }))) }}>
              Clear all
            </button>
          </div>

          <div className="notification-dropdown-list">
            {latest.length === 0 ? (
              <div className="empty-state">No live notifications yet.</div>
            ) : (
              latest.map((note) => (
                <div key={note.id} className={`notification-preview-card ${note.unread !== false ? 'notification-unread' : ''}`}>
                  <div className="notification-preview-head">
                    <span>{note.category || 'System'}</span>
                    <span className={`badge badge-${note.severity || 'info'}`}>{note.severity || 'info'}</span>
                  </div>
                  <p>{note.title || note.summary}</p>
                  <div className="notification-preview-meta">
                    <span>{new Date(note.timestamp || note.created_at || Date.now()).toLocaleTimeString()}</span>
                    <button type="button" className="pill small" onClick={() => toggleRead(note.id)}>
                      {note.unread !== false ? 'Mark read' : 'Unread'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
