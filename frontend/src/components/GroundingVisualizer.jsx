import React, { useState } from 'react';
import { Eye, EyeOff, Crosshair, AlertTriangle } from 'lucide-react';

export function GroundingVisualizer({ imagePreviewUrl, grounding, answerText }) {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const regions = grounding?.regions || [];
  const hasRegions = regions.length > 0;

  return (
    <div className="gov-grounding-visualizer">
      <div className="visualizer-header">
        <div className="header-title-group">
          <Crosshair size={15} className="header-icon" />
          <span className="visualizer-title font-mono">SPATIAL FEATURE GROUNDING OVERLAY</span>
          {hasRegions && (
            <span className="region-count-badge font-mono">
              {regions.length} REGION{regions.length > 1 ? 'S' : ''}
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
            <span>{showAnnotations ? 'OVERLAY ON' : 'ORIGINAL'}</span>
          </button>
        )}
      </div>

      <div className="canvas-frame">
        {imagePreviewUrl ? (
          <div className="image-relative-container">
            <img
              src={imagePreviewUrl}
              alt="Satellite Feature Grounding"
              className="grounding-image"
            />

            {/* Bounding Box Overlays (Orange / Blue) */}
            {hasRegions && showAnnotations && (
              <div className="bounding-layer">
                {regions.map((reg, index) => {
                  const isHovered = hoveredRegion === index;
                  const isEven = index % 2 === 0;

                  return (
                    <div
                      key={index}
                      className={`bounding-box-item ${isEven ? 'theme-orange' : 'theme-blue'} ${isHovered ? 'hovered' : ''}`}
                      style={{
                        left: `${reg.x * 100}%`,
                        top: `${reg.y * 100}%`,
                        width: `${reg.width * 100}%`,
                        height: `${reg.height * 100}%`
                      }}
                      onMouseEnter={() => setHoveredRegion(index)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    >
                      <div className="box-pill font-mono">
                        <span>{reg.label || `Region #${index + 1}`}</span>
                        {reg.confidence && (
                          <span className="box-confidence">
                            {Math.round(reg.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="no-preview-placeholder font-mono">
            <span>No imagery frame loaded</span>
          </div>
        )}
      </div>

      {/* Region Coordinates List */}
      {hasRegions && (
        <div className="regions-list-grid">
          {regions.map((reg, idx) => (
            <div
              key={idx}
              className={`region-item-row ${hoveredRegion === idx ? 'highlighted' : ''}`}
              onMouseEnter={() => setHoveredRegion(idx)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <div className={`region-indicator-dot ${idx % 2 === 0 ? 'dot-orange' : 'dot-blue'}`} />
              <div className="region-meta-block">
                <span className="region-label-text">{reg.label || `Region #${idx + 1}`}</span>
                <span className="region-coords-text font-mono">
                  Coordinates: [{Math.round(reg.x * 100)}%, {Math.round(reg.y * 100)}%] • Span: {Math.round(reg.width * 100)}% × {Math.round(reg.height * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approximate Grounding Disclaimer */}
      <div className="grounding-advisory-box">
        <AlertTriangle size={13} className="advisory-icon" />
        <span>
          <strong>Approximate Grounding:</strong> Inferred spatial bounding boxes represent VLM visual attention quadrants (not calibrated GIS shapefile polygons).
        </span>
      </div>

      <style>{`
        .gov-grounding-visualizer {
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
          color: var(--accent-orange);
        }
        .visualizer-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
        }
        .region-count-badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-orange-text);
          background: rgba(249, 115, 22, 0.12);
          border: 1px solid rgba(249, 115, 22, 0.35);
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
          background: rgba(249, 115, 22, 0.15);
          border-color: var(--accent-orange);
          color: var(--accent-orange-text);
        }
        .canvas-frame {
          position: relative;
          background: #08090d;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .image-relative-container {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
        }
        .grounding-image {
          width: 100%;
          height: auto;
          max-height: 480px;
          object-fit: contain;
          display: block;
        }
        .bounding-layer {
          position: absolute;
          inset: 0;
          pointer-events: auto;
        }
        .bounding-box-item {
          position: absolute;
          box-sizing: border-box;
          z-index: 10;
          transition: all 0.15s ease;
        }
        .bounding-box-item.theme-orange {
          border: 2px solid var(--accent-orange);
          background: rgba(249, 115, 22, 0.18);
        }
        .bounding-box-item.theme-blue {
          border: 2px solid var(--accent-blue);
          background: rgba(59, 130, 246, 0.18);
        }
        .bounding-box-item:hover, .bounding-box-item.hovered {
          z-index: 20;
          box-shadow: 0 0 12px rgba(249, 115, 22, 0.4);
        }
        .box-pill {
          position: absolute;
          top: -22px;
          left: -2px;
          background: #08090d;
          border: 1px solid currentColor;
          border-radius: 2px;
          padding: 0.05rem 0.35rem;
          font-size: 0.625rem;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .bounding-box-item.theme-orange .box-pill { border-color: var(--accent-orange); color: var(--accent-orange-text); }
        .bounding-box-item.theme-blue .box-pill { border-color: var(--accent-blue); color: var(--accent-blue-text); }
        .box-confidence {
          background: rgba(255, 255, 255, 0.15);
          padding: 0.02rem 0.2rem;
          border-radius: 2px;
        }
        .regions-list-grid {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .region-item-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.45rem 0.65rem;
          background: #0d0e15;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
        }
        .region-item-row.highlighted {
          border-color: var(--accent-orange);
          background: #141722;
        }
        .region-indicator-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }
        .dot-orange { background: var(--accent-orange); }
        .dot-blue { background: var(--accent-blue); }
        .region-meta-block {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .region-label-text {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
        }
        .region-coords-text {
          font-size: 0.675rem;
          color: var(--text-muted);
        }
        .grounding-advisory-box {
          display: flex;
          align-items: flex-start;
          gap: 0.45rem;
          font-size: 0.725rem;
          color: var(--text-secondary);
          background: #10121a;
          border: 1px solid var(--border-subtle);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          line-height: 1.45;
        }
        .advisory-icon {
          color: var(--accent-orange);
          flex-shrink: 0;
          margin-top: 0.1rem;
        }
        .no-preview-placeholder {
          padding: 3rem;
          color: var(--text-dim);
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}

export default GroundingVisualizer;
