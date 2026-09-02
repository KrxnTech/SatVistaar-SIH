import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { Satellite, Mail, Lock, User, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';

export function Register({ onNavigateToLogin, onSuccess }) {
  const { register, error: contextError, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const displayError = localError || contextError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!name.trim()) {
      setLocalError('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setLocalError('Please enter your email address');
      return;
    }

    if (!password) {
      setLocalError('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setLocalError(err.message || 'Registration failed');
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
          <h2 className="auth-title">Create Analyst Account</h2>
          <p className="auth-subtitle">Register for SatVistaar Geospatial Platform Access</p>
        </div>

        {displayError && (
          <div className="auth-alert">
            <AlertCircle size={15} className="alert-icon" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label font-mono" htmlFor="register-name">
              FULL NAME
            </label>
            <div className="input-wrapper">
              <User size={15} className="field-icon" />
              <input
                id="register-name"
                type="text"
                className="gov-dark-input"
                placeholder="Dr. Rajesh Kumar"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (displayError) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                disabled={submitting}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-mono" htmlFor="register-email">
              OFFICIAL / WORK EMAIL
            </label>
            <div className="input-wrapper">
              <Mail size={15} className="field-icon" />
              <input
                id="register-email"
                type="email"
                className="gov-dark-input"
                placeholder="rajesh@isro.gov.in"
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
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label font-mono" htmlFor="register-password">
              PASSWORD (MIN 8 CHARACTERS)
            </label>
            <div className="input-wrapper">
              <Lock size={15} className="field-icon" />
              <input
                id="register-password"
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
                autoComplete="new-password"
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

          <div className="form-group">
            <label className="form-label font-mono" htmlFor="register-confirm">
              CONFIRM PASSWORD
            </label>
            <div className="input-wrapper">
              <Lock size={15} className="field-icon" />
              <input
                id="register-confirm"
                type={showPassword ? 'text' : 'password'}
                className="gov-dark-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (displayError) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                disabled={submitting}
                autoComplete="new-password"
              />
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
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="btn-content">
                <UserPlus size={15} />
                <span>Register Analyst Account</span>
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have credentials?</span>{' '}
          <button
            type="button"
            className="switch-auth-btn"
            onClick={() => {
              clearError();
              if (onNavigateToLogin) onNavigateToLogin();
            }}
          >
            Sign in here
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
          background: var(--bg-main);
        }
        .gov-auth-card {
          width: 100%;
          max-width: 440px;
          padding: 2.25rem;
          background: var(--bg-card);
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
          background: var(--bg-main);
          color: var(--accent-orange);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
        }
        .auth-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-main);
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
          gap: 1rem;
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
          background: var(--bg-main);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: var(--text-main);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gov-dark-input:focus {
          border-color: var(--accent-orange);
          box-shadow: 0 0 0 2px rgba(255, 82, 37, 0.25);
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
          color: var(--text-main);
        }
        .gov-auth-submit-orange-btn {
          width: 100%;
          padding: 0.75rem 1.25rem;
          margin-top: 0.35rem;
          background: var(--accent-orange);
          color: var(--white);
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
          background: var(--border-subtle);
          color: var(--slate-gray);
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
          border: 2px solid rgba(0, 0, 102, 0.18);
          border-top-color: var(--navy-blue);
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

export default Register;
