export default function NotificationsPanel({ notifications }) {
  return (
    <section className="panel notifications-panel glass neon">
      <div className="section-head">
        <h3>Notification Center</h3>
        <p>AI recommendations and stream events for instant awareness.</p>
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">No notifications yet. Real-time alerts appear here.</div>
        ) : (
          notifications.map((note) => (
            <article className="notification-card glass" key={note.id}>
              <div className="notification-head">
                <strong>{note.title}</strong>
                <span className={`badge ${note.severity === 'critical' ? 'badge-danger' : note.severity === 'warning' ? 'badge-warning' : 'badge-success'}`}>
                  {note.severity}
                </span>
              </div>
              <p>{note.summary}</p>
              <div className="notification-details">
                {note.details && typeof note.details === 'object' ? (
                  Object.entries(note.details).map(([key, value]) => (
                    <span key={key}>{`${key}: ${Array.isArray(value) ? value.slice(0, 2).join(', ') : value}`}</span>
                  ))
                ) : (
                  <span>{note.details}</span>
                )}
              </div>
              <div className="notification-meta">{new Date(note.timestamp).toLocaleString()}</div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
