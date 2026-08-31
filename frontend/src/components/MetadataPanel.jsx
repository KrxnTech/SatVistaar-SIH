import React from 'react';
import { Cpu, Clock, CheckCircle2, AlertTriangle, Hash, Zap } from 'lucide-react';

export function MetadataPanel({ result }) {
  if (!result) return null;

  const isSuccess = result.status === 'success';
  const isAbstained = result.status === 'abstained';

  return (
    <div className="gov-metadata-panel">
      <div className="meta-chips-grid">
        <div className="meta-chip">
          <span className="chip-label font-mono">TASK</span>
          <span className="chip-val font-mono">{result.task || 'N/A'}</span>
        </div>

        <div className="meta-chip">
          <span className="chip-label font-mono">PROVIDER</span>
          <span className="chip-val font-mono uppercase t-blue">{result.provider || 'N/A'}</span>
        </div>

        <div className="meta-chip">
          <span className="chip-label font-mono">MODEL</span>
          <span className="chip-val font-mono truncate t-blue" title={result.modelName}>
            {result.modelName || 'N/A'}
          </span>
        </div>

        <div className="meta-chip">
          <span className="chip-label font-mono">LATENCY</span>
          <span className="chip-val font-mono">{result.latency || 'N/A'}</span>
        </div>

        <div className="meta-chip">
          <span className="chip-label font-mono">CONFIDENCE</span>
          <span className="chip-val font-mono">{result.confidence || 'N/A'}</span>
        </div>

        <div className="meta-chip">
          <span className="chip-label font-mono">STATUS</span>
          <span className={`status-text font-mono ${isSuccess ? 'success' : isAbstained ? 'abstained' : 'failed'}`}>
            {result.status}
          </span>
        </div>
      </div>

      {result.warnings && result.warnings.length > 0 && (
        <div className="warnings-alert-box">
          <div className="alert-header">
            <AlertTriangle size={13} className="alert-icon" />
            <span className="font-mono">ANALYSIS ADVISORIES ({result.warnings.length})</span>
          </div>
          <ul className="warnings-list">
            {result.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="request-id-row font-mono">
        <Hash size={11} />
        <span>Request ID: <code>{result.requestId}</code></span>
      </div>

      <style>{`
        .gov-metadata-panel {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle);
        }
        .meta-chips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.5rem;
        }
        .meta-chip {
          display: flex;
          flex-direction: column;
          padding: 0.45rem 0.65rem;
          background: #0d0e15;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          gap: 0.1rem;
        }
        .chip-label {
          font-size: 0.625rem;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .chip-val {
          font-size: 0.775rem;
          font-weight: 600;
          color: #ffffff;
        }
        .chip-val.t-blue {
          color: var(--accent-blue-text);
        }
        .chip-val.truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .status-text {
          font-size: 0.725rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-text.success { color: var(--status-green-text); }
        .status-text.abstained { color: #fbbf24; }
        .status-text.failed { color: var(--status-red-text); }

        .warnings-alert-box {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.85rem;
          font-size: 0.75rem;
          color: #fde68a;
        }
        .alert-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
          color: var(--accent-orange-text);
        }
        .alert-icon {
          color: var(--accent-orange);
        }
        .warnings-list {
          padding-left: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          line-height: 1.4;
        }
        .request-id-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.675rem;
          color: var(--text-dim);
        }
        .request-id-row code {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

export default MetadataPanel;
