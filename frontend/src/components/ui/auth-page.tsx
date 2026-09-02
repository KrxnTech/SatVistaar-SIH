'use client';

import React, { useState } from 'react';
import { useAuth } from '@/auth/AuthContext.jsx';
import { useRouter } from '@/context/RouterContext.jsx';
import {
  Satellite,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';

export interface AuthPageProps {
  onNavigateToRegister?: () => void;
  onSuccess?: () => void;
  onNavigateHome?: () => void;
}

export function AuthPage({
  onNavigateToRegister,
  onSuccess,
  onNavigateHome,
}: AuthPageProps) {
  const auth = useAuth();
  const router = useRouter ? useRouter() : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = localError || (auth ? auth.error : null);

  const handleGoHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else if (router?.navigateTo) {
      router.navigateTo('/');
    } else {
      window.location.href = '/';
    }
  };

  const handleGoRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    if (auth?.clearError) auth.clearError();
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else if (router?.navigateTo) {
      router.navigateTo('/register');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (auth?.clearError) auth.clearError();

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
      if (auth?.login) {
        await auth.login({
          email: email.trim(),
          password,
        });
      }
      if (onSuccess) {
        onSuccess();
      } else if (router?.navigateTo) {
        router.navigateTo('/analysis');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-viewport-wrapper">
      <div className="auth-card-container">
        {/* Back Link */}
        <div className="auth-top-nav">
          <button
            type="button"
            onClick={handleGoHome}
            className="auth-back-btn"
          >
            <ChevronLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Clean Auth Card (Reference Layout) */}
        <div className="auth-clean-card">
          {/* Top Logo Badge */}
          <div className="auth-icon-circle">
            <Satellite size={22} className="auth-brand-svg" />
          </div>

          {/* Heading & Subtitle */}
          <div className="auth-headings">
            <h1 className="auth-main-title">Welcome Back!</h1>
            <p className="auth-main-subtitle">Sign in to continue your geospatial analysis</p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="auth-error-box">
              <AlertCircle size={15} className="error-icon" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-inner-form" noValidate>
            {/* Email Field */}
            <div className="auth-field-group">
              <div className="auth-input-container">
                <Mail size={16} className="auth-lead-icon" />
                <input
                  id="user-email"
                  type="email"
                  className="auth-text-input"
                  placeholder="name@organization.gov.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (displayError) {
                      setLocalError(null);
                      if (auth?.clearError) auth.clearError();
                    }
                  }}
                  disabled={submitting}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-field-group">
              <div className="auth-input-container">
                <Lock size={16} className="auth-lead-icon" />
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-text-input has-trailing-btn"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (displayError) {
                      setLocalError(null);
                      if (auth?.clearError) auth.clearError();
                    }
                  }}
                  disabled={submitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-trail-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Options Row: Remember Me & Forgot Password */}
            <div className="auth-options-row">
              <label className="auth-remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="auth-checkbox"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-forgot-btn"
                onClick={() => {
                  setLocalError('Please contact your administrator to reset credentials.');
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="auth-submit-btn"
            >
              {submitting ? (
                <div className="btn-flex-center">
                  <Loader2 size={16} className="spinner-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Bottom Account Switch Link */}
          <div className="auth-card-footer">
            <span>Don't have an account?</span>{' '}
            <button
              type="button"
              onClick={handleGoRegister}
              className="auth-switch-link"
            >
              Register new account
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .auth-viewport-wrapper {
          min-height: calc(100vh - 120px);
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          background: #f8fafc;
          position: relative;
        }

        .auth-card-container {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .auth-top-nav {
          display: flex;
          align-items: center;
        }

        .auth-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #64748b;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          transition: all 0.15s ease;
        }

        .auth-back-btn:hover {
          color: #ff5225;
          background: rgba(255, 82, 37, 0.06);
        }

        .auth-clean-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 36px -8px rgba(0, 0, 70, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03);
          padding: 2.5rem 2.25rem 2.25rem 2.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .auth-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #fff5f2;
          border: 1px solid #ffe4dc;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .auth-brand-svg {
          color: #ff5225;
        }

        .auth-headings {
          text-align: center;
          margin-bottom: 1.75rem;
        }

        .auth-main-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: -0.025em;
          margin: 0 0 0.35rem 0;
        }

        .auth-main-subtitle {
          font-size: 0.825rem;
          color: #64748b;
          margin: 0;
        }

        .auth-error-box {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 0.85rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          color: #dc2626;
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 1.25rem;
        }

        .error-icon {
          flex-shrink: 0;
          color: #ef4444;
        }

        .auth-inner-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .auth-field-group {
          width: 100%;
        }

        .auth-input-container {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }

        .auth-lead-icon {
          position: absolute;
          left: 0.875rem;
          color: #94a3b8;
          pointer-events: none;
          z-index: 2;
        }

        .auth-text-input {
          width: 100%;
          height: 46px;
          padding: 0 0.875rem 0 2.5rem;
          font-size: 0.875rem;
          color: #0f172a;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .auth-text-input.has-trailing-btn {
          padding-right: 2.75rem;
        }

        .auth-text-input::placeholder {
          color: #94a3b8;
        }

        .auth-text-input:focus {
          border-color: #ff5225;
          box-shadow: 0 0 0 3px rgba(255, 82, 37, 0.15);
        }

        .auth-trail-toggle {
          position: absolute;
          right: 0.75rem;
          color: #94a3b8;
          background: none;
          border: none;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 4px;
          transition: color 0.15s ease;
        }

        .auth-trail-toggle:hover {
          color: #334155;
        }

        .auth-options-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8125rem;
          margin-top: -0.15rem;
        }

        .auth-remember-label {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: #64748b;
          cursor: pointer;
          user-select: none;
        }

        .auth-checkbox {
          width: 15px;
          height: 15px;
          accent-color: #ff5225;
          cursor: pointer;
          border-radius: 4px;
        }

        .auth-forgot-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s ease;
        }

        .auth-forgot-btn:hover {
          color: #ff5225;
          text-decoration: underline;
        }

        .auth-submit-btn {
          width: 100%;
          height: 46px;
          background: #ff5225;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(255, 82, 37, 0.3);
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-submit-btn:hover:not(:disabled) {
          background: #e6451a;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255, 82, 37, 0.38);
        }

        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-submit-btn:disabled {
          background: #cbd5e1;
          color: #64748b;
          box-shadow: none;
          cursor: not-allowed;
        }

        .btn-flex-center {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spinner-spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .auth-card-footer {
          margin-top: 1.75rem;
          font-size: 0.8125rem;
          color: #64748b;
          text-align: center;
        }

        .auth-switch-link {
          background: none;
          border: none;
          padding: 0;
          color: #ff5225;
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s ease;
        }

        .auth-switch-link:hover {
          color: #000066;
        }

        @media (max-width: 480px) {
          .auth-clean-card {
            padding: 2rem 1.5rem;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default AuthPage;
