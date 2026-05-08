import MetricsCards from '../components/MetricsCards'
import DistributionChart from '../components/DistributionChart'
import TrendChart from '../components/TrendChart'
import LiveFeed from '../components/LiveFeed'
import AlertsPanel from '../components/AlertsPanel'

export default function DashboardPage({ summary, distribution, aggregate, feedbacks, alerts }) {
  return (
    <div className="dashboard-grid">
      <MetricsCards summary={summary} />
      <div className="dashboard-stage">
        <div className="dashboard-stage-main glass">
          <DistributionChart distribution={distribution} />
        </div>
        <div className="dashboard-stage-side">
          <TrendChart aggregate={aggregate} />
        </div>
      </div>
      <div className="two-col">
        <LiveFeed feedbacks={feedbacks} />
        <AlertsPanel alerts={alerts} />
      </div>
    </div>
  )
}
