import React from 'react';
import { Cpu, Clock, CheckCircle2, AlertTriangle, Hash, Zap, ShieldAlert } from 'lucide-react';

export function MetadataPanel({ result }) {
  if (!result) return null;

  const isSuccess = result.status === 'success';
  const isAbstained = result.status === 'abstained';

  return (
    <div className="metadata-panel-root">
      <div className="meta-chips-grid">
        <div className="meta-chip">
          <Zap size={13} className="chip-icon cyan" />
          <span className="chip-label">Task</span>
          <span className="chip-val">{result.task || 'N/A'}</span>
        </div>

        <div className="meta-chip">
          <Cpu size={13} className="chip-icon indigo" />
          <span className="chip-label">Provider</span>
          <span className="chip-val uppercase">{result.provider || 'N/A'}</span>
        </div>

        <div className="meta-chip">
          <Cpu size={13} className="chip-icon" />
          <span className="chip-label">Model</span>
          <span className="chip-val truncate" title={result.modelName}>
            {result.modelName || 'N/A'}
          </span>
        </div>

        <div className="meta-chip">
          <Clock size={13} className="chip-icon" />
          <span className="chip-label">Latency</span>
          <span className="chip-val">{result.latency || 'N/A'}</span>
        </div>

        <div className="meta-chip">
          <span className="chip-label">Confidence</span>
          <span className="chip-val">{result.confidence || 'N/A'}</span>
        </div>

        <div className="meta-chip">
          <span className="chip-label">Status</span>
          <span className={`status-pill ${isSuccess ? 'success' : isAbstained ? 'abstained' : 'failed'}`}>
            {result.status}
          </span>
        </div>
      </div>

      {result.warnings && result.warnings.length > 0 && (
        <div className="warnings-alert-box">
          <div className="alert-header">
            <AlertTriangle size={13} />
            <span>Analysis Advisories ({result.warnings.length})</span>
          </div>
          <ul className="warnings-list">
            {result.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="request-id-row">
        <Hash size={11} />
        <span>Request ID: <code>{result.requestId}</code></span>
      </div>

      <style>{`
        .metadata-panel-root {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 0.75rem;
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
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          gap: 0.15rem;
        }
        .chip-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .chip-val {
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .chip-val.uppercase {
          text-transform: uppercase;
        }
        .chip-val.truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .chip-icon.cyan { color: var(--accent-cyan); }
        .chip-icon.indigo { color: var(--accent-indigo); }
        .status-pill {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          width: fit-content;
        }
        .status-pill.success { color: var(--status-success); }
        .status-pill.abstained { color: var(--status-warning); }
        .status-pill.failed { color: var(--status-error); }
        .warnings-alert-box {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.8rem;
          font-size: 0.725rem;
          color: #fbbf24;
        }
        .alert-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
        }
        .warnings-list {
          padding-left: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          line-height: 1.35;
        }
        .request-id-row {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.68rem;
          color: var(--text-dim);
        }
        .request-id-row code {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

export default MetadataPanel;
