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
          background: rgba(34, 197, 94, 0.12);
          border-color: rgba(34, 197, 94, 0.35);
          color: var(--success);
        }
        .badge-success .status-badge-dot {
          background: var(--success);
          box-shadow: 0 0 8px var(--success);
        }

        /* Cyan */
        .badge-cyan {
          background: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.35);
          color: var(--info);
        }
        .badge-cyan .status-badge-dot {
          background: var(--info);
          box-shadow: 0 0 8px var(--info);
        }

        /* Magenta */
        .badge-magenta {
          background: rgba(255, 82, 37, 0.12);
          border-color: rgba(255, 82, 37, 0.35);
          color: var(--flame-orange);
        }
        .badge-magenta .status-badge-dot {
          background: var(--flame-orange);
          box-shadow: 0 0 8px var(--flame-orange);
        }

        /* Warning / Amber */
        .badge-warning {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.35);
          color: var(--warning);
        }
        .badge-warning .status-badge-dot {
          background: var(--warning);
          box-shadow: 0 0 8px var(--warning);
        }

        /* Danger / Red */
        .badge-danger {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.35);
          color: var(--error);
        }
        .badge-danger .status-badge-dot {
          background: var(--error);
          box-shadow: 0 0 8px var(--error);
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
