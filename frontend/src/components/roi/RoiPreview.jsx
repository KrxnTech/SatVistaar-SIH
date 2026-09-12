import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Layers, GitCompare, Radio, Maximize2, X, Download, Sparkles, Sliders } from 'lucide-react';

export function RoiPreview({
  roiGeometry,
  imageA,
  imageB,
  task = 'VQA'
}) {
  const [cropUrlA, setCropUrlA] = useState(null);
  const [cropUrlB, setCropUrlB] = useState(null);
  const [cropMetaA, setCropMetaA] = useState(null);
  const [cropMetaB, setCropMetaB] = useState(null);
  const [modalImage, setModalImage] = useState(null); // { url, title, meta }
  const [sharpenEnabled, setSharpenEnabled] = useState(true);

  const isDual = task === 'CHANGE_ANALYSIS' || task === 'OPTICAL_SAR_FUSION';
  const urlA = imageA?.previewUrl || imageA?.url;
  const urlB = imageB?.previewUrl || imageB?.url;

  // 3x3 Laplacian sharpening filter to make satellite edges & textures crisp
  const applySharpenFilter = (ctx, w, h, amount = 0.28) => {
    try {
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      const copy = new Uint8ClampedArray(d);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          for (let c = 0; c < 3; c++) {
            const val = copy[idx + c];
            const up = copy[((y - 1) * w + x) * 4 + c];
            const down = copy[((y + 1) * w + x) * 4 + c];
            const left = copy[(y * w + (x - 1)) * 4 + c];
            const right = copy[(y * w + (x + 1)) * 4 + c];
            const laplacian = 5 * val - up - down - left - right;
            d[idx + c] = Math.min(255, Math.max(0, val + amount * (laplacian - val)));
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      // Ignore if canvas is tainted by cross-origin
    }
  };

  // Extract sub-crop from image using HTML5 Canvas with multi-scale super-sampling
  useEffect(() => {
    if (!roiGeometry?.coordinates || roiGeometry.coordinates.length < 2) {
      setCropUrlA(null);
      setCropUrlB(null);
      setCropMetaA(null);
      setCropMetaB(null);
      return;
    }

    const xs = roiGeometry.coordinates.map(c => c.x);
    const ys = roiGeometry.coordinates.map(c => c.y);
    const minX = Math.max(0, Math.min(...xs));
    const maxX = Math.min(1, Math.max(...xs));
    const minY = Math.max(0, Math.min(...ys));
    const maxY = Math.min(1, Math.max(...ys));
    const normW = Math.max(0.01, maxX - minX);
    const normH = Math.max(0.01, maxY - minY);

    const generateCrop = (imgUrl, setCropState, setMetaState) => {
      if (!imgUrl) return;
      const img = new Image();
      // Only set crossOrigin for external http(s) URLs, avoid for blob: and data:
      if (typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        try {
          const natW = img.naturalWidth || img.width || 1024;
          const natH = img.naturalHeight || img.height || 1024;

          const sx = Math.max(0, Math.round(minX * natW));
          const sy = Math.max(0, Math.round(minY * natH));
          const sWidth = Math.max(1, Math.min(natW - sx, Math.round(normW * natW)));
          const sHeight = Math.max(1, Math.min(natH - sy, Math.round(normH * natH)));

          // High-PPI target resolution: ensure small crops aren't pixelated
          // Target at least 640px on longest dimension for crystal clarity
          const minTargetDim = 640;
          const maxTargetDim = 1400;
          const cropMax = Math.max(sWidth, sHeight);
          let scaleFactor = 1;
          if (cropMax < minTargetDim) {
            scaleFactor = minTargetDim / cropMax;
          } else if (cropMax > maxTargetDim) {
            scaleFactor = maxTargetDim / cropMax;
          }

          const targetW = Math.max(32, Math.round(sWidth * scaleFactor));
          const targetH = Math.max(32, Math.round(sHeight * scaleFactor));

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);

            if (sharpenEnabled) {
              applySharpenFilter(ctx, targetW, targetH, 0.25);
            }

            // Lossless crisp PNG export
            const dataUrl = canvas.toDataURL('image/png');
            setCropState(dataUrl);
            setMetaState({
              origW: sWidth,
              origH: sHeight,
              targetW,
              targetH,
              aspectRatio: (sWidth / sHeight).toFixed(2),
              scaleFactor: scaleFactor.toFixed(2)
            });
          }
        } catch (e) {
          console.warn('ROI preview canvas extraction fallback:', e);
          setCropState(imgUrl);
          setMetaState(null);
        }
      };
      img.onerror = () => {
        setCropState(imgUrl);
        setMetaState(null);
      };
      img.src = imgUrl;
    };

    generateCrop(urlA, setCropUrlA, setCropMetaA);
    if (isDual && urlB) {
      generateCrop(urlB, setCropUrlB, setCropMetaB);
    }
  }, [roiGeometry, urlA, urlB, isDual, sharpenEnabled]);

  if (!roiGeometry?.coordinates || roiGeometry.coordinates.length < 2) {
    return null;
  }

  const handleDownload = (e, dataUrl, filename) => {
    e.stopPropagation();
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename || 'satvistaar_roi_crop.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="sat-roi-preview-container font-mono">
      {/* Header bar */}
      <div className="preview-header">
        <div className="preview-title-group">
          <Eye size={13} className="text-orange-500" />
          <span className="preview-title">SELECTED REGION CROP</span>
          <span className="hd-badge">HD 1:1</span>
        </div>
        <div className="preview-header-actions">
          <button
            type="button"
            className={`preview-filter-btn ${sharpenEnabled ? 'active' : ''}`}
            onClick={() => setSharpenEnabled(!sharpenEnabled)}
            title="Toggle Edge Sharpening Filter"
          >
            <Sparkles size={11} />
            <span>{sharpenEnabled ? 'Crisp' : 'Raw'}</span>
          </button>
          {roiGeometry?.areaKm2 && (
            <span className="preview-area-tag">
              Area: {roiGeometry.areaKm2} km²
            </span>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className={`preview-cards-grid ${isDual ? 'dual' : 'single'}`}>
        {/* Single or Image A Slot */}
        <div className="preview-subcard">
          <div className="subcard-label">
            <div className="label-left">
              {task === 'OPTICAL_SAR_FUSION' ? (
                <>
                  <Eye size={11} className="text-sky-500" />
                  <span>OPTICAL ROI</span>
                </>
              ) : task === 'CHANGE_ANALYSIS' ? (
                <>
                  <GitCompare size={11} className="text-amber-500" />
                  <span>T1 BASELINE ROI</span>
                </>
              ) : (
                <>
                  <Layers size={11} className="text-orange-500" />
                  <span>PRIMARY ROI</span>
                </>
              )}
            </div>
            <div className="label-right">
              {cropMetaA && (
                <span className="subcard-dim-tag">{cropMetaA.origW} × {cropMetaA.origH} px</span>
              )}
              {cropUrlA && (
                <button
                  type="button"
                  className="subcard-action-btn"
                  onClick={() => setModalImage({
                    url: cropUrlA,
                    title: task === 'OPTICAL_SAR_FUSION' ? 'Optical Multispectral ROI Crop' : 'Primary Satellite ROI Crop',
                    meta: cropMetaA
                  })}
                  title="Expand to Full Resolution"
                >
                  <Maximize2 size={11} />
                </button>
              )}
            </div>
          </div>

          <div
            className="subcard-img-frame"
            onClick={() => cropUrlA && setModalImage({
              url: cropUrlA,
              title: 'Primary Satellite ROI Crop',
              meta: cropMetaA
            })}
          >
            {/* GIS Corner targeting brackets */}
            <div className="gis-bracket top-left" />
            <div className="gis-bracket top-right" />
            <div className="gis-bracket bottom-left" />
            <div className="gis-bracket bottom-right" />

            {cropUrlA ? (
              <div className="img-contain-wrapper">
                <img
                  src={cropUrlA}
                  alt="Selected ROI Crop"
                  className="subcard-img"
                  draggable={false}
                />
              </div>
            ) : (
              <div className="subcard-loading">Extracting Sub-Window...</div>
            )}

            {cropMetaA && (
              <div className="subcard-overlay-tag">
                <span>Aspect {cropMetaA.aspectRatio}:1</span>
              </div>
            )}
          </div>
        </div>

        {/* Dual Mode: Image B Slot */}
        {isDual && urlB && (
          <div className="preview-subcard">
            <div className="subcard-label">
              <div className="label-left">
                {task === 'OPTICAL_SAR_FUSION' ? (
                  <>
                    <Radio size={11} className="text-purple-500" />
                    <span>SAR BACKSCATTER ROI</span>
                  </>
                ) : (
                  <>
                    <GitCompare size={11} className="text-emerald-500" />
                    <span>T2 POST-EVENT ROI</span>
                  </>
                )}
              </div>
              <div className="label-right">
                {cropMetaB && (
                  <span className="subcard-dim-tag">{cropMetaB.origW} × {cropMetaB.origH} px</span>
                )}
                {cropUrlB && (
                  <button
                    type="button"
                    className="subcard-action-btn"
                    onClick={() => setModalImage({
                      url: cropUrlB,
                      title: task === 'OPTICAL_SAR_FUSION' ? 'SAR Radar Backscatter ROI Crop' : 'T2 Post-Event ROI Crop',
                      meta: cropMetaB
                    })}
                    title="Expand to Full Resolution"
                  >
                    <Maximize2 size={11} />
                  </button>
                )}
              </div>
            </div>

            <div
              className="subcard-img-frame"
              onClick={() => cropUrlB && setModalImage({
                url: cropUrlB,
                title: task === 'OPTICAL_SAR_FUSION' ? 'SAR Radar Backscatter ROI Crop' : 'T2 Post-Event ROI Crop',
                meta: cropMetaB
              })}
            >
              <div className="gis-bracket top-left" />
              <div className="gis-bracket top-right" />
              <div className="gis-bracket bottom-left" />
              <div className="gis-bracket bottom-right" />

              {cropUrlB ? (
                <div className="img-contain-wrapper">
                  <img
                    src={cropUrlB}
                    alt="Paired ROI Crop"
                    className="subcard-img"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="subcard-loading">Extracting Sub-Window...</div>
              )}

              {cropMetaB && (
                <div className="subcard-overlay-tag">
                  <span>Aspect {cropMetaB.aspectRatio}:1</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full-Resolution Modal Inspector */}
      {modalImage && typeof document !== 'undefined' && createPortal(
        <div className="roi-modal-backdrop" onClick={() => setModalImage(null)}>
          <div className="roi-modal-content" onClick={e => e.stopPropagation()}>
            <div className="roi-modal-header font-mono">
              <div className="roi-modal-title">
                <Eye size={14} className="text-orange-500" />
                <span>{modalImage.title}</span>
                {modalImage.meta && (
                  <span className="modal-dim-badge">
                    {modalImage.meta.origW} × {modalImage.meta.origH} px
                  </span>
                )}
              </div>
              <div className="roi-modal-actions">
                <button
                  type="button"
                  className="modal-action-btn"
                  onClick={(e) => handleDownload(e, modalImage.url, 'satvistaar_roi_highres.png')}
                  title="Download Crisp PNG"
                >
                  <Download size={13} />
                  <span>Export PNG</span>
                </button>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setModalImage(null)}
                  title="Close (Esc)"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <div className="roi-modal-stage">
              <img
                src={modalImage.url}
                alt="Full resolution ROI crop"
                className="roi-modal-img"
              />
            </div>

            <div className="roi-modal-footer font-mono">
              <span>CRS: Pixel Normalized Grid</span>
              <span>Interpolation: Crisp High-Resolution Canvas</span>
              <span>Area: {roiGeometry?.areaKm2 || '--'} km²</span>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .sat-roi-preview-container {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          box-shadow: 0 2px 8px -2px rgba(0, 0, 70, 0.04);
        }
        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 0.45rem;
        }
        .preview-title-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .preview-title {
          font-size: 0.72rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: 0.04em;
        }
        .hd-badge {
          font-size: 0.55rem;
          font-weight: 800;
          color: #0284c7;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          padding: 0.05rem 0.35rem;
          border-radius: 3px;
        }
        .preview-header-actions {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .preview-filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.62rem;
          font-weight: 700;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .preview-filter-btn:hover {
          background: #f1f5f9;
          color: #000066;
        }
        .preview-filter-btn.active {
          background: #eff6ff;
          border-color: #93c5fd;
          color: #1d4ed8;
        }
        .preview-area-tag {
          font-size: 0.625rem;
          font-weight: 700;
          color: #ff5225;
          background: #fff5f2;
          border: 1px solid #ffd8cc;
          padding: 0.12rem 0.45rem;
          border-radius: 4px;
        }
        .preview-cards-grid {
          display: grid;
          gap: 0.6rem;
        }
        .preview-cards-grid.single {
          grid-template-columns: 1fr;
        }
        .preview-cards-grid.dual {
          grid-template-columns: repeat(2, 1fr);
        }
        @media (max-width: 768px) {
          .preview-cards-grid.dual {
            grid-template-columns: 1fr;
          }
        }
        .preview-subcard {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
        }
        .subcard-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.65rem;
          font-weight: 800;
          color: #334155;
          padding: 0.4rem 0.6rem;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;
        }
        .label-left {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .label-right {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .subcard-dim-tag {
          font-size: 0.58rem;
          color: #475569;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          padding: 0.08rem 0.35rem;
          border-radius: 3px;
        }
        .subcard-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
          border-radius: 3px;
          width: 20px;
          height: 20px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .subcard-action-btn:hover {
          background: #000066;
          color: #ffffff;
          border-color: #000066;
        }

        /* ── FIXED IMAGE CONTAINER CSS (NEVER BLURRY, NEVER STRETCHED) ── */
        .subcard-img-frame {
          position: relative;
          height: 250px;
          width: 100%;
          background: #080d1a;
          background-image: 
            radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 16px 16px, 32px 32px, 32px 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          box-sizing: border-box;
          cursor: zoom-in;
          overflow: hidden;
        }

        .img-contain-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          position: relative;
        }

        .subcard-img {
          max-width: 100%;
          max-height: 100%;
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
          display: block;
          border-radius: 4px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.14);
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .subcard-img-frame:hover .subcard-img {
          transform: scale(1.02);
        }

        /* GIS Corner targeting reticles */
        .gis-bracket {
          position: absolute;
          width: 8px;
          height: 8px;
          pointer-events: none;
          z-index: 10;
        }
        .gis-bracket.top-left {
          top: 6px;
          left: 6px;
          border-top: 2px solid rgba(255, 82, 37, 0.7);
          border-left: 2px solid rgba(255, 82, 37, 0.7);
        }
        .gis-bracket.top-right {
          top: 6px;
          right: 6px;
          border-top: 2px solid rgba(255, 82, 37, 0.7);
          border-right: 2px solid rgba(255, 82, 37, 0.7);
        }
        .gis-bracket.bottom-left {
          bottom: 6px;
          left: 6px;
          border-bottom: 2px solid rgba(255, 82, 37, 0.7);
          border-left: 2px solid rgba(255, 82, 37, 0.7);
        }
        .gis-bracket.bottom-right {
          bottom: 6px;
          right: 6px;
          border-bottom: 2px solid rgba(255, 82, 37, 0.7);
          border-right: 2px solid rgba(255, 82, 37, 0.7);
        }

        .subcard-overlay-tag {
          position: absolute;
          bottom: 6px;
          right: 8px;
          background: rgba(0, 0, 40, 0.85);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #94a3b8;
          font-size: 0.58rem;
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
          pointer-events: none;
        }

        .subcard-loading {
          font-size: 0.7rem;
          color: #94a3b8;
          font-weight: 600;
        }

        /* Full Resolution Inspection Modal */
        .roi-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 20, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1.5rem;
          animation: fadeIn 0.15s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .roi-modal-content {
          background: #090e1c;
          border: 1px solid #1e293b;
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
          overflow: hidden;
        }
        .roi-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
        }
        .roi-modal-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 800;
        }
        .modal-dim-badge {
          font-size: 0.65rem;
          background: #1e293b;
          color: #38bdf8;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          border: 1px solid #334155;
        }
        .roi-modal-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .modal-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #ff5225;
          color: #ffffff;
          border: none;
          padding: 0.3rem 0.65rem;
          border-radius: 5px;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .modal-action-btn:hover {
          background: #e0441b;
        }
        .modal-close-btn {
          background: #1e293b;
          color: #94a3b8;
          border: none;
          width: 26px;
          height: 26px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .modal-close-btn:hover {
          background: #334155;
          color: #ffffff;
        }
        .roi-modal-stage {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: #050811;
          overflow: auto;
          min-height: 340px;
        }
        .roi-modal-img {
          max-width: 100%;
          max-height: 65vh;
          object-fit: contain;
          border-radius: 6px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.7);
          image-rendering: -webkit-optimize-contrast;
        }
        .roi-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 1rem;
          background: #0f172a;
          border-top: 1px solid #1e293b;
          font-size: 0.65rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

export default RoiPreview;
