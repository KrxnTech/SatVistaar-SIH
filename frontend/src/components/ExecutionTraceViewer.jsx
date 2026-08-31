import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronRight, CheckCircle, Clock } from 'lucide-react';

export function ExecutionTraceViewer({ trace }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!trace || !trace.events || trace.events.length === 0) return null;

  return (
    <div className="trace-viewer-root">
      <button
        type="button"
        className="trace-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="btn-left">
          <Activity size={14} className="trace-icon" />
          <span>Execution Plan & Trace Telemetry ({trace.events.length} Steps)</span>
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {isOpen && (
        <div className="trace-content-box">
          <div className="timeline-list">
            {trace.events.map((evt, idx) => {
              const date = new Date(evt.timestamp);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });

              return (
                <div key={idx} className="timeline-item">
                  <div className="timeline-point" />
                  <div className="timeline-body">
                    <div className="timeline-header">
                      <span className="event-type">{evt.type}</span>
                      <span className="event-time">{timeStr}</span>
                    </div>
                    {Object.keys(evt).filter(k => k !== 'type' && k !== 'timestamp').length > 0 && (
                      <div className="event-details">
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
        .trace-viewer-root {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          background: var(--bg-panel);
          overflow: hidden;
          margin-top: 0.5rem;
        }
        .trace-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0.85rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          background: transparent;
        }
        .trace-toggle-btn:hover {
          background: var(--bg-card);
          color: var(--text-main);
        }
        .btn-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .trace-icon {
          color: var(--accent-indigo);
        }
        .trace-content-box {
          padding: 0.85rem;
          background: #060a14;
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
          top: 4px;
          bottom: 4px;
          width: 1px;
          background: var(--border-medium);
        }
        .timeline-item {
          display: flex;
          gap: 0.75rem;
          position: relative;
        }
        .timeline-point {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--accent-indigo);
          box-shadow: 0 0 8px var(--accent-indigo);
          margin-top: 4px;
          flex-shrink: 0;
          z-index: 1;
        }
        .timeline-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .timeline-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .event-type {
          font-size: 0.725rem;
          font-weight: 700;
          color: #a5b4fc;
          font-family: 'JetBrains Mono', monospace;
        }
        .event-time {
          font-size: 0.65rem;
          color: var(--text-dim);
        }
        .event-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          background: var(--bg-card);
          padding: 0.35rem 0.55rem;
          border-radius: 4px;
          font-size: 0.68rem;
        }
        .detail-row {
          display: flex;
          gap: 0.4rem;
        }
        .detail-key {
          color: var(--text-dim);
        }
        .detail-val {
          color: var(--text-main);
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}

export default ExecutionTraceViewer;
