import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  Calendar,
  Compass,
  Radio,
  Eye,
  Activity,
  HardDrive
} from 'lucide-react';

export function FusionMetadataPanel({ imageA, imageB }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const metaA = imageA?.metadata || {};
  const metaB = imageB?.metadata || {};

  const formatBounds = (bounds) => {
    if (!bounds) return 'Not georeferenced';
    const l = typeof bounds.left === 'number' ? bounds.left.toFixed(4) : bounds.left;
    const b = typeof bounds.bottom === 'number' ? bounds.bottom.toFixed(4) : bounds.bottom;
    const r = typeof bounds.right === 'number' ? bounds.right.toFixed(4) : bounds.right;
    const t = typeof bounds.top === 'number' ? bounds.top.toFixed(4) : bounds.top;
    return `[${l}, ${b}] → [${r}, ${t}]`;
  };

  const hasAnyMetadata = Boolean(imageA?.fileId || imageB?.fileId);
  if (!hasAnyMetadata) return null;

  return (
    <div className="fusion-meta-panel-root">
      <button
        type="button"
        className="fusion-meta-toggle-btn"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="toggle-left">
          <FileText size={14} className="meta-icon" />
          <span className="meta-btn-title font-mono">IMAGE METADATA DOSSIER</span>
          <span className="meta-pill font-mono">
            {isExpanded ? 'Hide Specifications' : 'View Optical & SAR Parameters'}
          </span>
        </div>
        <div className="toggle-right">
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {isExpanded && (
        <div className="fusion-meta-body">
          <div className="meta-columns-grid">
            {/* OPTICAL COLUMN */}
            <div className="meta-column opt-col">
              <div className="column-header">
                <div className="col-badge opt font-mono">
                  <Eye size={12} />
                  <span>OPTICAL / MULTISPECTRAL</span>
                </div>
                <span className="col-filename font-mono" title={imageA?.filename || 'Not uploaded'}>
                  {imageA?.filename || 'No optical image uploaded'}
                </span>
              </div>

              <div className="meta-spec-table">
                <div className="spec-row">
                  <span className="spec-label">Sensor / Platform</span>
                  <span className="spec-val font-mono">{metaA.sensor || (metaA.format === 'GTIFF' ? 'Sentinel-2 (MSI)' : 'Optical Sensor')}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Dimensions</span>
                  <span className="spec-val font-mono">{metaA.width && metaA.height ? `${metaA.width} × ${metaA.height} px` : '—'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Spectral Bands</span>
                  <span className="spec-val font-mono">{metaA.bands ? `${metaA.bands} channels (${metaA.bands >= 4 ? 'RGB+NIR' : 'RGB'})` : '3 bands'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">CRS Projection</span>
                  <span className="spec-val font-mono">{metaA.crs || 'Non-georeferenced'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Ground Resolution</span>
                  <span className="spec-val font-mono">{metaA.resolution || (metaA.isGeoreferenced ? '10 m' : 'Native pixel')}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Acquisition Date</span>
                  <span className="spec-val font-mono">{metaA.timestamp || 'Standard pass'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Datatype</span>
                  <span className="spec-val font-mono">{metaA.datatype || metaA.format || 'uint8'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">NoData Value</span>
                  <span className="spec-val font-mono">{metaA.nodata !== undefined && metaA.nodata !== null ? String(metaA.nodata) : 'None'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Bounding Extent</span>
                  <span className="spec-val bounds font-mono" title={formatBounds(metaA.bounds)}>{formatBounds(metaA.bounds)}</span>
                </div>
              </div>
            </div>

            {/* SAR COLUMN */}
            <div className="meta-column sar-col">
              <div className="column-header">
                <div className="col-badge sar font-mono">
                  <Radio size={12} />
                  <span>SYNTHETIC APERTURE RADAR (SAR)</span>
                </div>
                <span className="col-filename font-mono" title={imageB?.filename || 'Not uploaded'}>
                  {imageB?.filename || 'No SAR image uploaded'}
                </span>
              </div>

              <div className="meta-spec-table">
                <div className="spec-row">
                  <span className="spec-label">Sensor / Platform</span>
                  <span className="spec-val font-mono">{metaB.sensor || (metaB.format === 'GTIFF' ? 'Sentinel-1 (C-SAR)' : 'RISAT / Radar')}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Dimensions</span>
                  <span className="spec-val font-mono">{metaB.width && metaB.height ? `${metaB.width} × ${metaB.height} px` : '—'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Polarization</span>
                  <span className="spec-val font-mono">{metaB.polarization || 'VV / VH (Dual-pol)'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">CRS Projection</span>
                  <span className="spec-val font-mono">{metaB.crs || 'Non-georeferenced'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Ground Resolution</span>
                  <span className="spec-val font-mono">{metaB.resolution || (metaB.isGeoreferenced ? '10 m' : 'Native pixel')}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Acquisition Date</span>
                  <span className="spec-val font-mono">{metaB.timestamp || 'Co-registered pass'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Datatype</span>
                  <span className="spec-val font-mono">{metaB.datatype || metaB.format || 'float32 / uint8'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">NoData Value</span>
                  <span className="spec-val font-mono">{metaB.nodata !== undefined && metaB.nodata !== null ? String(metaB.nodata) : '0.0'}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Bounding Extent</span>
                  <span className="spec-val bounds font-mono" title={formatBounds(metaB.bounds)}>{formatBounds(metaB.bounds)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fusion-meta-panel-root {
          margin-top: 0.65rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #ffffff;
          overflow: hidden;
        }
        .fusion-meta-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 1rem;
          background: #f8fafc;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .fusion-meta-toggle-btn:hover {
          background: #f1f5f9;
        }
        .toggle-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .meta-icon {
          color: #000066;
        }
        .meta-btn-title {
          font-size: 0.72rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.02em;
        }
        .meta-pill {
          font-size: 0.65rem;
          color: #64748b;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 0.1rem 0.45rem;
          border-radius: 6px;
        }
        .toggle-right {
          color: #94a3b8;
        }
        .fusion-meta-body {
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
          background: #ffffff;
        }
        .meta-columns-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .meta-columns-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        .meta-column {
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          padding: 0.75rem;
          background: #fafafa;
        }
        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.65rem;
          gap: 0.5rem;
        }
        .col-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-size: 0.67rem;
          font-weight: 800;
        }
        .col-badge.opt {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        .col-badge.sar {
          background: #f5f3ff;
          color: #6d28d9;
          border: 1px solid #ddd6fe;
        }
        .col-filename {
          font-size: 0.65rem;
          color: #64748b;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .meta-spec-table {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .spec-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.25rem 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.72rem;
        }
        .spec-row:last-child {
          border-bottom: none;
        }
        .spec-label {
          color: #64748b;
          font-size: 0.69rem;
        }
        .spec-val {
          color: #0f172a;
          font-weight: 600;
          font-size: 0.68rem;
          text-align: right;
        }
        .spec-val.bounds {
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

export default FusionMetadataPanel;
