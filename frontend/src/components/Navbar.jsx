import React, { useState } from 'react';
import {
  Satellite,
  User,
  LogOut,
  LogIn,
  Play,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from './../auth/AuthContext.jsx';
import { useRouter } from './../context/RouterContext.jsx';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentRoute, navigateTo } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Analysis', path: '/analysis' },
    { label: 'About', path: '/about' },
    { label: 'Help', path: '/help' }
  ];

  const handleNavClick = (path) => {
    navigateTo(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="gov-navbar-root">
      {/* Main Dark Navbar */}
      <div className="navbar-main">
        <div className="container navbar-inner">
          {/* Brand Group */}
          <div className="brand-group" onClick={() => handleNavClick('/')}>
            <div className="brand-logo-badge">
              <Satellite className="brand-icon" size={20} />
            </div>
            <div className="brand-text">
              <div className="brand-title-row">
                <span className="brand-title">SatVistaar</span>
              </div>
              <span className="brand-subtitle">Remote Sensing Vision Intelligence</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentRoute === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  className={`nav-link-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.path)}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="active-orange-underline" />}
                </button>
              );
            })}
          </nav>

          {/* Right Action Group */}
          <div className="navbar-actions">
            {/* Primary Action Button (ORANGE) */}
            {currentRoute !== '/analysis' && (
              <button
                type="button"
                className="gov-cta-orange-btn"
                onClick={() => handleNavClick('/analysis')}
              >
                <Play size={14} fill="currentColor" />
                <span>Start Analysis</span>
              </button>
            )}

            {/* Auth Controls */}
            {isAuthenticated && user ? (
              <div className="user-profile-group">
                <div className="user-badge" title={`Signed in as ${user.email}`}>
                  <User size={14} className="user-icon" />
                  <span className="user-name">{user.name || 'Analyst'}</span>
                </div>
                <button
                  type="button"
                  className="gov-logout-btn"
                  onClick={logout}
                  title="Sign out"
                  aria-label="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="auth-btn-group">
                <button
                  type="button"
                  className="gov-signin-btn"
                  onClick={() => handleNavClick('/login')}
                >
                  <LogIn size={14} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  className="gov-register-btn"
                  onClick={() => handleNavClick('/register')}
                >
                  <span>Register</span>
                </button>
              </div>
            )}

            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="container mobile-drawer-inner">
            <nav className="mobile-links-list">
              {navItems.map((item) => {
                const isActive = currentRoute === item.path;
                return (
                  <button
                    key={item.path}
                    type="button"
                    className={`mobile-link-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.path)}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="mobile-active-dot" />}
                  </button>
                );
              })}
            </nav>

            <div className="mobile-drawer-actions">
              {currentRoute !== '/analysis' && (
                <button
                  type="button"
                  className="gov-cta-orange-btn full-w"
                  onClick={() => handleNavClick('/analysis')}
                >
                  <Play size={15} fill="currentColor" />
                  <span>Start Analysis Dashboard</span>
                </button>
              )}

              {!isAuthenticated ? (
                <div className="mobile-auth-row">
                  <button
                    type="button"
                    className="gov-signin-btn full-w"
                    onClick={() => handleNavClick('/login')}
                  >
                    <LogIn size={15} />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    className="gov-register-btn full-w"
                    onClick={() => handleNavClick('/register')}
                  >
                    <span>Register</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="gov-logout-mobile-btn full-w"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out ({user?.name || user?.email})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gov-navbar-root {
          width: 100%;
          background: #08090d;
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .gov-top-banner {
          background: #040507;
          border-bottom: 1px solid #141722;
          padding: 0.3rem 0;
          font-size: 0.7rem;
        }
        .top-banner-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .gov-flag-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .telemetry-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-orange);
        }
        .top-banner-meta {
          color: #525f76;
          font-size: 0.65rem;
        }
        @media (max-width: 640px) {
          .top-banner-meta { display: none; }
        }

        .navbar-main {
          padding: 0.65rem 0;
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .brand-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }
        .brand-logo-badge {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: #141722;
          border: 1px solid #2a3044;
          color: var(--accent-orange);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-text {
          display: flex;
          flex-direction: column;
        }
        .brand-title-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .brand-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        .brand-tag {
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          background: rgba(249, 115, 22, 0.12);
          border: 1px solid rgba(249, 115, 22, 0.35);
          color: var(--accent-orange-text);
        }
        .brand-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* Desktop Nav */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (max-width: 840px) {
          .desktop-nav { display: none; }
        }
        .nav-link-btn {
          position: relative;
          padding: 0.5rem 0.95rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          min-height: 36px;
        }
        .nav-link-btn:hover {
          color: #ffffff;
          background: #12151f;
        }
        .nav-link-btn.active {
          color: #ffffff;
          background: #141722;
        }
        .active-orange-underline {
          position: absolute;
          bottom: 0;
          left: 15%;
          right: 15%;
          height: 2px;
          background: var(--accent-orange);
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(249, 115, 22, 0.6);
        }

        /* Actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* Primary Orange CTA */
        .gov-cta-orange-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.5rem 1rem;
          background: var(--accent-orange);
          color: #08090d;
          border-radius: var(--radius-sm);
          font-size: 0.825rem;
          font-weight: 700;
          min-height: 36px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }
        .gov-cta-orange-btn:hover {
          background: var(--accent-orange-hover);
          transform: translateY(-1px);
        }
        @media (max-width: 720px) {
          .gov-cta-orange-btn { display: none; }
        }

        /* Auth */
        .user-profile-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .user-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.65rem;
          background: #141722;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .user-icon {
          color: var(--accent-blue-text);
        }
        .gov-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          background: #141722;
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          min-height: auto;
        }
        .gov-logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          color: var(--status-red);
          border-color: rgba(239, 68, 68, 0.4);
        }
        .auth-btn-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .gov-signin-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          background: #12151f;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
          min-height: 36px;
        }
        .gov-signin-btn:hover {
          background: #181c28;
          border-color: var(--accent-blue);
          color: var(--accent-blue-text);
        }
        .gov-register-btn {
          padding: 0.4rem 0.8rem;
          background: #181c28;
          border: 1px solid var(--border-medium);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          min-height: 36px;
        }
        .gov-register-btn:hover {
          background: #202535;
          color: #ffffff;
          border-color: var(--border-strong);
        }

        /* Mobile */
        .mobile-toggle-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: #141722;
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
        }
        @media (max-width: 840px) {
          .mobile-toggle-btn { display: flex; }
        }
        .mobile-nav-drawer {
          background: #0d0e15;
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-medium);
          padding: 1rem 0 1.5rem 0;
        }
        .mobile-drawer-inner {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mobile-links-list {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .mobile-link-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-main);
          border-radius: var(--radius-sm);
          text-align: left;
        }
        .mobile-link-item:hover, .mobile-link-item.active {
          background: #141722;
          color: var(--accent-orange);
        }
        .mobile-active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-orange);
        }
        .mobile-drawer-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle);
        }
        .mobile-auth-row {
          display: flex;
          gap: 0.5rem;
        }
        .full-w {
          width: 100%;
          justify-content: center;
        }
        .gov-logout-mobile-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: var(--status-red-text);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
        }
      `}</style>
    </header>
  );
}

export default Navbar;
