import React from 'react';
import { Play, Loader2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export function AnalyzeButton({ loading, onClick, disabled, selectedMode, imageA, imageB, query }) {
  const getModeTitle = () => {
    switch (selectedMode) {
      case 'CHANGE_ANALYSIS': return 'Bi-Temporal Change';
      case 'FEATURE_IDENTIFICATION': return 'Visual Grounding';
      case 'CAPTIONING': return 'Scene Description';
      default: return 'Visual Q&A';
    }
  };

  const isDual = selectedMode === 'CHANGE_ANALYSIS';

  // Validation feedback
  const getMissingReason = () => {
    if (!imageA?.fileId) {
      return isDual ? 'Upload Image A (T1 Reference) to continue' : 'Upload a satellite scene to continue';
    }
    if (isDual && !imageB?.fileId) {
      return 'Upload Image B (T2 Comparison) for change detection';
    }
    if (!query || !query.trim()) {
      return 'Enter an analysis question or select a suggested prompt';
    }
    return null;
  };

  const missingReason = disabled && !loading ? getMissingReason() : null;

  return (
    <div className="sat-analyze-cta-root">
      <button
        type="button"
        className={`sat-run-btn ${loading ? 'is-loading' : ''} ${disabled ? 'is-disabled' : ''}`}
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <div className="cta-content-row">
            <Loader2 className="cta-spinner" size={18} />
            <span>Analyzing Satellite Raster with Qwen3.8-27B...</span>
          </div>
        ) : (
          <div className="cta-content-row">
            <Sparkles size={16} />
            <span className="cta-main-text">Run {getModeTitle()} Analysis</span>
            <ArrowRight size={16} className="cta-arrow" />
          </div>
        )}
      </button>

      {/* Validation Message / Status */}
      {missingReason ? (
        <div className="cta-validation-status font-mono">
          <AlertCircle size={13} className="val-icon" />
          <span>{missingReason}</span>
        </div>
      ) : (
        <div className="cta-ready-status font-mono">
          <span className="pulse-dot" />
          <span>Inputs validated • Ready for multimodal inference</span>
        </div>
      )}

      <style>{`
        .sat-analyze-cta-root {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .sat-run-btn {
          width: 100%;
          min-height: 48px;
          padding: 0.85rem 1.5rem;
          background: #ff5225;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 4px 18px rgba(255, 82, 37, 0.35);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sat-run-btn:hover:not(:disabled) {
          background: #e6451a;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255, 82, 37, 0.45);
        }

        .sat-run-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .sat-run-btn.is-disabled {
          background: #e2e8f0;
          color: #94a3b8;
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
        }

        .sat-run-btn.is-loading {
          background: #ff5225;
          cursor: wait;
          box-shadow: 0 0 20px rgba(255, 82, 37, 0.4);
        }

        .cta-content-row {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .cta-main-text {
          letter-spacing: -0.01em;
        }

        .cta-arrow {
          transition: transform 0.2s ease;
        }

        .sat-run-btn:hover:not(:disabled) .cta-arrow {
          transform: translateX(3px);
        }

        .cta-spinner {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .cta-validation-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          font-size: 0.725rem;
          color: #f59e0b;
          text-align: center;
          padding: 0.2rem 0;
        }

        .val-icon {
          color: #f59e0b;
          flex-shrink: 0;
        }

        .cta-ready-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.725rem;
          color: #16a34a;
          text-align: center;
          padding: 0.2rem 0;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 6px rgba(22, 163, 74, 0.6);
        }
      `}</style>
    </div>
  );
}

export default AnalyzeButton;
