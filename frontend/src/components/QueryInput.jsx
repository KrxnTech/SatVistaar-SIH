import React from 'react';
import { HelpCircle, Sparkles, X } from 'lucide-react';

const MODE_PRESETS = {
  VQA: [
    'What is visible in this satellite image?',
    'Is there an airport terminal or runway?',
    'Are there buildings or major structures visible?',
    'Is there water or a coastline?',
    'Where are the road transportation networks?'
  ],
  CAPTIONING: [
    'Describe this satellite image in detail.',
    'Provide a structured overview of all visible land cover and facilities.',
    'Describe the transportation corridors and surrounding terrain.'
  ],
  FEATURE_IDENTIFICATION: [
    'Where are the major buildings and facilities located?',
    'Where is the water or harbor?',
    'Where are the primary transportation routes and roads?'
  ],
  CHANGE_ANALYSIS: [
    'What changed between these two satellite images?',
    'Has vegetation or tree cover changed?',
    'Are there any new structures or cleared land between the images?'
  ]
};

export function QueryInput({ selectedMode, query, setQuery }) {
  const presets = MODE_PRESETS[selectedMode] || MODE_PRESETS.VQA;

  return (
    <div className="query-input-wrapper">
      <div className="query-label-row">
        <label className="section-label">
          <span>3. Enter Analysis Query</span>
        </label>
        {query && (
          <button
            type="button"
            className="clear-query-btn"
            onClick={() => setQuery('')}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="input-field-container">
        <textarea
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Enter your ${selectedMode} question or prompt...`}
          className="query-textarea"
        />
      </div>

      <div className="presets-wrapper">
        <div className="presets-title">
          <Sparkles size={12} /> Suggested Queries:
        </div>
        <div className="preset-chips">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className={`preset-chip ${query === preset ? 'active' : ''}`}
              onClick={() => setQuery(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .query-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .query-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .clear-query-btn {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.7rem;
          color: var(--text-dim);
          background: transparent;
        }
        .clear-query-btn:hover {
          color: var(--status-error);
        }
        .input-field-container {
          position: relative;
          width: 100%;
        }
        .query-textarea {
          width: 100%;
          background: var(--bg-input);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-main);
          resize: vertical;
          min-height: 75px;
          max-height: 160px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .query-textarea:focus {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 15px var(--accent-cyan-glow);
        }
        .query-textarea::placeholder {
          color: var(--text-dim);
        }
        .presets-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .presets-title {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .preset-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .preset-chip {
          font-size: 0.72rem;
          padding: 0.25rem 0.6rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          color: var(--text-muted);
          text-align: left;
          transition: all 0.15s ease;
        }
        .preset-chip:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-medium);
          color: var(--text-main);
        }
        .preset-chip.active {
          background: rgba(0, 229, 255, 0.15);
          border-color: var(--accent-cyan);
          color: var(--accent-cyan);
        }
      `}</style>
    </div>
  );
}

export default QueryInput;
