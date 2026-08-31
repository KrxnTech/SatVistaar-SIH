import React from 'react';
import { Play, Loader2, Sparkles } from 'lucide-react';

export function AnalyzeButton({ loading, onClick, disabled, selectedMode }) {
  return (
    <div className="analyze-action-wrapper">
      <button
        type="button"
        className={`analyze-main-btn ${loading ? 'loading' : ''}`}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <Loader2 className="btn-spinner" size={18} />
            <span>Analyzing satellite imagery with VLM...</span>
          </>
        ) : (
          <>
            <Play size={16} fill="currentColor" />
            <span>Run {selectedMode === 'CHANGE_ANALYSIS' ? 'Change Analysis' : selectedMode === 'FEATURE_IDENTIFICATION' ? 'Visual Grounding' : selectedMode === 'CAPTIONING' ? 'Scene Description' : 'VQA Analysis'}</span>
          </>
        )}
      </button>

      <style>{`
        .analyze-action-wrapper {
          width: 100%;
          margin-top: 0.25rem;
        }
        .analyze-main-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.875rem 1.5rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          background: linear-gradient(135deg, #00d8ff, #0099ff);
          color: #050b14;
          box-shadow: 0 4px 20px rgba(0, 216, 255, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .analyze-main-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0, 216, 255, 0.5);
          background: linear-gradient(135deg, #33e1ff, #1aa3ff);
        }
        .analyze-main-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .analyze-main-btn:disabled {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--text-dim);
          box-shadow: none;
          cursor: not-allowed;
        }
        .analyze-main-btn.loading {
          background: var(--bg-card-hover);
          border: 1px solid var(--accent-cyan);
          color: var(--accent-cyan);
          cursor: wait;
        }
        .btn-spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AnalyzeButton;
