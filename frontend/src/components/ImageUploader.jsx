import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Layers,
  Maximize2,
  Minimize2,
  Eye,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Sparkles,
  Radio
} from 'lucide-react';
import { uploadImageFile } from '../services/api.js';
import { formatDisplayDate, calculateTemporalDelta, generateBiTemporalDatePair } from '../utils/dateGenerator.js';
import { PairCompatibilityCard } from './PairCompatibilityCard.jsx';
import { FusionMetadataPanel } from './FusionMetadataPanel.jsx';

export function ImageUploader({
  selectedMode,
  imageA,
  setImageA,
  imageB,
  setImageB,
  biTemporalDates,
  setBiTemporalDates
}) {
  const isOpticalSarMode = selectedMode === 'OPTICAL_SAR_FUSION';
  const isDualMode = selectedMode === 'CHANGE_ANALYSIS' || isOpticalSarMode;

  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);
  const [uploadingA, setUploadingA] = useState(false);
  const [uploadingB, setUploadingB] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [errorA, setErrorA] = useState(null);
  const [errorB, setErrorB] = useState(null);
  const [fitModeA, setFitModeA] = useState('contain');
  const [fitModeB, setFitModeB] = useState('contain');
  const [modalImage, setModalImage] = useState(null);
  const [modalZoom, setModalZoom] = useState(1);

  const fileInputRefA = useRef(null);
  const fileInputRefB = useRef(null);

  useEffect(() => {
    if (!modalImage) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalImage]);

  const handleOpenModal = (imgData, isImageB = false) => {
    if (!imgData?.previewUrl) return;
    setModalZoom(1);
    const modalTitle = isOpticalSarMode
      ? (isImageB ? 'SAR Radar Scene (Sentinel-1)' : 'Optical Multispectral Scene (Sentinel-2)')
      : (isDualMode
        ? (isImageB ? 'Image B • T2 Comparison' : 'Image A • T1 Reference')
        : 'Satellite Scene');
    const modalTag = isOpticalSarMode
      ? (isImageB ? 'SAR RADAR (MICROWAVE)' : 'OPTICAL MULTISPECTRAL')
      : (isDualMode ? (isImageB ? 'T2 COMPARISON' : 'T1 BASELINE') : 'PRIMARY SCENE');

    setModalImage({
      url: imgData.previewUrl,
      title: modalTitle,
      tag: modalTag,
      filename: imgData.filename || (isImageB ? 'satellite-b.png' : 'satellite-a.png'),
      size: imgData.size || '',
      date: isImageB ? dateBValue : dateAValue
    });
  };

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

  const processUpload = async (file, isSlotB = false, metadataOverrides = {}) => {
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
          ...(uploadRes.metadata || {}),
          ...metadataOverrides
        }
      });
    } catch (err) {
      console.error('Image upload failed, falling back to local object preview:', err);
      const previewUrl = URL.createObjectURL(file);
      setImage({
        fileId: `local_${Date.now()}`,
        previewUrl,
        filename: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        mimeType: file.type || 'image/jpeg',
        metadata: {
          timestamp: defaultDate,
          crs: 'EPSG:4326',
          ...metadataOverrides
        }
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLoadDemoOpticalSar = async () => {
    setLoadingDemo(true);
    try {
      const resOpt = await fetch('/demo_sentinel2_optical.png');
      const blobOpt = await resOpt.blob();
      const fileOpt = new File([blobOpt], 'demo_sentinel2_optical.png', { type: 'image/png' });

      const resSar = await fetch('/demo_sentinel1_sar.png');
      const blobSar = await resSar.blob();
      const fileSar = new File([blobSar], 'demo_sentinel1_sar.png', { type: 'image/png' });

      await Promise.all([
        processUpload(fileOpt, false, {
          sensor: 'Sentinel-2 MSI Level-2A',
          platform: 'Sentinel-2B',
          bands: 'B4 (Red), B3 (Green), B2 (Blue), B8 (NIR)',
          resolution: '10m',
          crs: 'EPSG:32643 (UTM Zone 43N)',
          bounds: [77.10, 28.55, 77.25, 28.70],
          modality: 'OPTICAL'
        }),
        processUpload(fileSar, true, {
          sensor: 'Sentinel-1 C-Band SAR',
          platform: 'Sentinel-1A',
          polarization: 'VV + VH Cross-Pol GRD',
          resolution: '10m',
          crs: 'EPSG:32643 (UTM Zone 43N)',
          bounds: [77.10, 28.55, 77.25, 28.70],
          modality: 'SAR'
        })
      ]);
    } catch (err) {
      console.error('Failed to load demo Optical+SAR pair:', err);
      setErrorA('Failed to load demo satellite pair. Please verify network or public assets.');
    } finally {
      setLoadingDemo(false);
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
            {isOpticalSarMode
              ? 'Upload Optical + SAR Imagery Pair'
              : (isDualMode ? 'Upload Bi-Temporal Scene Pair' : 'Upload Satellite Scene')}
          </label>
        </div>
        <span className="uploader-hint font-mono">
          {isOpticalSarMode
            ? 'Co-registered Multispectral Optical (Sentinel-2) + Radar SAR (Sentinel-1)'
            : 'TIFF, GeoTIFF, PNG, JPG (≤50MB)'}
        </span>
      </div>

      {/* Optical + SAR Hero Banner with Pre-aligned Demo Pair Button */}
      {isOpticalSarMode && (
        <div className="optical-sar-hero-banner">
          <div className="fusion-banner-content">
            <div className="fusion-banner-badge font-mono">
              <Layers size={13} />
              <span>CO-REGISTERED MULTIMODAL DUAL STREAM</span>
            </div>
            <p className="fusion-banner-desc">
              Ingest complementary <strong>Optical (Sentinel-2/Landsat)</strong> multispectral reflectance and <strong>SAR (Sentinel-1/RISAT)</strong> microwave backscatter for cloud-penetrating structural and hydrological intelligence.
            </p>
          </div>
          <button
            type="button"
            className="load-demo-pair-btn font-mono"
            onClick={handleLoadDemoOpticalSar}
            disabled={loadingDemo}
            title="Automatically load and co-register high-resolution Sentinel-1 and Sentinel-2 test scenes"
          >
            <Sparkles size={14} className={loadingDemo ? 'animate-spin' : ''} />
            <span>{loadingDemo ? 'Ingesting Pre-aligned Pair...' : 'Load Pre-aligned Demo Pair (Sentinel-1 SAR + Sentinel-2 Optical)'}</span>
          </button>
        </div>
      )}

      {/* Bi-Temporal Acquisition Timeline Banner (Only in Change Analysis Mode) */}
      {!isOpticalSarMode && isDualMode && (
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
        {/* Canvas A (Primary / Reference / Optical) */}
        <div className="canvas-column">
          {isDualMode && (
            <div className="canvas-col-header font-mono">
              <span className={`canvas-tag ${isOpticalSarMode ? 'optical-tag' : 't1'}`}>
                {isOpticalSarMode ? 'SLOT 1 • OPTICAL / MULTISPECTRAL' : 'IMAGE A • T1 BASELINE'}
              </span>
              <span className="canvas-date font-mono">
                {isOpticalSarMode ? (imageA?.metadata?.sensor || 'Sentinel-2 MSI') : formatDisplayDate(dateAValue)}
              </span>
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
                    <p className="upload-primary-text">
                      {isOpticalSarMode ? 'Click to select Optical scene' : 'Click to select'}
                    </p>
                    <p className="upload-secondary-text">
                      {isOpticalSarMode ? 'or drop Sentinel-2 / Landsat multispectral raster' : 'or drag and drop satellite scene here'}
                    </p>
                  </div>
                  <span className="upload-sub-hint font-mono">TIFF, GeoTIFF, PNG, JPG (≤50MB)</span>
                </>
              )}
            </div>
          ) : (
            <div className="upload-preview-wrapper">
              <div
                className="preview-image-card group cursor-zoom-in"
                onClick={() => handleOpenModal(imageA, false)}
                title="Click to open full-resolution satellite scene"
              >
                <img
                  src={imageA.previewUrl}
                  alt="Satellite Preview A"
                  className={`preview-image-element fit-${fitModeA}`}
                />
                <div className="preview-top-toolbar">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFitModeA(prev => prev === 'contain' ? 'cover' : 'contain');
                    }}
                    className="fit-toggle-badge font-mono"
                    title={fitModeA === 'contain' ? 'Switch to Fill Frame (Cover)' : 'Switch to Full Scene (Contain)'}
                  >
                    {fitModeA === 'contain' ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
                    <span>{fitModeA === 'contain' ? 'FULL SCENE' : 'FILL FRAME'}</span>
                  </button>
                </div>
                <div className="preview-hover-overlay" />
                <div className="preview-hover-actions">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(imageA, false);
                    }}
                    className="hover-action-btn view-btn"
                    title="Open full size in inspector"
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRefA.current?.click();
                    }}
                    className="hover-action-btn replace-btn"
                    title="Upload replacement image"
                  >
                    <Upload size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(false);
                    }}
                    className="hover-action-btn delete-btn"
                    title="Remove image"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <span className="preview-click-hint font-mono">
                  <Eye size={12} /> CLICK TO OPEN FULL SCENE
                </span>
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

        {/* Canvas B (Comparison Later / SAR Radar) */}
        {isDualMode && (
          <div className="canvas-column">
            <div className="canvas-col-header font-mono">
              <span className={`canvas-tag ${isOpticalSarMode ? 'sar-tag' : 't2'}`}>
                {isOpticalSarMode ? 'SLOT 2 • SAR RADAR (BACKSCATTER)' : 'IMAGE B • T2 COMPARISON'}
              </span>
              <span className="canvas-date font-mono">
                {isOpticalSarMode ? (imageB?.metadata?.sensor || 'Sentinel-1 C-Band SAR') : formatDisplayDate(dateBValue)}
              </span>
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
                className={`upload-drop-box ${isOpticalSarMode ? 'purple-theme' : 'orange-theme'} ${isDraggingB ? 'drag-over' : ''}`}
              >
                {uploadingB ? (
                  <div className="upload-loading-view">
                    <Loader2 className={`sat-spin-icon ${isOpticalSarMode ? 'purple' : 'orange'}`} size={28} />
                    <span className="loading-text font-mono">
                      {isOpticalSarMode ? 'Ingesting SAR radar raster...' : 'Ingesting comparison raster...'}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className={`upload-icon-circle ${isOpticalSarMode ? 'purple' : 'orange'}`}>
                      <ImagePlus className={`upload-main-icon ${isOpticalSarMode ? 'purple' : 'orange'}`} size={24} />
                    </div>
                    <div className="upload-text-content">
                      <p className="upload-primary-text">
                        {isOpticalSarMode ? 'Click to select SAR scene' : 'Click to select'}
                      </p>
                      <p className="upload-secondary-text">
                        {isOpticalSarMode ? 'or drop Sentinel-1 GRD / RISAT radar raster' : 'or drag and drop comparison scene here'}
                      </p>
                    </div>
                    <span className="upload-sub-hint font-mono">TIFF, GeoTIFF, PNG, JPG (≤50MB)</span>
                  </>
                )}
              </div>
            ) : (
              <div className="upload-preview-wrapper">
                <div
                  className="preview-image-card group cursor-zoom-in"
                  onClick={() => handleOpenModal(imageB, true)}
                  title="Click to open full-resolution satellite scene"
                >
                  <img
                    src={imageB.previewUrl}
                    alt="Satellite Preview B"
                    className={`preview-image-element fit-${fitModeB}`}
                  />
                  <div className="preview-top-toolbar">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFitModeB(prev => prev === 'contain' ? 'cover' : 'contain');
                      }}
                      className="fit-toggle-badge font-mono"
                      title={fitModeB === 'contain' ? 'Switch to Fill Frame (Cover)' : 'Switch to Full Scene (Contain)'}
                    >
                      {fitModeB === 'contain' ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
                      <span>{fitModeB === 'contain' ? 'FULL SCENE' : 'FILL FRAME'}</span>
                    </button>
                  </div>
                  <div className="preview-hover-overlay" />
                  <div className="preview-hover-actions">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(imageB, true);
                      }}
                      className="hover-action-btn view-btn"
                      title="Open full size in inspector"
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRefB.current?.click();
                      }}
                      className="hover-action-btn replace-btn"
                      title="Upload replacement image"
                    >
                      <Upload size={17} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(true);
                      }}
                      className="hover-action-btn delete-btn"
                      title="Remove image"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <span className="preview-click-hint font-mono">
                    <Eye size={12} /> CLICK TO OPEN FULL SCENE
                  </span>
                </div>

                {imageB.filename && (
                  <div className="preview-meta-footer font-mono">
                    <div className="footer-filename-group">
                      <FileCheck size={14} className={`file-check-icon ${isOpticalSarMode ? 'purple' : 'orange'}`} />
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

      {/* Real-time Co-Registration Checklist and Fusion Readiness Diagnostics (Only for Optical + SAR Mode) */}
      {isOpticalSarMode && (imageA || imageB) && (
        <PairCompatibilityCard imageA={imageA} imageB={imageB} />
      )}

      {/* Collapsible Optical vs SAR Metadata Dossier */}
      {isOpticalSarMode && (imageA || imageB) && (
        <FusionMetadataPanel imageA={imageA} imageB={imageB} />
      )}

      {/* FULL SCREEN / HIGH RESOLUTION LIGHTBOX MODAL (PORTAL TO DOCUMENT.BODY) */}
      {modalImage && typeof document !== 'undefined' && createPortal(
        <div
          className="sat-image-modal-backdrop"
          onClick={() => setModalImage(null)}
        >
          <div
            className="sat-image-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header-bar">
              <div className="modal-header-left">
                <span className="modal-scene-pill font-mono">{modalImage.tag}</span>
                <span className="modal-scene-name font-mono" title={modalImage.filename}>
                  {modalImage.filename}
                </span>
                {modalImage.size && (
                  <span className="modal-scene-size font-mono">{modalImage.size}</span>
                )}
                {modalImage.date && (
                  <span className="modal-scene-date font-mono">
                    <Clock size={11} />
                    {formatDisplayDate(modalImage.date)}
                  </span>
                )}
              </div>

              {/* Modal Actions */}
              <div className="modal-header-actions">
                {/* Zoom Controls */}
                <div className="modal-zoom-group">
                  <button
                    type="button"
                    className="modal-icon-btn"
                    onClick={() => setModalZoom(z => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                    title="Zoom Out"
                    disabled={modalZoom <= 0.5}
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span className="modal-zoom-val font-mono">{Math.round(modalZoom * 100)}%</span>
                  <button
                    type="button"
                    className="modal-icon-btn"
                    onClick={() => setModalZoom(z => Math.min(3, Number((z + 0.25).toFixed(2))))}
                    title="Zoom In"
                    disabled={modalZoom >= 3}
                  >
                    <ZoomIn size={14} />
                  </button>
                  {modalZoom !== 1 && (
                    <button
                      type="button"
                      className="modal-icon-btn"
                      onClick={() => setModalZoom(1)}
                      title="Reset Zoom"
                    >
                      <RotateCcw size={13} />
                    </button>
                  )}
                </div>

                <a
                  href={modalImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-icon-btn link-btn"
                  title="Open raw image in new tab"
                >
                  <ExternalLink size={14} />
                  <span className="font-mono text-[11px]">New Tab</span>
                </a>

                <a
                  href={modalImage.url}
                  download={modalImage.filename || 'satellite-scene.png'}
                  className="modal-icon-btn link-btn"
                  title="Download satellite scene"
                >
                  <Download size={14} />
                  <span className="font-mono text-[11px]">Download</span>
                </a>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setModalImage(null)}
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Canvas Body */}
            <div className="modal-canvas-viewport">
              <div
                className="modal-canvas-stage"
                style={{
                  transform: `scale(${modalZoom})`,
                  transformOrigin: 'center center'
                }}
              >
                <img
                  src={modalImage.url}
                  alt={modalImage.filename}
                  className="modal-highres-image"
                />
              </div>
            </div>

            {/* Modal Footer Bar */}
            <div className="modal-footer-bar font-mono">
              <span>SatVistaar High-Resolution Geospatial Inspection</span>
              <span className="esc-hint">Press <kbd>ESC</kbd> or click outside to close</span>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .sat-uploader-root {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }

        /* Optical + SAR Hero Banner */
        .optical-sar-hero-banner {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 27, 75, 0.92));
          border: 1px solid rgba(147, 51, 234, 0.35);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          box-shadow: 0 4px 20px -2px rgba(99, 102, 241, 0.15);
        }

        .fusion-banner-content {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
          min-width: 260px;
        }

        .fusion-banner-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #c084fc;
          background: rgba(168, 85, 247, 0.12);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
          width: fit-content;
        }

        .fusion-banner-desc {
          font-size: 0.8rem;
          color: #cbd5e1;
          margin: 0;
          line-height: 1.45;
        }

        .fusion-banner-desc strong {
          color: #ffffff;
        }

        .load-demo-pair-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.15rem;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #ffffff;
          border: 1px solid rgba(192, 132, 252, 0.4);
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
          white-space: nowrap;
        }

        .load-demo-pair-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
          filter: brightness(1.1);
        }

        .load-demo-pair-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .optical-tag {
          background: #0284c7 !important;
          color: #ffffff !important;
        }

        .sar-tag {
          background: #7c3aed !important;
          color: #ffffff !important;
        }

        .purple-theme {
          border-color: rgba(168, 85, 247, 0.35) !important;
          background: rgba(168, 85, 247, 0.02) !important;
        }

        .purple-theme:hover {
          border-color: #a855f7 !important;
          background: rgba(168, 85, 247, 0.06) !important;
        }

        .sat-spin-icon.purple,
        .upload-main-icon.purple,
        .file-check-icon.purple {
          color: #a855f7 !important;
        }

        .upload-icon-circle.purple {
          background: rgba(168, 85, 247, 0.12) !important;
        }

        .cursor-zoom-in {
          cursor: zoom-in !important;
        }

        /* Lightbox Modal */
        .sat-image-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999999;
          background: rgba(2, 6, 23, 0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .sat-image-modal-dialog {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 95vw;
          max-width: 1280px;
          height: 90vh;
          max-height: 860px;
          background: #090d16;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 0, 102, 0.25);
          animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalSlideUp {
          from { transform: scale(0.96) translateY(12px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        .modal-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.15rem;
          background: #0f172a;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          gap: 1rem;
          flex-wrap: wrap;
          z-index: 10;
        }

        .modal-header-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          min-width: 0;
          flex: 1;
        }

        .modal-scene-pill {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.55rem;
          border-radius: 5px;
          background: rgba(59, 130, 246, 0.18);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.4);
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .modal-scene-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 320px;
        }

        .modal-scene-size {
          font-size: 0.65rem;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
        }

        .modal-scene-date {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.65rem;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .modal-header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-zoom-group {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 0.15rem;
          gap: 0.2rem;
        }

        .modal-zoom-val {
          font-size: 0.68rem;
          color: #cbd5e1;
          min-width: 42px;
          text-align: center;
        }

        .modal-icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          height: 28px;
          padding: 0 0.55rem;
          border-radius: 5px;
          background: transparent;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }

        .modal-icon-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        .modal-icon-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .modal-icon-btn.link-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-close-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .modal-close-btn:hover {
          background: #ef4444;
          color: #ffffff;
          border-color: #ef4444;
        }

        .modal-canvas-viewport {
          position: relative;
          flex: 1;
          width: 100%;
          min-height: 0;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background-color: #050811;
          background-image:
            radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            radial-gradient(ellipse at 50% 50%, rgba(30, 41, 59, 0.4), rgba(2, 6, 23, 0.95));
          background-size: 24px 24px, 100% 100%;
        }

        .modal-canvas-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          max-height: 100%;
          transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
        }

        .modal-highres-image {
          max-width: 100%;
          max-height: 72vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
          display: block;
        }

        .modal-footer-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1.15rem;
          background: #090d16;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.65rem;
          color: #64748b;
        }

        .modal-footer-bar .esc-hint kbd {
          background: rgba(255, 255, 255, 0.12);
          color: #e2e8f0;
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 0.6rem;
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
          gap: 0.45rem;
          width: 100%;
        }

        .preview-image-card {
          position: relative;
          width: 100%;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #090d16;
          background-image: 
            radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(2, 6, 23, 0.98));
          background-size: 20px 20px, 100% 100%;
          box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.6);
          cursor: zoom-in;
        }

        .single-canvas .preview-image-card {
          min-height: 360px;
          max-height: 540px;
          height: 420px;
        }

        .dual-canvas .preview-image-card {
          min-height: 260px;
          max-height: 380px;
          height: 320px;
        }

        .preview-image-element {
          width: 100%;
          height: 100%;
          max-height: 100%;
          display: block;
          margin: auto;
          transition: transform 0.25s ease;
        }

        .preview-image-element.fit-contain {
          object-fit: contain;
        }

        .preview-image-element.fit-cover {
          object-fit: cover;
        }

        .preview-image-card:hover .preview-image-element.fit-cover {
          transform: scale(1.02);
        }

        .preview-top-toolbar {
          position: absolute;
          top: 0.65rem;
          right: 0.65rem;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .fit-toggle-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.28rem 0.65rem;
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #f1f5f9;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .fit-toggle-badge:hover {
          background: rgba(15, 23, 42, 1);
          border-color: rgba(255, 255, 255, 0.4);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .preview-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
          z-index: 2;
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
          gap: 0.6rem;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
          z-index: 5;
        }

        .preview-image-card:hover .preview-hover-actions {
          opacity: 1;
        }

        .hover-action-btn {
          pointer-events: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
          transition: transform 0.15s ease, background 0.15s ease;
        }

        .hover-action-btn.view-btn {
          background: #3b82f6;
          color: #ffffff;
        }

        .hover-action-btn.view-btn:hover {
          background: #2563eb;
          transform: scale(1.08);
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

        .preview-click-hint {
          position: absolute;
          bottom: 0.75rem;
          left: 50%;
          transform: translateX(-50%) translateY(4px);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          pointer-events: none;
          opacity: 0;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
          z-index: 6;
        }

        .preview-image-card:hover .preview-click-hint {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
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
