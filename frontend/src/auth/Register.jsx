import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { Satellite, User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const isPasswordLongEnough = password.length >= 6;
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!name.trim()) {
      setLocalError('Please enter your full name');
      return;
    }

    if (name.trim().length < 2) {
      setLocalError('Name must be at least 2 characters long');
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

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
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
    <div className="auth-page-container">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-badge-icon">
            <Satellite size={28} className="auth-satellite" />
            <div className="badge-ring" />
          </div>
          <h2 className="auth-title">Create SatVistaar Account</h2>
          <p className="auth-subtitle">Join the mission for Autonomous Geospatial AI</p>
        </div>

        {displayError && (
          <div className="auth-alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name
            </label>
            <div className="input-wrapper">
              <User size={17} className="field-icon" />
              <input
                id="register-name"
                type="text"
                className="form-input"
                placeholder="Dr. Rajesh Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (displayError) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                disabled={submitting}
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Work Email Address
            </label>
            <div className="input-wrapper">
              <Mail size={17} className="field-icon" />
              <input
                id="register-email"
                type="email"
                className="form-input"
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
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <div className="input-wrapper">
              <Lock size={17} className="field-icon" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="•••••••• (min 6 characters)"
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <Lock size={17} className="field-icon" />
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
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

          {/* Password Validation Hints */}
          <div className="password-hints">
            <div className={`hint-item ${isPasswordLongEnough ? 'valid' : ''}`}>
              <CheckCircle2 size={13} className="hint-icon" />
              <span>At least 6 characters</span>
            </div>
            {confirmPassword && (
              <div className={`hint-item ${doPasswordsMatch ? 'valid' : 'invalid'}`}>
                <CheckCircle2 size={13} className="hint-icon" />
                <span>{doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <span className="btn-loading-state">
                <span className="btn-spinner" />
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="btn-content">
                <UserPlus size={18} />
                <span>Create SatVistaar Account</span>
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>{' '}
          <button
            type="button"
            className="switch-auth-btn"
            onClick={() => {
              clearError();
              if (onNavigateToLogin) onNavigateToLogin();
            }}
          >
            Sign in
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
          max-width: 460px;
          padding: 2.25rem;
          background: rgba(13, 19, 34, 0.9);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xl);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), var(--shadow-glow);
          position: relative;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 1.5rem;
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
          margin-bottom: 1.25rem;
          line-height: 1.4;
        }
        .alert-icon {
          flex-shrink: 0;
          color: var(--status-error);
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
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
          padding: 0.725rem 0.875rem 0.725rem 2.65rem;
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
        .password-hints {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          padding: 0.25rem 0;
        }
        .hint-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-dim);
        }
        .hint-item.valid {
          color: var(--status-success);
        }
        .hint-item.invalid {
          color: var(--status-error);
        }
        .hint-icon {
          flex-shrink: 0;
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

export default Register;
