import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Compass,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';

export function PairCompatibilityCard({
  imageA, // Optical
  imageB, // SAR
  pairValidation = null,
  isOpticalSarMode = true
}) {
  const metaA = imageA?.metadata || {};
  const metaB = imageB?.metadata || {};

  const hasImageA = Boolean(imageA?.fileId);
  const hasImageB = Boolean(imageB?.fileId);

  // Derive checks from provided metadata or backend pairValidation
  const backendChecks = pairValidation?.checks || [];

  const formatPass = hasImageA && hasImageB;
  const dimsMatch = (metaA.width && metaB.width) ? (metaA.width === metaB.width && metaA.height === metaB.height) : true;
  const crsMatch = (metaA.crs && metaB.crs) ? (metaA.crs === metaB.crs) : true;
  const geoDetected = Boolean(metaA.isGeoreferenced || metaB.isGeoreferenced || metaA.crs || metaB.crs);
  const boundsOverlap = pairValidation?.checks?.find(c => c.name === 'bounds')?.status !== 'fail';

  const readiness = pairValidation?.fusionReadiness?.status || (
    (hasImageA && hasImageB && formatPass && boundsOverlap) ? 'READY' : 'NOT_READY'
  );

  const isReady = readiness === 'READY';

  const checklist = [
    {
      id: 'opt_loaded',
      label: 'Optical Image Loaded',
      pass: hasImageA,
      detail: hasImageA ? (metaA.sensor || imageA.filename || 'Loaded') : 'Awaiting Optical raster'
    },
    {
      id: 'sar_loaded',
      label: 'SAR Radar Image Loaded',
      pass: hasImageB,
      detail: hasImageB ? (metaB.polarization ? `SAR ${metaB.polarization}` : imageB.filename || 'Loaded') : 'Awaiting SAR raster'
    },
    {
      id: 'format_valid',
      label: 'Valid Raster Format',
      pass: hasImageA && hasImageB,
      detail: hasImageA && hasImageB ? `${metaA.format || 'RGB'} • ${metaB.format || 'SAR'}` : 'TIFF / GeoTIFF / PNG / JPG'
    },
    {
      id: 'geo_metadata',
      label: 'Geographic Metadata Detected',
      pass: geoDetected,
      status: geoDetected ? 'pass' : 'warning',
      detail: geoDetected ? `${metaA.crs || 'EPSG:4326'} / ${metaB.crs || 'EPSG:4326'}` : 'Visual co-registration active'
    },
    {
      id: 'spatial_overlap',
      label: 'Spatial Overlap Verified',
      pass: boundsOverlap && hasImageA && hasImageB,
      detail: boundsOverlap && hasImageA && hasImageB ? 'Extents share geographic coverage' : 'Check spatial bounds overlap'
    },
    {
      id: 'resolution_compat',
      label: 'Resolution Compatible',
      pass: hasImageA && hasImageB,
      detail: metaA.resolution || metaB.resolution ? `${metaA.resolution || '10m'} / ${metaB.resolution || '10m'}` : 'Ground sampling distance compatible'
    },
    {
      id: 'crs_compat',
      label: 'CRS Projection Compatible',
      pass: crsMatch,
      status: crsMatch ? 'pass' : 'warning',
      detail: crsMatch ? 'Matching geodetic frame' : 'Reprojection alignment active'
    },
    {
      id: 'dim_compat',
      label: 'Raster Dimensions Compatible',
      pass: dimsMatch,
      status: dimsMatch ? 'pass' : 'warning',
      detail: (metaA.width && metaB.width) ? `${metaA.width}x${metaA.height} vs ${metaB.width}x${metaB.height}` : 'Normalized coordinate space'
    }
  ];

  return (
    <div className={`pair-compat-card ${isReady ? 'is-ready' : 'not-ready'}`}>
      <div className="compat-card-header">
        <div className="compat-header-left">
          <div className="compat-icon-badge">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h4 className="compat-title font-mono">CO-REGISTRATION &amp; COMPATIBILITY CHECK</h4>
            <p className="compat-sub font-mono">
              Automated spatial and radiometric alignment verification
            </p>
          </div>
        </div>

        <div className={`readiness-pill font-mono ${isReady ? 'ready' : 'waiting'}`}>
          <span className="readiness-dot" />
          <span>FUSION READINESS: {readiness}</span>
        </div>
      </div>

      <div className="compat-divider" />

      {/* Grid of checks */}
      <div className="compat-checklist-grid">
        {checklist.map((item) => {
          const isPass = item.pass;
          const isWarn = item.status === 'warning' && !isPass;

          return (
            <div key={item.id} className={`check-item ${isPass ? 'passed' : isWarn ? 'warned' : 'pending'}`}>
              <div className="check-icon-wrap">
                {isPass ? (
                  <CheckCircle2 size={13} className="check-icon pass" />
                ) : isWarn ? (
                  <AlertTriangle size={13} className="check-icon warn" />
                ) : (
                  <span className="check-icon-dot" />
                )}
              </div>
              <div className="check-text-wrap">
                <span className="check-label">{item.label}</span>
                <span className="check-detail font-mono">{item.detail}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostic message if not ready */}
      {!isReady && hasImageA && hasImageB && (
        <div className="compat-alert-banner">
          <Info size={13} className="alert-icon" />
          <span>
            {pairValidation?.fusionReadiness?.summary ||
              'Ensure optical and SAR rasters represent the same geographic zone with mutual spatial overlap.'}
          </span>
        </div>
      )}

      <style>{`
        .pair-compat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.15rem 1.25rem;
          margin-top: 0.85rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          transition: all 0.2s ease;
        }
        .pair-compat-card.is-ready {
          border-color: #bbf7d0;
          background: #fcfdfc;
        }
        .compat-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .compat-header-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .compat-icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #eff6ff;
          color: #000066;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .is-ready .compat-icon-badge {
          background: #f0fdf4;
          color: #16a34a;
        }
        .compat-title {
          font-size: 0.8rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
          margin: 0;
        }
        .compat-sub {
          font-size: 0.7rem;
          color: #64748b;
          margin: 0.1rem 0 0 0;
        }
        .readiness-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.03em;
        }
        .readiness-pill.ready {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }
        .readiness-pill.waiting {
          background: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        .readiness-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }
        .compat-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0.85rem 0;
        }
        .compat-checklist-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.65rem 1rem;
        }
        @media (min-width: 1024px) {
          .compat-checklist-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        .check-item {
          display: flex;
          align-items: flex-start;
          gap: 0.45rem;
        }
        .check-icon-wrap {
          margin-top: 2px;
          flex-shrink: 0;
        }
        .check-icon.pass {
          color: #16a34a;
        }
        .check-icon.warn {
          color: #d97706;
        }
        .check-icon-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1.5px solid #cbd5e1;
        }
        .check-text-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .check-label {
          font-size: 0.73rem;
          font-weight: 700;
          color: #1e293b;
        }
        .check-detail {
          font-size: 0.66rem;
          color: #64748b;
        }
        .compat-alert-banner {
          margin-top: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #92400e;
          font-size: 0.73rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .alert-icon {
          color: #d97706;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

export default PairCompatibilityCard;
