export default function HomePage({ summary, onGoFeedback, onGoDashboard }) {
  return (
    <section className="hero panel glass hero panel hero panel">
      <div className="hero-copy">
        <span className="eyebrow">FeedMind Intelligence Platform</span>
        <h1>Monitor campus sentiment in real time.</h1>
        <p>
          FeedMind helps colleges track feedback across faculty, labs, hostel, transport, WiFi, placements, and campus services with live AI analysis.
        </p>
        <div className="hero-cta">
          <button className="primary-btn" onClick={onGoFeedback}>Submit Feedback</button>
          <button className="secondary-btn" onClick={onGoDashboard}>Open Dashboard</button>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'}}>
        <div style={{width: '100%', borderRadius: 18, padding: 18}} className="glass">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <div className="eyebrow">Live Summary</div>
              <h3 style={{margin: '6px 0 0'}}>{summary.total} total</h3>
            </div>
            <div style={{display:'flex', gap:8}}>
              <div className="pill-decor"></div>
              <div className="pill-decor" style={{background: 'linear-gradient(90deg,#a78bfa55,#38bdf855)'}}></div>
            </div>
          </div>
          <div style={{display:'flex', gap:12, marginTop:12}}>
            <div className="metric-card glass" style={{flex:1}}>
              <span>Positive</span>
              <strong>{summary.positive}</strong>
            </div>
            <div className="metric-card glass" style={{flex:1}}>
              <span>Negative</span>
              <strong>{summary.negative}</strong>
            </div>
            <div className="metric-card glass" style={{flex:1}}>
              <span>Neutral</span>
              <strong>{summary.neutral}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
