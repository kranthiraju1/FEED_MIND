import { BellDot, MessageCircle, Sparkles } from 'lucide-react'

const iconMap = {
  critical: BellDot,
  warning: MessageCircle,
  info: Sparkles,
  resolved: Sparkles,
}

export default function NotificationCard({ notification, onToggleRead }) {
  const Icon = iconMap[notification.severity] || MessageCircle
  const category = notification.category || 'System'
  const timestamp = notification.timestamp || notification.created_at || new Date().toISOString()
  const unread = notification.unread ?? true

  return (
    <article className={`notification-card glass ${unread ? 'notification-unread' : ''}`}>
      <div className="notification-card-head">
        <div className="notification-card-icon">
          <Icon size={18} />
        </div>
        <div>
          <strong>{notification.title || notification.summary || 'New system notification'}</strong>
          <div className="pill light">{category}</div>
        </div>
      </div>

      <p>{notification.summary || 'Real-time activity from student feedback and AI monitoring.'}</p>

      <div className="notification-card-meta">
        <span>{new Date(timestamp).toLocaleString()}</span>
        <button type="button" className="secondary-btn small" onClick={() => onToggleRead(notification.id)}>
          {unread ? 'Mark read' : 'Mark unread'}
        </button>
      </div>
    </article>
  )
}
