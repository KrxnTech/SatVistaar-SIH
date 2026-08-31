import React, { useState } from 'react';
import { Eye, EyeOff, Layers, Crosshair, AlertTriangle } from 'lucide-react';

export function GroundingVisualizer({ imagePreviewUrl, grounding, answerText }) {
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const regions = grounding?.regions || [];
  const hasRegions = regions.length > 0;

  return (
    <div className="grounding-visualizer-root">
      <div className="visualizer-toolbar">
        <div className="toolbar-title-group">
          <Crosshair size={16} className="cyan-icon" />
          <span className="toolbar-title">Approximate Visual Grounding</span>
          {hasRegions && (
            <span className="region-count-badge">
              {regions.length} Detected Region{regions.length > 1 ? 's' : ''}
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

      <div className="canvas-container">
        {imagePreviewUrl ? (
          <div className="image-relative-wrapper">
            <img
              src={imagePreviewUrl}
              alt="Satellite Grounding"
              className="grounding-base-image"
            />

            {/* Bounding Box Overlays */}
            {hasRegions && showAnnotations && (
              <div className="bounding-boxes-layer">
                {regions.map((reg, index) => {
                  const leftPercent = `${reg.x * 100}%`;
                  const topPercent = `${reg.y * 100}%`;
                  const widthPercent = `${reg.width * 100}%`;
                  const heightPercent = `${reg.height * 100}%`;
                  const isHovered = hoveredRegion === index;

                  return (
                    <div
                      key={index}
                      className={`bounding-box ${isHovered ? 'hovered' : ''}`}
                      style={{
                        left: leftPercent,
                        top: topPercent,
                        width: widthPercent,
                        height: heightPercent
                      }}
                      onMouseEnter={() => setHoveredRegion(index)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    >
                      <div className="box-label-pill">
                        <span>{reg.label || `Region #${index + 1}`}</span>
                        {reg.confidence && (
                          <span className="box-conf">
                            {Math.round(reg.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="box-corner tl" />
                      <div className="box-corner tr" />
                      <div className="box-corner bl" />
                      <div className="box-corner br" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="no-image-placeholder">
            <span>No image preview available</span>
          </div>
        )}
      </div>

      {/* Region List Cards */}
      {hasRegions && (
        <div className="regions-list">
          {regions.map((reg, idx) => (
            <div
              key={idx}
              className={`region-pill-item ${hoveredRegion === idx ? 'highlighted' : ''}`}
              onMouseEnter={() => setHoveredRegion(idx)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <div className="region-bullet" />
              <div className="region-info">
                <span className="region-name">{reg.label || `Region #${idx + 1}`}</span>
                <span className="region-coords">
                  Bounds: [{Math.round(reg.x * 100)}%, {Math.round(reg.y * 100)}%] — {Math.round(reg.width * 100)}% × {Math.round(reg.height * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grounding-disclaimer">
        <AlertTriangle size={13} />
        <span>Approximate Visual Grounding: Bounding regions represent VLM-inferred visual localization (not pixel-level survey segmentation).</span>
      </div>

      <style>{`
        .grounding-visualizer-root {
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
        .annotation-toggle-group {
          display: flex;
          align-items: center;
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
        .toggle-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-main);
        }
        .toggle-btn.active {
          background: rgba(0, 229, 255, 0.15);
          border-color: var(--accent-cyan);
          color: var(--accent-cyan);
        }
        .canvas-container {
          position: relative;
          background: #000000;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .image-relative-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
        }
        .grounding-base-image {
          width: 100%;
          height: auto;
          max-height: 520px;
          object-fit: contain;
          display: block;
        }
        .bounding-boxes-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: auto;
        }
        .bounding-box {
          position: absolute;
          border: 2px solid #00e5ff;
          background: rgba(0, 229, 255, 0.15);
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
          transition: all 0.2s ease;
          box-sizing: border-box;
          z-index: 10;
        }
        .bounding-box:hover, .bounding-box.hovered {
          border-color: #ff007f;
          background: rgba(255, 0, 127, 0.22);
          box-shadow: 0 0 25px rgba(255, 0, 127, 0.6);
          z-index: 20;
        }
        .box-label-pill {
          position: absolute;
          top: -24px;
          left: -2px;
          background: rgba(10, 15, 29, 0.92);
          border: 1px solid #00e5ff;
          border-radius: 4px;
          padding: 0.15rem 0.45rem;
          font-size: 0.65rem;
          font-weight: 600;
          color: #00e5ff;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          backdrop-filter: blur(4px);
        }
        .bounding-box:hover .box-label-pill, .bounding-box.hovered .box-label-pill {
          border-color: #ff007f;
          color: #ff007f;
        }
        .box-conf {
          background: rgba(0, 229, 255, 0.25);
          padding: 0.05rem 0.25rem;
          border-radius: 2px;
          font-size: 0.6rem;
        }
        .box-corner {
          position: absolute;
          width: 6px;
          height: 6px;
          border: 2px solid #00e5ff;
        }
        .box-corner.tl { top: -3px; left: -3px; border-right: none; border-bottom: none; }
        .box-corner.tr { top: -3px; right: -3px; border-left: none; border-bottom: none; }
        .box-corner.bl { bottom: -3px; left: -3px; border-right: none; border-top: none; }
        .box-corner.br { bottom: -3px; right: -3px; border-left: none; border-top: none; }
        .regions-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .region-pill-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
        }
        .region-pill-item:hover, .region-pill-item.highlighted {
          border-color: var(--accent-cyan);
          background: var(--bg-card-hover);
        }
        .region-bullet {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-cyan);
          box-shadow: 0 0 8px var(--accent-cyan);
        }
        .region-info {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .region-name {
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .region-coords {
          font-size: 0.675rem;
          color: var(--text-dim);
          font-family: 'JetBrains Mono', monospace;
        }
        .grounding-disclaimer {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          color: var(--text-dim);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          padding: 0.45rem 0.75rem;
          border-radius: var(--radius-sm);
        }
        .no-image-placeholder {
          padding: 3rem;
          color: var(--text-dim);
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
}

export default GroundingVisualizer;
