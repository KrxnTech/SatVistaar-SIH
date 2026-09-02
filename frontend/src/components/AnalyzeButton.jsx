import React from 'react';
import { Play, Loader2 } from 'lucide-react';

export function AnalyzeButton({ loading, onClick, disabled, selectedMode }) {
  const getModeTitle = () => {
    switch (selectedMode) {
      case 'CHANGE_ANALYSIS': return 'Bi-Temporal Change';
      case 'FEATURE_IDENTIFICATION': return 'Visual Grounding';
      case 'CAPTIONING': return 'Scene Description';
      default: return 'Visual Q&A';
    }
  };

  return (
    <div className="gov-analyze-action">
      <button
        type="button"
        className={`gov-run-analysis-orange-btn ${loading ? 'loading' : ''}`}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <>
            <Loader2 className="btn-spinner-icon" size={17} />
            <span>Analyzing satellite imagery with VLM...</span>
          </>
        ) : (
          <>
            <Play size={15} fill="currentColor" />
            <span>Run {getModeTitle()} Analysis</span>
          </>
        )}
      </button>

      <style>{`
        .gov-analyze-action {
          width: 100%;
        }
        .gov-run-analysis-orange-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.8rem 1.25rem;
          background: var(--accent-orange);
          color: var(--white);
          border-radius: var(--radius-sm);
          font-size: 0.925rem;
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
          min-height: 44px;
          transition: background-color 0.15s ease, transform 0.15s ease, opacity 0.15s ease;
        }
        .gov-run-analysis-orange-btn:hover:not(:disabled) {
          background: var(--accent-orange-hover);
          transform: translateY(-1px);
        }
        .gov-run-analysis-orange-btn:disabled {
          background: var(--border-subtle);
          color: var(--slate-gray);
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }
        .gov-run-analysis-orange-btn.loading {
          background: var(--accent-orange);
          cursor: wait;
        }
        .btn-spinner-icon {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AnalyzeButton;
