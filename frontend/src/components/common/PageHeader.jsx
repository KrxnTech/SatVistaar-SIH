import React from 'react';
import { Terminal, Sparkles } from 'lucide-react';

export function PageHeader({
  title,
  subtitle,
  tag = 'SAT_SYS',
  accentColor = 'cyan', // 'cyan' | 'green' | 'magenta'
  actions = null,
  breadcrumbs = null,
  badge = null
}) {
  return (
    <div className={`page-header-root accent-${accentColor}`}>
      <div className="container header-container">
        <div className="header-meta-row">
          <div className="terminal-tag">
            <Terminal size={12} className="tag-icon" />
            <span>&gt; {tag} // {breadcrumbs || 'WORKSPACE'}</span>
          </div>
          {badge && <div className="header-badge-wrap">{badge}</div>}
        </div>

        <div className="header-main-row">
          <div className="title-block">
            <h1 className="page-title glitch-text" data-text={title}>
              {title}
            </h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>

          {actions && (
            <div className="header-actions-block">
              {actions}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .page-header-root {
          padding: 2.25rem 0 1.75rem 0;
          border-bottom: 1px solid var(--border-subtle);
          background: linear-gradient(180deg, rgba(31, 33, 38, 0.75) 0%, rgba(0, 0, 0, 0.4) 100%);
          position: relative;
        }
        .page-header-root::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 140px;
          height: 2px;
          background: var(--tertiary);
          box-shadow: 0 0 12px var(--tertiary-glow);
        }
        .page-header-root.accent-green::after {
          background: var(--primary);
          box-shadow: 0 0 12px var(--primary-glow);
        }
        .page-header-root.accent-magenta::after {
          background: var(--secondary);
          box-shadow: 0 0 12px var(--secondary-glow);
        }
        .header-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .header-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .terminal-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.725rem;
          color: var(--tertiary);
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .accent-green .terminal-tag {
          color: var(--primary);
          background: var(--primary-subtle);
          border-color: rgba(34, 197, 94, 0.25);
        }
        .accent-magenta .terminal-tag {
          color: var(--secondary);
          background: var(--secondary-subtle);
          border-color: rgba(255, 82, 37, 0.25);
        }
        .tag-icon {
          opacity: 0.8;
        }
        .header-main-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .title-block {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          max-width: 820px;
        }
        .page-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-main);
          line-height: 1.15;
        }
        .page-subtitle {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .header-actions-block {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .page-header-root {
            padding: 1.5rem 0 1.25rem 0;
          }
          .page-title {
            font-size: 1.5rem;
          }
          .page-subtitle {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}

export default PageHeader;
