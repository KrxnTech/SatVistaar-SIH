import React from 'react';
import {
  Compass,
  MapPin,
  Ruler,
  Layers,
  Globe,
  Maximize2,
  Cpu,
  Info
} from 'lucide-react';

export function RoiGisPanel({
  roiGeometry,
  metadata = {},
  className = ''
}) {
  if (!roiGeometry || !roiGeometry.coordinates || roiGeometry.coordinates.length < 2) {
    return (
      <div className={`sat-roi-gis-panel empty ${className}`}>
        <div className="gis-empty-placeholder font-mono">
          <Compass size={22} className="gis-empty-icon text-slate-400" />
          <span className="gis-empty-title">NO AREA SELECTED</span>
          <span className="gis-empty-desc">
            Use the ROI toolbar above to select a polygon or bounding box on the satellite image.
          </span>
        </div>

        <style>{`
          .sat-roi-gis-panel.empty {
            background: #ffffff;
            border: 1px dashed #cbd5e1;
            border-radius: 10px;
            padding: 1.5rem 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .gis-empty-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.35rem;
            max-width: 240px;
          }
          .gis-empty-title {
            font-size: 0.75rem;
            font-weight: 800;
            color: #000066;
            letter-spacing: 0.05em;
          }
          .gis-empty-desc {
            font-size: 0.675rem;
            color: #64748b;
            line-height: 1.4;
          }
        `}</style>
      </div>
    );
  }

  const {
    type = 'Polygon',
    areaKm2,
    areaM2,
    perimeterKm,
    perimeterM,
    bounds,
    center,
    crs,
    resolution,
    imageCoverage,
    pixelDimensions,
    pixelWindow,
    isGeoreferenced
  } = roiGeometry;

  return (
    <div className={`sat-roi-gis-panel populated ${className}`}>
      <div className="gis-panel-header font-mono">
        <div className="gis-title-group">
          <Compass size={14} className="text-orange-500" />
          <span className="gis-title">SELECTED AREA GIS INTEL</span>
        </div>
        <span className={`gis-crs-pill ${isGeoreferenced ? 'geo' : 'pixel'}`}>
          {isGeoreferenced ? (crs || 'EPSG:4326') : 'PIXEL CRS'}
        </span>
      </div>

      <div className="gis-metrics-grid font-mono">
        {/* Area */}
        <div className="gis-metric-card primary">
          <div className="metric-label">
            <Ruler size={12} className="metric-icon" />
            <span>CALCULATED AREA</span>
          </div>
          <div className="metric-value-lg">
            {areaKm2 ? `${areaKm2} km²` : (areaM2 ? `${areaM2.toLocaleString()} m²` : 'N/A')}
          </div>
          {areaM2 && areaKm2 && (
            <div className="metric-subtext">
              ({areaM2.toLocaleString()} m²)
            </div>
          )}
        </div>

        {/* Perimeter */}
        <div className="gis-metric-card">
          <div className="metric-label">
            <Maximize2 size={12} className="metric-icon" />
            <span>PERIMETER</span>
          </div>
          <div className="metric-value">
            {perimeterKm ? `${perimeterKm} km` : (perimeterM ? `${perimeterM.toLocaleString()} m` : 'N/A')}
          </div>
          <div className="metric-subtext">
            Geometry: {type}
          </div>
        </div>

        {/* Center Coordinate */}
        <div className="gis-metric-card">
          <div className="metric-label">
            <MapPin size={12} className="metric-icon" />
            <span>CENTER COORDINATE</span>
          </div>
          {isGeoreferenced && center?.lat !== undefined ? (
            <div className="metric-value-coords">
              <span>Lat: {center.lat}</span>
              <span>Lon: {center.lon}</span>
            </div>
          ) : (
            <div className="metric-value-coords">
              <span>Rel X: {center?.x ?? '0.500'}</span>
              <span>Rel Y: {center?.y ?? '0.500'}</span>
            </div>
          )}
          <div className="metric-subtext">
            {isGeoreferenced ? 'WGS84 Geodetic' : 'Normalized Raster'}
          </div>
        </div>

        {/* Image Coverage / Resolution */}
        <div className="gis-metric-card">
          <div className="metric-label">
            <Layers size={12} className="metric-icon" />
            <span>COVERAGE &amp; RESOLUTION</span>
          </div>
          <div className="metric-value">
            {imageCoverage || '12.4%'} scene
          </div>
          <div className="metric-subtext">
            Res: {resolution || metadata?.resolution || '10.0 m'}
          </div>
        </div>
      </div>

      {/* Detailed Bounds & Pixel Metadata Table */}
      <div className="gis-details-table font-mono">
        <div className="table-row">
          <span className="row-label">Geometry Type</span>
          <span className="row-val font-bold">{type}</span>
        </div>

        {isGeoreferenced && bounds ? (
          <>
            <div className="table-row">
              <span className="row-label">Bounding Box (N / S)</span>
              <span className="row-val">{bounds.north}° N / {bounds.south}° S</span>
            </div>
            <div className="table-row">
              <span className="row-label">Bounding Box (E / W)</span>
              <span className="row-val">{bounds.east}° E / {bounds.west}° W</span>
            </div>
          </>
        ) : (
          <div className="table-row">
            <span className="row-label">Bounding Box</span>
            <span className="row-val text-slate-500">
              [{pixelWindow?.x ?? 0}, {pixelWindow?.y ?? 0}] to [{(pixelWindow?.x ?? 0) + (pixelWindow?.width ?? 0)}, {(pixelWindow?.y ?? 0) + (pixelWindow?.height ?? 0)}] px
            </span>
          </div>
        )}

        <div className="table-row">
          <span className="row-label">Pixel Dimensions</span>
          <span className="row-val">{pixelDimensions || `${pixelWindow?.width || 0} × ${pixelWindow?.height || 0} px`}</span>
        </div>

        <div className="table-row">
          <span className="row-label">Spatial Reference (CRS)</span>
          <span className={`row-val ${isGeoreferenced ? 'text-emerald-700' : 'text-slate-500'}`}>
            {crs || (isGeoreferenced ? 'EPSG:4326' : 'Geospatial coordinates unavailable (pixel-based selection)')}
          </span>
        </div>
      </div>

      {!isGeoreferenced && (
        <div className="gis-transparency-alert font-mono">
          <Info size={12} className="flex-shrink-0 text-amber-600" />
          <span>Geospatial coordinates unavailable for standard image format. Spatial analysis derived from pixel dimensions.</span>
        </div>
      )}

      <style>{`
        .sat-roi-gis-panel.populated {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.85rem;
          box-shadow: 0 2px 10px -2px rgba(0, 0, 70, 0.05);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .gis-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.5rem;
        }
        .gis-title-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .gis-title {
          font-size: 0.72rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: 0.04em;
        }
        .gis-crs-pill {
          font-size: 0.625rem;
          font-weight: 800;
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
        }
        .gis-crs-pill.geo {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }
        .gis-crs-pill.pixel {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
        }
        .gis-metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }
        .gis-metric-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.5rem 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .gis-metric-card.primary {
          background: #fff5f2;
          border-color: #ffd8cc;
        }
        .metric-label {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.6rem;
          font-weight: 700;
          color: #64748b;
        }
        .gis-metric-card.primary .metric-label {
          color: #c2410c;
        }
        .metric-value-lg {
          font-size: 1.1rem;
          font-weight: 900;
          color: #000066;
        }
        .metric-value {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0f172a;
        }
        .metric-value-coords {
          display: flex;
          flex-direction: column;
          font-size: 0.7rem;
          font-weight: 800;
          color: #000066;
          line-height: 1.25;
        }
        .metric-subtext {
          font-size: 0.625rem;
          color: #64748b;
        }
        .gis-details-table {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.45rem 0.65rem;
        }
        .table-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.675rem;
          padding: 0.2rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .table-row:last-child {
          border-bottom: none;
        }
        .row-label {
          color: #64748b;
        }
        .row-val {
          color: #0f172a;
          text-align: right;
        }
        .gis-transparency-alert {
          display: flex;
          align-items: flex-start;
          gap: 0.4rem;
          font-size: 0.625rem;
          color: #78350f;
          background: #fefce8;
          border: 1px solid #fef08a;
          padding: 0.35rem 0.55rem;
          border-radius: 6px;
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}

export default RoiGisPanel;
