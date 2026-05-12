export default function LoginPage({ onLogin, message }) {
  return (
    <section className="page-shell login-shell">
      <div className="page-hero glass admin-hero">
        <div>
          <span className="eyebrow">Secure Admin Access</span>
          <h2>Admin-only analytics and alert controls.</h2>
          <p>{message || 'Please sign in as an administrator to access alerts, notifications, and AI operations.'}</p>
        </div>
      </div>

      <div className="panel glass neon login-panel">
        <div className="section-head">
          <h3>Choose your access level</h3>
          <p>Admin users can access protected analytics panels. Student access is limited.</p>
        </div>

        <div className="login-actions">
          <button type="button" className="primary-btn" onClick={() => onLogin('admin', 'Admin User')}>
            Sign in as Admin
          </button>
          <button type="button" className="secondary-btn" onClick={() => onLogin('student', 'Student User')}>
            Continue as Student
          </button>
        </div>
      </div>
    </section>
  )
}
