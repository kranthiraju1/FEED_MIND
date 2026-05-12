import NotificationsPanel from '../components/NotificationsPanel'

export default function NotificationsPage({ notifications }) {
  return (
    <section className="page-shell">
      <div className="page-hero glass">
        <div>
          <span className="eyebrow">Real-Time Notifications</span>
          <h2>Intelligent alerts, escalations, and AI guidance.</h2>
          <p>Stay ahead with a curated stream of sentiment intelligence and critical system activity.</p>
        </div>
      </div>
      <NotificationsPanel notifications={notifications} />
    </section>
  )
}
