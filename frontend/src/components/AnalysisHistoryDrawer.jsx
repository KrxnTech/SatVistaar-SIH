import React from 'react';
import {
  History,
  Clock,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Radio,
  FileText
} from 'lucide-react';

export function AnalysisHistoryDrawer({
  isOpen,
  onClose,
  history = [],
  onRestoreItem
}) {
  if (!isOpen) return null;

  return (
    <div className="history-drawer-backdrop" onClick={onClose}>
      <aside
        className="history-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Analysis History Drawer"
      >
        {/* Header */}
        <div className="drawer-header">
          <div className="header-title-group">
            <div className="history-icon-badge">
              <History size={16} />
            </div>
            <div>
              <h3 className="drawer-title font-mono">SESSION ANALYSIS DOSSIER</h3>
              <p className="drawer-sub font-mono">
                {history.length} intelligence session{history.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
          </div>

          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="drawer-divider" />

        {/* History Item List */}
        <div className="history-items-container">
          {history.length === 0 ? (
            <div className="history-empty-state font-mono">
              <Clock size={28} className="empty-clock-icon" />
              <span className="empty-head">No Analyses Executed Yet</span>
              <p className="empty-sub">
                Run an autonomous analysis in the workspace to log your satellite query, models, and evidence.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item, idx) => {
                const isFusion = item.task === 'OPTICAL_SAR_FUSION';
                const isChange = item.task === 'CHANGE_ANALYSIS';

                return (
                  <div
                    key={item.id || idx}
                    className={`history-card-item ${isFusion ? 'fusion-item' : ''}`}
                    onClick={() => {
                      if (onRestoreItem) onRestoreItem(item);
                      if (onClose) onClose();
                    }}
                  >
                    <div className="item-top-row">
                      <span className={`task-badge font-mono ${isFusion ? 'badge-fusion' : isChange ? 'badge-change' : 'badge-default'}`}>
                        {isFusion ? 'OPTICAL + SAR FUSION' : item.task || 'ANALYSIS'}
                      </span>
                      <span className="item-timestamp font-mono">
                        {item.formattedTime || item.timestamp || 'Just now'}
                      </span>
                    </div>

                    <h4 className="item-query-title">
                      "{item.query || 'Satellite Analysis Query'}"
                    </h4>

                    {item.summary && (
                      <p className="item-summary-text">
                        {item.summary.slice(0, 110)}...
                      </p>
                    )}

                    <div className="item-footer font-mono">
                      <div className="item-meta-tags">
                        {item.confidence && (
                          <span className="conf-tag">
                            Confidence: {item.confidence}
                          </span>
                        )}
                        {item.modelName && (
                          <span className="model-tag">
                            {item.modelName}
                          </span>
                        )}
                      </div>

                      <span className="restore-cta">
                        <span>Restore</span>
                        <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer font-mono">
          <span>Session State • Local Memory Cache</span>
        </div>
      </aside>

      <style>{`
        .history-drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.15s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .history-drawer-panel {
          width: 380px;
          max-width: 90vw;
          height: 100%;
          background: #ffffff;
          box-shadow: -4px 0 25px rgba(0, 0, 70, 0.12);
          display: flex;
          flex-direction: column;
          animation: slideLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .drawer-header {
          padding: 1.15rem 1.25rem 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-title-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .history-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #eff6ff;
          color: #000066;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .drawer-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #000066;
          margin: 0;
        }
        .drawer-sub {
          font-size: 0.68rem;
          color: #64748b;
          margin: 0.1rem 0 0 0;
        }
        .drawer-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.3rem;
          border-radius: 6px;
        }
        .drawer-close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .drawer-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 0;
        }
        .history-items-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.25rem;
        }
        .history-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 260px;
          color: #94a3b8;
          gap: 0.5rem;
        }
        .empty-clock-icon {
          color: #cbd5e1;
        }
        .empty-head {
          font-size: 0.8rem;
          font-weight: 800;
          color: #475569;
        }
        .empty-sub {
          font-size: 0.72rem;
          max-width: 240px;
          line-height: 1.4;
          margin: 0;
        }
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .history-card-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.85rem;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .history-card-item:hover {
          border-color: #ff5225;
          background: #fffaf8;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(255, 82, 37, 0.08);
        }
        .history-card-item.fusion-item {
          border-left: 3px solid #9333ea;
        }
        .item-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .task-badge {
          font-size: 0.62rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }
        .badge-fusion {
          background: #f3e8ff;
          color: #7e22ce;
          border: 1px solid #e9d5ff;
        }
        .badge-change {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #dbeafe;
        }
        .badge-default {
          background: #f1f5f9;
          color: #475569;
        }
        .item-timestamp {
          font-size: 0.65rem;
          color: #94a3b8;
        }
        .item-query-title {
          font-size: 0.76rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          line-height: 1.35;
        }
        .item-summary-text {
          font-size: 0.69rem;
          color: #64748b;
          line-height: 1.35;
          margin: 0;
        }
        .item-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.25rem;
          padding-top: 0.35rem;
          border-top: 1px dashed #e2e8f0;
          font-size: 0.65rem;
        }
        .item-meta-tags {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .conf-tag {
          color: #16a34a;
          font-weight: 700;
        }
        .model-tag {
          color: #64748b;
        }
        .restore-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          color: #ff5225;
          font-weight: 700;
        }
        .drawer-footer {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 0.66rem;
          color: #94a3b8;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default AnalysisHistoryDrawer;
