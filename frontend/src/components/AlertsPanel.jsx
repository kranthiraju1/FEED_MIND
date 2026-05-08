export default function AlertsPanel({ alerts }) {
  return (
    <section className="panel alerts-panel glass neon">
      <div className="section-head">
        <h3>Alert Panel</h3>
        <p>High negative ratio, category spikes, and critical keyword alerts.</p>
      </div>
      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="empty-state">No alerts triggered yet.</div>
        ) : (
          alerts.map((alert) => (
            <article className="alert-item glass" key={alert.id}>
              <div className="feed-row">
                <strong>{alert.alert_type}</strong>
                <span className={`sentiment ${String(alert.alert_type ?? '').toLowerCase().includes('negative') ? 'negative' : 'neutral'}`}>
                  alert
                </span>
              </div>
              <div className="alert-metrics">
                <span>Actual: {Number(alert.actual_value).toFixed(2)}</span>
                <span>Threshold: {Number(alert.threshold_value).toFixed(2)}</span>
                <span>Posts: {alert.post_count}</span>
              </div>
              <p>{JSON.stringify(alert.details)}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
