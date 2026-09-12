import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  Sliders,
  Split,
  Eye,
  Crosshair,
  Grid,
  Download,
  ShieldCheck,
  Compass,
  Radio,
  Sparkles,
  HelpCircle,
  Move,
  Lock,
  Unlock,
  Square
} from 'lucide-react';
import { RoiDrawingCanvas } from './roi/RoiDrawingCanvas.jsx';

export function FusionImageViewer({
  opticalUrl,
  sarUrl,
  opticalImage,
  sarImage,
  opticalMeta = {},
  sarMeta = {},
  grounding = null,
  fusionRegions = null,
  modalityAgreement = [],
  title = 'Optical + SAR Interactive Fusion Viewer',
  roiGeometry = null,
  activeRoiTool = null,
  onSelectRoiTool = null,
  onChangeRoi = null
}) {
  // Active Viewer Sub-mode: 'slider' | 'split' | 'overlay' | 'fusion' | 'optical' | 'sar'
  const [activeView, setActiveView] = useState('slider');

  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Pan Lock state (true = image fixed/stationary for drawing, false = image moveable/pan)
  const [isPanLocked, setIsPanLocked] = useState(false);

  // Automatically lock/fix the image when an ROI tool is chosen
  useEffect(() => {
    if (activeRoiTool) {
      setIsPanLocked(true);
    }
  }, [activeRoiTool]);

  // Draggable slider percentage (0 to 100)
  const [sliderPos, setSliderPos] = useState(50);
  const [isSliderActive, setIsSliderActive] = useState(false);

  // Layer Opacity controls (0 to 100)
  const [opticalOpacity, setOpticalOpacity] = useState(100);
  const [sarOpacity, setSarOpacity] = useState(85);

  // Layer Visibility Toggles
  const [showBoxes, setShowBoxes] = useState(true);
  const [showFusionMap, setShowFusionMap] = useState(true);
  const [showAgreementBadges, setShowAgreementBadges] = useState(true);
  const [showCrosshairs, setShowCrosshairs] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  // Hovered box / region for highlighting
  const [hoveredBoxIdx, setHoveredBoxIdx] = useState(null);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0, lat: null, lon: null });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const viewerFrameRef = useRef(null);

  // Normalized regions
  const regions = fusionRegions || grounding?.regions || [];

  // Reset Pan & Zoom
  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.35, 5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.35, 0.7));

  // Wheel zoom handler
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setScale(s => Math.min(5, Math.max(0.7, s * zoomFactor)));
  };

  // Drag Panning Handlers
  const handleMouseDown = (e) => {
    // If image is fixed/locked, or ROI tool is active, or clicking slider divider or ROI overlay: DO NOT PAN
    if (isPanLocked || activeRoiTool) return;
    if (e.target.closest('.fusion-slider-divider')) return;
    if (e.target.closest('.sat-roi-canvas-overlay')) return;
    if (e.button !== 0) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging && !isPanLocked && !activeRoiTool) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }

    // Update coordinate readout
    if (viewerFrameRef.current) {
      const rect = viewerFrameRef.current.getBoundingClientRect();
      const pxX = Math.round(e.clientX - rect.left);
      const pxY = Math.round(e.clientY - rect.top);
      const relX = Math.max(0, Math.min(1, pxX / rect.width));
      const relY = Math.max(0, Math.min(1, pxY / rect.height));

      // Calculate approximate georeferenced coordinates if bounds exist
      let lat = null;
      let lon = null;
      const bounds = opticalMeta.bounds || sarMeta.bounds;
      if (bounds) {
        lon = bounds.left + relX * (bounds.right - bounds.left);
        lat = bounds.top - relY * (bounds.top - bounds.bottom);
      }

      setMouseCoords({
        x: pxX,
        y: pxY,
        lat: lat ? lat.toFixed(5) : null,
        lon: lon ? lon.toFixed(5) : null
      });
    }

    // Handle slider dragging
    if (isSliderActive && viewerFrameRef.current) {
      const rect = viewerFrameRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
      setSliderPos(pct);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsSliderActive(false);
  };

  // Touch Support
  const handleTouchMove = (e) => {
    if (isSliderActive && viewerFrameRef.current && e.touches[0]) {
      const rect = viewerFrameRef.current.getBoundingClientRect();
      const offsetX = e.touches[0].clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
      setSliderPos(pct);
    }
  };

  // Fullscreen toggling
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Category Color Mapper
  const getCategoryColor = (label = '', type = '') => {
    const l = (label || '').toLowerCase();
    const t = (type || '').toLowerCase();
    if (l.includes('built') || l.includes('urban') || t === 'built_up') {
      return { border: '#a855f7', fill: 'rgba(168, 85, 247, 0.22)', text: '#9333ea', tag: 'BUILT-UP' };
    }
    if (l.includes('water') || l.includes('river') || l.includes('flood') || t === 'water') {
      return { border: '#0284c7', fill: 'rgba(2, 132, 199, 0.22)', text: '#0369a1', tag: 'WATER' };
    }
    if (l.includes('veg') || l.includes('canopy') || l.includes('crop') || t === 'vegetation') {
      return { border: '#16a34a', fill: 'rgba(22, 163, 74, 0.22)', text: '#15803d', tag: 'VEGETATION' };
    }
    if (l.includes('disagree') || l.includes('ambigu') || t === 'disagreement') {
      return { border: '#eab308', fill: 'rgba(234, 179, 8, 0.26)', text: '#ca8a04', tag: 'DISAGREEMENT' };
    }
    return { border: '#ff5225', fill: 'rgba(255, 82, 37, 0.20)', text: '#ff5225', tag: 'REGION' };
  };

  // Concise tag formatter for bounding boxes to avoid horizontal/vertical label collision
  const getShortLabel = (label = '', type = '') => {
    const l = (label || '').toLowerCase();
    const t = (type || '').toLowerCase();
    if (l.includes('built') || l.includes('urban') || t === 'built_up') return 'Built-up';
    if (l.includes('water') || l.includes('river') || l.includes('flood') || t === 'water') return 'Water Body';
    if (l.includes('veg') || l.includes('canopy') || l.includes('crop') || t === 'vegetation') return 'Vegetation';
    if (l.includes('struct') || t === 'sar_dominant') return 'SAR Structural';
    if (l.includes('disagree') || l.includes('ambigu') || t === 'disagreement') return 'Disagreement';
    if (t === 'optical_dominant') return 'Optical Veg';
    const clean = label.replace(/\s*\([^)]*\)/g, '').trim();
    return clean || 'Feature';
  };

  const optSrc = opticalUrl || opticalImage?.previewUrl || opticalImage?.url || '/demo_sentinel2_optical.png';
  const sarSrc = sarUrl || sarImage?.previewUrl || sarImage?.url || '/demo_sentinel1_sar.png';

  return (
    <div
      ref={containerRef}
      className={`fusion-viewer-root ${isFullscreen ? 'is-fullscreen' : ''}`}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchEnd={() => setIsSliderActive(false)}
    >
      {/* ── TOP CONTROL BAR ── */}
      <div className="viewer-top-bar">
        <div className="bar-left">
          <div className="viewer-brand-badge font-mono">
            <Radio size={13} className="pulse-icon" />
            <span>OPTICAL + SAR FUSION VIEWER</span>
          </div>

          {/* View Mode Selector Tabs */}
          <div className="view-mode-tabs font-mono">
            <button
              type="button"
              className={`view-tab ${activeView === 'slider' ? 'active' : ''}`}
              onClick={() => setActiveView('slider')}
              title="Interactive draggable comparison slider"
            >
              <Split size={12} />
              <span>Slider View</span>
            </button>

            <button
              type="button"
              className={`view-tab ${activeView === 'split' ? 'active' : ''}`}
              onClick={() => setActiveView('split')}
              title="Side-by-side split comparison"
            >
              <Layers size={12} />
              <span>Split View</span>
            </button>

            <button
              type="button"
              className={`view-tab ${activeView === 'overlay' ? 'active' : ''}`}
              onClick={() => setActiveView('overlay')}
              title="Dual layer opacity blending"
            >
              <Sliders size={12} />
              <span>Overlay Blend</span>
            </button>

            <button
              type="button"
              className={`view-tab ${activeView === 'fusion' ? 'active' : ''}`}
              onClick={() => setActiveView('fusion')}
              title="Multimodal evidence fusion map"
            >
              <Sparkles size={12} />
              <span>Fusion Map</span>
            </button>

            <button
              type="button"
              className={`view-tab ${activeView === 'optical' ? 'active' : ''}`}
              onClick={() => setActiveView('optical')}
              title="Optical multispectral scene only"
            >
              <Eye size={12} />
              <span>Optical</span>
            </button>

            <button
              type="button"
              className={`view-tab ${activeView === 'sar' ? 'active' : ''}`}
              onClick={() => setActiveView('sar')}
              title="SAR radar backscatter scene only"
            >
              <Radio size={12} />
              <span>SAR</span>
            </button>
          </div>
        </div>

        {/* Zoom & Screen Actions */}
        <div className="bar-right font-mono">
          {/* Viewport Interaction Lock / Draw Controls */}
          <div className="viewport-interaction-group">
            <button
              type="button"
              className={`tool-btn pan-lock-toggle ${isPanLocked || activeRoiTool ? 'is-locked' : 'is-movable'}`}
              onClick={() => {
                setIsPanLocked(prev => {
                  const next = !prev;
                  if (!next && activeRoiTool && onSelectRoiTool) {
                    onSelectRoiTool(null);
                  }
                  return next;
                });
              }}
              title={isPanLocked || activeRoiTool ? "Image Fixed (Locked in place). Click to enable Pan/Move" : "Image Moveable (Click to lock/fix image in place)"}
            >
              {isPanLocked || activeRoiTool ? <Lock size={12} className="lock-icon" /> : <Move size={12} className="move-icon" />}
              <span className="btn-label">{isPanLocked || activeRoiTool ? 'Fixed' : 'Move'}</span>
            </button>

            {onSelectRoiTool && (
              <button
                type="button"
                className={`tool-btn roi-quick-rect-btn ${activeRoiTool === 'rectangle' ? 'active' : ''}`}
                onClick={() => {
                  if (activeRoiTool === 'rectangle') {
                    onSelectRoiTool(null);
                  } else {
                    onSelectRoiTool('rectangle');
                    setIsPanLocked(true);
                  }
                }}
                title={activeRoiTool === 'rectangle' ? "Drawing Rectangle Active — Drag on image to make box" : "Draw Rectangle ROI (Fixes image and draws box)"}
              >
                <Square size={12} />
                <span className="btn-label">{activeRoiTool === 'rectangle' ? 'Drawing Rect' : 'Rectangle'}</span>
              </button>
            )}
          </div>

          <div className="zoom-btn-group">
            <button type="button" onClick={handleZoomOut} title="Zoom Out" className="tool-btn">
              <ZoomOut size={13} />
            </button>
            <span className="zoom-level-readout">{Math.round(scale * 100)}%</span>
            <button type="button" onClick={handleZoomIn} title="Zoom In" className="tool-btn">
              <ZoomIn size={13} />
            </button>
            <button type="button" onClick={handleReset} title="Reset View" className="tool-btn">
              <RotateCcw size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="tool-btn fullscreen-btn"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── SECONDARY LAYER TOGGLE & OPACITY BAR ── */}
      <div className="viewer-secondary-bar font-mono">
        <div className="layer-toggles">
          <span className="layer-label">LAYERS:</span>
          <label className="toggle-chip">
            <input
              type="checkbox"
              checked={showBoxes}
              onChange={(e) => setShowBoxes(e.target.checked)}
            />
            <span>Bounding Boxes ({regions.length})</span>
          </label>

          <label className="toggle-chip">
            <input
              type="checkbox"
              checked={showFusionMap}
              onChange={(e) => setShowFusionMap(e.target.checked)}
            />
            <span>Fusion Classification</span>
          </label>

          <label className="toggle-chip">
            <input
              type="checkbox"
              checked={showCrosshairs}
              onChange={(e) => setShowCrosshairs(e.target.checked)}
            />
            <span>Reticle</span>
          </label>

          <label className="toggle-chip">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            <span>Spatial Grid</span>
          </label>
        </div>

        {/* Opacity Sliders (active in Overlay mode) */}
        {activeView === 'overlay' && (
          <div className="opacity-slider-group font-mono">
            <div className="slider-item">
              <span>Optical: {opticalOpacity}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={opticalOpacity}
                onChange={(e) => setOpticalOpacity(Number(e.target.value))}
                className="range-input"
              />
            </div>
            <div className="slider-item">
              <span>SAR: {sarOpacity}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sarOpacity}
                onChange={(e) => setSarOpacity(Number(e.target.value))}
                className="range-input"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN INTERACTIVE CANVAS VIEWPORT ── */}
      <div
        ref={viewerFrameRef}
        className={`viewer-viewport ${isDragging ? 'is-dragging' : ''} ${isPanLocked || activeRoiTool ? 'is-locked' : ''} ${activeRoiTool ? 'has-active-roi' : ''}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <div
          className="canvas-transform-wrapper"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center'
          }}
        >
          {/* 1. SLIDER VIEW: DRAGGABLE BEFORE/AFTER SPLIT */}
          {activeView === 'slider' && (
            <div className="slider-view-stage">
              {/* Underneath: SAR Image */}
              <div className="sar-underlay-layer">
                <img src={sarSrc} alt="SAR Radar Backscatter" className="canvas-raster" />
                <div className="quad-label-pill sar-pill font-mono">SAR RADAR BACKSCATTER (T2)</div>
              </div>

              {/* Top Clipped: Optical Image */}
              <div
                className="optical-overlay-clip"
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
              >
                <img src={optSrc} alt="Optical Multispectral" className="canvas-raster" />
                <div className="quad-label-pill opt-pill font-mono">OPTICAL MULTISPECTRAL (T1)</div>
              </div>

              {/* Draggable Divider Line & Knob */}
              <div
                className="fusion-slider-divider"
                style={{ left: `${sliderPos}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsSliderActive(true);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsSliderActive(true);
                }}
              >
                <div className="divider-line" />
                <div className="divider-handle">
                  <Split size={14} className="handle-icon" />
                </div>
              </div>
            </div>
          )}

          {/* 2. SPLIT VIEW: SIDE-BY-SIDE DUAL PANELS */}
          {activeView === 'split' && (
            <div className="split-view-stage">
              <div className="split-col opt-side">
                <div className="quad-label-pill opt-pill font-mono">OPTICAL MULTISPECTRAL</div>
                <img src={optSrc} alt="Optical Scene" className="canvas-raster" />
              </div>
              <div className="split-divider-static" />
              <div className="split-col sar-side">
                <div className="quad-label-pill sar-pill font-mono">SAR RADAR BACKSCATTER</div>
                <img src={sarSrc} alt="SAR Radar Scene" className="canvas-raster" />
              </div>
            </div>
          )}

          {/* 3. OVERLAY BLEND: ALPHA TRANSPARENCY BLENDING */}
          {activeView === 'overlay' && (
            <div className="overlay-blend-stage">
              <img
                src={optSrc}
                alt="Optical Scene"
                className="canvas-raster"
                style={{ opacity: opticalOpacity / 100 }}
              />
              <img
                src={sarSrc}
                alt="SAR Scene"
                className="canvas-raster overlay-blend-top"
                style={{ opacity: sarOpacity / 100, mixBlendMode: 'screen' }}
              />
            </div>
          )}

          {/* 4. FUSION MAP VIEW: FALSE-COLOR EVIDENCE COMPOSITE */}
          {activeView === 'fusion' && (
            <div className="fusion-composite-stage">
              <img src={optSrc} alt="Base Optical Frame" className="canvas-raster" />
              <img
                src={sarSrc}
                alt="SAR Structural Tint"
                className="canvas-raster overlay-fusion-tint"
                style={{ mixBlendMode: 'color-dodge', opacity: 0.65 }}
              />
            </div>
          )}

          {/* 5. SINGLE OPTICAL VIEW */}
          {activeView === 'optical' && (
            <div className="single-stage">
              <img src={optSrc} alt="Optical Multispectral" className="canvas-raster" />
            </div>
          )}

          {/* 6. SINGLE SAR VIEW */}
          {activeView === 'sar' && (
            <div className="single-stage">
              <img src={sarSrc} alt="SAR Radar Backscatter" className="canvas-raster" />
            </div>
          )}

          {/* ── VECTOR OVERLAYS: BOUNDING BOXES & FUSION ZONES ── */}
          {showBoxes && regions.length > 0 && (
            <div className="vector-overlays-layer">
              {regions.map((reg, idx) => {
                const styleObj = getCategoryColor(reg.label, reg.type);
                const isHovered = hoveredBoxIdx === idx;

                return (
                  <div
                    key={idx}
                    className={`fusion-box-overlay ${isHovered ? 'hovered' : ''}`}
                    style={{
                      left: `${reg.x * 100}%`,
                      top: `${reg.y * 100}%`,
                      width: `${reg.width * 100}%`,
                      height: `${reg.height * 100}%`,
                      borderColor: styleObj.border,
                      backgroundColor: isHovered ? styleObj.fill.replace('0.2', '0.35') : styleObj.fill
                    }}
                    onMouseEnter={() => setHoveredBoxIdx(idx)}
                    onMouseLeave={() => setHoveredBoxIdx(null)}
                  >
                    <div className="box-corner tl" style={{ borderColor: styleObj.border }} />
                    <div className="box-corner tr" style={{ borderColor: styleObj.border }} />
                    <div className="box-corner bl" style={{ borderColor: styleObj.border }} />
                    <div className="box-corner br" style={{ borderColor: styleObj.border }} />

                    <div
                      className="box-label-tag font-mono"
                      style={{ backgroundColor: styleObj.border, color: '#ffffff' }}
                      title={`${reg.label || 'Feature'} ${reg.confidence ? `(${Math.round(reg.confidence * 100)}%)` : ''}`}
                    >
                      <span className="box-tag-text">{getShortLabel(reg.label, reg.type)}</span>
                      {reg.confidence && <span className="box-tag-conf">{Math.round(reg.confidence * 100)}%</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Spatial Grid Overlay */}
          {showGrid && (
            <div className="spatial-grid-overlay">
              <div className="grid-cell" />
              <div className="grid-cell" />
              <div className="grid-cell" />
              <div className="grid-cell" />
            </div>
          )}

          {/* Universal Synchronized ROI Selection Layer */}
          {(activeRoiTool || roiGeometry || isPanLocked) && (
            <RoiDrawingCanvas
              activeTool={activeRoiTool}
              roiGeometry={roiGeometry}
              onChangeRoi={onChangeRoi}
              onSelectTool={onSelectRoiTool}
            />
          )}
        </div>

        {/* Reticle / Crosshair Indicator */}
        {showCrosshairs && (
          <div className="crosshairs-indicator" style={{ left: mouseCoords.x, top: mouseCoords.y }}>
            <div className="ch-line h" />
            <div className="ch-line v" />
          </div>
        )}
      </div>

      {/* ── BOTTOM STATUS BAR & LEGEND ── */}
      <div className="viewer-bottom-bar font-mono">
        {/* Legend */}
        <div className="legend-items-row">
          <span className="legend-title">FUSION PALETTE:</span>
          <div className="legend-item">
            <span className="legend-chip builtup" />
            <span>Built-up / Infrastructure</span>
          </div>
          <div className="legend-item">
            <span className="legend-chip water" />
            <span>Water / Specular</span>
          </div>
          <div className="legend-item">
            <span className="legend-chip veg" />
            <span>Vegetation / Canopy</span>
          </div>
          <div className="legend-item">
            <span className="legend-chip disagree" />
            <span>Disagreement / Ambiguity</span>
          </div>
        </div>

        {/* Coordinates readout */}
        <div className="coords-readout">
          <Compass size={12} className="coords-icon" />
          {mouseCoords.lat && mouseCoords.lon ? (
            <span>LAT: {mouseCoords.lat}° N, LON: {mouseCoords.lon}° E</span>
          ) : (
            <span>PIXEL: X:{mouseCoords.x} Y:{mouseCoords.y}</span>
          )}
          <span className="crs-tag">{opticalMeta.crs || 'EPSG:4326'}</span>
        </div>
      </div>

      <style>{`
        .fusion-viewer-root {
          width: 100%;
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          user-select: none;
          box-shadow: 0 4px 20px -2px rgba(0,0,0,0.25);
        }
        .fusion-viewer-root.is-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 99999;
          border-radius: 0;
        }
        .viewer-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 0.85rem;
          background: #090d16;
          border-bottom: 1px solid #1e293b;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .bar-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .viewer-brand-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #38bdf8;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
        .pulse-icon {
          animation: pulseIcon 1.6s infinite alternate;
        }
        @keyframes pulseIcon {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
        .view-mode-tabs {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #1e293b;
          padding: 0.2rem;
          border-radius: 8px;
        }
        .view-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .view-tab:hover {
          color: #f8fafc;
        }
        .view-tab.active {
          background: #ff5225;
          color: #ffffff;
          box-shadow: 0 1px 4px rgba(255, 82, 37, 0.4);
        }
        .bar-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .viewport-interaction-group {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #1e293b;
          padding: 0.2rem 0.35rem;
          border-radius: 8px;
          border: 1px solid #334155;
        }
        .pan-lock-toggle {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.5rem;
          border-radius: 5px;
          font-size: 0.7rem;
          font-weight: 700;
          transition: all 0.15s ease;
        }
        .pan-lock-toggle.is-locked {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.4);
        }
        .pan-lock-toggle.is-locked:hover {
          background: rgba(16, 185, 129, 0.3);
        }
        .pan-lock-toggle.is-movable {
          color: #94a3b8;
        }
        .pan-lock-toggle.is-movable:hover {
          color: #f1f5f9;
          background: #334155;
        }
        .roi-quick-rect-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.5rem;
          border-radius: 5px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #94a3b8;
          transition: all 0.15s ease;
        }
        .roi-quick-rect-btn:hover {
          color: #f1f5f9;
          background: #334155;
        }
        .roi-quick-rect-btn.active {
          background: rgba(255, 82, 37, 0.25);
          color: #ff5225;
          border: 1px solid rgba(255, 82, 37, 0.5);
          box-shadow: 0 0 8px rgba(255, 82, 37, 0.3);
        }
        .btn-label {
          font-size: 0.68rem;
        }
        .zoom-btn-group {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #1e293b;
          padding: 0.2rem 0.4rem;
          border-radius: 8px;
        }
        .tool-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 0.25rem 0.4rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }
        .tool-btn:hover {
          background: #334155;
          color: #ffffff;
        }
        .zoom-level-readout {
          font-size: 0.68rem;
          font-weight: 700;
          color: #e2e8f0;
          min-width: 38px;
          text-align: center;
        }
        .viewer-secondary-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.35rem 0.85rem;
          background: #0b1120;
          border-bottom: 1px solid #1e293b;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-size: 0.68rem;
        }
        .layer-toggles {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .layer-label {
          color: #64748b;
          font-weight: 800;
        }
        .toggle-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: #cbd5e1;
          cursor: pointer;
        }
        .toggle-chip input {
          accent-color: #ff5225;
          cursor: pointer;
        }
        .opacity-slider-group {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .slider-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: #94a3b8;
        }
        .range-input {
          width: 80px;
          accent-color: #ff5225;
          cursor: pointer;
        }
        .viewer-viewport {
          position: relative;
          width: 100%;
          height: 480px;
          background: #020617;
          overflow: hidden;
          cursor: grab;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .viewer-viewport.is-locked,
        .viewer-viewport.has-active-roi {
          cursor: crosshair;
        }
        .is-fullscreen .viewer-viewport {
          height: calc(100vh - 82px);
        }
        .viewer-viewport.is-dragging {
          cursor: grabbing;
        }
        .canvas-transform-wrapper {
          position: relative;
          max-width: 100%;
          max-height: 100%;
          display: inline-block;
          transition: transform 0.05s ease-out;
        }
        .canvas-raster {
          display: block;
          max-height: 460px;
          width: auto;
          height: auto;
          object-fit: contain;
          pointer-events: none;
        }
        .is-fullscreen .canvas-raster {
          max-height: calc(100vh - 100px);
        }
        /* Slider View */
        .slider-view-stage {
          position: relative;
          display: inline-block;
          overflow: hidden;
        }
        .sar-underlay-layer {
          position: relative;
        }
        .optical-overlay-clip {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .fusion-slider-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 32px;
          transform: translateX(-50%);
          cursor: ew-resize;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .divider-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #ffffff;
          box-shadow: 0 0 6px rgba(0,0,0,0.8);
        }
        .divider-handle {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ff5225;
          color: #ffffff;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        /* Split View */
        .split-view-stage {
          display: flex;
          align-items: center;
          gap: 2px;
          background: #000000;
        }
        .split-col {
          position: relative;
          flex: 1;
        }
        .split-divider-static {
          width: 2px;
          height: 100%;
          background: #ff5225;
        }
        .quad-label-pill {
          position: absolute;
          bottom: 8px;
          padding: 0.22rem 0.55rem;
          border-radius: 4px;
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          z-index: 15;
          pointer-events: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
        }
        .opt-pill {
          left: 8px;
          background: rgba(15, 23, 42, 0.90);
          color: #38bdf8;
          border: 1px solid #0284c7;
        }
        .sar-pill {
          right: 8px;
          background: rgba(15, 23, 42, 0.90);
          color: #c084fc;
          border: 1px solid #9333ea;
        }
        /* Overlay Stage */
        .overlay-blend-stage, .fusion-composite-stage {
          position: relative;
          display: inline-block;
        }
        .overlay-blend-top, .overlay-fusion-tint {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        /* Vector Overlays */
        .vector-overlays-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: auto;
        }
        .fusion-box-overlay {
          position: absolute;
          border: 2px solid #ff5225;
          border-radius: 4px;
          box-sizing: border-box;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .fusion-box-overlay.hovered {
          box-shadow: 0 0 12px rgba(255, 82, 37, 0.8);
          z-index: 30;
        }
        .box-corner {
          position: absolute;
          width: 6px;
          height: 6px;
          border-style: solid;
        }
        .box-corner.tl { top: -2px; left: -2px; border-width: 2px 0 0 2px; }
        .box-corner.tr { top: -2px; right: -2px; border-width: 2px 2px 0 0; }
        .box-corner.bl { bottom: -2px; left: -2px; border-width: 0 0 2px 2px; }
        .box-corner.br { bottom: -2px; right: -2px; border-width: 0 2px 2px 0; }
        .box-label-tag {
          position: absolute;
          top: 3px;
          left: 3px;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.12rem 0.35rem;
          border-radius: 3px;
          font-size: 0.58rem;
          font-weight: 700;
          line-height: 1.15;
          white-space: nowrap;
          max-width: calc(100% - 6px);
          overflow: hidden;
          text-overflow: ellipsis;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
          pointer-events: auto;
          z-index: 5;
          letter-spacing: 0.02em;
        }
        .box-tag-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .box-tag-conf {
          opacity: 0.92;
          font-weight: 600;
          flex-shrink: 0;
        }
        .fusion-box-overlay.hovered .box-label-tag {
          max-width: none;
          z-index: 35;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
        }
        /* Grid */
        .spatial-grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          pointer-events: none;
        }
        .grid-cell {
          border: 1px dashed rgba(255, 255, 255, 0.2);
        }
        /* Reticle */
        .crosshairs-indicator {
          position: absolute;
          pointer-events: none;
          transform: translate(-50%, -50%);
          z-index: 40;
        }
        .ch-line {
          position: absolute;
          background: rgba(255, 82, 37, 0.8);
        }
        .ch-line.h {
          width: 20px;
          height: 1px;
          left: -10px;
          top: 0;
        }
        .ch-line.v {
          width: 1px;
          height: 20px;
          left: 0;
          top: -10px;
        }
        /* Bottom Bar */
        .viewer-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 0.85rem;
          background: #090d16;
          border-top: 1px solid #1e293b;
          font-size: 0.65rem;
          color: #94a3b8;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .legend-items-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .legend-title {
          color: #64748b;
          font-weight: 800;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #cbd5e1;
        }
        .legend-chip {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }
        .legend-chip.builtup { background: #a855f7; }
        .legend-chip.water { background: #0284c7; }
        .legend-chip.veg { background: #16a34a; }
        .legend-chip.disagree { background: #eab308; }
        .coords-readout {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #38bdf8;
        }
        .crs-tag {
          color: #64748b;
          background: #1e293b;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default FusionImageViewer;
