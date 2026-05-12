export default function NavBar({ currentPath, navigate, connected, health, userRole, onLogout }) {
  const items = [
    ['/', 'Home'],
    ['/feedback', 'Student Feedback'],
    ['/dashboard', 'Live Dashboard'],
    ['/notifications', 'Notifications'],
  ]

  if (userRole === 'admin') {
    items.push(['/admin/alerts', 'Alerts'])
    items.push(['/admin/notifications', 'Admin Notifications'])
  }

  const normalizedPath = currentPath === '/home' ? '/' : currentPath

  return (
    <header className="topbar glass" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="brand">FeedMind</div>
          <div className="subtitle">AI Powered Real-Time College Feedback Intelligence Platform</div>
        </div>
        <div className="topbar-right">
          <span className={`badge ${connected ? 'badge-success' : 'badge-muted'}`}>{connected ? 'WebSocket Connected' : 'WebSocket Offline'}</span>
          <span className={`badge ${health === 'ok' ? 'badge-success' : 'badge-warning'}`}>API {health ?? 'loading'}</span>
          <span className="badge badge-info">{userRole.toUpperCase()}</span>
          <button type="button" className="secondary-btn small" onClick={onLogout}>
            {userRole === 'admin' ? 'Logout' : 'Reset'}
          </button>
        </div>
      </div>
      <nav className="nav-pills">
        {items.map(([path, label]) => (
          <button key={path} className={normalizedPath === path ? 'pill active' : 'pill'} onClick={() => navigate(path)}>
            {label}
          </button>
        ))}
      </nav>
    </header>
  )
}
