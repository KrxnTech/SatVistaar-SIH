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
    <div className="gov-json-viewer">
      <button
        type="button"
        className="json-toggle-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="btn-left">
          <Code size={14} className="code-icon" />
          <span className="font-mono">RAW BACKEND RESPONSE (JSON)</span>
        </div>
        <div className="btn-right">
          {isOpen && (
            <button
              type="button"
              className="copy-json-btn font-mono"
              onClick={handleCopy}
              title="Copy raw JSON to clipboard"
            >
              {copied ? (
                <>
                  <Check size={11} className="copy-ok" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>COPY JSON</span>
                </>
              )}
            </button>
          )}
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="json-pre-box">
          <pre className="json-pre font-mono">
            <code>{jsonString}</code>
          </pre>
        </div>
      )}

      <style>{`
        .gov-json-viewer {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          overflow: hidden;
          margin-top: 0.75rem;
        }
        .json-toggle-header {
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
        .json-toggle-header:hover {
          color: var(--text-main);
          background: var(--light-gray);
        }
        .btn-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .code-icon {
          color: var(--accent-blue-text);
        }
        .btn-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .copy-json-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 3px;
          color: var(--text-secondary);
          min-height: auto;
        }
        .copy-json-btn:hover {
          border-color: var(--accent-orange);
          color: var(--accent-orange-text);
        }
        .copy-ok {
          color: var(--status-green-text);
        }
        .json-pre-box {
          padding: 0.85rem;
          background: var(--bg-main);
          border-top: 1px solid var(--border-subtle);
          max-height: 380px;
          overflow-y: auto;
        }
        .json-pre {
          font-size: 0.725rem;
          color: var(--accent-blue-text);
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
