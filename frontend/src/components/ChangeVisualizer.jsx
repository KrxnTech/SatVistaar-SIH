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
    <div className="gov-change-visualizer">
      <div className="visualizer-header">
        <div className="header-title-group">
          <GitCompare size={15} className="header-icon" />
          <span className="visualizer-title font-mono">BI-TEMPORAL VISUAL COMPARISON</span>
          {hasRegions && (
            <span className="region-count-badge font-mono">
              {regions.length} CHANGE REGION{regions.length > 1 ? 'S' : ''}
            </span>
          )}
        </div>

        {hasRegions && (
          <button
            type="button"
            className={`annotation-toggle-btn font-mono ${showAnnotations ? 'active' : ''}`}
            onClick={() => setShowAnnotations(!showAnnotations)}
          >
            {showAnnotations ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>{showAnnotations ? 'ANNOTATIONS ON' : 'ORIGINAL'}</span>
          </button>
        )}
      </div>

      {/* Temporal Baseline Indicator Bar */}
      {dateA && dateB && (
        <div className="temporal-baseline-bar">
          <div className="baseline-left">
            <Clock size={13} className="baseline-icon" />
            <span className="baseline-label font-mono">Temporal Delta:</span>
            <span className="baseline-delta-val font-mono">{deltaText}</span>
          </div>
          <div className="baseline-dates font-mono">
            <span className="date-span old">{displayA} (T1)</span>
            <ArrowRight size={12} className="arrow-sep" />
            <span className="date-span new">{displayB} (T2)</span>
          </div>
        </div>
      )}

      {/* Side-by-Side Dual Comparison Grid */}
      <div className="dual-comparison-grid">
        {/* Image A Slot */}
        <div className="comparison-slot gov-card slot-old">
          <div className="slot-header">
            <div className="slot-badge old font-mono">IMAGE A: Reference (T1)</div>
            <div className="date-badge old font-mono">
              <Calendar size={11} />
              <span>{displayA}</span>
            </div>
          </div>

          <div className="canvas-frame">
            {imageAPreviewUrl ? (
              <div className="image-relative-container">
                <img
                  src={imageAPreviewUrl}
                  alt="Reference Satellite Image A"
                  className="comparison-img"
                />

                {hasRegions && showAnnotations && (
                  <div className="bounding-layer">
                    {regions.map((reg, idx) => (
                      <div
                        key={idx}
                        className="change-box-ref"
                        style={{
                          left: `${reg.x * 100}%`,
                          top: `${reg.y * 100}%`,
                          width: `${reg.width * 100}%`,
                          height: `${reg.height * 100}%`
                        }}
                      >
                        <div className="change-tag-ref font-mono">
                          <span>[A] {reg.label || `Change #${idx + 1}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-image-placeholder font-mono">No Image A loaded</div>
            )}
          </div>
        </div>

        {/* Image B Slot */}
        <div className="comparison-slot gov-card slot-new">
          <div className="slot-header">
            <div className="slot-badge new font-mono">IMAGE B: Comparison (T2)</div>
            <div className="date-badge new font-mono">
              <Calendar size={11} />
              <span>{displayB}</span>
            </div>
          </div>

          <div className="canvas-frame">
            {imageBPreviewUrl ? (
              <div className="image-relative-container">
                <img
                  src={imageBPreviewUrl}
                  alt="Comparison Satellite Image B"
                  className="comparison-img"
                />

                {hasRegions && showAnnotations && (
                  <div className="bounding-layer">
                    {regions.map((reg, idx) => (
                      <div
                        key={idx}
                        className="change-box-comp"
                        style={{
                          left: `${reg.x * 100}%`,
                          top: `${reg.y * 100}%`,
                          width: `${reg.width * 100}%`,
                          height: `${reg.height * 100}%`
                        }}
                      >
                        <div className="change-tag-comp font-mono">
                          <span>[B] {reg.label || `Change #${idx + 1}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="no-image-placeholder font-mono">No Image B loaded</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .gov-change-visualizer {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }
        .visualizer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .header-icon {
          color: var(--status-red-text);
        }
        .visualizer-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
        }
        .region-count-badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--status-red-text);
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
        }
        .annotation-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 700;
          background: #141722;
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          min-height: auto;
        }
        .annotation-toggle-btn.active {
          background: rgba(239, 68, 68, 0.15);
          border-color: var(--status-red);
          color: var(--status-red-text);
        }
        .temporal-baseline-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #0d0e15;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.75rem;
          font-size: 0.75rem;
          gap: 0.5rem;
        }
        .baseline-left {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .baseline-icon {
          color: var(--accent-orange);
        }
        .baseline-label {
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.7rem;
        }
        .baseline-delta-val {
          color: var(--accent-orange-text);
          font-weight: 700;
        }
        .baseline-dates {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
        }
        .date-span.old { color: var(--accent-blue-text); font-weight: 600; }
        .date-span.new { color: var(--status-green-text); font-weight: 600; }
        .arrow-sep { color: var(--text-dim); }
        .dual-comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .dual-comparison-grid { grid-template-columns: 1fr; }
        }
        .comparison-slot {
          background: #0d0e15;
          border: 1px solid var(--border-subtle);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .comparison-slot.slot-old {
          border-top: 3px solid var(--accent-blue);
        }
        .comparison-slot.slot-new {
          border-top: 3px solid var(--status-green);
        }
        .slot-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          background: #141722;
          border-bottom: 1px solid var(--border-subtle);
        }
        .slot-badge {
          font-size: 0.7rem;
          font-weight: 700;
        }
        .slot-badge.old { color: var(--accent-blue-text); }
        .slot-badge.new { color: var(--status-green-text); }
        .date-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.675rem;
          color: var(--text-muted);
        }
        .canvas-frame {
          background: #08090d;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 220px;
          position: relative;
        }
        .image-relative-container {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
        }
        .comparison-img {
          width: 100%;
          height: auto;
          max-height: 380px;
          object-fit: contain;
          display: block;
        }
        .bounding-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .change-box-ref {
          position: absolute;
          border: 2px solid var(--accent-blue);
          background: rgba(59, 130, 246, 0.2);
          box-sizing: border-box;
        }
        .change-box-comp {
          position: absolute;
          border: 2px solid var(--status-red);
          background: rgba(239, 68, 68, 0.2);
          box-sizing: border-box;
        }
        .change-tag-ref {
          position: absolute;
          top: -20px;
          left: -2px;
          background: #08090d;
          color: var(--accent-blue-text);
          border: 1px solid var(--accent-blue);
          padding: 0.05rem 0.35rem;
          font-size: 0.6rem;
          font-weight: 700;
          border-radius: 2px;
          white-space: nowrap;
        }
        .change-tag-comp {
          position: absolute;
          top: -20px;
          left: -2px;
          background: #08090d;
          color: var(--status-red-text);
          border: 1px solid var(--status-red);
          padding: 0.05rem 0.35rem;
          font-size: 0.6rem;
          font-weight: 700;
          border-radius: 2px;
          white-space: nowrap;
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
