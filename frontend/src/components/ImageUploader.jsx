import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Dices,
  ArrowRight,
  Clock
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

  const handleRandomizeDates = (e) => {
    if (e) e.preventDefault();
    const newPair = generateBiTemporalDatePair();
    if (setBiTemporalDates) {
      setBiTemporalDates(newPair);
    }
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
    <div className="gov-image-uploader">
      <div className="uploader-header-row">
        <label className="uploader-title">
          2. Upload Satellite Imagery
        </label>
        <span className="uploader-formats-hint font-mono">TIFF, GeoTIFF, PNG, JPG (≤50MB)</span>
      </div>

      {/* Bi-Temporal Acquisition Dates Banner */}
      {isDualMode && (
        <div className="bitemporal-banner gov-card">
          <div className="banner-top-row">
            <div className="banner-title-group">
              <Clock size={13} className="banner-icon" />
              <span className="banner-title">Acquisition Timeline</span>
              <span className="delta-badge font-mono">Δt: {currentDelta}</span>
            </div>

            <button
              type="button"
              className="randomize-dates-btn font-mono"
              onClick={handleRandomizeDates}
              title="Generate 2 random realistic acquisition dates (Old & New)"
            >
              <Dices size={12} />
              <span>Randomize</span>
            </button>
          </div>

          <div className="timeline-inputs-grid">
            <div className="timeline-date-box date-old">
              <div className="date-role-row">
                <span className="role-tag old font-mono">IMAGE A (T1)</span>
                <span className="date-val-display font-mono">{formatDisplayDate(dateAValue)}</span>
              </div>
              <input
                type="date"
                className="gov-dark-date-input"
                value={dateAValue || ''}
                onChange={(e) => handleDateAChange(e.target.value)}
                aria-label="Image A Reference acquisition date"
              />
            </div>

            <div className="timeline-arrow-sep">
              <ArrowRight size={14} />
            </div>

            <div className="timeline-date-box date-new">
              <div className="date-role-row">
                <span className="role-tag new font-mono">IMAGE B (T2)</span>
                <span className="date-val-display font-mono">{formatDisplayDate(dateBValue)}</span>
              </div>
              <input
                type="date"
                className="gov-dark-date-input"
                value={dateBValue || ''}
                onChange={(e) => handleDateBChange(e.target.value)}
                aria-label="Image B Comparison acquisition date"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Slots Grid */}
      <div className={`uploader-slots-grid ${isDualMode ? 'dual' : 'single'}`}>
        <UploadSlot
          slotName="Image A"
          roleLabel={isDualMode ? 'Reference Baseline' : 'Primary Frame'}
          imageState={imageA}
          setImageState={setImageA}
          acquisitionDate={isDualMode ? dateAValue : null}
          isOld={isDualMode}
          required
        />

        {isDualMode && (
          <UploadSlot
            slotName="Image B"
            roleLabel="Comparison Later"
            imageState={imageB}
            setImageState={setImageB}
            acquisitionDate={dateBValue}
            isNew={true}
            required
          />
        )}
      </div>

      <style>{`
        .gov-image-uploader {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .uploader-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .uploader-title {
          font-size: 0.825rem;
          font-weight: 700;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .uploader-formats-hint {
          font-size: 0.675rem;
          color: var(--text-dim);
        }
        .bitemporal-banner {
          padding: 0.85rem;
          background: #10121a;
          border: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .banner-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .banner-title-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .banner-icon {
          color: var(--accent-orange);
        }
        .banner-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
        }
        .delta-badge {
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(249, 115, 22, 0.12);
          color: var(--accent-orange-text);
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
          border: 1px solid rgba(249, 115, 22, 0.35);
        }
        .randomize-dates-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.55rem;
          background: #141722;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary);
          min-height: auto;
        }
        .randomize-dates-btn:hover {
          border-color: var(--accent-orange);
          color: var(--accent-orange-text);
        }
        .timeline-inputs-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0.6rem;
          align-items: center;
        }
        @media (max-width: 580px) {
          .timeline-inputs-grid { grid-template-columns: 1fr; }
          .timeline-arrow-sep { display: none; }
        }
        .timeline-date-box {
          background: #0a0c12;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .timeline-date-box.date-old {
          border-left: 3px solid var(--accent-blue);
        }
        .timeline-date-box.date-new {
          border-left: 3px solid var(--status-green);
        }
        .date-role-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .role-tag {
          font-size: 0.65rem;
          font-weight: 700;
        }
        .role-tag.old { color: var(--accent-blue-text); }
        .role-tag.new { color: var(--status-green-text); }
        .date-val-display {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .gov-dark-date-input {
          border: 1px solid var(--border-subtle);
          border-radius: 4px;
          padding: 0.25rem 0.45rem;
          font-size: 0.75rem;
          color: #ffffff;
          background: #141722;
          outline: none;
        }
        .gov-dark-date-input:focus {
          border-color: var(--accent-orange);
        }
        .timeline-arrow-sep {
          color: var(--text-dim);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .uploader-slots-grid {
          display: grid;
          gap: 0.65rem;
        }
        .uploader-slots-grid.single {
          grid-template-columns: 1fr;
        }
        .uploader-slots-grid.dual {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 580px) {
          .uploader-slots-grid.dual { grid-template-columns: 1fr; }
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
      className={`gov-upload-slot ${isDragging ? 'dragging' : ''} ${imageState ? 'has-file' : ''}`}
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

      <div className="slot-header-bar">
        <div className="slot-title-group">
          <span className="slot-badge font-mono">{slotName}</span>
          <span className="slot-role-text">{roleLabel}</span>
        </div>
      </div>

      {uploading ? (
        <div className="upload-progress-state">
          <div className="progress-spinner" />
          <span className="font-mono">Extracting raster metadata...</span>
        </div>
      ) : imageState ? (
        <div className="slot-file-preview">
          <div className="preview-thumb-box">
            <img
              src={imageState.previewUrl}
              alt={imageState.fileName}
              className="preview-img"
            />
            {/* Subtle red remove button */}
            <button
              type="button"
              className="slot-remove-btn"
              onClick={removeImage}
              title="Remove image"
              aria-label="Remove image"
            >
              <X size={13} />
            </button>
          </div>

          <div className="preview-details">
            <div className="preview-filename" title={imageState.fileName}>
              {imageState.fileName}
            </div>
            <div className="preview-submeta font-mono">
              <span>{formatBytes(imageState.sizeBytes)}</span>
              {imageState.fileId ? (
                <span className="status-tag ok">
                  <CheckCircle2 size={11} /> READY
                </span>
              ) : (
                <span className="status-tag warn">
                  <AlertCircle size={11} /> LOCAL
                </span>
              )}
            </div>
            {imageState.fileId && (
              <div className="preview-id-tag font-mono">
                ID: {imageState.fileId.slice(0, 14)}...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="slot-empty-dropzone">
          <UploadCloud size={24} className="dropzone-icon" />
          <div className="dropzone-text">
            <strong>Click to upload</strong> or drag frame
          </div>
          <div className="dropzone-hint font-mono">GeoTIFF, TIFF, PNG, JPG</div>
        </div>
      )}

      {error && (
        <div className="slot-error-msg">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      <style>{`
        .gov-upload-slot {
          background: #141722;
          border: 1px dashed var(--border-medium);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-height: 130px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .gov-upload-slot:hover {
          border-color: var(--accent-blue);
          background: #181c28;
        }
        .gov-upload-slot.has-file {
          border-style: solid;
          border-color: var(--border-subtle);
          cursor: default;
        }
        .gov-upload-slot.dragging {
          border-color: var(--accent-orange);
          background: rgba(249, 115, 22, 0.08);
        }
        .slot-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .slot-title-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .slot-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.1rem 0.45rem;
          background: #0d0e15;
          border: 1px solid var(--border-subtle);
          border-radius: 3px;
          color: #ffffff;
        }
        .slot-role-text {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .slot-empty-dropzone {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding: 0.5rem 0;
          text-align: center;
        }
        .dropzone-icon {
          color: var(--text-dim);
        }
        .gov-upload-slot:hover .dropzone-icon {
          color: var(--accent-blue-text);
        }
        .dropzone-text {
          font-size: 0.775rem;
          color: var(--text-secondary);
        }
        .dropzone-text strong {
          color: var(--accent-orange-text);
        }
        .dropzone-hint {
          font-size: 0.65rem;
          color: var(--text-dim);
        }
        .slot-file-preview {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }
        .preview-thumb-box {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 4px;
          overflow: hidden;
          background: #08090d;
          border: 1px solid var(--border-medium);
          flex-shrink: 0;
        }
        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* Subtle red remove button */
        .slot-remove-btn {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(8, 9, 13, 0.85);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: auto;
        }
        .slot-remove-btn:hover {
          background: var(--status-red);
          color: #ffffff;
        }
        .preview-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          flex: 1;
          overflow: hidden;
        }
        .preview-filename {
          font-size: 0.8rem;
          font-weight: 600;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .preview-submeta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.675rem;
          color: var(--text-muted);
        }
        .status-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          font-weight: 700;
        }
        .status-tag.ok { color: var(--status-green-text); }
        .status-tag.warn { color: #fbbf24; }
        .preview-id-tag {
          font-size: 0.625rem;
          color: var(--text-dim);
        }
        .upload-progress-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .progress-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border-medium);
          border-top-color: var(--accent-orange);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .slot-error-msg {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.7rem;
          color: var(--status-red-text);
        }
      `}</style>
    </div>
  );
}

export default ImageUploader;
