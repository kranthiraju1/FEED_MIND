export default function AlertsPanel({ alerts }) {
  return (
    <section className="panel alerts-panel glass neon">
      <div className="section-head">
        <h3>Alert Panel</h3>
        <p>High negative ratio, category spikes, and critical campus issues tracked live.</p>
      </div>
      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="empty-state">No alerts triggered yet. The stream will populate as events arrive.</div>
        ) : (
          alerts.map((alert) => {
            const severity = alert.alert_type?.includes('critical') ? 'danger' : alert.alert_type?.includes('negative') ? 'warning' : 'info'
            return (
              <article className="alert-item glass" key={alert.id}>
                <div className="feed-row">
                  <strong>{alert.alert_type.replace(/_/g, ' ')}</strong>
                  <span className={`badge badge-${severity}`}>{severity}</span>
                </div>
                <div className="alert-metrics">
                  <span>Actual: {Number(alert.actual_value).toFixed(2)}</span>
                  <span>Threshold: {Number(alert.threshold_value).toFixed(2)}</span>
                  <span>Posts: {alert.post_count}</span>
                </div>
                <p>{alert.details ? JSON.stringify(alert.details) : 'Triggered by live feedback.'}</p>
                <div className="notification-meta">{new Date(alert.triggered_at).toLocaleString()}</div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
