import React from 'react';
import { MessageSquare, FileText, Crosshair, GitCompare } from 'lucide-react';

export const ANALYSIS_MODES = [
  {
    id: 'VQA',
    title: 'Visual Q&A',
    badge: '1 Image',
    icon: MessageSquare,
    accentColor: 'blue',
    description: 'Ask arbitrary natural language questions about visible objects, water bodies, or terrain.',
    defaultQuery: 'What is visible in this satellite image?',
    minImages: 1
  },
  {
    id: 'CAPTIONING',
    title: 'Scene Description',
    badge: '1 Image',
    icon: FileText,
    accentColor: 'green',
    description: 'Generate a structured visual overview covering built-up structures, roads, and land cover.',
    defaultQuery: 'Describe this satellite image in detail.',
    minImages: 1
  },
  {
    id: 'FEATURE_IDENTIFICATION',
    title: 'Visual Grounding',
    badge: '1 Image + Overlay',
    icon: Crosshair,
    accentColor: 'orange',
    description: 'Identify and localize features with approximate spatial bounding box overlays.',
    defaultQuery: 'Where are the major buildings and facilities located?',
    minImages: 1
  },
  {
    id: 'CHANGE_ANALYSIS',
    title: 'Bi-Temporal Change',
    badge: '2 Images (Pair)',
    icon: GitCompare,
    accentColor: 'red-orange',
    description: 'Compare baseline reference (Image A) with comparison (Image B) to identify visual changes.',
    defaultQuery: 'What changed between these two satellite images?',
    minImages: 2
  }
];

export function ModeSelector({ selectedMode, onSelectMode }) {
  return (
    <div className="gov-mode-selector">
      <div className="mode-section-header">
        <label className="mode-section-title">
          1. Select Analysis Task
        </label>
        <span className="mode-hint font-mono">PIPELINE ROUTING</span>
      </div>

      <div className="modes-grid">
        {ANALYSIS_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              className={`mode-select-card ${isSelected ? 'active' : ''} accent-${mode.accentColor}`}
              onClick={() => onSelectMode(mode.id)}
            >
              <div className="mode-card-top">
                <div className={`mode-icon-box accent-${mode.accentColor} ${isSelected ? 'selected' : ''}`}>
                  <Icon size={16} />
                </div>
                <span className="mode-badge font-mono">{mode.badge}</span>
              </div>

              <div className="mode-card-info">
                <span className="mode-title">{mode.title}</span>
                <p className="mode-desc">{mode.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        .gov-mode-selector {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .mode-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mode-section-title {
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .mode-hint {
          font-size: 0.675rem;
          color: var(--text-dim);
        }
        .modes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.65rem;
        }
        @media (max-width: 580px) {
          .modes-grid { grid-template-columns: 1fr; }
        }
        .mode-select-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 0.85rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .mode-select-card:hover {
          border-color: var(--border-medium);
          background: var(--light-gray);
        }
        .mode-select-card.active {
          background: var(--very-light-gray);
          border-color: var(--accent-orange);
          box-shadow: 0 0 10px rgba(255, 82, 37, 0.2);
        }
        .mode-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 0.45rem;
        }
        .mode-icon-box {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          background: var(--bg-main);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mode-icon-box.accent-blue { color: var(--accent-blue-text); border-color: rgba(59, 130, 246, 0.35); }
        .mode-icon-box.accent-orange { color: var(--accent-orange); border-color: rgba(255, 82, 37, 0.35); }
        .mode-icon-box.accent-green { color: var(--status-green-text); border-color: rgba(34, 197, 94, 0.35); }
        .mode-icon-box.accent-red-orange { color: var(--error); border-color: rgba(239, 68, 68, 0.35); }

        .mode-icon-box.selected {
          background: var(--bg-card);
        }
        .mode-badge {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-main);
          padding: 0.12rem 0.45rem;
          border-radius: 3px;
          border: 1px solid var(--border-subtle);
        }
        .mode-select-card.active .mode-badge {
          background: rgba(255, 82, 37, 0.12);
          color: var(--accent-orange-text);
          border-color: rgba(255, 82, 37, 0.35);
        }
        .mode-card-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .mode-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .mode-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}

export default ModeSelector;
