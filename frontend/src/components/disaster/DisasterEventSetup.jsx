import React, { useRef } from 'react';
import {
  Waves,
  Wind,
  Activity,
  Mountain,
  Flame,
  SunMedium,
  Building,
  Factory,
  AlertTriangle,
  UploadCloud,
  CheckCircle,
  Radio,
  Eye,
  Crop,
  Layers,
  Sparkles
} from 'lucide-react';
import { uploadImageFile } from '../../services/api.js';

export const DISASTER_TYPES = [
  { id: 'FLOOD', label: 'Flood / Inundation', icon: Waves, color: '#38bdf8' },
  { id: 'CYCLONE', label: 'Cyclone / Storm', icon: Wind, color: '#818cf8' },
  { id: 'EARTHQUAKE', label: 'Earthquake Damage', icon: Activity, color: '#f87171' },
  { id: 'LANDSLIDE', label: 'Landslide / Debris', icon: Mountain, color: '#fb923c' },
  { id: 'WILDFIRE', label: 'Wildfire / Burn Scar', icon: Flame, color: '#f43f5e' },
  { id: 'DROUGHT', label: 'Drought / Moisture', icon: SunMedium, color: '#facc15' },
  { id: 'URBAN_DISASTER', label: 'Urban Structural', icon: Building, color: '#e879f9' },
  { id: 'INDUSTRIAL_DAMAGE', label: 'Industrial Hazard', icon: Factory, color: '#c084fc' },
  { id: 'TSUNAMI', label: 'Tsunami Coastal', icon: Waves, color: '#2dd4bf' },
  { id: 'OTHER', label: 'General / Other', icon: AlertTriangle, color: '#94a3b8' }
];

