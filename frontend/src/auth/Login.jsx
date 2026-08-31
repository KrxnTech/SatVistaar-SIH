import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { Satellite, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

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
    <div className="gov-auth-container">
      <div className="gov-auth-card gov-card">
        <div className="auth-header">
          <div className="auth-badge-icon">
            <Satellite size={22} />
          </div>
          <h2 className="auth-title">Sign In to SatVistaar</h2>
          <p className="auth-subtitle">Access the Autonomous Geospatial Analysis Platform</p>
        </div>

        {displayError && (
          <div className="auth-alert">
            <AlertCircle size={15} className="alert-icon" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label font-mono" htmlFor="login-email">
              EMAIL ADDRESS
            </label>
            <div className="input-wrapper">
              <Mail size={15} className="field-icon" />
              <input
                id="login-email"
                type="email"
                className="gov-dark-input"
                placeholder="analyst@organization.gov.in"
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
            <label className="form-label font-mono" htmlFor="login-password">
              PASSWORD
            </label>
            <div className="input-wrapper">
              <Lock size={15} className="field-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="gov-dark-input"
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
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="gov-auth-submit-orange-btn"
            disabled={submitting}
          >
            {submitting ? (
              <span className="btn-loading-state">
                <span className="btn-spinner" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <span className="btn-content">
                <LogIn size={15} />
                <span>Sign In to Platform</span>
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Need access credentials?</span>{' '}
          <button
            type="button"
            className="switch-auth-btn"
            onClick={() => {
              clearError();
              if (onNavigateToRegister) onNavigateToRegister();
            }}
          >
            Register new account
          </button>
        </div>
      </div>

      <style>{`
        .gov-auth-container {
          min-height: calc(100vh - 180px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          background: #08090d;
        }
        .gov-auth-card {
          width: 100%;
          max-width: 420px;
          padding: 2.25rem;
          background: #141722;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .auth-badge-icon {
          width: 44px;
          height: 44px;
          margin: 0 auto 1rem auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d0e15;
          color: var(--accent-orange);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
        }
        .auth-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }
        .auth-subtitle {
          font-size: 0.775rem;
          color: var(--text-muted);
        }
        .auth-alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.85rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          border-radius: var(--radius-sm);
          color: var(--status-red-text);
          font-size: 0.8rem;
          margin-bottom: 1.25rem;
        }
        .alert-icon {
          flex-shrink: 0;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .form-label {
          font-size: 0.725rem;
          font-weight: 700;
          color: var(--text-dim);
          letter-spacing: 0.05em;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-dim);
          pointer-events: none;
        }
        .gov-dark-input {
          width: 100%;
          padding: 0.65rem 0.75rem 0.65rem 2.35rem;
          background: #0a0c12;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: #ffffff;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gov-dark-input:focus {
          border-color: var(--accent-orange);
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.25);
        }
        .password-toggle {
          position: absolute;
          right: 0.75rem;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.2rem;
          min-height: auto;
        }
        .password-toggle:hover {
          color: #ffffff;
        }
        .gov-auth-submit-orange-btn {
          width: 100%;
          padding: 0.75rem 1.25rem;
          margin-top: 0.25rem;
          background: var(--accent-orange);
          color: #08090d;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
        }
        .gov-auth-submit-orange-btn:hover:not(:disabled) {
          background: var(--accent-orange-hover);
        }
        .gov-auth-submit-orange-btn:disabled {
          background: #1e2230;
          color: #525f76;
          cursor: not-allowed;
        }
        .btn-content, .btn-loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
        }
        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(8, 9, 13, 0.3);
          border-top-color: #08090d;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .auth-footer {
          margin-top: 1.25rem;
          text-align: center;
          font-size: 0.775rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-subtle);
          padding-top: 1rem;
        }
        .switch-auth-btn {
          color: var(--accent-orange-text);
          font-weight: 600;
          text-decoration: underline;
          min-height: auto;
        }
        .switch-auth-btn:hover {
          color: var(--accent-orange);
        }
      `}</style>
    </div>
  );
}

export default Login;
