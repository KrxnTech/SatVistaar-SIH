import React from 'react';
import {
  Square,
  Pentagon,
  PenTool,
  MapPin,
  Edit3,
  Trash2,
  Maximize2,
  HelpCircle
} from 'lucide-react';

export function RoiToolbar({
  activeTool,
  onSelectTool,
  onClearRoi,
  onZoomToRoi,
  hasRoi,
  disabled = false
}) {
  const tools = [
    { id: 'rectangle', label: 'Rectangle', icon: Square, desc: 'Drag box to select bounding region' },
    { id: 'polygon', label: 'Polygon', icon: Pentagon, desc: 'Click points around boundary, double click to close' },
    { id: 'freehand', label: 'Freehand', icon: PenTool, desc: 'Draw arbitrary continuous contour' },
    { id: 'point', label: 'Point', icon: MapPin, desc: 'Click to select spot location with buffer' },
    { id: 'edit', label: 'Edit', icon: Edit3, desc: 'Drag vertices or transform existing selection' }
  ];

  return (
    <div className="sat-roi-toolbar font-mono">
      <div className="toolbar-label-group">
        <span className="toolbar-chip-dot" />
        <span className="toolbar-heading">ROI SELECTION TOOLBAR</span>
      </div>

      <div className="toolbar-btn-group">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              className={`roi-tool-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTool(isActive ? null : tool.id)}
              disabled={disabled}
              title={tool.desc}
            >
              <Icon size={14} className="roi-btn-icon" />
              <span>{tool.label}</span>
            </button>
          );
        })}

        <div className="toolbar-divider" />

        {hasRoi && (
          <>
            {onZoomToRoi && (
              <button
                type="button"
                className="roi-action-btn zoom"
                onClick={onZoomToRoi}
                title="Fit view to selected ROI geometry"
              >
                <Maximize2 size={13} />
                <span>Zoom</span>
              </button>
            )}

            <button
              type="button"
              className="roi-action-btn clear"
              onClick={onClearRoi}
              title="Clear selected region"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          </>
        )}
      </div>

      <style>{`
        .sat-roi-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.5rem 0.85rem;
          box-shadow: 0 2px 8px -2px rgba(0, 0, 70, 0.04);
          margin-bottom: 0.75rem;
        }
        .toolbar-label-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .toolbar-chip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ff5225;
          box-shadow: 0 0 6px rgba(255, 82, 37, 0.6);
        }
        .toolbar-heading {
          font-size: 0.72rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: 0.05em;
        }
        .toolbar-btn-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
        .roi-tool-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .roi-tool-btn:hover:not(:disabled) {
          background: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
          transform: translateY(-1px);
        }
        .roi-tool-btn.active {
          background: #000066;
          border-color: #000066;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 102, 0.25);
        }
        .roi-btn-icon {
          flex-shrink: 0;
        }
        .toolbar-divider {
          width: 1px;
          height: 20px;
          background: #e2e8f0;
          margin: 0 0.25rem;
        }
        .roi-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.65rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .roi-action-btn.zoom {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }
        .roi-action-btn.zoom:hover {
          background: #dcfce7;
          border-color: #86efac;
        }
        .roi-action-btn.clear {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }
        .roi-action-btn.clear:hover {
          background: #fee2e2;
          border-color: #f87171;
        }
      `}</style>
    </div>
  );
}

export default RoiToolbar;
