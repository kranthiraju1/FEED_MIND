import { AlertCircle, ShieldAlert, Zap } from 'lucide-react'

const severityStyles = {
  critical: 'danger',
  warning: 'warning',
  info: 'info',
  resolved: 'success',
}

const severityIcon = {
  critical: AlertCircle,
  warning: Zap,
  info: ShieldAlert,
  resolved: ShieldAlert,
}

export default function AlertCard({ alert }) {
  const severity = alert.severity || (alert.alert_type?.toLowerCase().includes('critical') ? 'critical' : alert.alert_type?.toLowerCase().includes('negative') ? 'warning' : 'info')
  const badgeType = severityStyles[severity] ?? 'info'
  const Icon = severityIcon[severity] || ShieldAlert
  const title = alert.title || alert.alert_type?.replace(/_/g, ' ') || 'Campus alert'
  const category = alert.category || alert.details?.category || 'General'
  const summary = alert.summary || alert.details?.message || 'AI model detected an important issue affecting campus operations.'
  const timestamp = alert.triggered_at || alert.timestamp || alert.created_at || new Date().toISOString()
  const status = alert.status || (severity === 'critical' ? 'Critical' : severity === 'warning' ? 'Warning' : 'Active')
  const confidence = alert.details?.confidence ? `${Math.round(alert.details.confidence * 100)}%` : alert.confidence_score ? `${Math.round(alert.confidence_score * 100)}%` : '—'

  return (
    <article className={`alert-card glass glow-${badgeType}`}>
      <div className="alert-card-head">
        <div className="alert-card-title">
          <Icon size={20} />
          <div>
            <strong>{title}</strong>
            <span className="pill light">{category}</span>
          </div>
        </div>
        <span className={`badge badge-${badgeType}`}>{status}</span>
      </div>

      <p>{summary}</p>

      <div className="alert-card-meta">
        <span>Severity: {severity}</span>
        <span>Confidence: {confidence}</span>
        <span>{new Date(timestamp).toLocaleString()}</span>
      </div>
    </article>
  )
}
