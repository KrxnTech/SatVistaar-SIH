import React, { useRef, useState, useCallback } from 'react';
import {
  ImagePlus,
  X,
  Upload,
  Trash2,
  AlertCircle,
  Clock,
  Dices,
  ArrowRight,
  Loader2,
  FileCheck,
  Layers
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

  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);
  const [uploadingA, setUploadingA] = useState(false);
  const [uploadingB, setUploadingB] = useState(false);
  const [errorA, setErrorA] = useState(null);
  const [errorB, setErrorB] = useState(null);

  const fileInputRefA = useRef(null);
  const fileInputRefB = useRef(null);

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

  const processUpload = async (file, isSlotB = false) => {
    const setError = isSlotB ? setErrorB : setErrorA;
    const setUploading = isSlotB ? setUploadingB : setUploadingA;
    const setImage = isSlotB ? setImageB : setImageA;
    const defaultDate = isSlotB ? (biTemporalDates?.dateB || dateBValue) : (biTemporalDates?.dateA || dateAValue);

    setError(null);

    // Validate size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File exceeds the 50MB maximum size limit.');
      return;
    }

    setUploading(true);

    try {
      const uploadRes = await uploadImageFile(file);
      const previewUrl = URL.createObjectURL(file);

      setImage({
        fileId: uploadRes.fileId || `local_${Date.now()}`,
        previewUrl,
        filename: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        mimeType: file.type || 'image/jpeg',
        metadata: {
          timestamp: defaultDate,
          crs: 'EPSG:4326',
          ...(uploadRes.metadata || {})
        }
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      const previewUrl = URL.createObjectURL(file);
      setImage({
        fileId: `local_${Date.now()}`,
        previewUrl,
        filename: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        mimeType: file.type || 'image/jpeg',
        metadata: {
          timestamp: defaultDate,
          crs: 'EPSG:4326'
        }
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e, isSlotB = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSlotB) setIsDraggingB(false);
    else setIsDraggingA(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file, isSlotB);
    }
  };

  const handleDragOver = (e, isSlotB = false) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e, isSlotB = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSlotB) setIsDraggingB(true);
    else setIsDraggingA(true);
  };

  const handleDragLeave = (e, isSlotB = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSlotB) setIsDraggingB(false);
    else setIsDraggingA(false);
  };

  const handleRemove = (isSlotB = false) => {
    if (isSlotB) {
      if (imageB?.previewUrl) URL.revokeObjectURL(imageB.previewUrl);
      setImageB(null);
      setErrorB(null);
      if (fileInputRefB.current) fileInputRefB.current.value = '';
    } else {
      if (imageA?.previewUrl) URL.revokeObjectURL(imageA.previewUrl);
      setImageA(null);
      setErrorA(null);
      if (fileInputRefA.current) fileInputRefA.current.value = '';
    }
  };

  return (
    <div className="sat-uploader-root">
      {/* Header */}
      <div className="uploader-header-row">
        <div className="uploader-title-group">
          <span className="step-num-pill font-mono">02</span>
          <label className="uploader-heading">
            {isDualMode ? 'Upload Bi-Temporal Scene Pair' : 'Upload Satellite Scene'}
          </label>
        </div>
        <span className="uploader-hint font-mono">TIFF, GeoTIFF, PNG, JPG (≤50MB)</span>
      </div>

      {/* Bi-Temporal Acquisition Timeline Banner */}
      {isDualMode && (
        <div className="bitemporal-timeline-banner">
          <div className="timeline-header-row">
            <div className="timeline-title-wrap">
              <Clock size={14} className="timeline-icon" />
              <span className="timeline-title">Acquisition Timeline</span>
              <span className="delta-pill font-mono">Δt: {currentDelta}</span>
            </div>

            <button
              type="button"
              className="randomize-btn font-mono"
              onClick={handleRandomizeDates}
              title="Generate random realistic multi-year acquisition timestamps"
            >
              <Dices size={13} />
              <span>Randomize Dates</span>
            </button>
          </div>

          <div className="timeline-dates-grid">
            {/* Date A Box */}
            <div className="timeline-date-card card-t1">
              <div className="date-card-top">
                <span className="t-badge t1 font-mono">T1 (REFERENCE)</span>
                <span className="t-date-text font-mono">{formatDisplayDate(dateAValue)}</span>
              </div>
              <input
                type="date"
                className="sat-date-input"
                value={dateAValue || ''}
                onChange={(e) => handleDateAChange(e.target.value)}
                aria-label="T1 acquisition date"
              />
            </div>

            {/* Connecting Arrow */}
            <div className="timeline-flow-arrow">
              <div className="arrow-line" />
              <div className="arrow-badge font-mono">
                <ArrowRight size={14} />
              </div>
              <div className="arrow-line" />
            </div>

            {/* Date B Box */}
            <div className="timeline-date-card card-t2">
              <div className="date-card-top">
                <span className="t-badge t2 font-mono">T2 (COMPARISON)</span>
                <span className="t-date-text font-mono">{formatDisplayDate(dateBValue)}</span>
              </div>
              <input
                type="date"
                className="sat-date-input"
                value={dateBValue || ''}
                onChange={(e) => handleDateBChange(e.target.value)}
                aria-label="T2 acquisition date"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Canvases Grid */}
      <div className={`uploader-canvases-grid ${isDualMode ? 'dual-canvas' : 'single-canvas'}`}>
        {/* Canvas A (Primary / Reference) */}
        <div className="canvas-column">
          {isDualMode && (
            <div className="canvas-col-header font-mono">
              <span className="canvas-tag t1">IMAGE A • T1 BASELINE</span>
              <span className="canvas-date font-mono">{formatDisplayDate(dateAValue)}</span>
            </div>
          )}

          <input
            ref={fileInputRefA}
            type="file"
            accept=".tif,.tiff,.png,.jpg,.jpeg,.geotiff"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processUpload(e.target.files[0], false)}
          />

          {!imageA ? (
            <div
              onClick={() => fileInputRefA.current?.click()}
              onDragOver={(e) => handleDragOver(e, false)}
              onDragEnter={(e) => handleDragEnter(e, false)}
              onDragLeave={(e) => handleDragLeave(e, false)}
              onDrop={(e) => handleDrop(e, false)}
              className={`upload-drop-box ${isDraggingA ? 'drag-over' : ''}`}
            >
              {uploadingA ? (
                <div className="upload-loading-view">
                  <Loader2 className="sat-spin-icon" size={28} />
                  <span className="loading-text font-mono">Ingesting satellite raster...</span>
                </div>
              ) : (
                <>
                  <div className="upload-icon-circle">
                    <ImagePlus className="upload-main-icon" size={24} />
                  </div>
                  <div className="upload-text-content">
                    <p className="upload-primary-text">Click to select</p>
                    <p className="upload-secondary-text">or drag and drop satellite scene here</p>
                  </div>
                  <span className="upload-sub-hint font-mono">TIFF, GeoTIFF, PNG, JPG (≤50MB)</span>
                </>
              )}
            </div>
          ) : (
            <div className="upload-preview-wrapper">
              <div className="preview-image-card group">
                <img
                  src={imageA.previewUrl}
                  alt="Satellite Preview A"
                  className="preview-image-element"
                />
                <div className="preview-hover-overlay" />
                <div className="preview-hover-actions">
                  <button
                    type="button"
                    onClick={() => fileInputRefA.current?.click()}
                    className="hover-action-btn replace-btn"
                    title="Upload replacement image"
                  >
                    <Upload size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(false)}
                    className="hover-action-btn delete-btn"
                    title="Remove image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {imageA.filename && (
                <div className="preview-meta-footer font-mono">
                  <div className="footer-filename-group">
                    <FileCheck size={14} className="file-check-icon" />
                    <span className="footer-filename" title={imageA.filename}>
                      {imageA.filename}
                    </span>
                    <span className="footer-size-pill">{imageA.size}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(false)}
                    className="footer-close-btn"
                    title="Clear image"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>
          )}

          {errorA && (
            <div className="upload-err-msg font-mono">
              <AlertCircle size={13} />
              <span>{errorA}</span>
            </div>
          )}
        </div>

        {/* Canvas B (Comparison Later - Only in Bi-Temporal Mode) */}
        {isDualMode && (
          <div className="canvas-column">
            <div className="canvas-col-header font-mono">
              <span className="canvas-tag t2">IMAGE B • T2 COMPARISON</span>
              <span className="canvas-date font-mono">{formatDisplayDate(dateBValue)}</span>
            </div>

            <input
              ref={fileInputRefB}
              type="file"
              accept=".tif,.tiff,.png,.jpg,.jpeg,.geotiff"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && processUpload(e.target.files[0], true)}
            />

            {!imageB ? (
              <div
                onClick={() => fileInputRefB.current?.click()}
                onDragOver={(e) => handleDragOver(e, true)}
                onDragEnter={(e) => handleDragEnter(e, true)}
                onDragLeave={(e) => handleDragLeave(e, true)}
                onDrop={(e) => handleDrop(e, true)}
                className={`upload-drop-box orange-theme ${isDraggingB ? 'drag-over' : ''}`}
              >
                {uploadingB ? (
                  <div className="upload-loading-view">
                    <Loader2 className="sat-spin-icon orange" size={28} />
                    <span className="loading-text font-mono">Ingesting comparison raster...</span>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon-circle orange">
                      <ImagePlus className="upload-main-icon orange" size={24} />
                    </div>
                    <div className="upload-text-content">
                      <p className="upload-primary-text">Click to select</p>
                      <p className="upload-secondary-text">or drag and drop comparison scene here</p>
                    </div>
                    <span className="upload-sub-hint font-mono">TIFF, GeoTIFF, PNG, JPG (≤50MB)</span>
                  </>
                )}
              </div>
            ) : (
              <div className="upload-preview-wrapper">
                <div className="preview-image-card group">
                  <img
                    src={imageB.previewUrl}
                    alt="Satellite Preview B"
                    className="preview-image-element"
                  />
                  <div className="preview-hover-overlay" />
                  <div className="preview-hover-actions">
                    <button
                      type="button"
                      onClick={() => fileInputRefB.current?.click()}
                      className="hover-action-btn replace-btn"
                      title="Upload replacement image"
                    >
                      <Upload size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(true)}
                      className="hover-action-btn delete-btn"
                      title="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {imageB.filename && (
                  <div className="preview-meta-footer font-mono">
                    <div className="footer-filename-group">
                      <FileCheck size={14} className="file-check-icon orange" />
                      <span className="footer-filename" title={imageB.filename}>
                        {imageB.filename}
                      </span>
                      <span className="footer-size-pill">{imageB.size}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(true)}
                      className="footer-close-btn"
                      title="Clear image"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {errorB && (
              <div className="upload-err-msg font-mono">
                <AlertCircle size={13} />
                <span>{errorB}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .sat-uploader-root {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          width: 100%;
        }

        .uploader-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .uploader-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .step-num-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: #000066;
          color: #ffffff;
          font-size: 0.725rem;
          font-weight: 800;
        }

        .uploader-heading {
          font-size: 0.9rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }

        .uploader-hint {
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.04em;
        }

        /* Bi-Temporal Timeline */
        .bitemporal-timeline-banner {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .timeline-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .timeline-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .timeline-icon {
          color: #ff5225;
        }

        .timeline-title {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #0f172a;
        }

        .delta-pill {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          background: rgba(255, 82, 37, 0.1);
          color: #ff5225;
          border: 1px solid rgba(255, 82, 37, 0.25);
          border-radius: 6px;
        }

        .randomize-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .randomize-btn:hover {
          color: #ff5225;
          border-color: #ff5225;
          background: #fff5f2;
        }

        .timeline-dates-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 0.75rem;
        }

        @media (max-width: 640px) {
          .timeline-dates-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          .timeline-flow-arrow {
            display: none;
          }
        }

        .timeline-date-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .timeline-date-card.card-t1 {
          border-left: 3px solid #3b82f6;
        }

        .timeline-date-card.card-t2 {
          border-left: 3px solid #ff5225;
        }

        .date-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.7rem;
        }

        .t-badge {
          font-weight: 800;
          font-size: 0.65rem;
        }
        .t-badge.t1 { color: #2563eb; }
        .t-badge.t2 { color: #ff5225; }

        .t-date-text {
          color: #64748b;
          font-weight: 600;
        }

        .sat-date-input {
          width: 100%;
          font-size: 0.8125rem;
          padding: 0.25rem 0.4rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
        }
        .sat-date-input:focus {
          border-color: #ff5225;
        }

        .timeline-flow-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .arrow-line {
          flex: 1;
          height: 1px;
          background: #cbd5e1;
        }

        .arrow-badge {
          padding: 0.25rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Canvases Grid */
        .uploader-canvases-grid {
          display: grid;
          gap: 0.85rem;
          width: 100%;
        }

        .uploader-canvases-grid.single-canvas {
          grid-template-columns: 1fr;
        }

        .uploader-canvases-grid.dual-canvas {
          grid-template-columns: 1fr 1fr;
        }

        @media (max-width: 680px) {
          .uploader-canvases-grid.dual-canvas {
            grid-template-columns: 1fr;
          }
        }

        .canvas-column {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .canvas-col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0 0.2rem;
        }

        .canvas-tag.t1 { color: #2563eb; }
        .canvas-tag.t2 { color: #ff5225; }
        .canvas-date { color: #64748b; }

        /* Drop Box (shadcn/originui design) */
        .upload-drop-box {
          height: 220px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          border-radius: 12px;
          border: 2px dashed rgba(100, 116, 139, 0.3);
          background: #f8fafc;
          padding: 1.5rem 1rem;
          text-align: center;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .upload-drop-box:hover {
          background: #f1f5f9;
          border-color: #64748b;
        }

        .upload-drop-box.drag-over {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
          transform: scale(0.99);
        }

        .upload-drop-box.orange-theme.drag-over {
          border-color: #ff5225;
          background: rgba(255, 82, 37, 0.05);
        }

        .upload-icon-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid #e2e8f0;
          color: #64748b;
        }

        .upload-icon-circle.orange {
          color: #ff5225;
        }

        .upload-main-icon {
          color: #64748b;
        }

        .upload-main-icon.orange {
          color: #ff5225;
        }

        .upload-text-content {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .upload-primary-text {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .upload-secondary-text {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        .upload-sub-hint {
          font-size: 0.65rem;
          color: #94a3b8;
          letter-spacing: 0.03em;
        }

        /* Preview Card */
        .upload-preview-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .preview-image-card {
          position: relative;
          height: 220px;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #0f172a;
        }

        .preview-image-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .preview-image-card:hover .preview-image-element {
          transform: scale(1.04);
        }

        .preview-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .preview-image-card:hover .preview-hover-overlay {
          opacity: 1;
        }

        .preview-hover-actions {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .preview-image-card:hover .preview-hover-actions {
          opacity: 1;
        }

        .hover-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          transition: transform 0.15s ease, background 0.15s ease;
        }

        .hover-action-btn.replace-btn {
          background: #ffffff;
          color: #0f172a;
        }

        .hover-action-btn.replace-btn:hover {
          background: #f1f5f9;
          transform: scale(1.08);
        }

        .hover-action-btn.delete-btn {
          background: #ef4444;
          color: #ffffff;
        }

        .hover-action-btn.delete-btn:hover {
          background: #dc2626;
          transform: scale(1.08);
        }

        .preview-meta-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.35rem 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.725rem;
          color: #475569;
        }

        .footer-filename-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          overflow: hidden;
        }

        .file-check-icon {
          color: #16a34a;
          flex-shrink: 0;
        }

        .file-check-icon.orange {
          color: #ff5225;
        }

        .footer-filename {
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .footer-size-pill {
          background: #e2e8f0;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          font-size: 0.65rem;
          color: #475569;
        }

        .footer-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.15rem;
          border-radius: 4px;
          transition: color 0.15s ease;
        }

        .footer-close-btn:hover {
          color: #ef4444;
          background: #fee2e2;
        }

        .upload-loading-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .sat-spin-icon {
          color: #3b82f6;
          animation: spin 0.8s linear infinite;
        }

        .sat-spin-icon.orange {
          color: #ff5225;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .upload-err-msg {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          color: #dc2626;
          padding: 0.2rem 0.25rem;
        }
      `}</style>
    </div>
  );
}

export default ImageUploader;
