import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Clock, BarChart3, ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export function TimeSeriesViewer({
  timeSeriesData,
  roiGeometry,
  onSelectDateIndex,
  currentDateIndex = 0
}) {
  const [selectedClass, setSelectedClass] = useState('builtup');
  const [activeDateIdx, setActiveDateIdx] = useState(currentDateIndex);

  const timeline = useMemo(() => {
    return timeSeriesData?.timeline || [
      { date: '2022-01-15', statistics: { builtup: 28.4, vegetation: 46.2, water: 7.8, bareSoil: 17.6 }, areaKm2Breakdown: { builtup: 3.55, vegetation: 5.78, water: 0.98, bareSoil: 2.2, total: 12.5 } },
      { date: '2023-04-20', statistics: { builtup: 32.1, vegetation: 43.5, water: 8.1, bareSoil: 16.3 }, areaKm2Breakdown: { builtup: 4.01, vegetation: 5.44, water: 1.01, bareSoil: 2.04, total: 12.5 } },
      { date: '2024-02-14', statistics: { builtup: 37.8, vegetation: 39.1, water: 7.9, bareSoil: 15.2 }, areaKm2Breakdown: { builtup: 4.73, vegetation: 4.89, water: 0.99, bareSoil: 1.9, total: 12.5 } },
      { date: '2025-01-08', statistics: { builtup: 44.6, vegetation: 34.2, water: 8.4, bareSoil: 12.8 }, areaKm2Breakdown: { builtup: 5.58, vegetation: 4.28, water: 1.05, bareSoil: 1.6, total: 12.5 } }
    ];
  }, [timeSeriesData]);

  const activeEpoch = timeline[activeDateIdx] || timeline[0];

  const classConfig = {
    builtup: { label: 'Built-up / Urban', color: '#ff5225', bg: 'rgba(255, 82, 37, 0.12)' },
    vegetation: { label: 'Vegetation Canopy', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
    water: { label: 'Water Bodies', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)' },
    bareSoil: { label: 'Bare Soil / Ag', color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)' }
  };

  const handleDateChange = (idx) => {
    setActiveDateIdx(idx);
    if (onSelectDateIndex) onSelectDateIndex(idx);
  };

  // SVG Trend Chart Coordinates
  const chartPoints = useMemo(() => {
    const values = timeline.map(t => t.statistics?.[selectedClass] || 0);
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 60);
    const width = 500;
    const height = 140;
    const padding = 30;

    const pts = values.map((val, i) => {
      const x = padding + (i / Math.max(1, values.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - minVal) / Math.max(1, maxVal - minVal)) * (height - 2 * padding);
      return { x, y, val, date: timeline[i]?.date };
    });

    const pathD = pts.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
    const areaD = `${pathD} L ${pts[pts.length - 1].x} ${height - padding} L ${pts[0].x} ${height - padding} Z`;

    return { pts, pathD, areaD, width, height, padding, minVal, maxVal };
  }, [timeline, selectedClass]);

  return (
    <div className="time-series-viewer font-mono">
      {/* Header & Meta */}
      <div className="geoint-panel-header">
        <div className="header-left">
          <Calendar size={14} className="text-orange-500" />
          <span className="panel-title">MULTI-TEMPORAL TIME-SERIES INTELLIGENCE</span>
          <span className="epoch-badge">{timeline.length} Epochs ({timeline[0]?.date} → {timeline[timeline.length - 1]?.date})</span>
        </div>
        {roiGeometry?.areaKm2 && (
          <span className="roi-tag">Synchronized ROI: {roiGeometry.areaKm2} km²</span>
        )}
      </div>

      {/* 1. Interactive Timeline Bar */}
      <div className="timeline-interactive-bar">
        <div className="timeline-track-line" />
        <div className="timeline-nodes-row">
          {timeline.map((item, idx) => {
            const isSelected = idx === activeDateIdx;
            return (
              <button
                key={item.date || idx}
                type="button"
                className={`timeline-node-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleDateChange(idx)}
              >
                <div className="node-circle">
                  <div className="node-inner-dot" />
                </div>
                <div className="node-date-label">{item.date}</div>
                <div className="node-modality-badge">{item.modality || 'Optical'}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Timeline Date Slider */}
      <div className="timeline-slider-box">
        <div className="slider-label-group">
          <Clock size={12} className="text-slate-400" />
          <span>Epoch Navigation:</span>
          <strong>{activeEpoch.date}</strong>
          <span className="slider-subtext">(Epoch {activeDateIdx + 1} of {timeline.length})</span>
        </div>
        <input
          type="range"
          min="0"
          max={timeline.length - 1}
          value={activeDateIdx}
          onChange={(e) => handleDateChange(parseInt(e.target.value, 10))}
          className="timeline-scrubber-slider"
        />
      </div>

      {/* 3. Interactive Class Trend Chart */}
      <div className="trend-chart-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <TrendingUp size={13} className="text-emerald-500" />
            <span>Land-Cover Trajectory Curve:</span>
            <span style={{ color: classConfig[selectedClass].color }}>{classConfig[selectedClass].label}</span>
          </div>

          {/* Class Switcher Tabs */}
          <div className="class-selector-tabs">
            {Object.entries(classConfig).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                className={`class-tab-btn ${selectedClass === key ? 'active' : ''}`}
                style={{
                  '--accent': cfg.color,
                  '--accent-bg': cfg.bg
                }}
                onClick={() => setSelectedClass(key)}
              >
                {cfg.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Chart Stage */}
        <div className="chart-svg-stage">
          <svg viewBox={`0 0 ${chartPoints.width} ${chartPoints.height}`} className="trend-svg">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={classConfig[selectedClass].color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={classConfig[selectedClass].color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={chartPoints.padding} y1={chartPoints.height - chartPoints.padding} x2={chartPoints.width - chartPoints.padding} y2={chartPoints.height - chartPoints.padding} stroke="#334155" strokeWidth="1" />
            <line x1={chartPoints.padding} y1={chartPoints.padding} x2={chartPoints.width - chartPoints.padding} y2={chartPoints.padding} stroke="#1e293b" strokeDasharray="3 3" />

            {/* Filled area */}
            <path d={chartPoints.areaD} fill="url(#chartGrad)" />

            {/* Trajectory line */}
            <path d={chartPoints.pathD} fill="none" stroke={classConfig[selectedClass].color} strokeWidth="2.5" strokeLinecap="round" />

            {/* Nodes */}
            {chartPoints.pts.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={i === activeDateIdx ? 6 : 4}
                  fill={i === activeDateIdx ? '#ffffff' : classConfig[selectedClass].color}
                  stroke={classConfig[selectedClass].color}
                  strokeWidth={i === activeDateIdx ? 3 : 1.5}
                />
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  fill="#ffffff"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {pt.val.toFixed(1)}%
                </text>
                <text
                  x={pt.x}
                  y={chartPoints.height - 10}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {pt.date.slice(0, 4)}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* 4. Active Epoch Statistics Table */}
      <div className="epoch-stats-grid">
        {Object.entries(classConfig).map(([key, cfg]) => {
          const pct = activeEpoch.statistics?.[key] || 0;
          const km2 = activeEpoch.areaKm2Breakdown?.[key] || (pct / 100 * (roiGeometry?.areaKm2 || 10)).toFixed(2);
          return (
            <div key={key} className="epoch-stat-card">
              <div className="stat-card-header">
                <span className="stat-indicator-dot" style={{ background: cfg.color }} />
                <span className="stat-title">{cfg.label}</span>
              </div>
              <div className="stat-value font-mono">
                <strong>{pct.toFixed(1)}%</strong>
                <span className="stat-km2 font-mono">({km2} km²)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. AI Temporal Summary Narrative */}
      <div className="ai-summary-card">
        <div className="summary-header">
          <Sparkles size={13} className="text-amber-500" />
          <span className="summary-title font-mono">SYNTHESIZED TEMPORAL OBSERVATION</span>
          <span className="confidence-pill font-mono">Confidence: Estimated (Model-Derived)</span>
        </div>
        <div className="summary-body font-mono">
          {timeSeriesData?.summaryText || (
            <>
              <p>• <strong>Built-up infrastructure</strong> increased consistently from 28.4% to 44.6% (+16.2% net shift) between 2022 and 2025.</p>
              <p>• <strong>Vegetation canopy</strong> decreased from 46.2% to 34.2% during the observed timeframe due to urban transition.</p>
              <p>• <strong>Largest detected transition epoch</strong> occurred between 2024 and 2025 with rapid structural expansion (+6.8%).</p>
              <p>• <strong>Overall Trajectory:</strong> MODERATE-HIGH urban expansion across the synchronized geographic ROI.</p>
            </>
          )}
        </div>
      </div>

      <style>{`
        .time-series-viewer {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem;
        }
        .geoint-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.6rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .panel-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: 0.04em;
        }
        .epoch-badge {
          font-size: 0.625rem;
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
          font-weight: 700;
        }
        .roi-tag {
          font-size: 0.625rem;
          background: #fff5f2;
          color: #ff5225;
          border: 1px solid #ffd8cc;
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
          font-weight: 700;
        }

        /* Interactive Timeline */
        .timeline-interactive-bar {
          position: relative;
          padding: 1rem 0.5rem 0.5rem;
        }
        .timeline-track-line {
          position: absolute;
          top: 1.45rem;
          left: 5%;
          right: 5%;
          height: 2px;
          background: #cbd5e1;
          z-index: 1;
        }
        .timeline-nodes-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 2;
        }
        .timeline-node-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          background: transparent;
          border: none;
          cursor: pointer;
          min-height: auto;
          padding: 0 0.5rem;
          transition: transform 0.15s ease;
        }
        .timeline-node-btn:hover {
          transform: translateY(-2px);
        }
        .node-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .node-inner-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cbd5e1;
          transition: all 0.2s ease;
        }
        .timeline-node-btn.active .node-circle {
          border-color: #ff5225;
          box-shadow: 0 0 10px rgba(255, 82, 37, 0.4);
        }
        .timeline-node-btn.active .node-inner-dot {
          background: #ff5225;
        }
        .node-date-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: #334155;
        }
        .timeline-node-btn.active .node-date-label {
          color: #ff5225;
        }
        .node-modality-badge {
          font-size: 0.55rem;
          background: #f1f5f9;
          color: #64748b;
          padding: 0.05rem 0.3rem;
          border-radius: 3px;
        }

        /* Scrubber Slider */
        .timeline-slider-box {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
        }
        .slider-label-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.68rem;
          color: #475569;
        }
        .slider-subtext {
          font-size: 0.6rem;
          color: #94a3b8;
        }
        .timeline-scrubber-slider {
          width: 100%;
          cursor: pointer;
          accent-color: #ff5225;
        }

        /* Trend Chart Card */
        .trend-chart-card {
          background: #090e1c;
          border: 1px solid #1e293b;
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid #1e293b;
        }
        .chart-title-group {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: #cbd5e1;
        }
        .class-selector-tabs {
          display: flex;
          gap: 0.25rem;
        }
        .class-tab-btn {
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          background: #1e293b;
          color: #94a3b8;
          border: 1px solid #334155;
          cursor: pointer;
          min-height: auto;
          transition: all 0.15s ease;
        }
        .class-tab-btn:hover {
          color: #ffffff;
        }
        .class-tab-btn.active {
          background: var(--accent-bg);
          color: var(--accent);
          border-color: var(--accent);
        }
        .chart-svg-stage {
          width: 100%;
          overflow: hidden;
        }
        .trend-svg {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Epoch Stats Grid */
        .epoch-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }
        @media (max-width: 640px) {
          .epoch-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .epoch-stat-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .stat-card-header {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .stat-indicator-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .stat-title {
          font-size: 0.6rem;
          font-weight: 700;
          color: #475569;
        }
        .stat-value {
          display: flex;
          align-items: baseline;
          gap: 0.3rem;
          font-size: 0.95rem;
          color: #0f172a;
        }
        .stat-km2 {
          font-size: 0.65rem;
          color: #64748b;
        }

        /* AI Summary */
        .ai-summary-card {
          background: #fffdfa;
          border: 1px solid #fed7aa;
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .summary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.35rem;
          border-bottom: 1px solid #ffedd5;
        }
        .summary-title {
          font-size: 0.68rem;
          font-weight: 800;
          color: #c2410c;
        }
        .confidence-pill {
          font-size: 0.58rem;
          color: #9a3412;
          background: #ffedd5;
          padding: 0.08rem 0.35rem;
          border-radius: 3px;
        }
        .summary-body {
          font-size: 0.72rem;
          color: #431407;
          line-height: 1.5;
        }
        .summary-body p {
          margin: 0.2rem 0;
        }
      `}</style>
    </div>
  );
}

export default TimeSeriesViewer;
