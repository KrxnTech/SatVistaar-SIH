import React from 'react';
import { Sparkles, X, ArrowUp } from 'lucide-react';
import { useTextareaResize } from '../hooks/use-textarea-resize';

const MODE_PRESETS = {
  VQA: [
    'What objects and land cover are visible?',
    'Identify airport runways, hangars, or facilities',
    'Are there major transportation corridors visible?',
    'Is there water, shoreline, or coastal terrain?'
  ],
  CAPTIONING: [
    'Describe this satellite image in comprehensive detail.',
    'Provide a structured overview of all visible infrastructure and land cover.',
    'Summarize the transportation networks, built-up areas, and terrain.'
  ],
  FEATURE_IDENTIFICATION: [
    'Where are the major buildings and facilities located?',
    'Where is the water reservoir or shoreline located?',
    'Where are the primary transport routes and roads located?'
  ],
  CHANGE_ANALYSIS: [
    'What changed between these two satellite images?',
    'Detect new construction, roads, or facility expansion',
    'Has tree canopy, forest cover, or vegetation decreased?',
    'Identify cleared land, earthworks, or demolished structures'
  ]
};

function QueryTextarea({ value, onChange, onSubmit, placeholder }) {
  const textareaRef = useTextareaResize(value, 2);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (!value || !value.trim()) return;
      e.preventDefault();
      onSubmit?.();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      rows={2}
      className="qi-textarea"
      aria-label="Satellite query input"
    />
  );
}

export function QueryInput({ selectedMode, query, setQuery, onSubmit, loading }) {
  const presets = MODE_PRESETS[selectedMode] || MODE_PRESETS.VQA;
  const isEmpty = !query || !query.trim();

  const modeLabel = {
    VQA: 'vqa',
    CAPTIONING: 'scene description',
    FEATURE_IDENTIFICATION: 'visual grounding',
    CHANGE_ANALYSIS: 'change analysis'
  }[selectedMode] || 'satellite';

  return (
    <div className="qi-root">
      {/* Step Header */}
      <div className="qi-header">
        <div className="qi-header-left">
          <span className="qi-step-num font-mono">03</span>
          <div>
            <h3 className="qi-heading">ASK SATVISTAAR</h3>
            <p className="qi-subheading">Enter a conversational geospatial question or choose a suggested prompt</p>
          </div>
        </div>
        {!isEmpty && (
          <button type="button" className="qi-clear-btn font-mono" onClick={() => setQuery('')}>
            <X size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Input Card */}
      <div className="qi-card">
        <QueryTextarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onSubmit={onSubmit}
          placeholder={`Ask anything about this ${modeLabel} satellite scene...`}
        />
        <div className="qi-card-footer">
          <span className="qi-hint font-mono">Press Enter ↵ to submit · Shift+Enter for new line</span>
          <button
            type="button"
            disabled={isEmpty || loading}
            onClick={() => !isEmpty && onSubmit?.()}
            className={`qi-send-btn ${isEmpty || loading ? 'qi-send-disabled' : 'qi-send-active'}`}
            title="Submit query"
          >
            <ArrowUp size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="qi-presets">
        <div className="qi-presets-label">
          <Sparkles size={12} className="qi-sparkle" />
          <span className="font-mono">SUGGESTED PROMPTS</span>
        </div>
        <div className="qi-chips">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className={`qi-chip ${query === preset ? 'qi-chip-active' : ''}`}
              onClick={() => setQuery(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .qi-root {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          width: 100%;
        }

        /* ── Header ── */
        .qi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .qi-header-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .qi-step-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: #000066;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .qi-heading {
          font-size: 0.875rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          margin: 0 0 2px;
          line-height: 1;
        }

        .qi-subheading {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }

        .qi-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .qi-clear-btn:hover {
          color: #ef4444;
          background: #fee2e2;
          border-color: #fecaca;
        }

        /* ── Input Card ── */
        .qi-card {
          width: 100%;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .qi-card:focus-within {
          border-color: #ff5225;
          box-shadow: 0 0 0 3px rgba(255, 82, 37, 0.12);
        }

        .qi-textarea {
          width: 100%;
          min-height: 72px;
          max-height: 220px;
          padding: 0.875rem 1rem 0.5rem;
          font-size: 0.875rem;
          line-height: 1.6;
          color: #0f172a;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          font-family: inherit;
          box-sizing: border-box;
          overflow-x: hidden;
          overflow-y: auto;
        }

        .qi-textarea::placeholder {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .qi-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 0.75rem 0.55rem 1rem;
          border-top: 1px solid #f1f5f9;
          background: #fafafa;
        }

        .qi-hint {
          font-size: 0.65rem;
          color: #94a3b8;
          letter-spacing: 0.01em;
        }

        .qi-send-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }

        .qi-send-active {
          background: #0f172a;
          color: #fff;
        }

        .qi-send-active:hover {
          background: #ff5225;
          transform: scale(1.08);
        }

        .qi-send-disabled {
          background: #f1f5f9;
          color: #cbd5e1;
          cursor: not-allowed;
        }

        /* ── Suggested Prompts ── */
        .qi-presets {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .qi-presets-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .qi-sparkle {
          color: #ff5225;
        }

        .qi-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
        }

        .qi-chip {
          font-size: 0.75rem;
          padding: 0.3rem 0.65rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          color: #475569;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
          line-height: 1.4;
        }

        .qi-chip:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .qi-chip-active {
          background: rgba(255, 82, 37, 0.07);
          border-color: rgba(255, 82, 37, 0.3);
          color: #ff5225;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default QueryInput;
