import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Dices,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { uploadImageFile } from '../services/api.js';
import { formatDisplayDate, calculateTemporalDelta, generateBiTemporalDatePair } from '../utils/dateGenerator.js';

export function ImageUploader({
  selectedMode,
  imageA,
  setImageA,
  imageB,
  setImageB,
  biTemporalDates,
  setBiTemporalDates
}) {
  const isDualMode = selectedMode === 'CHANGE_ANALYSIS';

  // Handle randomizing bi-temporal dates
  const handleRandomizeDates = (e) => {
    if (e) e.preventDefault();
    const newPair = generateBiTemporalDatePair();
    if (setBiTemporalDates) {
      setBiTemporalDates(newPair);
    }
    // Update imageA and imageB metadata timestamps if loaded
    if (imageA) {
      setImageA(prev => prev ? {
        ...prev,
        metadata: { ...(prev.metadata || {}), timestamp: newPair.dateA }
      } : null);
    }
    if (imageB) {
      setImageB(prev => prev ? {
        ...prev,
        metadata: { ...(prev.metadata || {}), timestamp: newPair.dateB }
      } : null);
    }
  };

  const handleDateAChange = (newDateA) => {
    if (!newDateA) return;
    const delta = calculateTemporalDelta(newDateA, biTemporalDates?.dateB);
    const updated = {
      ...biTemporalDates,
      dateA: newDateA,
      displayA: formatDisplayDate(newDateA),
      delta
    };
    if (setBiTemporalDates) setBiTemporalDates(updated);
    if (imageA) {
      setImageA(prev => prev ? {
        ...prev,
        metadata: { ...(prev.metadata || {}), timestamp: newDateA }
      } : null);
    }
  };

  const handleDateBChange = (newDateB) => {
    if (!newDateB) return;
    const delta = calculateTemporalDelta(biTemporalDates?.dateA, newDateB);
    const updated = {
      ...biTemporalDates,
      dateB: newDateB,
      displayB: formatDisplayDate(newDateB),
      delta
    };
    if (setBiTemporalDates) setBiTemporalDates(updated);
    if (imageB) {
      setImageB(prev => prev ? {
        ...prev,
        metadata: { ...(prev.metadata || {}), timestamp: newDateB }
      } : null);
    }
  };

  const dateAValue = imageA?.metadata?.timestamp || biTemporalDates?.dateA;
  const dateBValue = imageB?.metadata?.timestamp || biTemporalDates?.dateB;
  const currentDelta = calculateTemporalDelta(dateAValue, dateBValue);

  return (
    <div className="image-uploader-wrapper">
      <div className="section-header-row">
        <label className="section-label">
          <span>2. Upload Satellite Imagery</span>
        </label>
        <span className="format-hint">PNG, JPG, TIFF (Max 50MB)</span>
      </div>

      {/* Bi-Temporal Acquisition Dates Banner (Only in CHANGE_ANALYSIS Mode) */}
      {isDualMode && (
        <div className="bitemporal-timeline-bar">
          <div className="timeline-bar-top">
            <div className="timeline-title-group">
              <Clock size={13} className="timeline-icon" />
              <span className="timeline-title">Bi-Temporal Acquisition Timeline</span>
              <span className="timeline-delta-badge">Δt: {currentDelta}</span>
            </div>

            <button
              type="button"
              className="randomize-dates-btn"
              onClick={handleRandomizeDates}
              title="Generate 2 random realistic acquisition dates (Old & New)"
            >
              <Dices size={13} />
              <span>Randomize Dates</span>
            </button>
          </div>

          <div className="timeline-controls-grid">
            {/* Old Date A Input */}
            <div className="date-input-group old-date">
              <div className="date-label-row">
                <span className="date-role-tag old">Image A (Old / Reference)</span>
                <span className="date-display-val">{formatDisplayDate(dateAValue)}</span>
              </div>
              <div className="input-with-icon">
                <Calendar size={13} className="input-icon" />
                <input
                  type="date"
                  className="date-native-input"
                  value={dateAValue || ''}
                  onChange={(e) => handleDateAChange(e.target.value)}
                  title="Reference satellite acquisition date (Old)"
                />
              </div>
            </div>

            {/* Timeline Arrow */}
            <div className="timeline-arrow-box">
              <ArrowRight size={16} className="arrow-icon" />
            </div>

            {/* New Date B Input */}
            <div className="date-input-group new-date">
              <div className="date-label-row">
                <span className="date-role-tag new">Image B (New / Comparison)</span>
                <span className="date-display-val">{formatDisplayDate(dateBValue)}</span>
              </div>
              <div className="input-with-icon">
                <Calendar size={13} className="input-icon" />
                <input
                  type="date"
                  className="date-native-input"
                  value={dateBValue || ''}
                  onChange={(e) => handleDateBChange(e.target.value)}
                  title="Comparison satellite acquisition date (New)"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Slots Grid */}
      <div className={`uploader-grid ${isDualMode ? 'dual' : 'single'}`}>
        <UploadSlot
          slotName="Image A"
          roleLabel={isDualMode ? 'Reference (Older Baseline)' : 'Target Satellite Image'}
          imageState={imageA}
          setImageState={setImageA}
          acquisitionDate={isDualMode ? dateAValue : null}
          isOld={isDualMode}
          required
        />

        {isDualMode && (
          <UploadSlot
            slotName="Image B"
            roleLabel="Comparison (Newer Imagery)"
            imageState={imageB}
            setImageState={setImageB}
            acquisitionDate={dateBValue}
            isNew={true}
            required
          />
        )}
      </div>

      <style>{`
        .image-uploader-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .section-label {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent-cyan);
        }
        .format-hint {
          font-size: 0.7rem;
          color: var(--text-dim);
          font-weight: 400;
          text-transform: none;
        }
        .bitemporal-timeline-bar {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(22, 33, 62, 0.9));
          border: 1px solid rgba(0, 229, 255, 0.25);
          border-radius: var(--radius-md);
          padding: 0.75rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.06);
        }
        .timeline-bar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .timeline-title-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .timeline-icon {
          color: var(--accent-cyan);
        }
        .timeline-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: 0.02em;
        }
        .timeline-delta-badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-cyan);
          background: rgba(0, 229, 255, 0.12);
          border: 1px solid rgba(0, 229, 255, 0.3);
          padding: 0.1rem 0.45rem;
          border-radius: 12px;
        }
        .randomize-dates-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 600;
          background: rgba(99, 102, 241, 0.18);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #c7d2fe;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .randomize-dates-btn:hover {
          background: rgba(99, 102, 241, 0.35);
          border-color: #818cf8;
          color: #ffffff;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
          transform: translateY(-1px);
        }
        .timeline-controls-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0.5rem;
          align-items: center;
        }
        @media (max-width: 540px) {
          .timeline-controls-grid {
            grid-template-columns: 1fr;
            gap: 0.4rem;
          }
          .timeline-arrow-box {
            display: none;
          }
        }
        .date-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          background: rgba(7, 10, 18, 0.6);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.4rem 0.6rem;
        }
        .date-input-group.old-date {
          border-left: 3px solid #818cf8;
        }
        .date-input-group.new-date {
          border-left: 3px solid #00e5ff;
        }
        .date-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.3rem;
        }
        .date-role-tag {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .date-role-tag.old {
          color: #a5b4fc;
        }
        .date-role-tag.new {
          color: #67e8f9;
        }
        .date-display-val {
          font-size: 0.675rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .input-with-icon {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          padding: 0.15rem 0.35rem;
        }
        .input-icon {
          color: var(--text-dim);
          flex-shrink: 0;
        }
        .date-native-input {
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 0.725rem;
          font-family: inherit;
          width: 100%;
          outline: none;
          cursor: pointer;
          color-scheme: dark;
        }
        .timeline-arrow-box {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-cyan);
          opacity: 0.8;
        }
        .uploader-grid {
          display: grid;
          gap: 0.75rem;
        }
        .uploader-grid.single {
          grid-template-columns: 1fr;
        }
        .uploader-grid.dual {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 640px) {
          .uploader-grid.dual {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function UploadSlot({
  slotName,
  roleLabel,
  imageState,
  setImageState,
  acquisitionDate,
  isOld,
  isNew,
  required
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const effectiveTimestamp = imageState?.metadata?.timestamp || acquisitionDate || null;

  const handleFile = async (file) => {
    if (!file) return;

    // Validate size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File exceeds 50MB limit.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setError(null);
    setUploading(true);

    try {
      const uploadRes = await uploadImageFile(file);
      setImageState({
        file,
        previewUrl,
        fileId: uploadRes.fileId,
        fileName: file.name,
        sizeBytes: file.size,
        metadata: {
          ...(uploadRes.metadata || {}),
          timestamp: effectiveTimestamp || uploadRes.metadata?.timestamp || null
        }
      });
    } catch (err) {
      setError(err.message || 'Upload failed');
      // Fallback state if preview is available
      setImageState({
        file,
        previewUrl,
        fileId: null,
        fileName: file.name,
        sizeBytes: file.size,
        metadata: {
          timestamp: effectiveTimestamp || null
        }
      });
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    if (imageState?.previewUrl) {
      URL.revokeObjectURL(imageState.previewUrl);
    }
    setImageState(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      className={`upload-slot ${isDragging ? 'dragging' : ''} ${imageState ? 'has-file' : ''} ${isOld ? 'slot-old' : isNew ? 'slot-new' : ''}`}
      onClick={() => !imageState && fileInputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.tif,.tiff,image/png,image/jpeg,image/tiff"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <div className="slot-header">
        <div className="slot-title-group">
          <span className={`slot-title ${isOld ? 'old' : isNew ? 'new' : ''}`}>{slotName}</span>
          {isOld && <span className="temporal-tag old">Old</span>}
          {isNew && <span className="temporal-tag new">New</span>}
        </div>
        <span className="slot-role">{roleLabel}</span>
      </div>

      {uploading ? (
        <div className="upload-loading-state">
          <div className="spinner" />
          <span>Uploading & extracting metadata...</span>
        </div>
      ) : imageState ? (
        <div className="slot-preview-card">
          <div className="preview-media-box">
            <img
              src={imageState.previewUrl}
              alt={imageState.fileName}
              className="slot-img-preview"
            />
            <button
              type="button"
              className="remove-btn"
              onClick={removeImage}
              title="Remove image"
            >
              <X size={14} />
            </button>
          </div>

          <div className="slot-meta-info">
            <div className="file-name" title={imageState.fileName}>
              {imageState.fileName}
            </div>
            <div className="file-submeta">
              <span>{formatBytes(imageState.sizeBytes)}</span>
              {imageState.fileId ? (
                <span className="file-ready-tag">
                  <CheckCircle2 size={11} /> Uploaded
                </span>
              ) : (
                <span className="file-warn-tag">
                  <AlertCircle size={11} /> Not Uploaded
                </span>
              )}
            </div>
            <div className="date-info">
              <Calendar size={11} />
              <span>Acquired: <strong>{formatDisplayDate(effectiveTimestamp)}</strong></span>
            </div>
          </div>
        </div>
      ) : (
        <div className="slot-dropzone">
          <div className="drop-icon-circle">
            <UploadCloud size={20} />
          </div>
          <div className="drop-text">
            <strong>Click to upload</strong> or drag & drop
          </div>
          <div className="drop-subtext">
            {effectiveTimestamp ? `Acquisition: ${formatDisplayDate(effectiveTimestamp)}` : 'GeoTIFF, TIFF, PNG, or JPEG'}
          </div>
        </div>
      )}

      {error && (
        <div className="upload-error">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      <style>{`
        .upload-slot {
          background: var(--bg-card);
          border: 1px dashed var(--border-medium);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-height: 145px;
          display: flex;
          flex-direction: column;
        }
        .upload-slot:hover {
          border-color: var(--accent-cyan);
          background: var(--bg-card-hover);
        }
        .upload-slot.slot-old:hover {
          border-color: #818cf8;
        }
        .upload-slot.slot-new:hover {
          border-color: #00e5ff;
        }
        .upload-slot.dragging {
          border-color: var(--accent-cyan);
          background: rgba(0, 229, 255, 0.05);
          box-shadow: 0 0 20px var(--accent-cyan-glow);
        }
        .upload-slot.has-file {
          border-style: solid;
          border-color: var(--border-subtle);
          cursor: default;
        }
        .slot-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .slot-title-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .slot-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--accent-cyan);
          background: rgba(0, 229, 255, 0.1);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }
        .slot-title.old {
          color: #a5b4fc;
          background: rgba(99, 102, 241, 0.15);
        }
        .slot-title.new {
          color: #67e8f9;
          background: rgba(0, 229, 255, 0.15);
        }
        .temporal-tag {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.08rem 0.35rem;
          border-radius: 3px;
          text-transform: uppercase;
        }
        .temporal-tag.old {
          background: rgba(99, 102, 241, 0.25);
          color: #c7d2fe;
          border: 1px solid rgba(99, 102, 241, 0.4);
        }
        .temporal-tag.new {
          background: rgba(0, 229, 255, 0.2);
          color: #a5f3fc;
          border: 1px solid rgba(0, 229, 255, 0.4);
        }
        .slot-role {
          font-size: 0.7rem;
          color: var(--text-dim);
        }
        .slot-dropzone {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.5rem 0;
        }
        .drop-icon-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }
        .upload-slot:hover .drop-icon-circle {
          color: var(--accent-cyan);
          border-color: var(--accent-cyan);
        }
        .upload-slot.slot-old:hover .drop-icon-circle {
          color: #818cf8;
          border-color: #818cf8;
        }
        .drop-text {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .drop-text strong {
          color: var(--text-main);
        }
        .drop-subtext {
          font-size: 0.675rem;
          color: var(--text-dim);
        }
        .slot-preview-card {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex: 1;
        }
        .preview-media-box {
          position: relative;
          width: 90px;
          height: 75px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: #000;
          border: 1px solid var(--border-subtle);
          flex-shrink: 0;
        }
        .slot-img-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-btn {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.75);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        .remove-btn:hover {
          background: var(--status-error);
        }
        .slot-meta-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .file-name {
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .file-submeta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: var(--text-dim);
        }
        .file-ready-tag {
          color: #34d399;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .file-warn-tag {
          color: #fbbf24;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .date-info {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.68rem;
          color: var(--text-muted);
        }
        .date-info strong {
          color: var(--text-main);
        }
        .upload-loading-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .spinner {
          width: 22px;
          height: 22px;
          border: 2px solid var(--border-medium);
          border-top-color: var(--accent-cyan);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .upload-error {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          color: var(--status-error);
          margin-top: 0.3rem;
        }
      `}</style>
    </div>
  );
}

export default ImageUploader;
