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

        /* Primary */
        .btn-primary {
          background: var(--navy-blue);
          color: var(--white);
          box-shadow: var(--shadow-blue-glow);
        }
        .btn-primary:hover:not(:disabled) {
          background: #000052;
          box-shadow: 0 0 18px rgba(0, 0, 102, 0.35);
          transform: translateY(-1px);
        }

        /* Secondary */
        .btn-secondary {
          background: var(--flame-orange);
          color: var(--white);
          box-shadow: var(--shadow-orange-glow);
        }
        .btn-secondary:hover:not(:disabled) {
          background: var(--accent-orange-hover);
          box-shadow: 0 0 18px rgba(255, 82, 37, 0.42);
          transform: translateY(-1px);
        }

        /* Tertiary */
        .btn-tertiary {
          background: var(--info);
          color: var(--white);
          box-shadow: var(--shadow-blue-glow);
        }
        .btn-tertiary:hover:not(:disabled) {
          background: var(--accent-blue-hover);
          box-shadow: 0 0 18px rgba(59, 130, 246, 0.42);
          transform: translateY(-1px);
        }

        /* Outline */
        .btn-outline {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid var(--border-medium);
          color: var(--text-main);
        }
        .btn-outline:hover:not(:disabled) {
          border-color: var(--flame-orange);
          color: var(--flame-orange);
          box-shadow: var(--shadow-orange-glow);
          background: var(--accent-orange-subtle);
          transform: translateY(-1px);
        }

        /* Ghost */
        .btn-ghost {
          background: transparent;
          color: var(--text-muted);
        }
        .btn-ghost:hover:not(:disabled) {
          color: var(--text-main);
          background: var(--bg-muted);
        }

        /* Danger */
        .btn-danger {
          background: var(--status-red-subtle);
          border: 1px solid var(--status-red-border);
          color: var(--error);
        }
        .btn-danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.24);
          border-color: var(--error);
          color: var(--white);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.35);
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
