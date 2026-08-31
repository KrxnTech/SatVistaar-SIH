import React from 'react';

export function StatusBadge({
  label,
  variant = 'success', // 'success' | 'cyan' | 'magenta' | 'warning' | 'danger' | 'neutral'
  pulse = true,
  dot = true,
  className = ''
}) {
  return (
    <span className={`status-badge-root badge-${variant} ${className}`}>
      {dot && <span className={`status-badge-dot ${pulse ? 'pulse' : ''}`} />}
      <span className="status-badge-text">{label}</span>

      <style>{`
        .status-badge-root {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.725rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          border: 1px solid transparent;
          width: fit-content;
        }
        .status-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Success / Green */
        .badge-success {
          background: rgba(0, 255, 136, 0.12);
          border-color: rgba(0, 255, 136, 0.35);
          color: #00ff88;
        }
        .badge-success .status-badge-dot {
          background: #00ff88;
          box-shadow: 0 0 8px #00ff88;
        }

        /* Cyan */
        .badge-cyan {
          background: rgba(0, 212, 255, 0.12);
          border-color: rgba(0, 212, 255, 0.35);
          color: #00d4ff;
        }
        .badge-cyan .status-badge-dot {
          background: #00d4ff;
          box-shadow: 0 0 8px #00d4ff;
        }

        /* Magenta */
        .badge-magenta {
          background: rgba(255, 0, 255, 0.12);
          border-color: rgba(255, 0, 255, 0.35);
          color: #ff00ff;
        }
        .badge-magenta .status-badge-dot {
          background: #ff00ff;
          box-shadow: 0 0 8px #ff00ff;
        }

        /* Warning / Amber */
        .badge-warning {
          background: rgba(251, 191, 36, 0.12);
          border-color: rgba(251, 191, 36, 0.35);
          color: #fbbf24;
        }
        .badge-warning .status-badge-dot {
          background: #fbbf24;
          box-shadow: 0 0 8px #fbbf24;
        }

        /* Danger / Red */
        .badge-danger {
          background: rgba(255, 51, 102, 0.12);
          border-color: rgba(255, 51, 102, 0.35);
          color: #ff3366;
        }
        .badge-danger .status-badge-dot {
          background: #ff3366;
          box-shadow: 0 0 8px #ff3366;
        }

        /* Neutral */
        .badge-neutral {
          background: var(--bg-muted);
          border-color: var(--border-subtle);
          color: var(--text-muted);
        }
        .badge-neutral .status-badge-dot {
          background: var(--text-dim);
        }

        .status-badge-dot.pulse {
          animation: pulse-dot 2s infinite ease-in-out;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </span>
  );
}

export default StatusBadge;
