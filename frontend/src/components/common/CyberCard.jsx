import React from 'react';

export function CyberCard({
  children,
  className = '',
  title,
  subtitle,
  badge,
  badgeVariant = 'primary', // 'primary' | 'secondary' | 'tertiary' | 'warning'
  glow = false,
  glowVariant = 'cyan', // 'cyan' | 'green' | 'magenta'
  cutCorner = false,
  headerAction,
  ...props
}) {
  const glowClass = glow ? `glow-${glowVariant}` : '';
  const cutClass = cutCorner ? 'cyber-cut' : '';

  return (
    <div className={`cyber-card-root ${glowClass} ${cutClass} ${className}`} {...props}>
      {(title || badge || headerAction) && (
        <div className="cyber-card-header">
          <div className="header-text-group">
            {title && <h3 className="cyber-card-title">{title}</h3>}
            {subtitle && <p className="cyber-card-subtitle">{subtitle}</p>}
          </div>
          <div className="header-meta-group">
            {badge && (
              <span className={`cyber-card-badge badge-${badgeVariant}`}>
                {badge}
              </span>
            )}
            {headerAction}
          </div>
        </div>
      )}

      <div className="cyber-card-body">
        {children}
      </div>

      <style>{`
        .cyber-card-root {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
          position: relative;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .cyber-card-root:hover {
          border-color: var(--border-medium);
        }
        .cyber-card-root.glow-cyan {
          border-color: var(--accent-blue-border);
          box-shadow: var(--shadow-blue-glow);
        }
        .cyber-card-root.glow-green {
          border-color: var(--status-green-border);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.12);
        }
        .cyber-card-root.glow-magenta {
          border-color: var(--accent-orange-border);
          box-shadow: var(--shadow-orange-glow);
        }
        .cyber-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.15rem;
          border-bottom: 1px solid var(--border-subtle);
          background: rgba(0, 0, 102, 0.32);
        }
        .header-text-group {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .cyber-card-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }
        .cyber-card-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .header-meta-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cyber-card-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .badge-primary {
          color: var(--primary);
          background: var(--primary-subtle);
          border: 1px solid var(--status-green-border);
        }
        .badge-secondary {
          color: var(--secondary);
          background: var(--secondary-subtle);
          border: 1px solid var(--accent-orange-border);
        }
        .badge-tertiary {
          color: var(--tertiary);
          background: var(--tertiary-subtle);
          border: 1px solid var(--accent-blue-border);
        }
        .badge-warning {
          color: var(--status-warning);
          background: var(--status-warning-bg);
          border: 1px solid var(--status-warning-border);
        }
        .cyber-card-body {
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
      `}</style>
    </div>
  );
}

export default CyberCard;
