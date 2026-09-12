import React, { useState, useRef, useEffect, useCallback } from 'react';

export function RoiDrawingCanvas({
  activeTool,
  roiGeometry,
  onChangeRoi,
  onSelectTool,
  isSynced = false,
  readOnly = false,
  aspectRatio = 1
}) {
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentMouse, setCurrentMouse] = useState(null);
  const [tempPoints, setTempPoints] = useState([]);
  const [draggedHandleIdx, setDraggedHandleIdx] = useState(null);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [shapeDragStart, setShapeDragStart] = useState(null);

  // Helper to convert MouseEvent into normalized [0..1] coordinates
  const getNormalizedCoords = useCallback((e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) };
  }, []);

  // Helper to convert normalized [0..1] to pixel values
  const toPixels = useCallback((normPt) => {
    if (!containerRef.current) return { px: 0, py: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      px: normPt.x * rect.width,
      py: normPt.y * rect.height
    };
  }, []);

  // Cancel drawing on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDrawing(false);
        setTempPoints([]);
        setStartPoint(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Mouse Down
  const handleMouseDown = (e) => {
    if (readOnly) return;

    // Prevent viewport panning when interacting with ROI drawing canvas
    if (e?.stopPropagation) e.stopPropagation();

    // Auto-activate rectangle tool if user drags on canvas without selecting a tool first
    let currentTool = activeTool;
    if (!currentTool && onSelectTool) {
      currentTool = 'rectangle';
      onSelectTool('rectangle');
    }

    if (!currentTool) return;

    const pt = getNormalizedCoords(e);

    // Edit Handle Drag
    if (currentTool === 'edit' && e.target.dataset.handleIndex !== undefined) {
      setDraggedHandleIdx(parseInt(e.target.dataset.handleIndex, 10));
      return;
    }

    // Edit Entire Shape Move
    if (currentTool === 'edit' && e.target.classList.contains('roi-poly-fill')) {
      setIsDraggingShape(true);
      setShapeDragStart(pt);
      return;
    }

    if (currentTool === 'rectangle') {
      setIsDrawing(true);
      setStartPoint(pt);
      setTempPoints([pt, pt, pt, pt]);
    } else if (currentTool === 'freehand') {
      setIsDrawing(true);
      setTempPoints([pt]);
    } else if (currentTool === 'point') {
      const buffer = 0.04;
      const poly = [
        { x: Math.max(0, pt.x - buffer), y: Math.max(0, pt.y - buffer) },
        { x: Math.min(1, pt.x + buffer), y: Math.max(0, pt.y - buffer) },
        { x: Math.min(1, pt.x + buffer), y: Math.min(1, pt.y + buffer) },
        { x: Math.max(0, pt.x - buffer), y: Math.min(1, pt.y + buffer) }
      ];
      onChangeRoi({
        type: 'Point',
        center: pt,
        coordinates: poly
      });
    }
  };

  // 2. Mouse Move
  const handleMouseMove = (e) => {
    if (activeTool || isDrawing || isDraggingShape || draggedHandleIdx !== null) {
      if (e?.stopPropagation) e.stopPropagation();
    }
    const pt = getNormalizedCoords(e);
    setCurrentMouse(pt);

    // Vertex handle dragging
    if (draggedHandleIdx !== null && roiGeometry?.coordinates) {
      const updated = [...roiGeometry.coordinates];
      updated[draggedHandleIdx] = pt;
      onChangeRoi({
        ...roiGeometry,
        coordinates: updated
      });
      return;
    }

    // Whole shape dragging
    if (isDraggingShape && shapeDragStart && roiGeometry?.coordinates) {
      const dx = pt.x - shapeDragStart.x;
      const dy = pt.y - shapeDragStart.y;
      const shifted = roiGeometry.coordinates.map(c => ({
        x: Math.max(0, Math.min(1, Number((c.x + dx).toFixed(4)))),
        y: Math.max(0, Math.min(1, Number((c.y + dy).toFixed(4))))
      }));
      setShapeDragStart(pt);
      onChangeRoi({
        ...roiGeometry,
        coordinates: shifted
      });
      return;
    }

    if (!isDrawing) return;

    if ((activeTool === 'rectangle' || !activeTool) && startPoint) {
      const x1 = Math.min(startPoint.x, pt.x);
      const x2 = Math.max(startPoint.x, pt.x);
      const y1 = Math.min(startPoint.y, pt.y);
      const y2 = Math.max(startPoint.y, pt.y);
      setTempPoints([
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
        { x: x1, y: y2 }
      ]);
    } else if (activeTool === 'freehand') {
      const last = tempPoints[tempPoints.length - 1];
      if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) > 0.015) {
        setTempPoints(prev => [...prev, pt]);
      }
    }
  };

  // 3. Mouse Up
  const handleMouseUp = (e) => {
    if (activeTool || isDrawing || isDraggingShape || draggedHandleIdx !== null) {
      if (e?.stopPropagation) e.stopPropagation();
    }

    if (draggedHandleIdx !== null) {
      setDraggedHandleIdx(null);
      return;
    }
    if (isDraggingShape) {
      setIsDraggingShape(false);
      setShapeDragStart(null);
      return;
    }

    if (isDrawing && (activeTool === 'rectangle' || !activeTool) && tempPoints.length === 4) {
      setIsDrawing(false);
      onChangeRoi({
        type: 'Rectangle',
        coordinates: tempPoints
      });
      setTempPoints([]);
      setStartPoint(null);
    } else if (isDrawing && activeTool === 'freehand' && tempPoints.length >= 3) {
      setIsDrawing(false);
      onChangeRoi({
        type: 'Freehand',
        coordinates: tempPoints
      });
      setTempPoints([]);
    }
  };

  // 4. Click (For Polygon Mode)
  const handleClick = (e) => {
    if (readOnly || activeTool !== 'polygon') return;
    if (e?.stopPropagation) e.stopPropagation();
    const pt = getNormalizedCoords(e);

    // If clicking near first point (closure distance)
    if (tempPoints.length >= 3) {
      const first = tempPoints[0];
      const dist = Math.hypot(pt.x - first.x, pt.y - first.y);
      if (dist < 0.035) {
        // Close polygon
        onChangeRoi({
          type: 'Polygon',
          coordinates: tempPoints
        });
        setTempPoints([]);
        setIsDrawing(false);
        return;
      }
    }

    if (!isDrawing) {
      setIsDrawing(true);
      setTempPoints([pt]);
    } else {
      setTempPoints(prev => [...prev, pt]);
    }
  };

  // 5. Double Click (Close polygon immediately)
  const handleDoubleClick = (e) => {
    if (e?.stopPropagation) e.stopPropagation();
    if (activeTool === 'polygon' && tempPoints.length >= 3) {
      onChangeRoi({
        type: 'Polygon',
        coordinates: tempPoints
      });
      setTempPoints([]);
      setIsDrawing(false);
    }
  };

  // Display coordinates: active tempPoints or established roiGeometry.coordinates
  const coordsToRender = isDrawing ? tempPoints : (roiGeometry?.coordinates || []);

  const hasCoords = coordsToRender && coordsToRender.length >= 2;
  const polyPointsString = coordsToRender.map(pt => `${pt.x * 100}%,${pt.y * 100}%`).join(' ');

  // Calculate center of geometry for tag placement
  const centerX = coordsToRender.length
    ? (coordsToRender.reduce((acc, p) => acc + p.x, 0) / coordsToRender.length) * 100
    : 50;
  const centerY = coordsToRender.length
    ? (coordsToRender.reduce((acc, p) => acc + p.y, 0) / coordsToRender.length) * 100
    : 50;

  return (
    <div
      ref={containerRef}
      className={`sat-roi-canvas-overlay ${activeTool ? `tool-${activeTool}` : onSelectTool ? 'tool-rectangle' : ''} ${readOnly ? 'read-only' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <svg className="roi-svg-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
        {hasCoords && (
          <polygon
            points={coordsToRender.map(p => `${p.x * 100},${p.y * 100}`).join(' ')}
            className={`roi-poly-fill ${isDrawing ? 'drawing' : 'finalized'}`}
          />
        )}

        {/* Rubber-band preview line for Polygon tool */}
        {activeTool === 'polygon' && isDrawing && tempPoints.length > 0 && currentMouse && (
          <line
            x1={tempPoints[tempPoints.length - 1].x * 100}
            y1={tempPoints[tempPoints.length - 1].y * 100}
            x2={currentMouse.x * 100}
            y2={currentMouse.y * 100}
            className="roi-rubberband-line"
          />
        )}

        {/* Closing guide circle to first point */}
        {activeTool === 'polygon' && isDrawing && tempPoints.length >= 3 && (
          <circle
            cx={tempPoints[0].x * 100}
            cy={tempPoints[0].y * 100}
            r="1.8"
            className="roi-close-target-circle"
          />
        )}
      </svg>

      {/* HTML overlay handles for vertex editing */}
      {!isDrawing && activeTool === 'edit' && coordsToRender.map((pt, idx) => (
        <div
          key={idx}
          data-handle-index={idx}
          className="roi-vertex-handle"
          style={{
            left: `${pt.x * 100}%`,
            top: `${pt.y * 100}%`
          }}
          title={`Vertex #${idx + 1}`}
        />
      ))}

      {/* Active ROI Area Tag Pill */}
      {hasCoords && !isDrawing && (
        <div
          className="roi-floating-tag font-mono"
          style={{
            left: `${centerX}%`,
            top: `${centerY}%`
          }}
        >
          <span className="roi-tag-dot" />
          <span>{roiGeometry?.type || 'SELECTED AREA'}</span>
          {roiGeometry?.areaKm2 && (
            <span className="roi-tag-area">{roiGeometry.areaKm2} km²</span>
          )}
        </div>
      )}

      <style>{`
        .sat-roi-canvas-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 30;
          user-select: none;
          pointer-events: auto;
        }
        .sat-roi-canvas-overlay.tool-rectangle { cursor: crosshair; }
        .sat-roi-canvas-overlay.tool-polygon { cursor: crosshair; }
        .sat-roi-canvas-overlay.tool-freehand { cursor: crosshair; }
        .sat-roi-canvas-overlay.tool-point { cursor: cell; }
        .sat-roi-canvas-overlay.tool-edit { cursor: move; }
        .sat-roi-canvas-overlay.read-only { pointer-events: none; }

        .roi-svg-layer {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }
        .roi-poly-fill {
          fill: rgba(255, 82, 37, 0.24);
          stroke: #ff5225;
          stroke-width: 0.65;
          vector-effect: non-scaling-stroke;
          transition: fill 0.15s ease;
        }
        .roi-poly-fill.drawing {
          fill: rgba(255, 82, 37, 0.15);
          stroke-dasharray: 4, 3;
        }
        .roi-poly-fill.finalized:hover {
          fill: rgba(255, 82, 37, 0.32);
        }
        .roi-rubberband-line {
          stroke: #ff5225;
          stroke-width: 0.65;
          stroke-dasharray: 3, 3;
          vector-effect: non-scaling-stroke;
        }
        .roi-close-target-circle {
          fill: #ffffff;
          stroke: #ff5225;
          stroke-width: 0.65;
          vector-effect: non-scaling-stroke;
          animation: pulseTarget 1s infinite alternate;
        }
        @keyframes pulseTarget {
          from { transform: scale(0.9); }
          to { transform: scale(1.3); }
        }
        .roi-vertex-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #ff5225;
          transform: translate(-50%, -50%);
          cursor: grab;
          z-index: 40;
          box-shadow: 0 0 5px rgba(255, 82, 37, 0.6);
        }
        .roi-vertex-handle:hover {
          background: #ff5225;
          border-color: #ffffff;
          transform: translate(-50%, -50%) scale(1.25);
        }
        .roi-floating-tag {
          position: absolute;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 70, 0.92);
          backdrop-filter: blur(4px);
          border: 1px solid #ff5225;
          color: #ffffff;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          pointer-events: none;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
          white-space: nowrap;
          z-index: 35;
        }
        .roi-tag-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff5225;
        }
        .roi-tag-area {
          background: rgba(255, 82, 37, 0.25);
          padding: 0.05rem 0.3rem;
          border-radius: 3px;
          color: #ffaa95;
        }
      `}</style>
    </div>
  );
}

export default RoiDrawingCanvas;
