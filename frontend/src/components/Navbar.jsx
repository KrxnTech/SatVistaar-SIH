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
    { label: 'About', path: '/about' },
    { label: 'Help', path: '/help' }
  ];

  const handleNavClick = (path) => {
    navigateTo(path);
    setMobileMenuOpen(false);
  };

  const isTransparent = isHomeRoute && !scrolledPastHero;

  return (
    <header className={`sat-navbar-unified ${isTransparent ? 'navbar-transparent' : 'navbar-solid'}`}>
      {/* Main Navbar Bar */}
      <div className="navbar-main-row">
        <div className="container navbar-content-container">
          {/* Brand Logo & Title */}
          <div className="brand-group" onClick={() => handleNavClick('/')}>
            <div className="brand-logo-badge">
              <Satellite className="brand-icon" size={20} />
            </div>
            <div className="brand-text">
              <span className="brand-title">SatVistaar</span>
              <span className="brand-subtitle">Remote Sensing Vision Intelligence</span>
            </div>
          </div>

          {/* Center Navigation Links */}
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

          {/* Right Actions Group */}
          <div className="navbar-actions">
            {/* Start Analysis Quick CTA (shown if not on /analysis) */}
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

            {/* Auth Buttons */}
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
                  className={`gov-signin-btn ${currentRoute === '/login' ? 'active-auth' : ''}`}
                  onClick={() => handleNavClick('/login')}
                >
                  <LogIn size={14} />
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
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }

        .sat-navbar-unified.navbar-solid {
          background: rgba(0, 0, 102, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 8px 32px rgba(0, 0, 70, 0.4);
        }

        .navbar-main-row {
          padding: 0.85rem 0;
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
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .brand-group:hover .brand-logo-badge {
          background: #ff5225;
          border-color: #ff5225;
          transform: scale(1.05);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.01em;
          line-height: 1.15;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .brand-subtitle {
          font-size: 0.68rem;
          color: rgba(255, 255, 255, 0.72);
          letter-spacing: 0.02em;
        }

        /* Center Nav Links */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        @media (max-width: 860px) {
          .desktop-nav {
            display: none;
          }
        }

        .nav-link-btn {
          position: relative;
          padding: 0.5rem 1rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.88);
          background: transparent;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          min-height: 38px;
          transition: all 0.2s ease;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
        }

        .nav-link-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.14);
        }

        .nav-link-btn.active {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.16);
        }

        .active-orange-underline {
          position: absolute;
          bottom: -2px;
          left: 20%;
          right: 20%;
          height: 2.5px;
          background: #ff5225;
          border-radius: 999px;
          box-shadow: 0 0 10px rgba(255, 82, 37, 0.8);
        }

        /* Right Actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .gov-cta-orange-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.6rem 1.15rem;
          background: #ff5225;
          color: #ffffff;
          border: none;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 700;
          min-height: 38px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(255, 82, 37, 0.4);
          transition: all 0.2s ease;
        }

        .gov-cta-orange-btn:hover {
          background: #e6451a;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255, 82, 37, 0.5);
        }

        .auth-btn-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .gov-signin-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.24);
          color: #ffffff;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 600;
          min-height: 38px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gov-signin-btn:hover, .gov-signin-btn.active-auth {
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.4);
          color: #ffffff;
        }

        .gov-register-btn {
          display: inline-flex;
          align-items: center;
          padding: 0.55rem 1rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 600;
          min-height: 38px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gov-register-btn:hover, .gov-register-btn.active-auth {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.35);
          color: #ffffff;
        }

        /* User Profile Badge */
        .user-profile-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.8rem;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 999px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #ffffff;
        }

        .user-icon {
          color: #ff5225;
        }

        .gov-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.24);
          color: rgba(255, 255, 255, 0.85);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .gov-logout-btn:hover {
          background: rgba(239, 68, 68, 0.25);
          border-color: rgba(239, 68, 68, 0.5);
          color: #ff6b6b;
        }

        /* Mobile Menu Button */
        .mobile-toggle-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.24);
          color: #ffffff;
          cursor: pointer;
        }

        @media (max-width: 860px) {
          .mobile-toggle-btn {
            display: flex;
          }
          .auth-btn-group, .gov-cta-orange-btn {
            display: none;
          }
        }

        /* Mobile Drawer */
        .mobile-nav-drawer {
          background: rgba(0, 0, 102, 0.98);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
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
