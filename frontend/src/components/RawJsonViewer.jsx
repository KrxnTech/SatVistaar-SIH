import React, { useState } from 'react';
import { Code, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

export function RawJsonViewer({ rawData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!rawData) return null;

  const jsonString = JSON.stringify(rawData, null, 2);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="raw-json-viewer-root">
      <button
        type="button"
        className="json-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="btn-left">
          <Code size={14} className="code-icon" />
          <span>Raw Backend Response (JSON)</span>
        </div>
        <div className="btn-right">
          {isOpen && (
            <button
              type="button"
              className="copy-btn"
              onClick={handleCopy}
              title="Copy JSON"
            >
              {copied ? (
                <>
                  <Check size={12} className="copy-ok" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="json-content-box">
          <pre className="json-pre">
            <code>{jsonString}</code>
          </pre>
        </div>
      )}

      <style>{`
        .raw-json-viewer-root {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          background: var(--bg-panel);
          overflow: hidden;
          margin-top: 0.75rem;
        }
        .json-toggle-btn {
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
        .json-toggle-btn:hover {
          background: var(--bg-card);
          color: var(--text-main);
        }
        .btn-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .code-icon {
          color: var(--accent-cyan);
        }
        .btn-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .copy-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.5rem;
          font-size: 0.675rem;
          background: var(--bg-card-hover);
          border: 1px solid var(--border-medium);
          border-radius: 4px;
          color: var(--text-muted);
        }
        .copy-btn:hover {
          color: var(--text-main);
          border-color: var(--accent-cyan);
        }
        .copy-ok {
          color: var(--status-success);
        }
        .json-content-box {
          padding: 0.85rem;
          background: #050811;
          border-top: 1px solid var(--border-subtle);
          max-height: 380px;
          overflow-y: auto;
        }
        .json-pre {
          font-size: 0.725rem;
          color: #a5f3fc;
          line-height: 1.45;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}

export default RawJsonViewer;
