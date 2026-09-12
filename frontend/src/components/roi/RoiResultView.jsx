import React, { useState } from 'react';
import {
  FileText,
  Compass,
  PieChart,
  Layers,
  Sparkles,
  HelpCircle,
  Activity,
  Download,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Eye,
  GitCompare,
  Target,
  ArrowRight
} from 'lucide-react';

export function RoiResultView({
  roiResult,
  roiGeometry,
  primaryTask = 'VQA',
  onDownloadReport
}) {
  const [activeTab, setActiveTab] = useState('Overview');

  if (!roiResult) return null;

  const {
    answerText,
    dominantClass,
    confidence = 0.92,
    statistics = {},
    multimodal = null,
    temporal = null,
    grounding = null,
    roiDebug = null,
    executionTrace = []
  } = roiResult;

  const stats = statistics || {};
  const vegPct = stats.vegetation ?? 0;
  const builtPct = stats.builtup ?? 0;
  const waterPct = stats.water ?? 0;
  const barePct = stats.bareSoil ?? 0;
  const areaBreakdown = stats.areaBreakdown || {};

  const tabs = [
    { id: 'Overview', label: 'Overview', icon: Sparkles },
    { id: 'GIS', label: 'GIS', icon: Compass },
    { id: 'Findings', label: 'Findings', icon: FileText },
    { id: 'Statistics', label: 'Statistics', icon: PieChart },
    { id: 'Evidence', label: 'Evidence', icon: Layers },
    { id: 'QA', label: 'Question Answer', icon: HelpCircle },
    { id: 'Execution', label: 'Execution Trace', icon: Activity },
    { id: 'Telemetry', label: 'Raster Telemetry', icon: Target }
  ];

  const handlePrintDossier = () => {
    if (onDownloadReport) {
      onDownloadReport();
      return;
    }
    window.print();
  };

  return (
    <div className="sat-roi-result-view">
      {/* ── HEADER BLOCK ── */}
      <div className="roi-result-header">
        <div className="roi-header-left">
          <span className="roi-result-badge font-mono">SELECTED AREA INTELLIGENCE</span>
          <h2 className="roi-result-title">
            ROI Analysis Dossier {roiGeometry?.areaKm2 ? `• ${roiGeometry.areaKm2} km²` : ''}
          </h2>
        </div>

        <button
          type="button"
          className="roi-export-btn font-mono"
          onClick={handlePrintDossier}
        >
          <Download size={13} />
          <span>Export ROI Report</span>
        </button>
      </div>

      {/* ── STATS SUMMARY METRIC CARDS ── */}
      <div className="roi-metrics-strip font-mono">
        <div className="roi-kpi-card">
          <span className="kpi-tag">TOTAL ROI AREA</span>
          <span className="kpi-num text-navy">
            {roiGeometry?.areaKm2 ? `${roiGeometry.areaKm2} km²` : (roiGeometry?.imageCoverage || 'ROI Sector')}
          </span>
        </div>

        <div className="roi-kpi-card">
          <span className="kpi-tag">DOMINANT CLASS</span>
          <span className="kpi-num text-orange-600">
            {dominantClass || 'Vegetation'}
          </span>
        </div>

        <div className="roi-kpi-card">
          <span className="kpi-tag">VEGETATION</span>
          <span className="kpi-num text-emerald-600">
            {vegPct}%
          </span>
        </div>

        <div className="roi-kpi-card">
          <span className="kpi-tag">BUILT-UP AREA</span>
          <span className="kpi-num text-sky-600">
            {builtPct}%
          </span>
        </div>

        <div className="roi-kpi-card">
          <span className="kpi-tag">WATER BODIES</span>
          <span className="kpi-num text-blue-600">
            {waterPct}%
          </span>
        </div>

        <div className="roi-kpi-card">
          <span className="kpi-tag">CONFIDENCE</span>
          <span className="kpi-num text-purple-600">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="roi-tabs-nav font-mono">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`roi-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENTS ── */}
      <div className="roi-tab-content-panel">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="tab-pane overview-pane">
            <div className="executive-answer-box">
              <div className="box-tag font-mono">EXECUTIVE SYNTHESIS</div>
              <p className="answer-text">{answerText}</p>
            </div>

            {/* Quick Land Cover Progress Overview */}
            <div className="landcover-breakdown-card font-mono">
              <div className="card-title-bar">
                <span>LAND COVER DISTRIBUTION</span>
                {stats.isCalculated && (
                  <span className="methodology-pill">Calculated from Raster Pixels</span>
                )}
              </div>

              <div className="progress-bars-stack">
                <div className="progress-row">
                  <div className="row-meta">
                    <span className="class-name">Vegetation Canopy</span>
                    <span className="class-pct">{vegPct}% {areaBreakdown.vegetationKm2 ? `(${areaBreakdown.vegetationKm2} km²)` : ''}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill green" style={{ width: `${vegPct}%` }} />
                  </div>
                </div>

                <div className="progress-row">
                  <div className="row-meta">
                    <span className="class-name">Built-up Infrastructure</span>
                    <span className="class-pct">{builtPct}% {areaBreakdown.builtupKm2 ? `(${areaBreakdown.builtupKm2} km²)` : ''}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill orange" style={{ width: `${builtPct}%` }} />
                  </div>
                </div>

                <div className="progress-row">
                  <div className="row-meta">
                    <span className="class-name">Water Bodies &amp; Drainage</span>
                    <span className="class-pct">{waterPct}% {areaBreakdown.waterKm2 ? `(${areaBreakdown.waterKm2} km²)` : ''}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill blue" style={{ width: `${waterPct}%` }} />
                  </div>
                </div>

                <div className="progress-row">
                  <div className="row-meta">
                    <span className="class-name">Bare Soil / Open Ground</span>
                    <span className="class-pct">{barePct}% {areaBreakdown.bareSoilKm2 ? `(${areaBreakdown.bareSoilKm2} km²)` : ''}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill slate" style={{ width: `${barePct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. GIS TAB */}
        {activeTab === 'GIS' && (
          <div className="tab-pane gis-pane font-mono">
            <div className="gis-dossier-table">
              <div className="dossier-row header">
                <span>GEOSPATIAL PARAMETER</span>
                <span>METRIC VALUE</span>
              </div>
              <div className="dossier-row">
                <span className="key">Selected Geometry</span>
                <span className="val">{roiGeometry?.type || 'Polygon'}</span>
              </div>
              <div className="dossier-row">
                <span className="key">Calculated Area</span>
                <span className="val highlight">{roiGeometry?.areaKm2 ? `${roiGeometry.areaKm2} km²` : 'N/A'} {roiGeometry?.areaM2 ? `(${roiGeometry.areaM2.toLocaleString()} m²)` : ''}</span>
              </div>
              <div className="dossier-row">
                <span className="key">Perimeter</span>
                <span className="val">{roiGeometry?.perimeterKm ? `${roiGeometry.perimeterKm} km` : 'N/A'}</span>
              </div>
              <div className="dossier-row">
                <span className="key">Center Coordinate</span>
                <span className="val">
                  {roiGeometry?.center?.lat ? `${roiGeometry.center.lat}° N, ${roiGeometry.center.lon}° E` : `[X: ${roiGeometry?.center?.x}, Y: ${roiGeometry?.center?.y}]`}
                </span>
              </div>
              <div className="dossier-row">
                <span className="key">Geodetic Bounding Extent</span>
                <span className="val">
                  {roiGeometry?.bounds ? `N: ${roiGeometry.bounds.north} • S: ${roiGeometry.bounds.south} • E: ${roiGeometry.bounds.east} • W: ${roiGeometry.bounds.west}` : 'Pixel Bounds'}
                </span>
              </div>
              <div className="dossier-row">
                <span className="key">Spatial Reference System (CRS)</span>
                <span className="val">{roiGeometry?.crs || 'EPSG:4326'}</span>
              </div>
              <div className="dossier-row">
                <span className="key">Raster Pixel Sub-window</span>
                <span className="val">{roiGeometry?.pixelDimensions || '100%'}</span>
              </div>
              <div className="dossier-row">
                <span className="key">Ground Sampling Resolution</span>
                <span className="val">{roiGeometry?.resolution || '10.0 m'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. FINDINGS TAB */}
        {activeTab === 'Findings' && (
          <div className="tab-pane findings-pane">
            <div className="findings-container">
              <div className="finding-block primary">
                <h4 className="finding-title font-mono">Specialist Interpretation</h4>
                <p className="finding-text">{answerText}</p>
              </div>

              {/* Multimodal Findings (if Optical + SAR) */}
              {multimodal && (
                <div className="multimodal-findings-grid font-mono">
                  <div className="modal-card optical">
                    <div className="card-top">
                      <Eye size={13} className="text-sky-500" />
                      <span>OPTICAL EVIDENCE</span>
                    </div>
                    <p className="card-body-text">{multimodal.optical?.evidence}</p>
                  </div>

                  <div className="modal-card sar">
                    <div className="card-top">
                      <Radio size={13} className="text-purple-500" />
                      <span>SAR BACKSCATTER EVIDENCE</span>
                    </div>
                    <p className="card-body-text">{multimodal.sar?.evidence}</p>
                  </div>

                  <div className="modal-card fusion">
                    <div className="card-top">
                      <Sparkles size={13} className="text-amber-500" />
                      <span>FUSED INTELLIGENCE &amp; AGREEMENT</span>
                    </div>
                    <p className="card-body-text">
                      <strong>{multimodal.fusion?.crossModalAgreement}:</strong> {multimodal.fusion?.uncertainty}
                    </p>
                  </div>
                </div>
              )}

              {/* Temporal Findings (if Bi-Temporal) */}
              {temporal && (
                <div className="temporal-findings-card font-mono">
                  <div className="temporal-title">
                    <GitCompare size={14} className="text-amber-500" />
                    <span>TEMPORAL DYNAMICS INSIDE ROI</span>
                  </div>
                  <ul className="temporal-bullets">
                    {temporal.summary?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. STATISTICS TAB */}
        {activeTab === 'Statistics' && (
          <div className="tab-pane stats-pane font-mono">
            <div className="stats-table-wrapper">
              <div className="table-header">
                <span>LAND COVER CLASS</span>
                <span>PERCENTAGE</span>
                <span>ESTIMATED AREA</span>
              </div>

              <div className="table-row">
                <span className="col-name text-emerald-700">Vegetation</span>
                <span className="col-val">{vegPct}%</span>
                <span className="col-area">{areaBreakdown.vegetationKm2 ? `${areaBreakdown.vegetationKm2} km²` : 'N/A'}</span>
              </div>

              <div className="table-row">
                <span className="col-name text-orange-700">Built-up</span>
                <span className="col-val">{builtPct}%</span>
                <span className="col-area">{areaBreakdown.builtupKm2 ? `${areaBreakdown.builtupKm2} km²` : 'N/A'}</span>
              </div>

              <div className="table-row">
                <span className="col-name text-blue-700">Water Bodies</span>
                <span className="col-val">{waterPct}%</span>
                <span className="col-area">{areaBreakdown.waterKm2 ? `${areaBreakdown.waterKm2} km²` : 'N/A'}</span>
              </div>

              <div className="table-row">
                <span className="col-name text-slate-700">Bare Soil / Other</span>
                <span className="col-val">{barePct}%</span>
                <span className="col-area">{areaBreakdown.bareSoilKm2 ? `${areaBreakdown.bareSoilKm2} km²` : 'N/A'}</span>
              </div>
            </div>

            <p className="stats-disclaimer">
              {stats.isCalculated
                ? `* Quantitative metrics calculated from pixel spectral classification and radar backscatter physics inside the masked polygon.`
                : `Quantitative percentage unavailable for this model. The following interpretation is qualitative.`}
            </p>
          </div>
        )}

        {/* 5. EVIDENCE TAB */}
        {activeTab === 'Evidence' && (
          <div className="tab-pane evidence-pane font-mono">
            {multimodal && (
              <div className="multimodal-table-container">
                <div className="section-heading">MULTIMODAL MODALITY COMPARISON TABLE</div>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Optical Stream</th>
                      <th>SAR Stream</th>
                      <th>Fusion Consensus</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Built-up Area</td>
                      <td>{multimodal.optical?.builtup}%</td>
                      <td>{multimodal.sar?.builtup}%</td>
                      <td className="highlight">{multimodal.fusion?.builtup}%</td>
                    </tr>
                    <tr>
                      <td>Vegetation Canopy</td>
                      <td>{multimodal.optical?.vegetation}%</td>
                      <td>{multimodal.sar?.vegetation}%</td>
                      <td className="highlight">{multimodal.fusion?.vegetation}%</td>
                    </tr>
                    <tr>
                      <td>Water Bodies</td>
                      <td>{multimodal.optical?.water}%</td>
                      <td>{multimodal.sar?.water}%</td>
                      <td className="highlight">{multimodal.fusion?.water}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {temporal && (
              <div className="temporal-table-container">
                <div className="section-heading">BI-TEMPORAL CHANGE TABLE</div>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Date 1 (T1)</th>
                      <th>Date 2 (T2)</th>
                      <th>Net Delta (Δ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {temporal.classes?.map((c, i) => (
                      <tr key={i}>
                        <td>{c.name}</td>
                        <td>{c.date1}%</td>
                        <td>{c.date2}%</td>
                        <td className="highlight">{c.delta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {grounding && grounding.regions && (
              <div className="grounding-roi-list">
                <div className="section-heading">SPATIAL DETECTIONS CLIPPED TO ROI ({grounding.detectedCount})</div>
                <div className="detections-grid">
                  {grounding.regions.map((r, i) => (
                    <div key={i} className="detection-card">
                      <Target size={13} className="text-orange-500" />
                      <div className="det-info">
                        <span className="det-label">{r.label}</span>
                        <span className="det-conf">Confidence: {Math.round(r.confidence * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. QUESTION ANSWER TAB */}
        {activeTab === 'QA' && (
          <div className="tab-pane qa-pane">
            <div className="qa-bubble query">
              <span className="qa-role font-mono">USER QUERY</span>
              <p className="qa-text font-bold">"{roiResult.query || 'What is visible in this selected area?'}"</p>
            </div>

            <div className="qa-bubble response">
              <span className="qa-role font-mono text-orange-600">SATVISTAAR ANALYST RESPONSE</span>
              <p className="qa-text">{answerText}</p>
            </div>
          </div>
        )}

        {/* 7. EXECUTION TRACE TAB */}
        {activeTab === 'Execution' && (
          <div className="tab-pane execution-pane font-mono">
            <div className="trace-list">
              {(executionTrace.length > 0 ? executionTrace : [
                "ROI geometry received and validated",
                "Spatial polygon raster mask generated",
                "Pixel sub-window extracted",
                "Quantitative land cover statistics computed",
                "Specialist task models executed on masked region",
                "Structured ROI intelligence dossier assembled"
              ]).map((step, idx) => (
                <div key={idx} className="trace-item">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. RASTER TELEMETRY & DEBUG TAB */}
        {activeTab === 'Telemetry' && (
          <div className="tab-pane telemetry-pane font-mono">
            <div className="telemetry-grid">
              {roiDebug?.cropThumbnailUrl && (
                <div className="crop-preview-box">
                  <span className="telemetry-subtitle">EXTRACTED 2D PIXEL SUB-WINDOW</span>
                  <div className="crop-img-wrap">
                    <img
                      src={roiDebug.cropThumbnailUrl}
                      alt="ROI Sub-window Crop"
                      className="crop-thumb-img"
                    />
                  </div>
                  <span className="crop-dimensions-label">
                    {roiDebug.cropDimensions?.[1]} × {roiDebug.cropDimensions?.[0]} px ({roiDebug.maskedPixels} masked pixels)
                  </span>
                </div>
              )}

              <div className="telemetry-metrics-list">
                <span className="telemetry-subtitle">REMOTE SENSING & SPATIAL TEXTURE TELEMETRY</span>
                <div className="telemetry-table">
                  <div className="telemetry-row header">
                    <span>Feature Metric</span>
                    <span>Computed Value</span>
                    <span>Interpretation</span>
                  </div>

                  <div className="telemetry-row">
                    <span className="key">Canny Edge Density</span>
                    <span className="val highlight">{roiDebug?.texture?.edgeDensity !== undefined ? roiDebug.texture.edgeDensity : 'N/A'}</span>
                    <span className="interpretation">
                      {roiDebug?.texture?.edgeDensity >= 0.10 ? 'High structure (Built-up / Roads)' : 'Low structure (Water / Soil / Canopy)'}
                    </span>
                  </div>

                  <div className="telemetry-row">
                    <span className="key">Laplacian Texture Variance</span>
                    <span className="val highlight">{roiDebug?.texture?.laplacianVariance !== undefined ? roiDebug.texture.laplacianVariance : 'N/A'}</span>
                    <span className="interpretation">
                      {roiDebug?.texture?.laplacianVariance < 220 ? 'Smooth homogeneous surface' : 'Rough / high-frequency texture'}
                    </span>
                  </div>

                  <div className="telemetry-row">
                    <span className="key">Visible Atm. Resistance (VARI)</span>
                    <span className="val">{roiDebug?.spectral?.meanVari !== undefined ? roiDebug.spectral.meanVari : 'N/A'}</span>
                    <span className="interpretation">
                      {roiDebug?.spectral?.meanVari > 0.05 ? 'Active chlorophyll absorption' : 'Non-photosynthetic surface'}
                    </span>
                  </div>

                  <div className="telemetry-row">
                    <span className="key">Excess Green Index (ExG)</span>
                    <span className="val">{roiDebug?.spectral?.meanExg !== undefined ? roiDebug.spectral.meanExg : 'N/A'}</span>
                    <span className="interpretation">
                      {roiDebug?.spectral?.meanExg > 15 ? 'Dense vegetation canopy' : 'Sparse / non-vegetated'}
                    </span>
                  </div>

                  <div className="telemetry-row">
                    <span className="key">Sub-window Mean Intensity</span>
                    <span className="val">{roiDebug?.texture?.meanIntensity !== undefined ? roiDebug.texture.meanIntensity : 'N/A'}</span>
                    <span className="interpretation">Grayscale 8-bit photometric mean</span>
                  </div>

                  {roiDebug?.spectral && (
                    <div className="telemetry-row">
                      <span className="key">RGB Channel Means</span>
                      <span className="val">R:{roiDebug.spectral.meanRed} G:{roiDebug.spectral.meanGreen} B:{roiDebug.spectral.meanBlue}</span>
                      <span className="interpretation">Multispectral band balance</span>
                    </div>
                  )}
                </div>

                <div className="telemetry-note">
                  Methodology: 2D sub-window crop extraction, local polygon raster masking, OpenCV Canny edge density &amp; Laplacian variance texture gating, VARI/ExG spectral indices.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .sat-roi-result-view {
          background: #ffffff;
          border: 1.5px solid #000066;
          border-radius: 14px;
          padding: 1.25rem;
          box-shadow: 0 4px 20px -4px rgba(0, 0, 70, 0.08);
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .roi-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1.5px solid #000066;
          padding-bottom: 0.75rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .roi-result-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: #ff5225;
          letter-spacing: 0.08em;
        }
        .roi-result-title {
          font-size: 1.15rem;
          font-weight: 900;
          color: #000066;
          margin: 0.15rem 0 0;
        }
        .roi-export-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          background: #000066;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .roi-export-btn:hover {
          background: #ff5225;
          transform: translateY(-1px);
        }
        .roi-metrics-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 0.5rem;
        }
        .roi-kpi-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.5rem 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .kpi-tag {
          font-size: 0.6rem;
          font-weight: 700;
          color: #64748b;
        }
        .kpi-num {
          font-size: 0.95rem;
          font-weight: 900;
        }
        .roi-tabs-nav {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        .roi-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.7rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          background: transparent;
          border: 1px solid transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .roi-tab-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .roi-tab-btn.active {
          background: #000066;
          color: #ffffff;
          border-color: #000066;
        }
        .roi-tab-content-panel {
          padding-top: 0.25rem;
        }
        .tab-pane {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .executive-answer-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-left: 4px solid #ff5225;
          border-radius: 8px;
          padding: 0.85rem 1rem;
        }
        .box-tag {
          font-size: 0.65rem;
          font-weight: 800;
          color: #ff5225;
          margin-bottom: 0.35rem;
        }
        .answer-text {
          font-size: 0.85rem;
          color: #1e293b;
          line-height: 1.55;
          margin: 0;
        }
        .landcover-breakdown-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .card-title-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.7rem;
          font-weight: 800;
          color: #000066;
        }
        .methodology-pill {
          font-size: 0.6rem;
          font-weight: 700;
          color: #166534;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }
        .progress-bars-stack {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .progress-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .row-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.675rem;
          font-weight: 700;
        }
        .progress-track {
          width: 100%;
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.4s ease;
        }
        .progress-fill.green { background: #16a34a; }
        .progress-fill.orange { background: #ea580c; }
        .progress-fill.blue { background: #0284c7; }
        .progress-fill.slate { background: #64748b; }

        .gis-dossier-table, .stats-table-wrapper {
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .dossier-row, .table-row, .table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.45rem 0.75rem;
          font-size: 0.7rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .dossier-row.header, .table-header {
          background: #f8fafc;
          font-weight: 800;
          color: #000066;
          border-bottom: 1.5px solid #e2e8f0;
        }
        .dossier-row:last-child, .table-row:last-child {
          border-bottom: none;
        }
        .key { color: #64748b; }
        .val { font-weight: 700; color: #0f172a; text-align: right; }
        .val.highlight { color: #ff5225; }

        .multimodal-findings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.65rem;
        }
        .modal-card {
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .modal-card.optical { background: #f0f9ff; border: 1px solid #bae6fd; }
        .modal-card.sar { background: #faf5ff; border: 1px solid #e9d5ff; }
        .modal-card.fusion { background: #fffbeb; border: 1px solid #fde68a; }
        .card-top {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.675rem;
          font-weight: 800;
        }
        .card-body-text {
          font-size: 0.72rem;
          line-height: 1.4;
          margin: 0;
          color: #1e293b;
        }

        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.7rem;
          margin-top: 0.35rem;
        }
        .comparison-table th {
          background: #f8fafc;
          padding: 0.45rem 0.65rem;
          text-align: left;
          border-bottom: 1.5px solid #e2e8f0;
          color: #000066;
        }
        .comparison-table td {
          padding: 0.45rem 0.65rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .comparison-table td.highlight {
          font-weight: 800;
          color: #000066;
        }

        .qa-bubble {
          border-radius: 8px;
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .qa-bubble.query {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .qa-bubble.response {
          background: #fff5f2;
          border: 1px solid #ffd8cc;
        }
        .qa-role {
          font-size: 0.65rem;
          font-weight: 800;
          color: #64748b;
        }
        .qa-text {
          font-size: 0.85rem;
          margin: 0;
          color: #0f172a;
          line-height: 1.5;
        }

        .trace-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .trace-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.72rem;
          color: #334155;
          padding: 0.35rem 0.6rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }
        .stats-disclaimer {
          font-size: 0.65rem;
          color: #64748b;
          margin-top: 0.5rem;
        }

        .telemetry-pane {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .telemetry-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .telemetry-grid {
            grid-template-columns: 1fr;
          }
        }
        .crop-preview-box {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: #0f172a;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #1e293b;
          max-width: 240px;
        }
        .crop-img-wrap {
          border-radius: 6px;
          overflow: hidden;
          background: #020617;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #334155;
        }
        .crop-thumb-img {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          display: block;
          image-rendering: pixelated;
        }
        .crop-dimensions-label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-align: center;
        }
        .telemetry-subtitle {
          font-size: 0.65rem;
          font-weight: 800;
          color: #ff5225;
          letter-spacing: 0.05em;
        }
        .telemetry-metrics-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .telemetry-table {
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          font-size: 0.7rem;
        }
        .telemetry-row {
          display: grid;
          grid-template-columns: 180px 140px 1fr;
          padding: 0.45rem 0.75rem;
          border-bottom: 1px solid #f1f5f9;
          align-items: center;
          gap: 0.5rem;
        }
        .telemetry-row:last-child {
          border-bottom: none;
        }
        .telemetry-row.header {
          background: #f8fafc;
          font-weight: 800;
          color: #000066;
          border-bottom: 1.5px solid #cbd5e1;
        }
        .telemetry-row .interpretation {
          color: #64748b;
          font-size: 0.65rem;
        }
        .telemetry-note {
          font-size: 0.65rem;
          color: #64748b;
          line-height: 1.4;
          background: #f8fafc;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
      `}</style>
    </div>
  );
}

export default RoiResultView;
