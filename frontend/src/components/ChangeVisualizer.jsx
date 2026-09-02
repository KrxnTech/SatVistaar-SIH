import React, { useState } from 'react';
import { GitCompare, Eye, EyeOff, Calendar, ArrowRight, Clock, Target, Layers } from 'lucide-react';
import { formatDisplayDate, calculateTemporalDelta } from '../utils/dateGenerator.js';

export function ChangeVisualizer({
  imageAPreviewUrl,
  imageBPreviewUrl,
  imageAMeta,
  imageBMeta,
  grounding
}) {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState(null);

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
          <GitCompare size={16} className="header-icon" />
          <span className="visualizer-title font-mono">BI-TEMPORAL VISUAL COMPARISON</span>
          {hasRegions && (
            <span className="region-count-badge font-mono">
              <Target size={11} />
              {regions.length} DETECTED CHANGE REGION{regions.length > 1 ? 'S' : ''}
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
            <span>{showAnnotations ? 'HIGHLIGHT BOXES ON' : 'HIDE BOXES'}</span>
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
            <div className="slot-badge old font-mono">
              <span className="slot-dot old" />
              IMAGE A: Reference Baseline (T1)
            </div>
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
                        className={`change-box-ref ${hoveredIdx === idx ? 'hovered' : ''}`}
                        style={{
                          left: `${reg.x * 100}%`,
                          top: `${reg.y * 100}%`,
                          width: `${reg.width * 100}%`,
                          height: `${reg.height * 100}%`
                        }}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      >
                        <div className="corner-tick top-left" />
                        <div className="corner-tick top-right" />
                        <div className="corner-tick bottom-left" />
                        <div className="corner-tick bottom-right" />

                        <div className="change-tag-ref font-mono">
                          <span>[T1 BASELINE] #{idx + 1}</span>
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
            <div className="slot-badge new font-mono">
              <span className="slot-dot new" />
              IMAGE B: Comparison Target (T2)
            </div>
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
                        className={`change-box-comp ${hoveredIdx === idx ? 'hovered' : ''}`}
                        style={{
                          left: `${reg.x * 100}%`,
                          top: `${reg.y * 100}%`,
                          width: `${reg.width * 100}%`,
                          height: `${reg.height * 100}%`
                        }}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}
                      >
                        <div className="corner-tick top-left orange" />
                        <div className="corner-tick top-right orange" />
                        <div className="corner-tick bottom-left orange" />
                        <div className="corner-tick bottom-right orange" />

                        <div className="change-tag-comp font-mono">
                          <span className="pulse-dot" />
                          <span>[T2 UPDATED REGION] {reg.label || `Change #${idx + 1}`}</span>
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

      {/* Change Region Legend */}
      {hasRegions && showAnnotations && (
        <div className="change-legend-panel">
          <div className="legend-head font-mono">
            <Layers size={13} />
            <span>IDENTIFIED CHANGE REGIONS &amp; SPATIAL BOUNDS</span>
          </div>
          <div className="legend-items">
            {regions.map((reg, idx) => (
              <div
                key={idx}
                className={`legend-item ${hoveredIdx === idx ? 'active' : ''}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="legend-left">
                  <span className="legend-num font-mono">0{idx + 1}</span>
                  <span className="legend-name">{reg.label || `Region #${idx + 1}`}</span>
                </div>
                <div className="legend-meta font-mono">
                  <span className="legend-bounds">
                    [{Math.round(reg.x * 100)}%, {Math.round(reg.y * 100)}% • {Math.round(reg.width * 100)}%×{Math.round(reg.height * 100)}%]
                  </span>
                  {reg.confidence && (
                    <span className="legend-conf">
                      {Math.round(reg.confidence * 100)}% CONF
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .gov-change-visualizer {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }
        .visualizer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .header-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .header-icon {
          color: var(--accent-orange);
        }
        .visualizer-title {
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: var(--text-main);
        }
        .region-count-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-orange-text);
          background: rgba(255, 82, 37, 0.12);
          border: 1px solid rgba(255, 82, 37, 0.4);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }
        .annotation-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 700;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .annotation-toggle-btn.active {
          background: rgba(255, 82, 37, 0.15);
          border-color: var(--accent-orange);
          color: var(--accent-orange-text);
        }
        .temporal-baseline-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-main);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.75rem;
          font-size: 0.75rem;
          gap: 0.5rem;
          flex-wrap: wrap;
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
          gap: 0.85rem;
        }
        @media (max-width: 768px) {
          .dual-comparison-grid { grid-template-columns: 1fr; }
        }
        .comparison-slot {
          background: var(--bg-main);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .comparison-slot.slot-old {
          border-top: 3px solid var(--accent-blue);
        }
        .comparison-slot.slot-new {
          border-top: 3px solid var(--accent-orange);
        }
        .slot-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 0.75rem;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-subtle);
        }
        .slot-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 700;
        }
        .slot-badge.old { color: var(--accent-blue-text); }
        .slot-badge.new { color: var(--accent-orange-text); }
        .slot-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .slot-dot.old { background: var(--accent-blue); }
        .slot-dot.new { background: var(--accent-orange); }
        .date-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.675rem;
          color: var(--text-muted);
        }
        .canvas-frame {
          background: var(--bg-main);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 220px;
          position: relative;
        }
        .image-relative-container {
          position: relative;
          width: 100%;
          display: block;
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
          border: 2px dashed var(--info);
          background: rgba(59, 130, 246, 0.16);
          box-sizing: border-box;
          pointer-events: auto;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.25);
        }
        .change-box-ref.hovered {
          border-color: var(--info);
          background: rgba(59, 130, 246, 0.3);
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.55);
        }
        .change-box-comp {
          position: absolute;
          border: 2.5px solid var(--flame-orange);
          background: rgba(255, 82, 37, 0.24);
          box-sizing: border-box;
          pointer-events: auto;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 16px rgba(255, 82, 37, 0.45);
          animation: pulse-glow 2.5s ease-in-out infinite;
        }
        .change-box-comp.hovered {
          border-color: var(--flame-orange);
          background: rgba(255, 82, 37, 0.38);
          box-shadow: 0 0 24px rgba(255, 82, 37, 0.75);
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 12px rgba(255, 82, 37, 0.35);
          }
          50% {
            box-shadow: 0 0 22px rgba(255, 82, 37, 0.65);
          }
        }
        .corner-tick {
          position: absolute;
          width: 8px;
          height: 8px;
          border-color: var(--info);
        }
        .corner-tick.orange {
          border-color: var(--text-main);
        }
        .corner-tick.top-left {
          top: -2px; left: -2px;
          border-top: 2px solid currentColor;
          border-left: 2px solid currentColor;
        }
        .corner-tick.top-right {
          top: -2px; right: -2px;
          border-top: 2px solid currentColor;
          border-right: 2px solid currentColor;
        }
        .corner-tick.bottom-left {
          bottom: -2px; left: -2px;
          border-bottom: 2px solid currentColor;
          border-left: 2px solid currentColor;
        }
        .corner-tick.bottom-right {
          bottom: -2px; right: -2px;
          border-bottom: 2px solid currentColor;
          border-right: 2px solid currentColor;
        }
        .change-tag-ref {
          position: absolute;
          top: -22px;
          left: -2px;
          background: var(--bg-main);
          color: var(--accent-blue-text);
          border: 1px solid var(--accent-blue);
          padding: 0.1rem 0.4rem;
          font-size: 0.62rem;
          font-weight: 700;
          border-radius: 3px;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .change-tag-comp {
          position: absolute;
          top: -24px;
          left: -2px;
          background: var(--bg-main);
          color: var(--text-main);
          border: 1px solid var(--flame-orange);
          padding: 0.12rem 0.45rem;
          font-size: 0.64rem;
          font-weight: 800;
          border-radius: 3px;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.6);
        }
        .pulse-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--flame-orange);
          box-shadow: 0 0 6px var(--flame-orange);
          display: inline-block;
        }
        .no-image-placeholder {
          padding: 2.5rem;
          font-size: 0.75rem;
          color: var(--text-dim);
        }
        .change-legend-panel {
          background: var(--bg-main);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          padding: 0.65rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .legend-head {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--accent-orange-text);
        }
        .legend-items {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .legend-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--very-light-gray);
          border: 1px solid var(--border-subtle);
          padding: 0.4rem 0.65rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .legend-item:hover, .legend-item.active {
          border-color: var(--accent-orange);
          background: rgba(255, 82, 37, 0.08);
        }
        .legend-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .legend-num {
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--accent-orange-text);
        }
        .legend-name {
          font-size: 0.75rem;
          color: var(--text-main);
          font-weight: 600;
        }
        .legend-meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.65rem;
        }
        .legend-bounds {
          color: var(--text-dim);
        }
        .legend-conf {
          color: var(--status-green-text);
          font-weight: 700;
          background: rgba(34, 197, 94, 0.1);
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

export default ChangeVisualizer;
