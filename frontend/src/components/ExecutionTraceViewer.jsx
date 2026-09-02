import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronRight } from 'lucide-react';

export function ExecutionTraceViewer({ trace }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!trace || !trace.events || trace.events.length === 0) return null;

  return (
    <div className="gov-trace-viewer">
      <button
        type="button"
        className="trace-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="btn-left">
          <Activity size={14} className="trace-icon" />
          <span className="font-mono">EXECUTION PLAN & TRACE TELEMETRY ({trace.events.length} STEPS)</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {isOpen && (
        <div className="trace-content-body">
          <div className="timeline-list">
            {trace.events.map((evt, idx) => {
              const date = new Date(evt.timestamp);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

              return (
                <div key={idx} className="timeline-step-item">
                  <div className="step-point" />
                  <div className="step-info-block">
                    <div className="step-header">
                      <span className="event-type font-mono">{evt.type}</span>
                      <span className="event-time font-mono">{timeStr}</span>
                    </div>
                    {Object.keys(evt).filter(k => k !== 'type' && k !== 'timestamp').length > 0 && (
                      <div className="event-details-box font-mono">
                        {Object.entries(evt)
                          .filter(([k]) => k !== 'type' && k !== 'timestamp')
                          .map(([k, v]) => (
                            <div key={k} className="detail-row">
                              <span className="detail-key">{k}:</span>
                              <span className="detail-val">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .gov-trace-viewer {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          overflow: hidden;
          margin-top: 0.5rem;
        }
        .trace-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0.85rem;
          font-size: 0.725rem;
          font-weight: 700;
          color: var(--text-secondary);
          background: var(--bg-card);
          min-height: 38px;
        }
        .trace-toggle-btn:hover {
          color: var(--text-main);
          background: var(--light-gray);
        }
        .btn-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .trace-icon {
          color: var(--accent-blue-text);
        }
        .trace-content-body {
          padding: 0.85rem;
          background: var(--bg-main);
          border-top: 1px solid var(--border-subtle);
        }
        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          position: relative;
          padding-left: 0.75rem;
        }
        .timeline-list::before {
          content: '';
          position: absolute;
          left: 11px;
          top: 6px;
          bottom: 6px;
          width: 1px;
          background: var(--border-subtle);
        }
        .timeline-step-item {
          display: flex;
          gap: 0.75rem;
          position: relative;
        }
        .step-point {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-orange);
          margin-top: 4px;
          flex-shrink: 0;
          z-index: 1;
        }
        .step-info-block {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .step-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .event-type {
          font-size: 0.725rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .event-time {
          font-size: 0.65rem;
          color: var(--text-dim);
        }
        .event-details-box {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          padding: 0.35rem 0.55rem;
          border-radius: 3px;
          font-size: 0.675rem;
        }
        .detail-row {
          display: flex;
          gap: 0.4rem;
        }
        .detail-key {
          color: var(--text-dim);
        }
        .detail-val {
          color: var(--accent-blue-text);
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}

export default ExecutionTraceViewer;
