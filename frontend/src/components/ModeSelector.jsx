import React from 'react';
import { MessageSquare, FileText, Crosshair, GitCompare } from 'lucide-react';

export const ANALYSIS_MODES = [
  {
    id: 'VQA',
    title: 'Visual Q&A',
    badge: '1 Image',
    icon: MessageSquare,
    description: 'Ask arbitrary visual questions about objects, water bodies, structures, or facilities.',
    defaultQuery: 'What is visible in this satellite image?',
    minImages: 1
  },
  {
    id: 'CAPTIONING',
    title: 'Scene Description',
    badge: '1 Image',
    icon: FileText,
    description: 'Generate a rich, structured visual overview covering buildings, roads, vegetation, and land cover.',
    defaultQuery: 'Describe this satellite image in detail.',
    minImages: 1
  },
  {
    id: 'FEATURE_IDENTIFICATION',
    title: 'Visual Grounding',
    badge: '1 Image + Box Overlay',
    icon: Crosshair,
    description: 'Locate features with approximate bounding box overlays on the satellite imagery.',
    defaultQuery: 'Where are the major buildings and structures located?',
    minImages: 1
  },
  {
    id: 'CHANGE_ANALYSIS',
    title: 'Bi-Temporal Change',
    badge: '2 Images (Pair)',
    icon: GitCompare,
    description: 'Compare historical reference image (A) with new comparison image (B) for visual changes.',
    defaultQuery: 'What changed between these two satellite images?',
    minImages: 2
  }
];

export function ModeSelector({ selectedMode, onSelectMode }) {
  return (
    <div className="mode-selector-container">
      <label className="section-label">
        <span>1. Select Analysis Mission</span>
      </label>

      <div className="modes-grid">
        {ANALYSIS_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              className={`mode-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectMode(mode.id)}
            >
              <div className="mode-card-header">
                <div className={`mode-icon-box ${isSelected ? 'active' : ''}`}>
                  <Icon size={18} />
                </div>
                <span className="mode-badge">{mode.badge}</span>
              </div>

              <div className="mode-title">{mode.title}</div>
              <div className="mode-desc">{mode.description}</div>
            </button>
          );
        })}
      </div>

      <style>{`
        .mode-selector-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .section-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent-cyan);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .modes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.625rem;
        }
        @media (max-width: 640px) {
          .modes-grid {
            grid-template-columns: 1fr;
          }
        }
        .mode-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 0.875rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mode-card:hover {
          border-color: var(--border-medium);
          background: var(--bg-card-hover);
          transform: translateY(-1px);
        }
        .mode-card.active {
          background: linear-gradient(135deg, rgba(19, 28, 49, 0.95), rgba(15, 23, 42, 0.95));
          border-color: var(--accent-cyan);
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.12);
        }
        .mode-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 0.5rem;
        }
        .mode-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          transition: all 0.2s ease;
        }
        .mode-card.active .mode-icon-box {
          background: rgba(0, 229, 255, 0.15);
          border-color: var(--accent-cyan);
          color: var(--accent-cyan);
        }
        .mode-badge {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-dim);
          background: var(--bg-dark);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          border: 1px solid var(--border-subtle);
        }
        .mode-card.active .mode-badge {
          color: var(--accent-cyan);
          border-color: rgba(0, 229, 255, 0.3);
        }
        .mode-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }
        .mode-desc {
          font-size: 0.725rem;
          color: var(--text-muted);
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}

export default ModeSelector;
