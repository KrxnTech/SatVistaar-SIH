import React, { useState, useEffect } from 'react';
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
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  const isHomeRoute = currentRoute === '/';

  useEffect(() => {
    if (!isHomeRoute) return;

    const handleScroll = () => {
      const heroEl = document.querySelector('.reference-hero') || document.querySelector('.hero-section');
      const heroHeight = heroEl ? heroEl.offsetHeight - 80 : 500;
      setScrolledPastHero(window.scrollY > heroHeight);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomeRoute]);

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

  const isPastHero = isHomeRoute && scrolledPastHero;

  return (
    <header className={`gov-navbar-root ${isHomeRoute ? 'home-navbar' : ''} ${isPastHero ? 'scrolled-past-hero' : ''}`}>
      {/* Main Navbar */}
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
            {isHomeRoute ? (
              <div className="home-auth-actions">
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
                  className="gov-cta-orange-btn"
                  onClick={() => handleNavClick('/register')}
                >
                  <span>Register</span>
                </button>
              </div>
            ) : (
              <>
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
              </>
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
                  onClick={() => handleNavClick(isHomeRoute ? '/register' : '/analysis')}
                >
                  {!isHomeRoute && <Play size={15} fill="currentColor" />}
                  <span>{isHomeRoute ? 'Register' : 'Start Analysis Dashboard'}</span>
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
          background: var(--bg-main);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, backdrop-filter 0.35s ease;
        }
        .gov-navbar-root.home-navbar {
          position: fixed;
          left: 0;
          right: 0;
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
        .gov-navbar-root.home-navbar.scrolled-past-hero {
          background: rgba(0, 0, 102, 0.94);
          border-bottom: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px rgba(0, 0, 70, 0.45);
        }
        .gov-navbar-root.home-navbar.scrolled-past-hero .brand-logo-badge {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: var(--white);
          border-radius: 6px;
        }
        .gov-navbar-root.home-navbar.scrolled-past-hero .brand-title {
          color: var(--white);
          text-shadow: none;
        }
        .gov-navbar-root.home-navbar.scrolled-past-hero .nav-link-btn {
          color: rgba(255, 255, 255, 0.88);
          text-shadow: none;
        }
        .gov-navbar-root.home-navbar.scrolled-past-hero .nav-link-btn:hover,
        .gov-navbar-root.home-navbar.scrolled-past-hero .nav-link-btn.active {
          color: var(--white);
          background: rgba(255, 255, 255, 0.16);
        }
        .gov-navbar-root.home-navbar.scrolled-past-hero .gov-signin-btn {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.25);
          color: var(--white);
        }
        .gov-navbar-root.home-navbar.scrolled-past-hero .gov-signin-btn:hover {
          background: rgba(255, 255, 255, 0.22);
          color: var(--white);
        }
        .gov-navbar-root.home-navbar.scrolled-past-hero .gov-cta-orange-btn {
          background: var(--flame-orange);
          color: var(--white);
          box-shadow: 0 4px 14px rgba(255, 82, 37, 0.4);
        }
        .gov-navbar-root.home-navbar.scrolled-past-hero .gov-cta-orange-btn:hover {
          background: var(--accent-orange-hover);
          transform: translateY(-1px);
        }
        .gov-top-banner {
          background: var(--bg-main);
          border-bottom: 1px solid var(--dark-gray);
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
          color: var(--gray);
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
          color: var(--slate-gray);
          font-size: 0.65rem;
        }
        @media (max-width: 640px) {
          .top-banner-meta { display: none; }
        }

        .navbar-main {
          padding: 0.85rem 0;
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
          width: 42px;
          height: 42px;
          border-radius: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
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
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: 0;
        }
        .brand-tag {
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          background: rgba(255, 82, 37, 0.12);
          border: 1px solid rgba(255, 82, 37, 0.35);
          color: var(--accent-orange-text);
        }
        .brand-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .home-navbar .brand-logo-badge {
          background: transparent;
          border-color: transparent;
          color: var(--white);
        }
        .home-navbar .brand-title {
          color: var(--white);
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.32);
        }
        .home-navbar .brand-subtitle {
          display: none;
        }

        /* Desktop Nav */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 1.25rem;
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
          border-radius: 999px;
          min-height: 36px;
        }
        .home-navbar .nav-link-btn {
          color: rgba(255, 255, 255, 0.88);
          font-size: 0.98rem;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.32);
        }
        .nav-link-btn:hover {
          color: var(--text-main);
          background: var(--very-light-gray);
        }
        .nav-link-btn.active {
          color: var(--text-main);
          background: var(--bg-card);
        }
        .home-navbar .nav-link-btn:hover,
        .home-navbar .nav-link-btn.active {
          color: var(--white);
          background: rgba(255, 255, 255, 0.12);
        }
        .active-orange-underline {
          position: absolute;
          bottom: 0;
          left: 15%;
          right: 15%;
          height: 2px;
          background: var(--accent-orange);
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(255, 82, 37, 0.6);
        }

        /* Actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .home-auth-actions {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }

        /* Primary Orange CTA */
        .gov-cta-orange-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.65rem 1.15rem;
          background: var(--accent-orange);
          color: var(--white);
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 700;
          min-height: 42px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }
        .home-navbar .gov-cta-orange-btn {
          background: var(--white);
          color: var(--dark-gray);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
        }
        .gov-cta-orange-btn:hover {
          background: var(--accent-orange-hover);
          transform: translateY(-1px);
        }
        .home-navbar .gov-cta-orange-btn:hover {
          background: var(--flame-orange);
          color: var(--white);
        }
        @media (max-width: 720px) {
          .gov-cta-orange-btn { display: none; }
          .home-auth-actions { display: none; }
          .mobile-drawer-actions .gov-cta-orange-btn { display: inline-flex; }
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
          background: var(--bg-card);
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
          background: var(--bg-card);
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
          background: var(--very-light-gray);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
          min-height: 36px;
        }
        .gov-signin-btn:hover {
          background: var(--light-gray);
          border-color: var(--accent-blue);
          color: var(--accent-blue-text);
        }
        .gov-register-btn {
          padding: 0.4rem 0.8rem;
          background: var(--light-gray);
          border: 1px solid var(--border-medium);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          min-height: 36px;
        }
        .gov-register-btn:hover {
          background: var(--light-gray);
          color: var(--text-main);
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
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
        }
        .home-navbar .gov-signin-btn {
          min-height: 42px;
          padding: 0.65rem 1.05rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.24);
          color: var(--white);
          box-shadow: none;
        }
        .home-navbar .gov-signin-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.38);
          color: var(--white);
        }
        .home-navbar .mobile-toggle-btn {
          color: var(--white);
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
        }
        @media (max-width: 840px) {
          .mobile-toggle-btn { display: flex; }
        }
        .mobile-nav-drawer {
          background: var(--bg-main);
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-medium);
          padding: 1rem 0 1.5rem 0;
        }
        .home-navbar .mobile-nav-drawer {
          background: rgba(0, 0, 102, 0.92);
          border-color: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(10px);
        }
        .home-navbar .mobile-link-item {
          color: var(--white);
        }
        .home-navbar .mobile-link-item:hover,
        .home-navbar .mobile-link-item.active {
          background: rgba(255, 255, 255, 0.12);
          color: var(--white);
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
          background: var(--bg-card);
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
