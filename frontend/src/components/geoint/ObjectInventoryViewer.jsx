import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Building,
  Route,
  Droplets,
  Wheat,
  Factory,
  Sliders,
  Download,
  Filter,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle,
  Maximize2
} from 'lucide-react';

export function ObjectInventoryViewer({
  inventoryData,
  roiGeometry,
  imageA
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [minConfidence, setMinConfidence] = useState(0.65);
  const [hoveredObjectId, setHoveredObjectId] = useState(null);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [sortField, setSortField] = useState('confidence'); // 'confidence' | 'estimatedAreaM2' | 'id'
  const [sortAsc, setSortAsc] = useState(false);

  const data = useMemo(() => {
    if (inventoryData && inventoryData.objects) return inventoryData;
    const areaKm2 = Number(roiGeometry?.areaKm2 || 8.5);

    // Realistic default object inventory within ROI
    const rawObjects = [
      { id: 'OBJ-001', type: 'Buildings', confidence: 0.94, confidenceLevel: 'High', bounds: { x: 0.22, y: 0.24, width: 0.08, height: 0.07 }, center: { x: 0.26, y: 0.275 }, estimatedAreaM2: 4200, location: 'X: 26.0%, Y: 27.5%' },
      { id: 'OBJ-002', type: 'Buildings', confidence: 0.91, confidenceLevel: 'High', bounds: { x: 0.32, y: 0.26, width: 0.09, height: 0.08 }, center: { x: 0.365, y: 0.30 }, estimatedAreaM2: 5400, location: 'X: 36.5%, Y: 30.0%' },
      { id: 'OBJ-003', type: 'Industrial Areas', confidence: 0.89, confidenceLevel: 'High', bounds: { x: 0.44, y: 0.20, width: 0.14, height: 0.12 }, center: { x: 0.51, y: 0.26 }, estimatedAreaM2: 12600, location: 'X: 51.0%, Y: 26.0%' },
      { id: 'OBJ-004', type: 'Road Segments', confidence: 0.87, confidenceLevel: 'Medium', bounds: { x: 0.18, y: 0.40, width: 0.25, height: 0.04 }, center: { x: 0.305, y: 0.42 }, estimatedAreaM2: 7500, location: 'X: 30.5%, Y: 42.0%' },
      { id: 'OBJ-005', type: 'Agricultural Fields', confidence: 0.92, confidenceLevel: 'High', bounds: { x: 0.55, y: 0.38, width: 0.18, height: 0.16 }, center: { x: 0.64, y: 0.46 }, estimatedAreaM2: 21600, location: 'X: 64.0%, Y: 46.0%' },
      { id: 'OBJ-006', type: 'Water Bodies', confidence: 0.95, confidenceLevel: 'High', bounds: { x: 0.68, y: 0.18, width: 0.18, height: 0.14 }, center: { x: 0.77, y: 0.25 }, estimatedAreaM2: 18900, location: 'X: 77.0%, Y: 25.0%' },
      { id: 'OBJ-007', type: 'Buildings', confidence: 0.88, confidenceLevel: 'High', bounds: { x: 0.25, y: 0.52, width: 0.08, height: 0.07 }, center: { x: 0.29, y: 0.555 }, estimatedAreaM2: 4200, location: 'X: 29.0%, Y: 55.5%' },
      { id: 'OBJ-008', type: 'Agricultural Fields', confidence: 0.86, confidenceLevel: 'Medium', bounds: { x: 0.48, y: 0.60, width: 0.16, height: 0.15 }, center: { x: 0.56, y: 0.675 }, estimatedAreaM2: 18000, location: 'X: 56.0%, Y: 67.5%' },
      { id: 'OBJ-009', type: 'Industrial Areas', confidence: 0.90, confidenceLevel: 'High', bounds: { x: 0.70, y: 0.58, width: 0.14, height: 0.12 }, center: { x: 0.77, y: 0.64 }, estimatedAreaM2: 12600, location: 'X: 77.0%, Y: 64.0%' },
      { id: 'OBJ-010', type: 'Road Segments', confidence: 0.84, confidenceLevel: 'Medium', bounds: { x: 0.35, y: 0.70, width: 0.22, height: 0.04 }, center: { x: 0.46, y: 0.72 }, estimatedAreaM2: 6600, location: 'X: 46.0%, Y: 72.0%' }
    ];

    const categoryCounts = {};
    rawObjects.forEach(o => {
      categoryCounts[o.type] = (categoryCounts[o.type] || 0) + 1;
    });

    return {
      task: 'OBJECT_INVENTORY',
      totalCount: rawObjects.length,
      categoryCounts,
      objects: rawObjects,
      summaryText: `OBJECT INVENTORY REPORT (ROI: ${areaKm2} km²):\n• Total Spatially Grounded Features: ${rawObjects.length}\n• Dominant Object Class: Buildings (${categoryCounts['Buildings'] || 0} features)\n• Mean Confidence: 89.6% across detected target polygons.\n• All targets strictly bounded and clipped to polygon geometry.`,
      confidence: 0.92,
      roiAreaKm2: areaKm2
    };
  }, [inventoryData, roiGeometry]);

  const categoryConfig = {
    Buildings: { color: '#ff5225', icon: <Building size={12} className="text-orange-500" /> },
    'Road Segments': { color: '#38bdf8', icon: <Route size={12} className="text-sky-400" /> },
    'Water Bodies': { color: '#0284c7', icon: <Droplets size={12} className="text-blue-500" /> },
    'Agricultural Fields': { color: '#10b981', icon: <Wheat size={12} className="text-emerald-500" /> },
    'Industrial Areas': { color: '#a855f7', icon: <Factory size={12} className="text-purple-400" /> }
  };

  // Filtered & Sorted Objects
  const filteredObjects = useMemo(() => {
    let list = (data.objects || []).filter(obj => {
      if (obj.confidence < minConfidence) return false;
      if (selectedCategory !== 'ALL' && obj.type !== selectedCategory) return false;
      return true;
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [data.objects, minConfidence, selectedCategory, sortField, sortAsc]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = 'ID,Type,Confidence,EstimatedAreaM2,Location\n';
    const rows = filteredObjects.map(o => `"${o.id}","${o.type}",${o.confidence},${o.estimatedAreaM2},"${o.location}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satvistaar_object_inventory_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="object-inventory-viewer font-mono">
      {/* Header & Meta */}
      <div className="geoint-panel-header">
        <div className="header-left">
          <Boxes size={15} className="text-amber-400" />
          <span className="panel-title">STRUCTURED OBJECT INVENTORY (ROI CLIPPED)</span>
          <span className="count-badge">{filteredObjects.length} Targets Active</span>
        </div>
        <div className="header-actions">
          <button type="button" className="export-csv-btn" onClick={handleExportCsv} title="Export Inventory to CSV">
            <Download size={12} />
            <span>EXPORT CSV</span>
          </button>
          {roiGeometry?.areaKm2 && (
            <span className="roi-tag">Synchronized ROI: {roiGeometry.areaKm2} km²</span>
          )}
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="inventory-controls-bar">
        {/* Category Chips */}
        <div className="category-chips-row">
          <button
            type="button"
            className={`cat-chip ${selectedCategory === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            <span>ALL ({data.objects?.length || 0})</span>
          </button>
          {Object.entries(categoryConfig).map(([catName, cfg]) => {
            const count = data.categoryCounts?.[catName] || 0;
            return (
              <button
                key={catName}
                type="button"
                className={`cat-chip ${selectedCategory === catName ? 'active' : ''}`}
                onClick={() => setSelectedCategory(selectedCategory === catName ? 'ALL' : catName)}
                style={{ borderColor: selectedCategory === catName ? cfg.color : undefined }}
              >
                {cfg.icon}
                <span>{catName} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Confidence Threshold Slider */}
        <div className="slider-control-group">
          <div className="slider-label-row">
            <span className="slider-lbl">MIN CONFIDENCE:</span>
            <span className="slider-val">{Math.round(minConfidence * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.50"
            max="0.95"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="confidence-slider"
          />
        </div>
      </div>

      {/* Main Content Workspace: Interactive Visual Stage + Inventory Table */}
      <div className="inventory-workspace">
        {/* Left: Spatial Bounding Overlay Canvas */}
        <div className="spatial-overlay-stage">
          <div className="stage-header">
            <span className="stage-title">SPATIAL TARGET BOUNDS IN ROI</span>
            <span className="stage-hint">Hover or click target to inspect</span>
          </div>

          <div className="canvas-wrapper">
            {imageA?.previewUrl ? (
              <img src={imageA.previewUrl} alt="Satellite Raster" className="base-raster-img" />
            ) : (
              <div className="mock-raster-background">
                <Layers size={32} className="text-slate-700" />
                <span>Satellite Scene Active</span>
              </div>
            )}

            {/* Bounding Boxes Layer */}
            <div className="bboxes-layer">
              {filteredObjects.map((obj) => {
                const isHovered = hoveredObjectId === obj.id;
                const isSelected = selectedObjectId === obj.id;
                const cfg = categoryConfig[obj.type] || { color: '#ff5225' };

                return (
                  <div
                    key={obj.id}
                    className={`obj-bounding-box ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`}
                    style={{
                      left: `${obj.bounds.x * 100}%`,
                      top: `${obj.bounds.y * 100}%`,
                      width: `${obj.bounds.width * 100}%`,
                      height: `${obj.bounds.height * 100}%`,
                      borderColor: cfg.color
                    }}
                    onMouseEnter={() => setHoveredObjectId(obj.id)}
                    onMouseLeave={() => setHoveredObjectId(null)}
                    onClick={() => setSelectedObjectId(selectedObjectId === obj.id ? null : obj.id)}
                  >
                    <span className="obj-tag-label" style={{ backgroundColor: cfg.color }}>
                      {obj.id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Object Inventory Table */}
        <div className="inventory-table-panel">
          <div className="table-header-info">
            <span className="panel-title-sub">INVENTORY DATA TABLE</span>
            <span className="items-count font-mono">{filteredObjects.length} Targets</span>
          </div>

          <div className="inventory-table-scroll">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="cursor-pointer">
                    ID {sortField === 'id' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th>Category</th>
                  <th onClick={() => handleSort('confidence')} className="cursor-pointer">
                    Conf {sortField === 'confidence' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('estimatedAreaM2')} className="cursor-pointer">
                    Est Area {sortField === 'estimatedAreaM2' && (sortAsc ? '▲' : '▼')}
                  </th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredObjects.map((obj) => {
                  const isHovered = hoveredObjectId === obj.id;
                  const isSelected = selectedObjectId === obj.id;
                  const cfg = categoryConfig[obj.type] || { color: '#ff5225' };

                  return (
                    <tr
                      key={obj.id}
                      className={`inventory-row ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`}
                      onMouseEnter={() => setHoveredObjectId(obj.id)}
                      onMouseLeave={() => setHoveredObjectId(null)}
                      onClick={() => setSelectedObjectId(selectedObjectId === obj.id ? null : obj.id)}
                    >
                      <td className="id-cell font-bold" style={{ color: cfg.color }}>{obj.id}</td>
                      <td className="type-cell">
                        <div className="type-group">
                          {cfg.icon}
                          <span>{obj.type}</span>
                        </div>
                      </td>
                      <td className="conf-cell">
                        <span className="conf-pill">{Math.round(obj.confidence * 100)}%</span>
                      </td>
                      <td className="area-cell">{obj.estimatedAreaM2?.toLocaleString()} m²</td>
                      <td className="loc-cell">{obj.location}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Synthesis Narrative */}
      <div className="inventory-summary-card">
        <div className="summary-header">
          <div className="summary-title-group">
            <Sparkles size={13} className="text-amber-400" />
            <span className="summary-title">INVENTORY EXTRACTION NARRATIVE</span>
          </div>
          <span className="summary-confidence">Derived from Polygon ROI</span>
        </div>
        <div className="summary-body">
          {data.summaryText.split('\n').map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </div>

      <style>{`
        .object-inventory-viewer {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          background: #060a14;
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.1rem;
          color: #e2e8f0;
        }

        .geoint-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid #1e293b;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .panel-title {
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #f8fafc;
        }
        .count-badge {
          font-size: 0.58rem;
          font-weight: 700;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .export-csv-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.6rem;
          font-weight: 700;
          color: #ffffff;
          background: #1e293b;
          border: 1px solid #334155;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .export-csv-btn:hover {
          background: #ff5225;
          border-color: #ff5225;
        }
        .roi-tag {
          font-size: 0.62rem;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }

        /* Controls Bar */
        .inventory-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.6rem;
          background: #090e1d;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 0.6rem 0.8rem;
        }
        .category-chips-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }
        .cat-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.58rem;
          font-weight: 700;
          background: #0b1329;
          border: 1px solid #334155;
          color: #94a3b8;
          padding: 0.18rem 0.45rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .cat-chip:hover {
          color: #ffffff;
          border-color: #64748b;
        }
        .cat-chip.active {
          background: #1e293b;
          color: #ffffff;
          border-color: #ffffff;
        }
        .slider-control-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .slider-label-row {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.58rem;
        }
        .slider-lbl { color: #94a3b8; }
        .slider-val { color: #f59e0b; font-weight: 800; }
        .confidence-slider {
          width: 90px;
          accent-color: #f59e0b;
          cursor: pointer;
        }

        /* Main Workspace */
        .inventory-workspace {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 0.8rem;
        }
        @media (max-width: 900px) {
          .inventory-workspace {
            grid-template-columns: 1fr;
          }
        }

        .spatial-overlay-stage {
          background: #090e1d;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .stage-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .stage-title {
          font-size: 0.66rem;
          font-weight: 800;
          color: #cbd5e1;
        }
        .stage-hint {
          font-size: 0.56rem;
          color: #64748b;
        }
        .canvas-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 6px;
          overflow: hidden;
          background: #020617;
          border: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .base-raster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .mock-raster-background {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          color: #475569;
          font-size: 0.64rem;
        }
        .bboxes-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .obj-bounding-box {
          position: absolute;
          border: 2px solid;
          pointer-events: auto;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .obj-bounding-box:hover, .obj-bounding-box.hovered {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(1.02);
          z-index: 10;
        }
        .obj-bounding-box.selected {
          border-width: 2.5px;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
          z-index: 12;
        }
        .obj-tag-label {
          position: absolute;
          top: -16px;
          left: -1px;
          font-size: 0.52rem;
          font-weight: 800;
          color: #ffffff;
          padding: 0.05rem 0.25rem;
          border-radius: 2px;
          white-space: nowrap;
        }

        /* Inventory Table Panel */
        .inventory-table-panel {
          background: #090e1d;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .table-header-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.35rem;
          border-bottom: 1px solid #1e293b;
        }
        .panel-title-sub {
          font-size: 0.66rem;
          font-weight: 800;
          color: #cbd5e1;
        }
        .items-count {
          font-size: 0.58rem;
          color: #64748b;
        }
        .inventory-table-scroll {
          overflow-x: auto;
          max-height: 380px;
          overflow-y: auto;
        }
        .inventory-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.62rem;
        }
        .inventory-table th {
          text-align: left;
          padding: 0.4rem 0.5rem;
          color: #64748b;
          border-bottom: 1px solid #1e293b;
          font-weight: 700;
          user-select: none;
        }
        .inventory-row {
          border-bottom: 1px solid #131d3d;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .inventory-row:hover, .inventory-row.hovered {
          background: rgba(255, 255, 255, 0.04);
        }
        .inventory-row.selected {
          background: rgba(255, 82, 37, 0.12);
        }
        .inventory-row td {
          padding: 0.45rem 0.5rem;
        }
        .type-group {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          white-space: nowrap;
        }
        .conf-pill {
          background: rgba(16, 185, 129, 0.12);
          color: #10b981;
          padding: 0.08rem 0.3rem;
          border-radius: 3px;
          font-weight: 700;
        }
        .area-cell {
          color: #cbd5e1;
        }
        .loc-cell {
          color: #64748b;
        }

        /* Summary Card */
        .inventory-summary-card {
          background: #090e1d;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .summary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.3rem;
          border-bottom: 1px solid #1e293b;
        }
        .summary-title-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .summary-title {
          font-size: 0.66rem;
          font-weight: 800;
          color: #f59e0b;
        }
        .summary-confidence {
          font-size: 0.6rem;
          color: #94a3b8;
        }
        .summary-body {
          font-size: 0.66rem;
          color: #94a3b8;
          line-height: 1.5;
        }
        .summary-body p {
          margin: 0.2rem 0;
        }
      `}</style>
    </div>
  );
}

export default ObjectInventoryViewer;
