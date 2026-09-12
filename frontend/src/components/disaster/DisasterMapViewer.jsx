import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Layers,
  Sliders,
  Columns,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Crosshair,
  MapPin,
  Building,
  AlertOctagon,
  ShieldAlert,
  Info
} from 'lucide-react';
import { RoiDrawingCanvas } from '../roi/RoiDrawingCanvas.jsx';

export default function DisasterMapViewer({
  preImage,
  postImage,
  disasterResult,
  aoiGeometry,
  onUpdateAoi,
  activeRoiTool,
  setActiveRoiTool
}) {
  const [viewMode, setViewMode] = useState('swipe'); // 'swipe' | 'split' | 'overlay'
  const [swipePos, setSwipePos] = useState(50); // percentage 0 - 100
  const [isSwiping, setIsSwiping] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Layer Toggles
  const [layers, setLayers] = useState({
    base: true,
    hazard: true,
    damage: true,
    infrastructure: true,
    priority: true,
    uncertainty: false
  });

  const toggleLayer = (layerKey) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const containerRef = useRef(null);

  // Swipe slider drag handlers
  const handleMouseDown = () => setIsSwiping(true);
  const handleMouseUp = () => setIsSwiping(false);
  const handleMouseMove = useCallback((e) => {
    if (!isSwiping || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    setSwipePos(x);
  }, [isSwiping]);

  useEffect(() => {
    if (isSwiping) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isSwiping, handleMouseMove]);

  const defaultCandidates = [
    { id: 'dmg_01', name: 'Barpeta Sector North', level: 4, severity: 'HIGH', label: 'Severe Submersion', x: 28, y: 35, areaHa: 142 },
    { id: 'dmg_02', name: 'Riverine Levee Breach', level: 4, severity: 'HIGH', label: 'Embankment Collapse', x: 58, y: 48, areaHa: 98 },
    { id: 'dmg_03', name: 'Rural Settlement Cluster', level: 3, severity: 'MODERATE', label: 'Access Corridor Cut', x: 42, y: 65, areaHa: 64 },
    { id: 'dmg_04', name: 'Lowland Buffer Zone', level: 2, severity: 'POTENTIAL', label: 'Saturated Farmland', x: 74, y: 28, areaHa: 115 }
  ];

  const rawCandidates = disasterResult?.candidateDamageRegions || disasterResult?.damageAssessment?.candidateRegions || disasterResult?.fieldVerificationQueue;
  let candidateRegions = defaultCandidates;
  if (Array.isArray(rawCandidates) && rawCandidates.length > 0) {
    candidateRegions = rawCandidates.map((c, i) => ({
      id: c.id || `dmg_${i + 1}`,
      name: c.name || c.label || `Sector ${i + 1}`,
      level: c.level || (c.damageLevelCode === 'HIGH' ? 4 : c.damageLevelCode === 'MODERATE' ? 3 : 2),
      severity: c.severity || c.damageLevelCode || 'HIGH',
      label: c.label || c.category || 'Impact Zone',
      x: c.x ?? (22 + (i * 19) % 60),
      y: c.y ?? (26 + (i * 21) % 55),
      areaHa: c.areaHa || 100
    }));
  }

  const defaultInfra = [
    { id: 'inf_01', name: 'Barpeta Civil Hospital', type: 'HOSPITAL', status: 'DISRUPTED', x: 32, y: 38 },
    { id: 'inf_02', name: 'NH-31 Bridge Span #4', type: 'BRIDGE', status: 'DISRUPTED', x: 56, y: 46 },
    { id: 'inf_03', name: 'North Power Substation', type: 'POWER', status: 'NORMAL', x: 68, y: 22 },
    { id: 'inf_04', name: 'Model High School', type: 'SCHOOL', status: 'DISRUPTED', x: 38, y: 62 }
  ];

  const rawInfra = disasterResult?.criticalInfrastructure?.facilities || disasterResult?.criticalInfrastructure;
  let criticalInfra = defaultInfra;
  if (Array.isArray(rawInfra) && rawInfra.length > 0) {
    criticalInfra = rawInfra.map((inf, i) => ({
      ...inf,
      x: inf.x ?? (28 + (i * 16) % 55),
      y: inf.y ?? (32 + (i * 18) % 50)
    }));
  }

  const preUrl = preImage?.url || '/reference_images/temporal_pre.png';
  const postUrl = postImage?.url || preImage?.url || '/reference_images/temporal_post.png';

  return (
    <div className="container" style={{ margin: '1.5rem auto' }}>
      <div className="disaster-map-container" ref={containerRef}>
        {/* Top Floating Map Toolbar */}
        <div className="disaster-map-toolbar">
          <button
            type="button"
            className={`map-tool-btn ${viewMode === 'swipe' ? 'active' : ''}`}
            onClick={() => setViewMode('swipe')}
            title="Interactive Swipe Comparison (Pre vs Post)"
          >
            <Sliders size={13} />
            <span>Swipe</span>
          </button>
          <button
            type="button"
            className={`map-tool-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
            title="Side-by-Side Dual View"
          >
            <Columns size={13} />
            <span>Side-by-Side</span>
          </button>
          <button
            type="button"
            className={`map-tool-btn ${viewMode === 'overlay' ? 'active' : ''}`}
            onClick={() => setViewMode('overlay')}
            title="Single Post-Event Incident View"
          >
            <Layers size={13} />
            <span>Incident</span>
          </button>

          <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

          {/* AOI Draw Tool Toggle */}
          <button
            type="button"
            className={`map-tool-btn ${activeRoiTool ? 'active' : ''}`}
            onClick={() => setActiveRoiTool(activeRoiTool ? null : 'rectangle')}
            title="Draw or modify Area of Interest on map"
          >
            <Crosshair size={13} />
            <span>{activeRoiTool ? 'Editing AOI' : 'Draw AOI'}</span>
          </button>
        </div>

        {/* Floating Layer Manager on Top Right */}
        <div className="disaster-layer-manager">
          <div className="layer-manager-title">
            <span>Map Layers</span>
            <Layers size={12} color="#94a3b8" />
          </div>

          <label className="layer-item">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              Base Imagery
            </span>
            <input
              type="checkbox"
              checked={layers.base}
              onChange={() => toggleLayer('base')}
            />
          </label>

          <label className="layer-item">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0284c7' }} />
              Hazard Footprint
            </span>
            <input
              type="checkbox"
              checked={layers.hazard}
              onChange={() => toggleLayer('hazard')}
            />
          </label>

          <label className="layer-item">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              5-Level Damage
            </span>
            <input
              type="checkbox"
              checked={layers.damage}
              onChange={() => toggleLayer('damage')}
            />
          </label>

          <label className="layer-item">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              Critical Infra & Roads
            </span>
            <input
              type="checkbox"
              checked={layers.infrastructure}
              onChange={() => toggleLayer('infrastructure')}
            />
          </label>

          <label className="layer-item">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899' }} />
              Priority Zones (P1-P3)
            </span>
            <input
              type="checkbox"
              checked={layers.priority}
              onChange={() => toggleLayer('priority')}
            />
          </label>

          <label className="layer-item">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }} />
              Uncertainty / Speckle
            </span>
            <input
              type="checkbox"
              checked={layers.uncertainty}
              onChange={() => toggleLayer('uncertainty')}
            />
          </label>
        </div>

        {/* Map Viewport Area */}
        <div className="swipe-slider-container">
          {viewMode === 'split' ? (
            /* Split View */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%' }}>
              <div style={{ position: 'relative', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                <img src={preUrl} alt="Pre-Disaster Baseline" className="swipe-image" />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                  BASELINE (PRE-DISASTER)
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <img src={postUrl} alt="Post-Disaster Incident" className="swipe-image" />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#ef4444', fontFamily: 'monospace' }}>
                  INCIDENT (POST-DISASTER)
                </div>
              </div>
            </div>
          ) : viewMode === 'overlay' ? (
            /* Single Incident Overlay View */
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img src={postUrl} alt="Post-Disaster Incident" className="swipe-image" />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#ef4444', fontFamily: 'monospace' }}>
                INCIDENT WITH LIVE DAMAGE MASK
              </div>
            </div>
          ) : (
            /* Interactive Swipe Slider View */
            <>
              {/* Bottom Layer: Pre-Disaster */}
              <img src={preUrl} alt="Pre-Disaster Baseline" className="swipe-image" />

              {/* Top Layer: Post-Disaster clipped by swipePos */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  clipPath: `polygon(${swipePos}% 0, 100% 0, 100% 100%, ${swipePos}% 100%)`,
                  overflow: 'hidden'
                }}
              >
                <img src={postUrl} alt="Post-Disaster Incident" className="swipe-image" />
              </div>

              {/* Vertical Swipe Divider & Handle */}
              <div
                className="swipe-divider-line"
                style={{ left: `${swipePos}%` }}
                onMouseDown={handleMouseDown}
              >
                <div className="swipe-handle">↔</div>
              </div>

              <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.75)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace', zIndex: 12 }}>
                ◀ PRE-EVENT
              </div>
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.75)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#ef4444', fontFamily: 'monospace', zIndex: 12 }}>
                POST-EVENT HAZARD ▶
              </div>
            </>
          )}

          {/* SVG Overlay Layers (Hazard mask, damage contours, infrastructure) */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 15
            }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* 1. Hazard Inundation Footprint Layer */}
            {layers.hazard && (
              <g opacity="0.45">
                <polygon
                  points="18,22 45,26 55,42 62,58 48,72 26,65 14,48"
                  fill="#0284c7"
                  stroke="#38bdf8"
                  strokeWidth="0.5"
                />
                <polygon
                  points="50,40 78,45 85,62 70,75 56,62"
                  fill="#ef4444"
                  stroke="#fca5a5"
                  strokeWidth="0.5"
                />
              </g>
            )}

            {/* 2. Priority 1 & 2 Zones Layer */}
            {layers.priority && (
              <g opacity="0.6">
                <circle cx="32" cy="36" r="9" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="1,1" />
                <circle cx="58" cy="48" r="8" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="1,1" />
                <circle cx="42" cy="65" r="7" fill="none" stroke="#f97316" strokeWidth="0.8" strokeDasharray="1,1" />
              </g>
            )}

            {/* 3. Uncertainty speckle mask */}
            {layers.uncertainty && (
              <g opacity="0.3">
                <rect x="75" y="15" width="20" height="25" fill="#a855f7" stroke="#d8b4fe" strokeWidth="0.4" strokeDasharray="2,1" />
              </g>
            )}
          </svg>

          {/* Candidate Damage Regions Markers */}
          {layers.damage && (Array.isArray(candidateRegions) ? candidateRegions : []).map((region) => (
            <div
              key={region.id}
              style={{
                position: 'absolute',
                top: `${region.y}%`,
                left: `${region.x}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 18,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
              onClick={() => setSelectedFeature(region)}
              title={`${region.name} - Severity: ${region.severity}`}
            >
              <div
                style={{
                  background: region.level >= 4 ? '#ef4444' : region.level === 3 ? '#f97316' : '#eab308',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.68rem',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(0,0,0,0.8)',
                  border: '2px solid #ffffff'
                }}
              >
                L{region.level}
              </div>
            </div>
          ))}

          {/* Critical Infrastructure Markers */}
          {layers.infrastructure && (Array.isArray(criticalInfra) ? criticalInfra : []).map((infra) => (
            <div
              key={infra.id}
              style={{
                position: 'absolute',
                top: `${infra.y}%`,
                left: `${infra.x}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 19,
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
              onClick={() => setSelectedFeature(infra)}
              title={`${infra.name} - Status: ${infra.status}`}
            >
              <div
                style={{
                  background: infra.status === 'DISRUPTED' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                  color: '#ffffff',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  whiteSpace: 'nowrap'
                }}
              >
                {infra.type === 'HOSPITAL' ? '🏥' : infra.type === 'BRIDGE' ? '🌉' : infra.type === 'POWER' ? '⚡' : '🏫'}
                <span>{infra.name}</span>
              </div>
            </div>
          ))}

          {/* Embedded ROI Drawing Canvas for AOI demarcation */}
          {activeRoiTool && (
            <RoiDrawingCanvas
              activeTool={activeRoiTool}
              roiGeometry={aoiGeometry}
              onChangeRoi={onUpdateAoi}
            />
          )}

          {/* Feature Popover / Details modal */}
          {selectedFeature && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(14, 21, 38, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem 1.25rem',
                zIndex: 25,
                boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                minWidth: '320px'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff', display: 'block' }}>
                  {selectedFeature.name}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {selectedFeature.label || `Status: ${selectedFeature.status}`} {selectedFeature.areaHa ? `· ${selectedFeature.areaHa} ha` : ''}
                </span>
              </div>
              <button
                type="button"
                className="disaster-action-btn"
                style={{ marginLeft: 'auto', padding: '3px 8px', fontSize: '0.7rem' }}
                onClick={() => setSelectedFeature(null)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
