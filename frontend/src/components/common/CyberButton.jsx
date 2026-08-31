import React from 'react';
import { Loader2 } from 'lucide-react';

export function CyberButton({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon = null,
  iconRight: IconRight = null,
  loading = false,
  disabled = false,
  cutCorner = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const cutClass = cutCorner ? 'cyber-cut' : '';

  return (
    <button
      type={type}
      className={`cyber-btn btn-${variant} btn-${size} ${cutClass} ${loading ? 'loading' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="btn-spin-icon" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="btn-icon" />}
          <span>{children}</span>
          {IconRight && <IconRight size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="btn-icon-right" />}
        </>
      )}

      <style>{`
        .cyber-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          border-radius: var(--radius-sm);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          white-space: nowrap;
          position: relative;
        }

        /* Sizes (ensuring minimum 44px for touch on md/lg) */
        .btn-sm {
          padding: 0.35rem 0.75rem;
          font-size: 0.775rem;
          min-height: 36px;
        }
        .btn-md {
          padding: 0.65rem 1.25rem;
          font-size: 0.875rem;
          min-height: 44px;
        }
        .btn-lg {
          padding: 0.85rem 1.65rem;
          font-size: 0.975rem;
          min-height: 50px;
        }

        /* Primary (Neon Green) */
        .btn-primary {
          background: #00ff88;
          color: #070a0f;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
        }
        .btn-primary:hover:not(:disabled) {
          background: #33ff9f;
          box-shadow: 0 0 25px rgba(0, 255, 136, 0.55);
          transform: translateY(-1px);
        }

        /* Secondary (Neon Magenta) */
        .btn-secondary {
          background: #ff00ff;
          color: #ffffff;
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
        }
        .btn-secondary:hover:not(:disabled) {
          background: #ff33ff;
          box-shadow: 0 0 25px rgba(255, 0, 255, 0.55);
          transform: translateY(-1px);
        }

        /* Tertiary (Neon Cyan) */
        .btn-tertiary {
          background: #00d4ff;
          color: #070a0f;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
        }
        .btn-tertiary:hover:not(:disabled) {
          background: #33ddff;
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.55);
          transform: translateY(-1px);
        }

        /* Outline */
        .btn-outline {
          background: rgba(18, 18, 26, 0.6);
          border: 1px solid var(--border-medium);
          color: var(--text-main);
        }
        .btn-outline:hover:not(:disabled) {
          border-color: var(--tertiary);
          color: var(--tertiary);
          box-shadow: 0 0 15px var(--tertiary-glow);
          background: rgba(0, 212, 255, 0.08);
          transform: translateY(-1px);
        }

        /* Ghost */
        .btn-ghost {
          background: transparent;
          color: var(--text-muted);
        }
        .btn-ghost:hover:not(:disabled) {
          color: var(--text-bright);
          background: var(--bg-muted);
        }

        /* Danger */
        .btn-danger {
          background: rgba(255, 51, 102, 0.15);
          border: 1px solid rgba(255, 51, 102, 0.4);
          color: #ff6688;
        }
        .btn-danger:hover:not(:disabled) {
          background: rgba(255, 51, 102, 0.3);
          border-color: #ff3366;
          color: #ffffff;
          box-shadow: 0 0 15px rgba(255, 51, 102, 0.35);
        }

        .cyber-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .btn-spin-icon {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}

export default CyberButton;
