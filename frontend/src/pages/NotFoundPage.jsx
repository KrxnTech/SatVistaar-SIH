import React from 'react';
import { Home, ArrowLeft, Search, Compass, AlertCircle, Play } from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';

export function NotFoundPage() {
  const { navigateTo, currentRoute } = useRouter();

  return (
    <div className="gov-404-page">
      <div className="container not-found-container">
        <div className="not-found-card">
          {/* Minimalist Portal / Compass Orb */}
          <div className="zero-orb">
            <Compass size={32} className="compass-icon" />
          </div>

          <h1 className="not-found-title">404</h1>
          <p className="not-found-lead">
            This page seems to have slipped through a time portal.
          </p>

          {/* Action Redirection Buttons */}
          <div className="not-found-actions">
            <button
              type="button"
              className="action-btn primary font-mono"
              onClick={() => navigateTo('/')}
            >
              <Home size={15} />
              <span>RETURN TO HOME</span>
            </button>

            <button
              type="button"
              className="action-btn secondary font-mono"
              onClick={() => navigateTo('/analysis')}
            >
              <Play size={15} />
              <span>LAUNCH WORKSPACE</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .gov-404-page {
          background: #f8fafc;
          min-height: calc(100vh - 160px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem 5rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .not-found-container {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 680px;
          width: 100%;
        }

        .not-found-card {
          background: #ffffff;
          border: 1.5px solid #000066;
          border-radius: 16px;
          padding: 3.5rem 2.5rem;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 102, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        .status-code-badge {
          font-size: 0.7rem;
          font-weight: 800;
          color: #ff5225;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: rgba(255, 82, 37, 0.08);
          border: 1px solid rgba(255, 82, 37, 0.25);
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          margin-bottom: 1.5rem;
        }

        .graphic-404-block {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .digit {
          font-size: 4.5rem;
          font-weight: 900;
          color: #000066;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .zero-orb {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #fff5f2;
          border: 2px solid #ff5225;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(255, 82, 37, 0.2);
        }

        .compass-icon {
          color: #ff5225;
          animation: spinPulse 6s ease-in-out infinite;
        }

        @keyframes spinPulse {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
        }

        .not-found-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: -0.02em;
          margin: 0 0 0.5rem 0;
        }

        .not-found-lead {
          font-size: 0.925rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 1.75rem 0;
          max-width: 480px;
        }

        .path-code {
          background: #f1f5f9;
          color: #ff5225;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 700;
          border: 1px solid #e2e8f0;
        }

        /* Diagnostic Box */
        .diagnostic-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.85rem 1.25rem;
          width: 100%;
          text-align: left;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          font-size: 0.72rem;
        }

        .diag-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .diag-key {
          color: #64748b;
          font-weight: 700;
        }

        .diag-val {
          color: #0f172a;
          font-weight: 700;
        }

        .diag-val.live {
          color: #16a34a;
        }

        /* Action Buttons */
        .not-found-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          width: 100%;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.7rem 1.5rem;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
        }

        .action-btn.primary {
          background: #000066;
          color: #ffffff;
          border: 1.5px solid #000066;
          box-shadow: 0 2px 10px rgba(0, 0, 102, 0.2);
        }

        .action-btn.primary:hover {
          background: #ff5225;
          border-color: #ff5225;
          transform: translateY(-1px);
        }

        .action-btn.secondary {
          background: #ffffff;
          color: #000066;
          border: 1.5px solid #000066;
        }

        .action-btn.secondary:hover {
          background: rgba(0, 0, 102, 0.05);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

export default NotFoundPage;
