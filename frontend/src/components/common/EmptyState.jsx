import React from 'react';
import { Home, ArrowLeft, Sparkles, Layers, FileQuestion, Play } from 'lucide-react';
import { useRouter } from '../../context/RouterContext.jsx';

export function EmptyState({
  icon: Icon = Layers,
  tag = "MISSION READINESS",
  title = "No Active Satellite Intelligence",
  description = "No analysis mission has been executed in this session yet. Upload your satellite raster or configure a task in the workspace to synthesize high-precision observations.",
  primaryActionLabel = "Return to Home",
  primaryActionRoute = "/",
  secondaryActionLabel = "Launch Workspace",
  secondaryActionRoute = "/analysis",
  children
}) {
  const { navigateTo } = useRouter();

  return (
    <div className="gov-empty-state-card">
      <div className="empty-state-badge font-mono">{tag}</div>

      <div className="empty-state-icon-wrap">
        <Icon size={28} className="empty-state-icon" />
      </div>

      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-description">{description}</p>

      {children}

      <div className="empty-state-actions">
        {primaryActionLabel && (
          <button
            type="button"
            className="empty-btn primary font-mono"
            onClick={() => navigateTo(primaryActionRoute)}
          >
            <Home size={14} />
            <span>{primaryActionLabel}</span>
          </button>
        )}

        {secondaryActionLabel && (
          <button
            type="button"
            className="empty-btn secondary font-mono"
            onClick={() => navigateTo(secondaryActionRoute)}
          >
            <Play size={14} />
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>

      <style>{`
        .gov-empty-state-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 3rem 2rem;
          box-shadow: 0 4px 24px -4px rgba(0, 0, 102, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 640px;
          margin: 2rem auto;
          width: 100%;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .empty-state-badge {
          font-size: 0.68rem;
          font-weight: 800;
          color: #ff5225;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(255, 82, 37, 0.08);
          border: 1px solid rgba(255, 82, 37, 0.25);
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          margin-bottom: 1.25rem;
        }

        .empty-state-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .empty-state-icon {
          color: #000066;
        }

        .empty-state-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: -0.01em;
          margin: 0 0 0.5rem 0;
        }

        .empty-state-description {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 1.75rem 0;
          max-width: 500px;
        }

        .empty-state-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          flex-wrap: wrap;
          width: 100%;
        }

        .empty-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          padding: 0.65rem 1.35rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
        }

        .empty-btn.primary {
          background: #000066;
          color: #ffffff;
          border: 1.5px solid #000066;
          box-shadow: 0 2px 8px rgba(0, 0, 102, 0.18);
        }

        .empty-btn.primary:hover {
          background: #ff5225;
          border-color: #ff5225;
          transform: translateY(-1px);
        }

        .empty-btn.secondary {
          background: #ffffff;
          color: #000066;
          border: 1.5px solid #000066;
        }

        .empty-btn.secondary:hover {
          background: rgba(0, 0, 102, 0.05);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

export default EmptyState;
