import React from 'react';
import { useAuth } from './AuthContext.jsx';
import { Satellite, ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ children, fallback = null }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-guard-loading">
        <div className="guard-card glass-panel">
          <div className="radar-spinner-wrapper">
            <Satellite className="radar-icon" size={32} />
            <div className="radar-sweep" />
          </div>
          <h3>Verifying Security Credentials</h3>
          <p className="guard-desc">Authenticating SatVistaar mission access session...</p>
        </div>

        <style>{`
          .auth-guard-loading {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .guard-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 2.5rem 3rem;
            max-width: 440px;
            width: 100%;
            border: 1px solid var(--border-medium);
            box-shadow: var(--shadow-glow);
          }
          .radar-spinner-wrapper {
            position: relative;
            width: 72px;
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: rgba(0, 0, 102, 0.6);
            border: 1px solid var(--accent-cyan);
            margin-bottom: 1.5rem;
          }
          .radar-icon {
            color: var(--accent-cyan);
            z-index: 2;
          }
          .radar-sweep {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top-color: var(--accent-cyan);
            border-right-color: var(--accent-indigo);
            animation: spin 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
          }
          .guard-card h3 {
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--text-main);
            margin-bottom: 0.5rem;
          }
          .guard-desc {
            font-size: 0.825rem;
            color: var(--text-muted);
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
}

export default ProtectedRoute;
