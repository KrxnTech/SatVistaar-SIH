import React from 'react';
import { Sparkles, X } from 'lucide-react';

const MODE_PRESETS = {
  VQA: [
    'What is visible in this satellite image?',
    'Is there an airport runway or terminal facility?',
    'Are there major transport networks visible?',
    'Is there water or a coastal shoreline visible?'
  ],
  CAPTIONING: [
    'Describe this satellite image in detail.',
    'Provide a structured overview of all visible land cover and facilities.',
    'Describe the transportation corridors and surrounding terrain.'
  ],
  FEATURE_IDENTIFICATION: [
    'Where are the major buildings and facilities located?',
    'Where is the water reservoir or shoreline?',
    'Where are the primary transportation routes and roads?'
  ],
  CHANGE_ANALYSIS: [
    'What changed between these two satellite images?',
    'Has tree canopy or vegetation coverage changed?',
    'Are there any new structures or cleared land between the images?'
  ]
};

export function QueryInput({ selectedMode, query, setQuery }) {
  const presets = MODE_PRESETS[selectedMode] || MODE_PRESETS.VQA;

  return (
    <div className="gov-query-input">
      <div className="query-header-row">
        <label className="query-label">
          3. Natural-Language Query
        </label>
        {query && (
          <button
            type="button"
            className="clear-query-link"
            onClick={() => setQuery('')}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <textarea
        rows={3}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Enter your ${selectedMode} question or prompt...`}
        className="gov-dark-textarea"
        aria-label="Satellite analysis query"
      />

      <div className="query-presets-wrapper">
        <span className="presets-heading font-mono">
          <Sparkles size={11} className="sparkle-icon" /> TASK PRESETS:
        </span>
        <div className="presets-chips-list">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className={`preset-chip-btn ${query === preset ? 'active' : ''}`}
              onClick={() => setQuery(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .gov-query-input {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .query-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .query-label {
          font-size: 0.825rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .clear-query-link {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          font-size: 0.7rem;
          color: var(--text-muted);
          min-height: auto;
        }
        .clear-query-link:hover {
          color: var(--status-red-text);
        }
        .gov-dark-textarea {
          width: 100%;
          background: #0a0c12;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          font-size: 0.875rem;
          color: #ffffff;
          resize: vertical;
          min-height: 72px;
          max-height: 160px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gov-dark-textarea:focus {
          border-color: var(--accent-orange);
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.25);
        }
        .query-presets-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .presets-heading {
          font-size: 0.675rem;
          font-weight: 700;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .sparkle-icon {
          color: var(--accent-orange);
        }
        .presets-chips-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .preset-chip-btn {
          font-size: 0.725rem;
          padding: 0.25rem 0.55rem;
          background: #10121a;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-align: left;
          min-height: auto;
          transition: all 0.15s ease;
        }
        .preset-chip-btn:hover {
          background: #181c28;
          color: #ffffff;
          border-color: var(--border-medium);
        }
        .preset-chip-btn.active {
          background: rgba(249, 115, 22, 0.12);
          border-color: rgba(249, 115, 22, 0.4);
          color: var(--accent-orange-text);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default QueryInput;
