import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { Satellite, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Sparkles } from 'lucide-react';

export function Login({ onNavigateToRegister, onSuccess }) {
  const { login, error: contextError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const displayError = localError || contextError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    if (!password) {
      setLocalError('Please enter your password');
      return;
    }

    setSubmitting(true);
    try {
      await login({
        email: email.trim(),
        password
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setLocalError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-badge-icon">
            <Satellite size={28} className="auth-satellite" />
            <div className="badge-ring" />
          </div>
          <h2 className="auth-title">Welcome to SatVistaar</h2>
          <p className="auth-subtitle">Sign in to access the Autonomous Geospatial Platform</p>
        </div>

        {displayError && (
          <div className="auth-alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="input-wrapper">
              <Mail size={17} className="field-icon" />
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (displayError) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                disabled={submitting}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
            </div>
            <div className="input-wrapper">
              <Lock size={17} className="field-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (displayError) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                disabled={submitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <span className="btn-loading-state">
                <span className="btn-spinner" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <span className="btn-content">
                <LogIn size={18} />
                <span>Sign In to SatVistaar</span>
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account yet?</span>{' '}
          <button
            type="button"
            className="switch-auth-btn"
            onClick={() => {
              clearError();
              if (onNavigateToRegister) onNavigateToRegister();
            }}
          >
            Register now
          </button>
        </div>
      </div>

      <style>{`
        .auth-page-container {
          min-height: calc(100vh - 140px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }
        .auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.25rem;
          background: rgba(13, 19, 34, 0.9);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xl);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), var(--shadow-glow);
          position: relative;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }
        .auth-badge-icon {
          position: relative;
          width: 58px;
          height: 58px;
          margin: 0 auto 1.25rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border: 1px solid var(--accent-cyan);
          border-radius: var(--radius-lg);
          box-shadow: 0 0 20px var(--accent-cyan-glow);
        }
        .auth-satellite {
          color: var(--accent-cyan);
        }
        .badge-ring {
          position: absolute;
          inset: -4px;
          border-radius: calc(var(--radius-lg) + 4px);
          border: 1px dashed rgba(0, 229, 255, 0.35);
          animation: rotate-slow 20s linear infinite;
        }
        .auth-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 0.35rem;
        }
        .auth-subtitle {
          font-size: 0.825rem;
          color: var(--text-muted);
        }
        .auth-alert {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 1rem;
          background: var(--status-error-bg);
          border: 1px solid rgba(244, 63, 94, 0.4);
          border-radius: var(--radius-md);
          color: #fca5a5;
          font-size: 0.825rem;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }
        .alert-icon {
          flex-shrink: 0;
          color: var(--status-error);
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .form-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-main);
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 0.875rem;
          color: var(--text-dim);
          pointer-events: none;
        }
        .form-input {
          width: 100%;
          padding: 0.75rem 0.875rem 0.75rem 2.65rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          color: #ffffff;
          transition: all 0.2s ease;
          outline: none;
        }
        .form-input:focus {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 12px var(--accent-cyan-glow);
          background: rgba(10, 15, 29, 0.95);
        }
        .form-input::placeholder {
          color: var(--text-dim);
        }
        .password-toggle {
          position: absolute;
          right: 0.875rem;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
        }
        .password-toggle:hover {
          color: var(--text-main);
        }
        .auth-submit-btn {
          width: 100%;
          padding: 0.875rem 1.25rem;
          margin-top: 0.5rem;
          background: linear-gradient(135deg, #00e5ff 0%, #3b82f6 50%, #6366f1 100%);
          border-radius: var(--radius-md);
          color: #070a12;
          font-weight: 600;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 229, 255, 0.3);
          transition: all 0.2s ease;
        }
        .auth-submit-btn:hover:not(:disabled) {
          box-shadow: 0 6px 22px rgba(0, 229, 255, 0.45);
          transform: translateY(-1px);
        }
        .auth-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-content, .btn-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(7, 10, 18, 0.3);
          border-top-color: #070a12;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.825rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.25rem;
        }
        .switch-auth-btn {
          color: var(--accent-cyan);
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .switch-auth-btn:hover {
          color: #67e8f9;
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Login;
