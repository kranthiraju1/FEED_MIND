import { motion } from 'framer-motion'

export default function HomePage({ summary, onGoFeedback, onGoDashboard }) {
  return (
    <section className="hero panel glass home-hero">
      <motion.div className="hero-copy" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}>
        <span className="eyebrow">FeedMind Intelligence Platform</span>
        <h1>Monitor campus sentiment in real time.</h1>
        <p>Drive better student experiences with AI-powered analytics, instant alerts, and live campus intelligence.</p>
        <div className="hero-cta">
          <button className="primary-btn" onClick={onGoFeedback}>Submit Feedback</button>
          <button className="secondary-btn" onClick={onGoDashboard}>Open Dashboard</button>
        </div>
      </motion.div>
      <motion.div className="hero-panel glass" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
        <div className="hero-panel-top">
          <span className="eyebrow">Live AI insights</span>
          <div className="status-pill">Realtime</div>
        </div>
        <div className="hero-stats">
          <article className="metric-card glass accent">
            <span>Campus Sentiment</span>
            <strong>{summary.total}</strong>
            <p>{summary.positive >= summary.negative ? 'Mostly positive engagement' : 'Monitor emerging concerns'}</p>
          </article>
          <article className="metric-card glass accent-green">
            <span>Positive</span>
            <strong>{summary.positive}</strong>
          </article>
          <article className="metric-card glass accent-red">
            <span>Negative</span>
            <strong>{summary.negative}</strong>
          </article>
          <article className="metric-card glass">
            <span>Neutral</span>
            <strong>{summary.neutral}</strong>
          </article>
        </div>
      </motion.div>
    </section>
  )
}
