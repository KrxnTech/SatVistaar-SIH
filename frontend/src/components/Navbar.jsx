import React from 'react';
import { Satellite, ShieldCheck, Activity, Cpu, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';

export function Navbar({ backendHealth, onNavigateToLogin, onNavigateToRegister }) {
  const { user, isAuthenticated, logout } = useAuth();
  const isHealthy = backendHealth?.ok && (backendHealth.status === 'healthy' || backendHealth.status === 'ok');

  return (
    <header className="navbar-root">
      <div className="container navbar-inner">
        <div className="brand-group">
          <div className="brand-icon-wrapper">
            <Satellite className="brand-icon" size={24} />
            <div className="brand-glow" />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <h1 className="brand-title">SatVistaar</h1>
              <span className="brand-tag">VISION AI</span>
            </div>
            <p className="brand-subtitle">Autonomous Geospatial Vision-Language Analysis</p>
          </div>
        </div>

        <div className="nav-status-group">
          <div className="meta-pill">
            <Cpu size={14} className="meta-icon" />
            <span>VLM Engine: <strong>Qwen3.8-27B</strong></span>
          </div>

          <div className={`health-pill ${isHealthy ? 'healthy' : 'unhealthy'}`}>
            <span className={`status-dot ${isHealthy ? 'live' : 'dead'}`} />
            <span>Backend: {isHealthy ? 'Connected' : (backendHealth?.status || 'Checking...')}</span>
          </div>

          {isAuthenticated && user ? (
            <div className="user-session-group">
              <div className="user-profile-pill">
                <div className="user-avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info-text">
                  <span className="user-name">{user.name || 'Analyst'}</span>
                  <span className="user-role-badge">{user.role || 'USER'}</span>
                </div>
              </div>

              <button
                type="button"
                className="nav-logout-btn"
                onClick={logout}
                title="Sign out of SatVistaar"
              >
                <LogOut size={15} />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-action-group">
              {onNavigateToLogin && (
                <button
                  type="button"
                  className="nav-login-btn"
                  onClick={onNavigateToLogin}
                >
                  <LogIn size={15} />
                  <span>Sign In</span>
                </button>
              )}
              {onNavigateToRegister && (
                <button
                  type="button"
                  className="nav-register-btn"
                  onClick={onNavigateToRegister}
                >
                  <span>Register</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-root {
          width: 100%;
          background: rgba(13, 19, 34, 0.85);
          border-bottom: 1px solid var(--border-subtle);
          backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.875rem;
          padding-bottom: 0.875rem;
        }
        .brand-group {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }
        .brand-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border: 1px solid var(--accent-cyan);
          border-radius: var(--radius-md);
          box-shadow: 0 0 15px var(--accent-cyan-glow);
        }
        .brand-icon {
          color: var(--accent-cyan);
        }
        .brand-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .brand-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.03em;
        }
        .brand-tag {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          background: linear-gradient(135deg, rgba(0, 229, 255, 0.2), rgba(99, 102, 241, 0.2));
          border: 1px solid rgba(0, 229, 255, 0.4);
          color: var(--accent-cyan);
        }
        .brand-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .nav-status-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .meta-pill {
          display: none;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .meta-icon {
          color: var(--accent-indigo);
        }
        @media (min-width: 900px) {
          .meta-pill {
            display: flex;
          }
        }
        .health-pill {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .health-pill.healthy {
          background: var(--status-success-bg);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #34d399;
        }
        .health-pill.unhealthy {
          background: var(--status-warning-bg);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
        }
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .status-dot.live {
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulse-green 2s infinite;
        }
        .status-dot.dead {
          background: #f59e0b;
        }
        .user-session-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding-left: 0.5rem;
          border-left: 1px solid var(--border-subtle);
        }
        .user-profile-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.65rem 0.25rem 0.35rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
        }
        .user-avatar-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00e5ff, #6366f1);
          color: #070a12;
          font-weight: 700;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-info-text {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .user-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
          max-width: 110px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-role-badge {
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #a5b4fc;
        }
        .nav-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.7rem;
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.25);
          border-radius: var(--radius-md);
          color: #fda4af;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .nav-logout-btn:hover {
          background: rgba(244, 63, 94, 0.2);
          border-color: rgba(244, 63, 94, 0.5);
          color: #ffffff;
        }
        .auth-action-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-left: 0.5rem;
          border-left: 1px solid var(--border-subtle);
        }
        .nav-login-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          color: var(--text-main);
          font-size: 0.775rem;
          font-weight: 500;
        }
        .nav-login-btn:hover {
          border-color: var(--accent-cyan);
          color: var(--accent-cyan);
        }
        .nav-register-btn {
          padding: 0.35rem 0.75rem;
          background: linear-gradient(135deg, #00e5ff, #3b82f6);
          border-radius: var(--radius-md);
          color: #070a12;
          font-size: 0.775rem;
          font-weight: 600;
        }
        .nav-register-btn:hover {
          opacity: 0.9;
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </header>
  );
}

export default Navbar;

