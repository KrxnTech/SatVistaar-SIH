import React, { useState, useEffect } from 'react';
import {
  Satellite,
  User,
  LogOut,
  LogIn,
  Play,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useAuth } from './../auth/AuthContext.jsx';
import { useRouter } from './../context/RouterContext.jsx';

export function Navbar({ backendHealth }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentRoute, navigateTo } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  const isHomeRoute = currentRoute === '/';

  useEffect(() => {
    if (!isHomeRoute) {
      setScrolledPastHero(true);
      return;
    }

    const handleScroll = () => {
      const heroEl = document.querySelector('.reference-hero') || document.querySelector('.hero-section');
      const heroHeight = heroEl ? heroEl.offsetHeight - 80 : 450;
      setScrolledPastHero(window.scrollY > heroHeight);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomeRoute]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Analysis', path: '/analysis' },
    { label: 'Disaster Mode', path: '/disaster', isDisaster: true },
    { label: 'About', path: '/about' },
    { label: 'Help', path: '/help' }
  ];

  const handleNavClick = (path) => {
    navigateTo(path);
    setMobileMenuOpen(false);
  };

  const isTransparent = isHomeRoute && !scrolledPastHero;
  const isHealthy = backendHealth?.ok !== false;

  return (
    <header className={`sat-navbar-unified ${isTransparent ? 'navbar-transparent' : 'navbar-solid'}`}>
      {/* Main Navbar Bar */}
      <div className="navbar-main-row">
        <div className="container navbar-content-container">
          {/* Brand Logo & Title */}
          <div className="brand-group" onClick={() => handleNavClick('/')}>
            <div className="brand-logo-badge">
              <Satellite className="brand-icon" size={19} />
            </div>
            <div className="brand-text">
              <span className="brand-title">SatVistaar</span>
              <span className="brand-subtitle">Remote Sensing Vision Intelligence</span>
            </div>
          </div>

          {/* Center Navigation Links - Modern Segmented Control */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentRoute === item.path;
              return (
                <button
                  key={item.path}
                  type="button"
                  className={`nav-link-btn ${isActive ? 'active' : ''} ${item.isDisaster ? 'disaster-link' : ''}`}
                  onClick={() => handleNavClick(item.path)}
                >
                  {item.isDisaster && <span className="disaster-nav-dot" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions Group */}
          <div className="navbar-actions">
            {/* System Status Indicator Pill */}
            <div className="nav-system-status" title={isHealthy ? "Backend AI specialist engines operational" : "Checking service connectivity"}>
              <span className={`status-pulse-dot ${isHealthy ? 'green' : 'amber'}`} />
              <span className="status-text">{isHealthy ? 'Operational' : 'Connecting'}</span>
            </div>

            {/* Start Analysis Quick CTA (shown if not on /analysis) */}
            {currentRoute !== '/analysis' && currentRoute !== '/disaster' && (
              <button
                type="button"
                className="gov-cta-orange-btn"
                onClick={() => handleNavClick('/analysis')}
              >
                <Play size={13} fill="currentColor" />
                <span>Launch Analysis</span>
              </button>
            )}

            {/* Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="analyst-profile-chip">
                <div className="analyst-avatar-box">
                  <User size={13} className="analyst-avatar-icon" />
                  <span className="analyst-live-dot" title="Session Active" />
                </div>
                <div className="analyst-details">
                  <span className="analyst-name">{user.name || 'Rajesh Sharma'}</span>
                  <span className="analyst-role">Geospatial Analyst</span>
                </div>
                <div className="chip-divider" />
                <button
                  type="button"
                  className="analyst-logout-btn"
                  onClick={logout}
                  title="Sign out"
                  aria-label="Logout"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <div className="auth-btn-group">
                <button
                  type="button"
                  className={`gov-signin-btn ${currentRoute === '/login' ? 'active-auth' : ''}`}
                  onClick={() => handleNavClick('/login')}
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  className={`gov-register-btn ${currentRoute === '/register' ? 'active-auth' : ''}`}
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
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
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
                    className={`mobile-link-item ${isActive ? 'active' : ''} ${item.isDisaster ? 'mobile-disaster-link' : ''}`}
                    onClick={() => handleNavClick(item.path)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {item.isDisaster && <span className="disaster-nav-dot" />}
                      <span>{item.label}</span>
                    </span>
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
                  <Play size={14} fill="currentColor" />
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
                    <LogIn size={14} />
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
                  <LogOut size={14} />
                  <span>Sign Out ({user?.name || user?.email})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sat-navbar-unified {
          width: 100%;
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease;
        }

        .sat-navbar-unified.navbar-transparent {
          position: fixed;
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }

        .sat-navbar-unified.navbar-solid {
          background: linear-gradient(180deg, rgba(2, 6, 26, 0.96) 0%, rgba(0, 0, 85, 0.93) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          box-shadow: 0 4px 24px -2px rgba(0, 0, 45, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .navbar-main-row {
          padding: 0.65rem 0;
        }

        .navbar-content-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        /* Brand Group */
        .brand-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }

        .brand-logo-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(255, 82, 37, 0.25) 0%, rgba(0, 0, 102, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .brand-group:hover .brand-logo-badge {
          transform: scale(1.05) rotate(-3deg);
          border-color: #ff5225;
          box-shadow: 0 0 16px rgba(255, 82, 37, 0.5);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 1.3rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.015em;
          line-height: 1.15;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        }

        .brand-subtitle {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.68);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* Modern Segmented Dock Center Nav */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 0.22rem 0.35rem;
          border-radius: 999px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.2);
          white-space: nowrap;
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .desktop-nav {
            display: none;
          }
        }

        .nav-link-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.42rem 1.05rem;
          font-size: 0.84rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.78);
          background: transparent;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          min-height: 32px;
          white-space: nowrap;
          flex-shrink: 0;
          line-height: 1;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-link-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.12);
        }

        .nav-link-btn.active {
          color: #ffffff;
          background: #ff5225;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(255, 82, 37, 0.45);
        }

        /* Disaster Mode Link in Center Nav */
        .nav-link-btn.disaster-link {
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .nav-link-btn.disaster-link:hover {
          color: #ffffff;
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.45);
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
        }

        .nav-link-btn.disaster-link.active {
          color: #ffffff;
          background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
          border-color: #ef4444;
          font-weight: 700;
          box-shadow: 0 2px 14px rgba(239, 68, 68, 0.55);
        }

        .disaster-nav-dot {
          width: 6.5px;
          height: 6.5px;
          border-radius: 50%;
          background: #ef4444;
          box-shadow: 0 0 6px #ef4444;
          animation: disaster-dot-pulse 1.8s infinite ease-in-out;
        }

        @keyframes disaster-dot-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 0 6px #ef4444;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.8;
            box-shadow: 0 0 12px #ef4444, 0 0 16px rgba(239, 68, 68, 0.4);
          }
        }

        .mobile-link-item.mobile-disaster-link {
          color: #fca5a5;
        }
        .mobile-link-item.mobile-disaster-link:hover,
        .mobile-link-item.mobile-disaster-link.active {
          background: rgba(239, 68, 68, 0.25);
          color: #ffffff;
        }

        /* Right Actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        /* System Status Pill */
        .nav-system-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 0.3rem 0.65rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.75);
          letter-spacing: 0.03em;
          white-space: nowrap;
        }
        @media (max-width: 1080px) {
          .nav-system-status {
            display: none;
          }
        }
        .status-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .status-pulse-dot.green {
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
        }
        .status-pulse-dot.amber {
          background: #f59e0b;
          box-shadow: 0 0 8px #f59e0b;
        }
        .status-text {
          font-family: 'JetBrains Mono', monospace;
        }

        /* Launch Analysis CTA Button */
        .gov-cta-orange-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 1rem;
          background: #ff5225;
          color: #ffffff;
          border: none;
          border-radius: 999px;
          font-size: 0.82rem;
          font-weight: 700;
          min-height: 32px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 3px 12px rgba(255, 82, 37, 0.4);
          transition: all 0.2s ease;
        }

        .gov-cta-orange-btn:hover {
          background: #e6451a;
          transform: translateY(-1px);
          box-shadow: 0 5px 16px rgba(255, 82, 37, 0.5);
        }

        /* Integrated Analyst Profile Chip */
        .analyst-profile-chip {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.22rem 0.35rem 0.22rem 0.55rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .analyst-profile-chip:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.28);
        }

        .analyst-avatar-box {
          position: relative;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255, 82, 37, 0.18);
          border: 1px solid rgba(255, 82, 37, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffaa95;
        }

        .analyst-live-dot {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          border: 1.5px solid #000066;
          box-shadow: 0 0 6px #22c55e;
        }

        .analyst-details {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .analyst-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #ffffff;
        }

        .analyst-role {
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.62);
          letter-spacing: 0.02em;
        }

        .chip-divider {
          width: 1px;
          height: 16px;
          background: rgba(255, 255, 255, 0.16);
        }

        .analyst-logout-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          min-height: auto;
          padding: 0;
        }

        .analyst-logout-btn:hover {
          background: rgba(239, 68, 68, 0.25);
          color: #ff8080;
        }

        .auth-btn-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .gov-signin-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.42rem 0.9rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
          border-radius: 999px;
          font-size: 0.8125rem;
          font-weight: 600;
          min-height: 32px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gov-signin-btn:hover, .gov-signin-btn.active-auth {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.38);
          color: #ffffff;
        }

        .gov-register-btn {
          display: inline-flex;
          align-items: center;
          padding: 0.42rem 0.9rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: rgba(255, 255, 255, 0.88);
          border-radius: 999px;
          font-size: 0.8125rem;
          font-weight: 600;
          min-height: 32px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gov-register-btn:hover, .gov-register-btn.active-auth {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.32);
          color: #ffffff;
        }

        /* Mobile Menu Button */
        .mobile-toggle-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          cursor: pointer;
          min-height: auto;
          padding: 0;
        }

        @media (max-width: 900px) {
          .mobile-toggle-btn {
            display: flex;
          }
          .auth-btn-group, .gov-cta-orange-btn, .analyst-profile-chip {
            display: none;
          }
        }

        /* Mobile Drawer */
        .mobile-nav-drawer {
          background: rgba(2, 6, 26, 0.98);
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          padding: 1.25rem 0 1.75rem 0;
          backdrop-filter: blur(16px);
        }

        .mobile-drawer-inner {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .mobile-links-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .mobile-link-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          background: transparent;
          border: none;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .mobile-link-item:hover, .mobile-link-item.active {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
        }

        .mobile-active-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ff5225;
          box-shadow: 0 0 8px #ff5225;
        }

        .mobile-drawer-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
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
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #ff8080;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </header>
  );
}

export default Navbar;
