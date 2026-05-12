import AlertsPanel from '../components/AlertsPanel'

export default function AlertsPage({ alerts }) {
  return (
    <section className="page-shell">
      <div className="page-hero glass">
        <div>
          <span className="eyebrow">Alerts Center</span>
          <h2>Critical signals for campus operations.</h2>
          <p>Track sentiment spikes, emergency complaints, and anomaly warnings in one premium panel.</p>
        </div>
      </div>
      <AlertsPanel alerts={alerts} />
    </section>
  )
}
