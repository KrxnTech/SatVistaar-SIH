import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Grid, 
  Crosshair, 
  Eye, 
  EyeOff, 
  Compass, 
  Split, 
  Info
} from 'lucide-react';

export type ViewerMode = 'single' | 'grounding' | 'bitemporal' | 'fusion';

export interface GroundingBox {
  id: string;
  label: string;
  confidence: number;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  width: number; // percentage width
  height: number; // percentage height
  color: string;
}

export interface ImageViewerProps {
  mode: ViewerMode;
  opticalUrl?: string;
  sarUrl?: string;
  historicalUrl?: string;
  groundingBoxes?: GroundingBox[];
  showOverlaysDefault?: boolean;
  className?: string;
}

const DEFAULT_GROUNDING_BOXES: GroundingBox[] = [
  { id: 'box-01', label: 'Vessel (Container)', confidence: 0.94, x: 44, y: 34, width: 9, height: 6, color: 'border-violet-500 text-violet-400 bg-violet-500/10' },
  { id: 'box-02', label: 'Vessel (Cargo)', confidence: 0.91, x: 54, y: 53, width: 10, height: 6, color: 'border-violet-500 text-violet-400 bg-violet-500/10' },
  { id: 'box-03', label: 'Petroleum Tank', confidence: 0.88, x: 18, y: 68, width: 6, height: 5, color: 'border-brand-sky text-brand-sky bg-brand-sky/10' },
  { id: 'box-04', label: 'Gantry Crane', confidence: 0.82, x: 70, y: 39, width: 4, height: 4, color: 'border-amber-500 text-amber-400 bg-amber-500/10' },
  { id: 'box-05', label: 'Dry Dock Lock', confidence: 0.85, x: 74, y: 48, width: 8, height: 16, color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' }
];

export const ImageViewer: React.FC<ImageViewerProps> = ({
  mode,
  opticalUrl = '/sat-optical.jpg',
  sarUrl = '/sat-sar.jpg',
  historicalUrl = '/sat-historical.jpg',
  groundingBoxes = DEFAULT_GROUNDING_BOXES,
  showOverlaysDefault = true,
  className = ''
}) => {
  // Zoom & Pan state
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Fullscreen simulated state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Overlay state toggles
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showCrosshairs, setShowCrosshairs] = useState<boolean>(true);
  const [showBoxes, setShowBoxes] = useState<boolean>(showOverlaysDefault);

  // Bi-temporal swipe percentage (0 to 100)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isSliderDragging, setIsSliderDragging] = useState<boolean>(false);

  // Fusion mode options: 'optical' | 'sar' | 'fused'
  const [fusionSubMode, setFusionSubMode] = useState<'optical' | 'sar' | 'fused'>('fused');
  const [blendOpacity, setBlendOpacity] = useState<number>(0.5); // SAR blend opacity (0 - 1)

  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Reset zoom and pan on mode change
  useEffect(() => {
    resetView();
  }, [mode]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.4, 6));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.4, 1));
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Drag Panning Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSliderDragging) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Bi-temporal slider dragging
  const handleSliderDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSliderDragging(true);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isSliderDragging || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setSliderPosition(percentage);
    };

    const handleGlobalMouseUp = () => {
      setIsSliderDragging(false);
    };

    if (isSliderDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isSliderDragging]);

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black border border-zinc-900 overflow-hidden select-none flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'w-full h-[400px] rounded-lg'
      } ${className}`}
    >
      
      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-30 pointer-events-none">
        
        {/* Mode Indicators Badges */}
        <div className="flex gap-2 pointer-events-auto">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded px-2.5 py-1 text-[9px] font-mono text-slate-300 flex items-center gap-1.5 uppercase font-bold tracking-wider shadow-md">
            <Compass className="w-3.5 h-3.5 text-brand-sky animate-spin-slow" />
            <span>MODE: {mode === 'bitemporal' ? 'Bi-Temporal SWIPE' : mode}</span>
          </div>

          {/* Fusion sub-tabs */}
          {mode === 'fusion' && (
            <div className="bg-zinc-950/90 border border-zinc-850 rounded p-0.5 flex gap-1 shadow-md">
              {(['optical', 'sar', 'fused'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFusionSubMode(tab)}
                  className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition ${
                    fusionSubMode === tab 
                      ? 'bg-violet-950/60 border border-violet-900/40 text-violet-400' 
                      : 'text-zinc-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Control Actions Toolbar */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          
          {/* Overlay toggles */}
          <div className="bg-zinc-950/85 border border-zinc-800 rounded flex p-0.5 shadow-md">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1 rounded text-zinc-500 hover:text-slate-300 transition ${showGrid ? 'text-violet-400 bg-zinc-900/40' : ''}`}
              title="Toggle reference grid"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowCrosshairs(!showCrosshairs)}
              className={`p-1 rounded text-zinc-500 hover:text-slate-300 transition ${showCrosshairs ? 'text-violet-400 bg-zinc-900/40' : ''}`}
              title="Toggle target crosshair"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
            {mode === 'grounding' && (
              <button
                onClick={() => setShowBoxes(!showBoxes)}
                className={`p-1 rounded text-zinc-500 hover:text-slate-300 transition ${showBoxes ? 'text-violet-400 bg-zinc-900/40' : ''}`}
                title="Toggle grounding labels"
              >
                {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Zoom/Pan/Fullscreen toolbar */}
          <div className="bg-zinc-950/85 border border-zinc-800 rounded flex p-0.5 shadow-md">
            <button
              onClick={handleZoomIn}
              className="p-1 text-zinc-500 hover:text-slate-300 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-zinc-500 hover:text-slate-300 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="p-1 text-[9px] font-mono font-bold text-zinc-500 hover:text-slate-300 rounded transition"
              title="Reset Viewport"
            >
              RESET
            </button>
            <span className="w-px bg-zinc-800 mx-1"></span>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 text-zinc-500 hover:text-slate-300 rounded transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>

      {/* Main Image Port viewport area */}
      <div 
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-grow relative overflow-hidden flex items-center justify-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Radar Coordinates grid overlay lines */}
        {showGrid && (
          <div className="absolute inset-0 radar-grid opacity-25 z-10 pointer-events-none"></div>
        )}

        {/* Center Target reticle lines */}
        {showCrosshairs && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-full h-[0.5px] bg-zinc-800/40 absolute"></div>
            <div className="h-full w-[0.5px] bg-zinc-800/40 absolute"></div>
            <div className="w-6 h-6 border border-dashed border-violet-500/20 rounded-full animate-spin-slow"></div>
          </div>
        )}

        {/* Map view canvas elements - Scales and Pans dynamically */}
        <motion.div
          animate={{
            x: position.x,
            y: position.y,
            scale: scale
          }}
          transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'spring', stiffness: 200, damping: 25 }}
          className="relative w-full h-full max-w-full max-h-full flex items-center justify-center transform-gpu"
        >
          {/* 1. SINGLE RASTER IMAGE MODE */}
          {mode === 'single' && (
            <img 
              src={opticalUrl} 
              alt="Satellite Optical View" 
              className="w-full h-full object-cover pointer-events-none"
            />
          )}

          {/* 2. GROUNDING MODE WITH BOUNDING BOX OVERLAYS */}
          {mode === 'grounding' && (
            <div className="relative w-full h-full">
              <img 
                src={opticalUrl} 
                alt="Satellite Grounding view" 
                className="w-full h-full object-cover pointer-events-none"
              />
              
              {/* Render grounding box coordinate labels */}
              {showBoxes && groundingBoxes.map((box) => (
                <div
                  key={box.id}
                  className={`absolute border-2 rounded ${box.color} flex flex-col transition-all`}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`
                  }}
                >
                  <div className="bg-zinc-950/80 border border-zinc-900 rounded px-1 text-[7px] font-mono uppercase tracking-wide font-bold absolute -top-4 left-0 shrink-0 pointer-events-none">
                    {box.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. BI-TEMPORAL BEFORE/AFTER SPLIT CURTAIN SWIPE MODE */}
          {mode === 'bitemporal' && (
            <div className="w-full h-full relative overflow-hidden">
              {/* T1 Historical Image (Before) - Base layer */}
              <img 
                src={historicalUrl} 
                alt="Historical Baseline T1" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* T2 Optical Image (After) - Clipped Overlay layer */}
              <div 
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{
                  clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`
                }}
              >
                <img 
                  src={opticalUrl} 
                  alt="Recent Telemetry T2" 
                  className="w-full h-full object-cover pointer-events-none"
                  style={{ width: sliderRef.current?.getBoundingClientRect().width, height: sliderRef.current?.getBoundingClientRect().height }}
                />
              </div>

              {/* Swipe split Curtain handle */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-violet-500 z-20 cursor-col-resize hover:bg-violet-400 group"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleSliderDown}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-violet-600 rounded-full border border-violet-400 shadow-md group-hover:bg-violet-500 flex items-center justify-center transition">
                  <Split className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* 4. OPTICAL / SAR FUSION BLENDING MODE */}
          {mode === 'fusion' && (
            <div className="w-full h-full relative">
              {/* Base layer: Optical RGB */}
              <img 
                src={opticalUrl} 
                alt="Optical RGB Feed" 
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
                  fusionSubMode === 'sar' ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {/* Top layer: SAR Radar scatter */}
              <img 
                src={sarUrl} 
                alt="SAR Radar Matrix" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: fusionSubMode === 'sar' ? 1 : fusionSubMode === 'fused' ? blendOpacity : 0
                }}
              />
            </div>
          )}
        </motion.div>

        {/* Legend / Info card details bottom left */}
        <div className="absolute bottom-3 left-3 z-30 pointer-events-none max-w-xs space-y-1.5">
          {mode === 'fusion' && fusionSubMode === 'fused' && (
            <div className="bg-zinc-950/85 border border-zinc-800 rounded p-2 text-[9px] font-mono text-zinc-400 pointer-events-auto shadow-md space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <span>SAR SCAN OPACITY:</span>
                <span className="text-violet-400 font-bold">{Math.round(blendOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={blendOpacity}
                onChange={(e) => setBlendOpacity(parseFloat(e.target.value))}
                className="w-28 h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>
          )}

          {mode === 'bitemporal' && (
            <div className="bg-zinc-950/85 border border-zinc-800 rounded px-2.5 py-1 text-[8.5px] font-mono text-zinc-500 shadow-md">
              <span className="text-zinc-600 font-bold uppercase">SWIPE CURTAIN</span>: L: T1 (2024) | R: T2 (2026)
            </div>
          )}

          {mode === 'grounding' && showBoxes && (
            <div className="bg-zinc-950/85 border border-zinc-800 rounded p-2 text-[8.5px] font-mono text-zinc-400 pointer-events-auto shadow-md">
              <span className="text-[9px] font-bold text-slate-300 block mb-1 uppercase">Grounding Legend</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-violet-500/20 border border-violet-500"></span>
                  <span>Marine Vessels</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-brand-sky/20 border border-brand-sky"></span>
                  <span>Petroleum Storage</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500/20 border border-emerald-500"></span>
                  <span>Port Structures</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GeoTIFF backend roadmap note details bottom right */}
        <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
          <div className="bg-zinc-950/80 border border-zinc-850 rounded px-2 py-1 text-[8px] font-mono text-zinc-600 flex items-center gap-1 pointer-events-auto">
            <Info className="w-3.5 h-3.5 text-zinc-500" />
            <span>GeoTIFF / TileServer Integration Hook</span>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ImageViewer;
