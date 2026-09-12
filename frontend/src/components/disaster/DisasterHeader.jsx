import React from 'react';
import {
  AlertTriangle,
  FileText,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Radio,
  Share2
} from 'lucide-react';

export default function DisasterHeader({
  disasterType = 'FLOOD',
  disasterResult,
  loading = false,
  onReset,
  onExportDossier,
  onRunAnalysis,
  aoiGeometry
}) {
  const isAnalyzed = Boolean(disasterResult);
  const eventName = disasterResult?.eventName || `${disasterType} Operational Response Assessment`;
  const locationName = disasterResult?.locationContext?.name || 'Assam Flood Basin (Brahmaputra)';
  const preDate = disasterResult?.temporalContext?.preDate || '2026-08-10';
  const postDate = disasterResult?.temporalContext?.postDate || '2026-08-18';
  const sensorLabel = disasterResult?.sensorMetadata?.sensorName || 'NISAR L-band Dual-Pol + Sentinel-2';

  return (
    <div className="disaster-header-banner">
      <div className="container disaster-header-content">
        {/* Left: Title, Badges, Context */}
        <div className="disaster-header-left">
          <div className="disaster-icon-halo">
            <AlertTriangle size={24} className={loading ? 'animate-spin' : ''} />
          </div>
          <div>
            <div className="title-row" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 className="disaster-title-main">
                {eventName}
              </h1>
              <span className="disaster-tag">
                <span className="disaster-badge-pulse" style={{ marginRight: '6px' }} />
                {loading ? 'ANALYZING SENSORS...' : isAnalyzed ? 'ACTIVE INCIDENT' : 'READINESS STANDBY'}
              </span>
            </div>
            
            <p className="disaster-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={13} color="#f87171" />
                <strong>AOI:</strong> {locationName} {aoiGeometry?.areaKm2 ? `(${Number(aoiGeometry.areaKm2).toFixed(1)} km²)` : ''}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={13} color="#38bdf8" />
                <strong>Baseline:</strong> {preDate} → <strong>Event:</strong> {postDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Radio size={13} color="#34d399" />
                <strong>Sensor Suite:</strong> {sensorLabel}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="disaster-header-right">
          <button
            type="button"
            className="disaster-action-btn"
            onClick={onExportDossier}
            disabled={!isAnalyzed || loading}
            title="Generate printable high-resolution disaster intelligence briefing"
          >
            <FileText size={14} />
            <span>Export Dossier</span>
          </button>

          <button
            type="button"
            className="disaster-action-btn"
            onClick={onReset}
            disabled={loading}
            title="Clear all event layers and restart setup"
          >
            <RotateCcw size={14} />
            <span>Reset Setup</span>
          </button>

          <button
            type="button"
            className="disaster-action-btn primary"
            onClick={onRunAnalysis}
            disabled={loading}
          >
            <Sparkles size={14} />
            <span>{loading ? 'Running AI Inference...' : isAnalyzed ? 'Refresh Intelligence' : 'Run Disaster Analysis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
