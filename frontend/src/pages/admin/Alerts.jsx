import NotificationBell from '../../components/admin/NotificationBell'
import AlertCard from '../../components/admin/AlertCard'

export default function Alerts({ alerts = [], notifications = [], onClearNotifications }) {
  const rendered = alerts.length > 0 ? alerts : [
    {
      id: 'sample-negative-spike',
      title: 'Negative Sentiment Spike Detected',
      category: 'Hostel',
      severity: 'warning',
      summary: 'Negative hostel feedback increased by 40% over the last 2 hours.',
      triggered_at: new Date().toISOString(),
      details: { confidence: 0.84, insight: 'Rapid rise in hostel food and room complaints.' },
      status: 'Warning',
    },
    {
      id: 'sample-toxic-keyword',
      title: 'Toxic Keyword Detected',
      category: 'Campus Safety',
      severity: 'critical',
      summary: 'Multiple submissions included “Unsafe” and “Harassment” in the same block.',
      triggered_at: new Date().toISOString(),
      details: { confidence: 0.92, insight: 'Repeated toxic phrase usage requires immediate follow-up.' },
      status: 'Critical',
    },
  ]

  return (
    <section className="admin-page-shell">
      <div className="page-hero glass admin-hero">
        <div>
          <span className="eyebrow">Admin Alert Center</span>
          <h2>Enterprise AI alerting for campus risk and operations.</h2>
          <p>Monitor negative sentiment spikes, repeated complaints, and critical campus incidents in real time.</p>
        </div>
        <NotificationBell notifications={notifications} onClearAll={onClearNotifications} />
      </div>

      <div className="admin-summary-bar glass neon">
        <div>
          <span className="eyebrow">Live intelligence</span>
          <h3>Priority alerts</h3>
          <p>Alerts update automatically as new feedback arrives through the WebSocket stream.</p>
        </div>
        <div className="admin-summary-stats">
          <div className="metric-card accent-red">
            <span>Critical Alerts</span>
            <strong>{rendered.filter((item) => item.severity === 'critical').length}</strong>
          </div>
          <div className="metric-card accent-warning">
            <span>Warning Signals</span>
            <strong>{rendered.filter((item) => item.severity === 'warning').length}</strong>
          </div>
          <div className="metric-card accent">
            <span>AI Insights</span>
            <strong>{Math.max(1, rendered.length)}</strong>
          </div>
        </div>
      </div>

      <div className="alerts-grid">
        {rendered.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </section>
  )
}
