export default function NavBar({ page, setPage, connected, health }) {
  const items = [
    ['home', 'Home'],
    ['feedback', 'Student Feedback'],
    ['dashboard', 'Live Dashboard'],
    ['alerts', 'Alerts'],
  ]

  return (
    <header className="topbar glass" style={{padding: '18px', display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <div className="brand">FeedMind</div>
          <div className="subtitle">AI Powered Real-Time College Feedback Intelligence Platform</div>
        </div>
        <div className="topbar-right">
          <span className={`badge ${connected ? 'badge-success' : 'badge-muted'}`}>{connected ? 'WebSocket Connected' : 'WebSocket Offline'}</span>
          <span className={`badge ${health === 'ok' ? 'badge-success' : 'badge-warning'}`}>API {health ?? 'loading'}</span>
        </div>
      </div>
      <nav className="nav-pills">
        {items.map(([key, label]) => (
          <button key={key} className={page === key ? 'pill active' : 'pill'} onClick={() => setPage(key)}>
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}