export default function DisasterEventSetup({
  disasterType,
  setDisasterType,
  sensorModality,
  setSensorModality,
  preImage,
  setPreImage,
  postImage,
  setPostImage,
  preDate,
  setPreDate,
  postDate,
  setPostDate,
  aoiGeometry,
  onOpenAoiDrawer,
  onExecuteAnalysis,
  loading = false
}) {
  const preInputRef = useRef(null);
  const postInputRef = useRef(null);

  const handleFileUpload = async (e, targetSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadRes = await uploadImageFile(file);
      const fileData = uploadRes?.data || uploadRes;
      targetSetter({
        id: fileData.fileId || fileData.id,
        fileId: fileData.fileId || fileData.id,
        url: fileData.url || (fileData.filepath ? `http://localhost:5000/${fileData.filepath.replace(/\\/g, '/')}` : URL.createObjectURL(file)),
        name: file.name,
        metadata: fileData.metadata || { width: 1024, height: 1024 }
      });
    } catch (err) {
      console.error('[Disaster Upload Error]:', err);
      // Client-side fallback object URL for offline inspection
      targetSetter({
        id: `local_${Date.now()}`,
        fileId: `local_${Date.now()}`,
        url: URL.createObjectURL(file),
        name: file.name,
        metadata: { width: 1024, height: 1024 }
      });
    }
  };

  return (
    <div className="container">
      <div className="disaster-setup-card">
        {/* Step Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#ef4444', color: '#ffffff', width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>1</span>
              Incident Parameters & Multi-Sensor Feeds
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
              Select disaster typology, calibrate sensor modality (supporting NISAR dual-polarization radar), and register temporal scenes.
            </p>
          </div>

          {/* Sensor Modality Toggle */}
          <div className="sensor-pills">
            {['AUTO', 'OPTICAL', 'SAR', 'NISAR'].map((mod) => (
              <button
                key={mod}
                type="button"
                className={`sensor-pill ${sensorModality === mod ? 'active' : ''} ${mod === 'NISAR' && sensorModality === 'NISAR' ? 'nisar-confirmed' : ''}`}
                onClick={() => setSensorModality(mod)}
              >
                {mod === 'NISAR' ? '🛰️ NISAR (L+S Band)' : mod === 'SAR' ? '📡 Radar SAR (C-band)' : mod === 'OPTICAL' ? '📷 Optical Multispectral' : '⚡ Auto-Detect Consensus'}
              </button>
            ))}
          </div>
        </div>

        {/* 10 Disaster Type Chips */}
        <div className="disaster-type-selector">
          {DISASTER_TYPES.map((dt) => {
            const Icon = dt.icon;
            const isActive = disasterType === dt.id;
            return (
              <button
                key={dt.id}
                type="button"
                className={`disaster-type-btn ${isActive ? 'active' : ''}`}
                onClick={() => setDisasterType(dt.id)}
              >
                <Icon size={18} color={isActive ? '#ef4444' : dt.color} />
                <span>{dt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Upload Slots: Pre-Disaster and Post-Disaster */}
        <div className="disaster-upload-grid">
          {/* Pre-Disaster Baseline */}
          <div
            className={`disaster-upload-slot ${preImage ? 'loaded' : ''}`}
            onClick={() => preInputRef.current?.click()}
          >
            <input
              type="file"
              ref={preInputRef}
              style={{ display: 'none' }}
              accept="image/*,.tif,.tiff"
              onChange={(e) => handleFileUpload(e, setPreImage)}
            />
            {preImage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                <img
                  src={preImage.url}
                  alt="Pre-disaster baseline"
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={14} color="#10b981" />
                    <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>Pre-Disaster Baseline</strong>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {preImage.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
                    <label style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Date:</label>
                    <input
                      type="date"
                      value={preDate}
                      onChange={(e) => setPreDate(e.target.value)}
                      style={{ padding: '2px 6px', fontSize: '0.72rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <UploadCloud size={24} color="#94a3b8" style={{ margin: '0 auto 0.4rem' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>Upload Pre-Disaster Scene</div>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                  Clear-sky baseline before the event onset (Optical or SAR)
                </p>
              </div>
            )}
          </div>

          {/* Post-Disaster Event Scene */}
          <div
            className={`disaster-upload-slot ${postImage ? 'loaded' : ''}`}
            onClick={() => postInputRef.current?.click()}
          >
            <input
              type="file"
              ref={postInputRef}
              style={{ display: 'none' }}
              accept="image/*,.tif,.tiff"
              onChange={(e) => handleFileUpload(e, setPostImage)}
            />
            {postImage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                <img
                  src={postImage.url}
                  alt="Post-disaster incident"
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.4)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={14} color="#ef4444" />
                    <strong style={{ fontSize: '0.82rem', color: '#ffffff' }}>Post-Disaster Incident Scene</strong>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {postImage.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
                    <label style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Date:</label>
                    <input
                      type="date"
                      value={postDate}
                      onChange={(e) => setPostDate(e.target.value)}
                      style={{ padding: '2px 6px', fontSize: '0.72rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: '#1e293b', color: '#fff' }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <UploadCloud size={24} color="#ef4444" style={{ margin: '0 auto 0.4rem' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fca5a5' }}>Upload Post-Disaster Scene</div>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                  Event-time scene (Cloud-penetrating NISAR / SAR or Optical)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AOI Bounding Box & Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              type="button"
              className="disaster-action-btn"
              onClick={onOpenAoiDrawer}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
            >
              <Crop size={13} color="#38bdf8" />
              <span>{aoiGeometry ? `AOI Defined (${Number(aoiGeometry.areaKm2 || 48.5).toFixed(1)} km²)` : 'Select Target AOI Boundary'}</span>
            </button>
            <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
              {aoiGeometry ? 'Spatial bounds scoped strictly to selected polygon.' : 'Analyzing full scene bounding box by default.'}
            </span>
          </div>

          <button
            type="button"
            className="disaster-action-btn primary"
            onClick={onExecuteAnalysis}
            disabled={loading || !postImage}
            style={{ minWidth: '220px', justifyContent: 'center' }}
          >
            <Sparkles size={14} />
            <span>{loading ? 'Processing Radar & Optical Feeds...' : 'Initialize Disaster Analysis'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
