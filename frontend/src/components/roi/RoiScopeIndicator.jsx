import React from 'react';
import { Target, Layers, ArrowLeftRight } from 'lucide-react';

export function RoiScopeIndicator({
  activeScope = 'FULL',
  onToggleScope,
  hasRoi = false,
  hasRoiResult = false,
  roiGeometry = null
}) {
  const isRoi = activeScope === 'ROI';

  return (
    <div className="sat-roi-scope-bar font-mono">
      <div className="scope-status-group">
        <span className={`scope-dot ${isRoi ? 'roi' : 'full'}`} />
        <span className="scope-label-title">ANALYSIS SCOPE:</span>
        <span className={`scope-badge ${isRoi ? 'roi' : 'full'}`}>
          {isRoi ? (
            <>
              <Target size={12} />
              <span>SELECTED AREA ({roiGeometry?.areaKm2 ? `${roiGeometry.areaKm2} km²` : (roiGeometry?.imageCoverage || 'ROI')})</span>
            </>
          ) : (
            <>
              <Layers size={12} />
              <span>FULL IMAGE ANALYSIS</span>
            </>
          )}
        </span>
      </div>

      {hasRoiResult && (
        <div className="scope-toggle-buttons">
          <button
            type="button"
            className={`scope-nav-btn ${!isRoi ? 'active' : ''}`}
            onClick={() => onToggleScope('FULL')}
          >
            <Layers size={12} />
            <span>Full Image</span>
          </button>

          <button
            type="button"
            className={`scope-nav-btn ${isRoi ? 'active' : ''}`}
            onClick={() => onToggleScope('ROI')}
          >
            <Target size={12} />
            <span>Selected Area</span>
          </button>
        </div>
      )}

      <style>{`
        .sat-roi-scope-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.45rem 0.85rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .scope-status-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
        }
        .scope-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .scope-dot.full {
          background: #0284c7;
          box-shadow: 0 0 6px rgba(2, 132, 199, 0.6);
        }
        .scope-dot.roi {
          background: #16a34a;
          box-shadow: 0 0 6px rgba(22, 163, 74, 0.7);
        }
        .scope-label-title {
          font-weight: 800;
          color: #64748b;
        }
        .scope-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 800;
          padding: 0.15rem 0.55rem;
          border-radius: 4px;
          font-size: 0.675rem;
        }
        .scope-badge.full {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          color: #0369a1;
        }
        .scope-badge.roi {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
        }
        .scope-toggle-buttons {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .scope-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.675rem;
          font-weight: 700;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .scope-nav-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .scope-nav-btn.active {
          background: #000066;
          border-color: #000066;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 102, 0.2);
        }
      `}</style>
    </div>
  );
}

export default RoiScopeIndicator;
