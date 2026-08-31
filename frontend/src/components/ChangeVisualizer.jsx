import React, { useState } from 'react';
import { GitCompare, Eye, EyeOff, Calendar, ArrowRight, Clock } from 'lucide-react';
import { formatDisplayDate, calculateTemporalDelta } from '../utils/dateGenerator.js';

export function ChangeVisualizer({
  imageAPreviewUrl,
  imageBPreviewUrl,
  imageAMeta,
  imageBMeta,
  grounding
}) {
  const [showAnnotations, setShowAnnotations] = useState(true);

  const regions = grounding?.regions || [];
  const hasRegions = regions.length > 0;

  const dateA = imageAMeta?.timestamp;
  const dateB = imageBMeta?.timestamp;
  const displayA = formatDisplayDate(dateA);
  const displayB = formatDisplayDate(dateB);
  const deltaText = (dateA && dateB) ? calculateTemporalDelta(dateA, dateB) : null;

  return (
    <div className="change-visualizer-root">
      <div className="visualizer-toolbar">
        <div className="toolbar-title-group">
          <GitCompare size={16} className="cyan-icon" />
          <span className="toolbar-title">Bi-Temporal Visual Pair Comparison</span>
          {hasRegions && (
            <span className="region-count-badge">
              {regions.length} Detected Change Region{regions.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {hasRegions && (
          <div className="annotation-toggle-group">
            <button
              type="button"
              className={`toggle-btn ${showAnnotations ? 'active' : ''}`}
              onClick={() => setShowAnnotations(!showAnnotations)}
            >
              {showAnnotations ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>{showAnnotations ? 'Annotated' : 'Original'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Temporal Baseline Indicator Banner */}
      {dateA && dateB && (
        <div className="temporal-baseline-bar">
          <div className="baseline-left">
            <Clock size={13} className="cyan-icon" />
            <span className="baseline-label">Temporal Baseline:</span>
            <span className="baseline-delta-val">{deltaText}</span>
          </div>
          <div className="baseline-dates">
            <span className="date-span old">{displayA} (T1)</span>
            <ArrowRight size={12} className="arrow-sep" />
            <span className="date-span new">{displayB} (T2)</span>
          </div>
        </div>
      )}

      <div className="dual-comparison-grid">
        {/* Image A Slot */}
        <div className="comparison-card card-old">
          <div className="comparison-card-header">
            <div className="header-badge image-a">IMAGE A (Old / Reference)</div>
            <div className="date-badge old">
              <Calendar size={11} />
              <span>{displayA}</span>
            </div>
          </div>

          <div className="canvas-wrapper">
            {imageAPreviewUrl ? (
              <div className="image-relative-wrapper">
                <img
                  src={imageAPreviewUrl}
                  alt="Reference Satellite Image A"
                  className="comparison-image"
                />

                {hasRegions && showAnnotations && (
                  <div className="bounding-boxes-layer">
                    {regions.map((reg, idx) => (
                      <div
                        key={idx}
                        className="change-box ref"
                        style={{
                          left: `${reg.x * 100}%`,
                          top: `${reg.y * 100}%`,
                          width: `${reg.width * 100}%`,
                          height: `${reg.height * 100}%`
                        }}
                      >
                        <div className="change-label-pill ref">
                          <span>[A] {reg.label || `Change #${idx + 1}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-image-placeholder">No Image A loaded</div>
            )}
          </div>
        </div>

        {/* Image B Slot */}
        <div className="comparison-card card-new">
          <div className="comparison-card-header">
            <div className="header-badge image-b">IMAGE B (New / Comparison)</div>
            <div className="date-badge new">
              <Calendar size={11} />
              <span>{displayB}</span>
            </div>
          </div>

          <div className="canvas-wrapper">
            {imageBPreviewUrl ? (
              <div className="image-relative-wrapper">
                <img
                  src={imageBPreviewUrl}
                  alt="Comparison Satellite Image B"
                  className="comparison-image"
                />

                {hasRegions && showAnnotations && (
                  <div className="bounding-boxes-layer">
                    {regions.map((reg, idx) => (
                      <div
                        key={idx}
                        className="change-box comp"
                        style={{
                          left: `${reg.x * 100}%`,
                          top: `${reg.y * 100}%`,
                          width: `${reg.width * 100}%`,
                          height: `${reg.height * 100}%`
                        }}
                      >
                        <div className="change-label-pill comp">
                          <span>[B] {reg.label || `Change #${idx + 1}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-image-placeholder">No Image B loaded</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .change-visualizer-root {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .visualizer-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .toolbar-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cyan-icon {
          color: var(--accent-cyan);
        }
        .toolbar-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .region-count-badge {
          font-size: 0.675rem;
          font-weight: 600;
          color: var(--accent-cyan);
          background: rgba(0, 229, 255, 0.12);
          border: 1px solid rgba(0, 229, 255, 0.3);
          padding: 0.15rem 0.5rem;
          border-radius: 20px;
        }
        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.7rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--text-muted);
          transition: all 0.2s ease;
        }
        .toggle-btn.active {
          background: rgba(0, 229, 255, 0.15);
          border-color: var(--accent-cyan);
          color: var(--accent-cyan);
        }
        .temporal-baseline-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(13, 27, 62, 0.6);
          border: 1px solid rgba(0, 229, 255, 0.25);
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.75rem;
          font-size: 0.725rem;
          gap: 0.5rem;
        }
        .baseline-left {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .baseline-label {
          color: var(--text-dim);
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.65rem;
          letter-spacing: 0.03em;
        }
        .baseline-delta-val {
          color: var(--accent-cyan);
          font-weight: 700;
        }
        .baseline-dates {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
        }
        .date-span.old {
          color: #a5b4fc;
          font-weight: 600;
        }
        .date-span.new {
          color: #67e8f9;
          font-weight: 600;
        }
        .arrow-sep {
          color: var(--text-dim);
        }
        .dual-comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .dual-comparison-grid {
            grid-template-columns: 1fr;
          }
          .temporal-baseline-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.35rem;
          }
        }
        .comparison-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .comparison-card.card-old {
          border-top: 2px solid #818cf8;
        }
        .comparison-card.card-new {
          border-top: 2px solid #00e5ff;
        }
        .comparison-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: var(--bg-panel);
          border-bottom: 1px solid var(--border-subtle);
        }
        .header-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }
        .header-badge.image-a {
          background: rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.4);
        }
        .header-badge.image-b {
          background: rgba(0, 229, 255, 0.2);
          color: #67e8f9;
          border: 1px solid rgba(0, 229, 255, 0.4);
        }
        .date-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.68rem;
          font-weight: 600;
        }
        .date-badge.old {
          color: #c7d2fe;
          background: rgba(99, 102, 241, 0.15);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }
        .date-badge.new {
          color: #a5f3fc;
          background: rgba(0, 229, 255, 0.12);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          border: 1px solid rgba(0, 229, 255, 0.3);
        }
        .canvas-wrapper {
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 220px;
          position: relative;
        }
        .image-relative-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
        }
        .comparison-image {
          width: 100%;
          height: auto;
          max-height: 380px;
          object-fit: contain;
          display: block;
        }
        .bounding-boxes-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .change-box {
          position: absolute;
          box-sizing: border-box;
          z-index: 10;
        }
        .change-box.ref {
          border: 2px solid #818cf8;
          background: rgba(99, 102, 241, 0.18);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
        }
        .change-box.comp {
          border: 2px solid #00e5ff;
          background: rgba(0, 229, 255, 0.18);
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
        }
        .change-label-pill {
          position: absolute;
          top: -22px;
          left: -2px;
          padding: 0.15rem 0.4rem;
          font-size: 0.625rem;
          font-weight: 700;
          border-radius: 4px;
          white-space: nowrap;
          backdrop-filter: blur(4px);
        }
        .change-label-pill.ref {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid #818cf8;
          color: #a5b4fc;
        }
        .change-label-pill.comp {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid #00e5ff;
          color: #00e5ff;
        }
        .no-image-placeholder {
          padding: 2rem;
          font-size: 0.75rem;
          color: var(--text-dim);
        }
      `}</style>
    </div>
  );
}

export default ChangeVisualizer;
