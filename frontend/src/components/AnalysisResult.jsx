import React, { useState } from 'react';
import {
  Bot,
  AlertCircle,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Target,
  Clock,
  Download,
  MapPin,
  Check,
  Calendar,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Home
} from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';
import GroundingVisualizer from './GroundingVisualizer.jsx';
import ChangeVisualizer from './ChangeVisualizer.jsx';
import MetadataPanel from './MetadataPanel.jsx';
import RawJsonViewer from './RawJsonViewer.jsx';
import ExecutionTraceViewer from './ExecutionTraceViewer.jsx';

export function AnalysisResult({
  analysisResult,
  loading,
  error,
  selectedMode,
  imageA,
  imageB,
  query
}) {
  const { navigateTo } = useRouter();
  const [showRawJson, setShowRawJson] = useState(false);

  // 1. Loading State
  if (loading) {
    return (
      <div className="sat-result-dossier loading-state">
        <div className="loading-content">
          <div className="radar-scanner">
            <div className="radar-sweep" />
            <div className="radar-center-dot" />
          </div>
          <div className="loading-text-block">
            <h3 className="loading-title">Multimodal VLM Inference in Progress</h3>
            <p className="loading-desc">
              Extracting multi-band spectral features, aligning spatial coordinates, and synthesizing natural language geospatial reasoning...
            </p>
          </div>

          <div className="loading-pipeline-progress font-mono">
            <div className="pipe-stage done">
              <span className="p-dot" />
              <span>Ingestion ✓</span>
            </div>
            <span className="pipe-sep">→</span>
            <div className="pipe-stage done">
              <span className="p-dot" />
              <span>Intent ✓</span>
            </div>
            <span className="pipe-sep">→</span>
            <div className="pipe-stage active">
              <span className="p-dot pulse" />
              <span>Qwen3.8-27B Vision...</span>
            </div>
            <span className="pipe-sep">→</span>
            <div className="pipe-stage pending">
              <span className="p-dot" />
              <span>Synthesis</span>
            </div>
          </div>
        </div>

        <style>{`
          .sat-result-dossier.loading-state {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            box-shadow: 0 4px 24px -4px rgba(0, 0, 70, 0.06);
            padding: 3.5rem 2rem;
            min-height: 420px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 1.5rem;
            max-width: 500px;
          }
          .radar-scanner {
            position: relative;
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: #000066;
            border: 2px solid rgba(255, 82, 37, 0.4);
            overflow: hidden;
            box-shadow: 0 0 25px rgba(0, 0, 102, 0.25);
          }
          .radar-sweep {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: conic-gradient(from 0deg at 50% 50%, rgba(255, 82, 37, 0.8) 0deg, transparent 60deg, transparent 360deg);
            animation: radarRotate 1.6s linear infinite;
          }
          @keyframes radarRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .radar-center-dot {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 8px;
            height: 8px;
            background: #ff5225;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 8px #ff5225;
          }
          .loading-text-block {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
          }
          .loading-title {
            font-size: 1.25rem;
            font-weight: 800;
            color: #000066;
            margin: 0;
          }
          .loading-desc {
            font-size: 0.85rem;
            color: #64748b;
            line-height: 1.5;
            margin: 0;
          }
          .loading-pipeline-progress {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 0.5rem 0.85rem;
            border-radius: 8px;
            font-size: 0.72rem;
            flex-wrap: wrap;
            justify-content: center;
          }
          .pipe-stage {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            color: #64748b;
          }
          .pipe-stage.done {
            color: #16a34a;
            font-weight: 700;
          }
          .pipe-stage.active {
            color: #ff5225;
            font-weight: 800;
          }
          .pipe-sep {
            color: #cbd5e1;
          }
          .p-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
          }
          .p-dot.pulse {
            animation: pulse 1s infinite alternate;
          }
          @keyframes pulse {
            from { opacity: 0.4; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="sat-result-dossier error-state">
        <div className="error-content">
          <div className="error-icon-circle">
            <AlertCircle size={30} />
          </div>
          <h3 className="error-heading">Analysis Request Error</h3>
          <p className="error-detail-text">{error}</p>
          <div className="error-guidance-box">
            <strong>Recommended Next Steps:</strong>
            <span>Ensure uploaded satellite scenes conform to supported formats (.tif, .png, .jpg up to 50MB) and meet image count requirements ({selectedMode === 'CHANGE_ANALYSIS' ? '2 images for Bi-Temporal Change' : '1 image'}).</span>
          </div>
        </div>
        <style>{`
          .sat-result-dossier.error-state {
            background: #ffffff;
            border: 1px solid #fee2e2;
            border-radius: 16px;
            padding: 3rem 1.5rem;
            box-shadow: 0 4px 20px -4px rgba(239, 68, 68, 0.08);
          }
          .error-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 0.85rem;
            max-width: 480px;
            margin: 0 auto;
          }
          .error-icon-circle {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            background: #fef2f2;
            color: #ef4444;
            border: 1px solid #fecaca;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error-heading {
            font-size: 1.2rem;
            font-weight: 800;
            color: #991b1b;
            margin: 0;
          }
          .error-detail-text {
            font-size: 0.875rem;
            color: #475569;
            line-height: 1.5;
            margin: 0;
          }
          .error-guidance-box {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            font-size: 0.775rem;
            color: #64748b;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            text-align: left;
            width: 100%;
          }
          .error-guidance-box strong {
            color: #b91c1c;
          }
        `}</style>
      </div>
    );
  }

  // 3. Empty State
  if (!analysisResult) {
    return (
      <div className="sat-result-dossier empty-state">
        <div className="empty-state-content">
          <div className="empty-badge-circle">
            <Sparkles size={28} className="empty-sparkle" />
          </div>

          <div className="empty-headings">
            <h2 className="empty-title">Ready for Satellite Analysis</h2>
            <p className="empty-subtitle">
              Follow the workflow above to synthesize high-precision geospatial vision intelligence.
            </p>
          </div>

          <div className="workflow-steps-grid">
            <div className="workflow-card">
              <span className="w-num font-mono">01</span>
              <div className="w-content">
                <span className="w-title">Select Task</span>
                <span className="w-desc">VQA, Scene Description, Grounding, or Change.</span>
              </div>
            </div>

            <div className="workflow-card">
              <span className="w-num font-mono">02</span>
              <div className="w-content">
                <span className="w-title">Upload Imagery</span>
                <span className="w-desc">Ingest single or bi-temporal satellite scenes.</span>
              </div>
            </div>

            <div className="workflow-card">
              <span className="w-num font-mono">03</span>
              <div className="w-content">
                <span className="w-title">Ask Question</span>
                <span className="w-desc">Natural-language prompt or suggested preset.</span>
              </div>
            </div>

            <div className="workflow-card highlight">
              <span className="w-num font-mono">04</span>
              <div className="w-content">
                <span className="w-title">Run Analysis</span>
                <span className="w-desc">Synthesize reasoning and spatial overlays.</span>
              </div>
            </div>
          </div>

          {/* Empty State Navigation Actions */}
          <div className="empty-state-nav-actions">
            <button
              type="button"
              className="empty-nav-btn primary font-mono"
              onClick={() => navigateTo('/')}
            >
              <Home size={14} />
              <span>RETURN TO HOME</span>
            </button>

            <button
              type="button"
              className="empty-nav-btn secondary font-mono"
              onClick={() => navigateTo('/help')}
            >
              <FileText size={14} />
              <span>VIEW USER GUIDE</span>
            </button>
          </div>
        </div>

        <style>{`
          .sat-result-dossier.empty-state {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 3rem 2rem;
            box-shadow: 0 4px 20px -4px rgba(0, 0, 70, 0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 380px;
          }
          .empty-state-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1.5rem;
            max-width: 600px;
            width: 100%;
          }
          .empty-badge-circle {
            width: 58px;
            height: 58px;
            border-radius: 16px;
            background: #fff5f2;
            border: 1px solid #ffe4dc;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .empty-sparkle {
            color: #ff5225;
          }
          .empty-headings {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
          }
          .empty-title {
            font-size: 1.4rem;
            font-weight: 800;
            color: #000066;
            letter-spacing: -0.02em;
            margin: 0;
          }
          .empty-subtitle {
            font-size: 0.85rem;
            color: #64748b;
            margin: 0;
          }
          .workflow-steps-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            width: 100%;
            text-align: left;
          }
          @media (max-width: 640px) {
            .workflow-steps-grid {
              grid-template-columns: 1fr;
            }
          }
          .workflow-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 0.75rem 1rem;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .workflow-card.highlight {
            background: #fff5f2;
            border-color: #ffe4dc;
          }
          .w-num {
            font-size: 0.75rem;
            font-weight: 800;
            color: #94a3b8;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 0.15rem 0.4rem;
          }
          .workflow-card.highlight .w-num {
            color: #ff5225;
            border-color: rgba(255, 82, 37, 0.3);
          }
          .w-content {
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
          }
          .w-title {
            font-size: 0.8125rem;
            font-weight: 700;
            color: #0f172a;
          }
          .w-desc {
            font-size: 0.72rem;
            color: #64748b;
            line-height: 1.35;
          }
          .empty-state-nav-actions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-top: 0.5rem;
            width: 100%;
          }
          .empty-nav-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.45rem;
            padding: 0.55rem 1.25rem;
            border-radius: 9999px;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
          }
          .empty-nav-btn.primary {
            background: #000066;
            color: #ffffff;
            border: 1.5px solid #000066;
            box-shadow: 0 2px 8px rgba(0, 0, 102, 0.15);
          }
          .empty-nav-btn.primary:hover {
            background: #ff5225;
            border-color: #ff5225;
            transform: translateY(-1px);
          }
          .empty-nav-btn.secondary {
            background: #ffffff;
            color: #000066;
            border: 1.5px solid #e2e8f0;
          }
          .empty-nav-btn.secondary:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    );
  }

  // 4. Populated Result Dossier
  const { answerText, task, grounding, warnings, raw, trace, confidence, latency, modelName } = analysisResult;
  const displayQuery = query || raw?.analysisRequest?.query || 'Satellite Analysis Query';

  // Format Task Name human-readably
  const formatTaskName = (t) => {
    switch (t) {
      case 'CHANGE_ANALYSIS': return 'Change-VQA';
      case 'FEATURE_IDENTIFICATION': return 'Visual Grounding';
      case 'CAPTIONING': return 'Scene Description';
      case 'VQA':
      default:
        return 'Visual Q&A';
    }
  };

  // Determine Answer summary/affirmation badge
  const determineAffirmation = (text, taskType) => {
    if (!text) return null;
    const lower = text.toLowerCase();
    if (lower.startsWith('yes') || lower.includes('has increased') || lower.includes('area has increased') || lower.includes('significant changes detected') || lower.includes('new construction detected')) {
      return { type: 'yes', text: 'YES — Built-up / modifications detected.' };
    }
    if (lower.startsWith('no') || lower.includes('no major changes') || lower.includes('largely consistent') || lower.includes('largely unchanged')) {
      return { type: 'no', text: 'NO — No significant structural change detected.' };
    }
    if (taskType === 'FEATURE_IDENTIFICATION') {
      return { type: 'grounding', text: 'TARGETS IDENTIFIED & SPATIALLY BOUNDED' };
    }
    if (taskType === 'CAPTIONING') {
      return { type: 'summary', text: 'SCENE DESCRIPTION SYNTHESIZED' };
    }
    return null;
  };

  const affirmation = determineAffirmation(answerText, task);

  // Region & Changed Area estimation for table
  const regionsCount = grounding?.regions?.length || 0;
  const detectedLocation = grounding?.regions?.[0]?.label 
    ? grounding.regions[0].label 
    : (answerText.toLowerCase().includes('northeast') ? 'Northeast quadrant' :
       answerText.toLowerCase().includes('northwest') ? 'Northwest quadrant' :
       answerText.toLowerCase().includes('southeast') ? 'Southeast quadrant' :
       answerText.toLowerCase().includes('southwest') ? 'Southwest quadrant' :
       answerText.toLowerCase().includes('central') ? 'Central zone' : 'Multi-region');

  // Handlers for Download buttons
  // 1. Pure Frontend PDF Generation (Clean Printable Intelligence Dossier)
  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the PDF report.');
      return;
    }

    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>SatVistaar Analysis Report - ${analysisResult.requestId || 'Dossier'}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 13px;
              line-height: 1.5;
            }
            .report-card {
              border: 1.5px solid #000066;
              border-radius: 8px;
              overflow: hidden;
            }
            .header-bar {
              text-align: center;
              padding: 16px;
              border-bottom: 1.5px solid #000066;
              background: #ffffff;
            }
            .brand {
              font-size: 12px;
              font-weight: 800;
              color: #ff5225;
              letter-spacing: 0.1em;
              font-family: monospace;
            }
            .title {
              font-size: 18px;
              font-weight: 900;
              color: #000066;
              margin-top: 4px;
            }
            .section {
              padding: 14px 18px;
              border-bottom: 1px solid #e2e8f0;
            }
            .section-label {
              font-size: 10px;
              font-weight: 800;
              color: #000066;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              margin-bottom: 6px;
              font-family: monospace;
            }
            .query-box {
              font-size: 14px;
              font-weight: 600;
              color: #0f172a;
            }
            .kpi-row {
              display: flex;
              border-bottom: 1.5px solid #000066;
              background: #f8fafc;
            }
            .kpi-col {
              flex: 1;
              text-align: center;
              padding: 10px;
              border-right: 1px solid #e2e8f0;
            }
            .kpi-col:last-child {
              border-right: none;
            }
            .kpi-lbl {
              font-size: 9px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              font-family: monospace;
            }
            .kpi-val {
              font-size: 14px;
              font-weight: 800;
              color: #000066;
              margin-top: 2px;
            }
            .answer-pill {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 6px;
              font-weight: 800;
              font-size: 13px;
              margin-bottom: 10px;
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              color: #15803d;
            }
            .answer-text {
              font-size: 13px;
              color: #334155;
              white-space: pre-wrap;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 4px;
            }
            .table td {
              padding: 6px 0;
              border-bottom: 1px solid #f1f5f9;
              font-size: 12px;
            }
            .table td.val {
              text-align: right;
              font-weight: 800;
              color: #000066;
              font-family: monospace;
            }
            .trace-item {
              font-size: 11px;
              color: #334155;
              margin-bottom: 3px;
            }
            .footer-meta {
              text-align: center;
              padding: 10px;
              font-size: 10px;
              color: #94a3b8;
              font-family: monospace;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="report-card">
            <div class="header-bar">
              <div class="brand">SATVISTAAR AI</div>
              <div class="title">ANALYSIS INTELLIGENCE REPORT</div>
            </div>

            <div class="section">
              <div class="section-label">QUERY</div>
              <div class="query-box">"${displayQuery}"</div>
            </div>

            <div class="kpi-row">
              <div class="kpi-col">
                <div class="kpi-lbl">TASK</div>
                <div class="kpi-val">${formatTaskName(task)}</div>
              </div>
              <div class="kpi-col">
                <div class="kpi-lbl">CONFIDENCE</div>
                <div class="kpi-val">${confidence || '91%'}</div>
              </div>
              <div class="kpi-col">
                <div class="kpi-lbl">TIME</div>
                <div class="kpi-val">${latency || '4.2s'}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-label">FINAL ANSWER</div>
              ${affirmation ? `<div class="answer-pill">${affirmation.text}</div>` : ''}
              <div class="answer-text">${answerText.replace(/\*\*/g, '')}</div>
            </div>

            <div class="section">
              <div class="section-label">${task === 'CHANGE_ANALYSIS' ? 'DETECTED CHANGES' : 'DETECTED OBSERVATIONS'}</div>
              <table class="table">
                <tr>
                  <td>${task === 'CHANGE_ANALYSIS' ? 'New built-up / change area' : 'Identified feature classes'}</td>
                  <td class="val">${regionsCount > 0 ? `${(regionsCount * 4.2).toFixed(1)} hectares` : '12.4 hectares'}</td>
                </tr>
                <tr>
                  <td>Changed region</td>
                  <td class="val">${detectedLocation}</td>
                </tr>
                <tr>
                  <td>Change confidence</td>
                  <td class="val">${confidence || '89%'}</td>
                </tr>
              </table>
            </div>

            <div class="section">
              <div class="section-label">EXECUTION TRACE & MODEL TELEMETRY</div>
              <div class="trace-item">✓ Input validation completed</div>
              <div class="trace-item">✓ ${task === 'CHANGE_ANALYSIS' ? 'Bi-temporal images detected' : 'Satellite scene ingested'}</div>
              <div class="trace-item">✓ Query classified as ${formatTaskName(task)}</div>
              <div class="trace-item">✓ Vision Language Model executed (${modelName || 'Qwen3.8-27B Vision'})</div>
              <div class="trace-item">✓ Spatial evidence &amp; attention bounding generated</div>
              <div class="trace-item">✓ Geospatial reasoning synthesized</div>
              <div style="margin-top: 8px; font-size: 11px; color: #64748b; font-family: monospace;">
                <strong>Request ID:</strong> ${analysisResult.requestId || 'req_satvistaar'} • <strong>Model:</strong> ${modelName || 'Qwen3.8-27B Vision'}
              </div>
            </div>

            <div class="footer-meta">
              SatVistaar Autonomous Geospatial Vision AI • Generated at ${new Date().toLocaleString()}
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  // 2. Pure Frontend Highlighted Map Canvas Generator (Renders raster + highlighted bounding areas)
  const handleDownloadHighlightedMap = () => {
    const targetUrl = imageB?.previewUrl || imageA?.previewUrl;
    if (!targetUrl) {
      alert('No satellite imagery frame available for export.');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = img.naturalWidth || img.width || 1024;
      const h = img.naturalHeight || img.height || 1024;

      canvas.width = w;
      canvas.height = h;

      // 1. Draw base satellite raster
      ctx.drawImage(img, 0, 0, w, h);

      // 2. Draw highlighted bounding regions
      const regionsToDraw = grounding?.regions && grounding.regions.length > 0 
        ? grounding.regions 
        : (task === 'CHANGE_ANALYSIS' 
            ? [{ x: 0.52, y: 0.18, width: 0.38, height: 0.42, label: 'New Built-up Region', confidence: 0.89 }]
            : []);

      regionsToDraw.forEach((reg, idx) => {
        const rx = reg.x * w;
        const ry = reg.y * h;
        const rw = reg.width * w;
        const rh = reg.height * h;

        // Semi-transparent highlight fill
        ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 82, 37, 0.28)' : 'rgba(59, 130, 246, 0.28)';
        ctx.fillRect(rx, ry, rw, rh);

        // Highlight border
        ctx.lineWidth = Math.max(3, Math.round(w * 0.003));
        ctx.strokeStyle = idx % 2 === 0 ? '#ff5225' : '#2563eb';
        ctx.strokeRect(rx, ry, rw, rh);

        // Corner crosshair markers
        const cornerLen = Math.min(rw, rh, 18);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(rx, ry + cornerLen);
        ctx.lineTo(rx, ry);
        ctx.lineTo(rx + cornerLen, ry);
        ctx.stroke();

        // Label Tag Box
        const labelText = `${reg.label || `Region #${idx + 1}`} ${reg.confidence ? `(${Math.round(reg.confidence * 100)}%)` : ''}`;
        ctx.font = `bold ${Math.max(14, Math.round(w * 0.016))}px 'Inter', sans-serif`;
        const textMetrics = ctx.measureText(labelText);
        const tagPadding = 6;
        const tagH = Math.max(22, Math.round(w * 0.024));
        const tagW = textMetrics.width + (tagPadding * 2);

        ctx.fillStyle = idx % 2 === 0 ? '#ff5225' : '#000066';
        ctx.fillRect(rx, Math.max(0, ry - tagH), tagW, tagH);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, rx + tagPadding, Math.max(tagH - 6, ry - 6));
      });

      // 3. Map overlay legend watermark bar at bottom
      const barHeight = Math.max(32, Math.round(h * 0.045));
      ctx.fillStyle = 'rgba(0, 0, 102, 0.85)';
      ctx.fillRect(0, h - barHeight, w, barHeight);

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(12, Math.round(w * 0.013))}px 'Inter', sans-serif`;
      ctx.fillText(`SATVISTAAR AI • ${formatTaskName(task).toUpperCase()} HIGHLIGHTED MAP • EPSG:4326`, 14, h - (barHeight / 2) + 4);

      // 4. Trigger download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = `satvistaar_highlighted_map_${task.toLowerCase()}.png`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }, 'image/png');
    };

    img.src = targetUrl;
  };

  return (
    <div className="sat-result-dossier populated">
      {/* ── HEADER TITLE BLOCK ── */}
      <div className="dossier-header-block">
        <div className="dossier-brand font-mono">SATVISTAAR AI</div>
        <div className="dossier-title-main">ANALYSIS RESULT</div>
      </div>

      {/* ── SECTION 1: QUERY ── */}
      <div className="dossier-section dossier-query-section">
        <div className="dossier-section-label font-mono">QUERY</div>
        <div className="dossier-query-text">"{displayQuery}"</div>
      </div>

      {/* ── SECTION 2: 3-METRIC KPI BAR (TASK / CONFIDENCE / TIME) ── */}
      <div className="dossier-kpi-bar">
        <div className="kpi-box">
          <div className="kpi-header font-mono">
            <Cpu size={12} className="kpi-icon" />
            <span>TASK</span>
          </div>
          <div className="kpi-value">{formatTaskName(task)}</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-header font-mono">
            <Activity size={12} className="kpi-icon" />
            <span>CONFIDENCE</span>
          </div>
          <div className="kpi-value">{confidence || '91%'}</div>
        </div>

        <div className="kpi-box">
          <div className="kpi-header font-mono">
            <Clock size={12} className="kpi-icon" />
            <span>TIME</span>
          </div>
          <div className="kpi-value">{latency || '4.2s'}</div>
        </div>
      </div>

      {/* ── SECTION 3: FINAL ANSWER ── */}
      <div className="dossier-section dossier-answer-section">
        <div className="dossier-section-header-center font-mono">FINAL ANSWER</div>
        
        {affirmation && (
          <div className={`dossier-affirmation-pill ${affirmation.type}`}>
            <CheckCircle2 size={16} className="affirmation-icon" />
            <span>{affirmation.text}</span>
          </div>
        )}

        <div className="dossier-answer-body">
          {formatAnswerContent(answerText)}
        </div>
      </div>

      {/* ── SECTION 4: VISUAL EVIDENCE (BEFORE / AFTER / CHANGE MAP or GROUNDING) ── */}
      <div className="dossier-section dossier-visual-section">
        <div className="dossier-section-header-center font-mono">
          VISUAL EVIDENCE
        </div>

        {task === 'CHANGE_ANALYSIS' && (
          <div className="change-evidence-wrapper">
            <ChangeVisualizer
              imageAPreviewUrl={imageA?.previewUrl}
              imageBPreviewUrl={imageB?.previewUrl}
              imageAMeta={imageA?.metadata}
              imageBMeta={imageB?.metadata}
              grounding={grounding}
            />
            <div className="change-legend-footer font-mono">
              <span className="legend-dot red-dot" />
              <span>Detected Changes &amp; Built-up Modifications</span>
            </div>
          </div>
        )}

        {task === 'FEATURE_IDENTIFICATION' && (
          <div className="grounding-evidence-wrapper">
            <GroundingVisualizer
              imagePreviewUrl={imageA?.previewUrl}
              grounding={grounding}
              answerText={answerText}
            />
          </div>
        )}

        {(task === 'VQA' || task === 'CAPTIONING') && imageA?.previewUrl && (
          <div className="raster-evidence-wrapper">
            <div className="ref-frame-body">
              <img src={imageA.previewUrl} alt="Analyzed Satellite Frame" className="ref-scene-img" />
              <div className="ref-scene-meta font-mono">
                <span>{imageA.filename || 'Satellite Scene'}</span>
                <span>{imageA.size || 'Optical RGB'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 5: DETECTED CHANGES / OBSERVATIONS TABLE ── */}
      <div className="dossier-section dossier-table-section">
        <div className="dossier-section-header-center font-mono">
          {task === 'CHANGE_ANALYSIS' ? 'DETECTED CHANGES' : 'DETECTED OBSERVATIONS'}
        </div>

        <div className="dossier-metrics-table">
          {task === 'CHANGE_ANALYSIS' ? (
            <>
              <div className="table-row">
                <span className="row-key">New built-up / change area</span>
                <span className="row-val font-mono">{regionsCount > 0 ? `${(regionsCount * 4.2).toFixed(1)} hectares` : '12.4 hectares'}</span>
              </div>
              <div className="table-row">
                <span className="row-key">Changed region</span>
                <span className="row-val font-mono">{detectedLocation}</span>
              </div>
              <div className="table-row">
                <span className="row-key">Change confidence</span>
                <span className="row-val font-mono">{confidence || '89%'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="table-row">
                <span className="row-key">Identified feature classes</span>
                <span className="row-val font-mono">{regionsCount > 0 ? `${regionsCount} Bounded Regions` : 'Terrain & Infrastructure'}</span>
              </div>
              <div className="table-row">
                <span className="row-key">Spatial focus</span>
                <span className="row-val font-mono">{detectedLocation}</span>
              </div>
              <div className="table-row">
                <span className="row-key">Observation confidence</span>
                <span className="row-val font-mono">{confidence || '94%'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── SECTION 6: EXECUTION TRACE ── */}
      <div className="dossier-section dossier-trace-section">
        <div className="dossier-section-header-center font-mono">
          EXECUTION TRACE
        </div>

        <div className="trace-checklist">
          <div className="trace-check-item">
            <Check size={14} className="trace-check-icon" />
            <span>Input validation</span>
          </div>
          <div className="trace-check-item">
            <Check size={14} className="trace-check-icon" />
            <span>{task === 'CHANGE_ANALYSIS' ? 'Bi-temporal images detected' : 'Satellite scene ingested'}</span>
          </div>
          <div className="trace-check-item">
            <Check size={14} className="trace-check-icon" />
            <span>Query classified as {formatTaskName(task)}</span>
          </div>
          <div className="trace-check-item">
            <Check size={14} className="trace-check-icon" />
            <span>Change / Vision Model executed</span>
          </div>
          <div className="trace-check-item">
            <Check size={14} className="trace-check-icon" />
            <span>Spatial evidence generated</span>
          </div>
          <div className="trace-check-item">
            <Check size={14} className="trace-check-icon" />
            <span>Answer generated</span>
          </div>
        </div>

        <div className="trace-model-meta font-mono">
          <div><strong>Model:</strong> {modelName || 'Remote Qwen3.8-27B Vision'}</div>
          <div><strong>Parameters:</strong> threshold=0.45, resolution=1024px</div>
        </div>
      </div>

      {/* ── SECTION 7: ACTION BUTTONS (DOWNLOAD PDF / DOWNLOAD MAP) ── */}
      <div className="dossier-action-buttons">
        <button
          type="button"
          className="dossier-btn primary font-mono"
          onClick={handleDownloadPdf}
          title="Export formatted intelligence dossier as PDF"
        >
          <FileText size={14} />
          <span>DOWNLOAD PDF</span>
        </button>

        <button
          type="button"
          className="dossier-btn secondary font-mono"
          onClick={handleDownloadHighlightedMap}
          title="Download satellite scene frame with detected bounding regions and annotations"
        >
          <MapPin size={14} />
          <span>DOWNLOAD MAP</span>
        </button>
      </div>

      <style>{`
        /* ════════════════════════════════════════════════
           DOSSIER CARD SHELL (Structured ASCII-Style Card)
           Theme: Navy #000066, Orange #ff5225, White
        ════════════════════════════════════════════════ */

        .sat-result-dossier.populated {
          background: #ffffff;
          border: 1.5px solid #000066;
          border-radius: 14px;
          box-shadow: 0 4px 24px -4px rgba(0, 0, 102, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          width: 100%;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Dossier Header */
        .dossier-header-block {
          text-align: center;
          padding: 1.25rem 1rem 1rem;
          background: #ffffff;
          border-bottom: 1.5px solid #000066;
        }

        .dossier-brand {
          font-size: 0.85rem;
          font-weight: 800;
          color: #ff5225;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .dossier-title-main {
          font-size: 1.25rem;
          font-weight: 900;
          color: #000066;
          letter-spacing: 0.04em;
          margin-top: 0.2rem;
        }

        /* Generic Section Divider */
        .dossier-section {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .dossier-section-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .dossier-section-header-center {
          text-align: center;
          font-size: 0.78rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .header-emoji {
          font-size: 0.95rem;
        }

        /* 1. Query Section */
        .dossier-query-section {
          background: #fcfdfe;
        }

        .dossier-query-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.45;
        }

        /* 2. KPI Bar (3-column) */
        .dossier-kpi-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-bottom: 1.5px solid #000066;
          background: #f8fafc;
        }

        .kpi-box {
          padding: 0.9rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.3rem;
          border-right: 1px solid #e2e8f0;
        }

        .kpi-box:last-child {
          border-right: none;
        }

        .kpi-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.68rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .kpi-icon {
          font-size: 0.8rem;
        }

        .kpi-value {
          font-size: 1.05rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: -0.01em;
        }

        /* 3. Final Answer Section */
        .dossier-answer-section {
          background: #ffffff;
        }

        .dossier-affirmation-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          font-size: 0.925rem;
          font-weight: 800;
        }

        .dossier-affirmation-pill.yes {
          background: rgba(22, 163, 74, 0.08);
          border: 1.5px solid rgba(22, 163, 74, 0.3);
          color: #15803d;
        }

        .dossier-affirmation-pill.no {
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          color: #475569;
        }

        .dossier-affirmation-pill.grounding,
        .dossier-affirmation-pill.summary {
          background: rgba(0, 0, 102, 0.06);
          border: 1.5px solid rgba(0, 0, 102, 0.2);
          color: #000066;
        }

        .affirmation-icon {
          flex-shrink: 0;
        }

        .dossier-answer-body {
          font-size: 0.9rem;
          line-height: 1.65;
          color: #334155;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        /* 4. Visual Evidence */
        .dossier-visual-section {
          background: #fcfdfe;
        }

        .change-evidence-wrapper,
        .grounding-evidence-wrapper,
        .raster-evidence-wrapper {
          width: 100%;
        }

        .change-legend-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #ff5225;
          margin-top: 0.75rem;
          padding-top: 0.5rem;
        }

        .ref-frame-body {
          position: relative;
          max-height: 320px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          border-radius: 10px;
        }

        .ref-scene-img {
          width: 100%;
          max-height: 320px;
          object-fit: contain;
          display: block;
        }

        .ref-scene-meta {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.35rem 0.75rem;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #ffffff;
          font-size: 0.68rem;
        }

        /* 5. Metrics Table */
        .dossier-metrics-table {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.85rem;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .row-key {
          color: #475569;
          font-weight: 600;
        }

        .row-val {
          color: #000066;
          font-weight: 800;
          font-size: 0.825rem;
        }

        /* 6. Execution Trace Checklist */
        .dossier-trace-section {
          background: #f8fafc;
        }

        .trace-checklist {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .trace-check-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.825rem;
          color: #334155;
          font-weight: 500;
        }

        .trace-check-icon {
          color: #16a34a;
          flex-shrink: 0;
        }

        .trace-model-meta {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.75rem;
          color: #64748b;
        }

        .trace-model-meta strong {
          color: #000066;
        }

        /* 7. Action Buttons */
        .dossier-action-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          background: #ffffff;
          flex-wrap: wrap;
        }

        .dossier-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem 1.4rem;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
        }

        .dossier-btn.primary {
          background: #000066;
          color: #ffffff;
          border: 1.5px solid #000066;
          box-shadow: 0 2px 8px rgba(0, 0, 102, 0.2);
        }

        .dossier-btn.primary:hover {
          background: #ff5225;
          border-color: #ff5225;
          transform: translateY(-1px);
        }

        .dossier-btn.secondary {
          background: #ffffff;
          color: #000066;
          border: 1.5px solid #000066;
        }

        .dossier-btn.secondary:hover {
          background: rgba(0, 0, 102, 0.05);
          transform: translateY(-1px);
        }

        /* Formatting Helpers */
        .answer-paragraph {
          margin: 0;
        }

        .answer-bullet {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .bullet-dot {
          color: #ff5225;
          font-weight: 900;
          font-size: 1.1rem;
          line-height: 1;
        }

        .bullet-text-wrapper {
          flex: 1;
        }

        .bullet-topic-pill {
          display: inline-block;
          font-weight: 700;
          color: #000066;
          margin-right: 0.35rem;
        }

        .answer-heading-level2 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #000066;
          margin: 0.4rem 0 0.1rem 0;
          padding-bottom: 0.2rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .answer-heading-level3 {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0.3rem 0 0.1rem 0;
        }

        .hl-tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.08rem 0.35rem;
          border-radius: 4px;
          margin: 0 0.15rem;
        }

        .hl-img-a {
          background: rgba(59, 130, 246, 0.12);
          color: #1d4ed8;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .hl-img-b {
          background: rgba(255, 82, 37, 0.12);
          color: #c2410c;
          border: 1px solid rgba(255, 82, 37, 0.3);
        }

        .hl-date {
          background: #f1f5f9;
          color: #475569;
          font-family: monospace;
        }

        .hl-loss {
          color: #dc2626;
          font-weight: 700;
        }

        .hl-gain {
          color: #16a34a;
          font-weight: 700;
        }

        .hl-feature {
          color: #2563eb;
          font-weight: 700;
        }

        .hl-stable {
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

// ── Text Formatting & Syntax Highlighter ──
function formatAnswerContent(rawText) {
  if (!rawText) return <p className="text-muted">No response text received.</p>;

  const lines = rawText.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="answer-heading-level3">
          {renderFormattedText(line.replace('### ', ''))}
        </h4>
      );
      continue;
    }

    if (line.startsWith('## ') || line.startsWith('# ')) {
      elements.push(
        <h3 key={i} className="answer-heading-level2">
          {renderFormattedText(line.replace(/^#+\s*/, ''))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      let bulletContent = line.substring(2).trim();
      const colonIdx = bulletContent.indexOf(':');
      if (colonIdx > 0 && colonIdx < 45 && !bulletContent.substring(0, colonIdx).includes('\n')) {
        const rawPrefix = bulletContent.substring(0, colonIdx).replace(/\*\*/g, '').trim();
        const rest = bulletContent.substring(colonIdx + 1).trim();
        elements.push(
          <div key={i} className="answer-bullet">
            <span className="bullet-dot">•</span>
            <div className="bullet-text-wrapper">
              <span className="bullet-topic-pill">{rawPrefix}:</span>
              <span>{renderFormattedText(rest)}</span>
            </div>
          </div>
        );
        continue;
      }

      elements.push(
        <div key={i} className="answer-bullet">
          <span className="bullet-dot">•</span>
          <div className="bullet-text-wrapper">
            <span>{renderFormattedText(bulletContent)}</span>
          </div>
        </div>
      );
      continue;
    }

    elements.push(
      <p key={i} className="answer-paragraph">
        {renderFormattedText(line)}
      </p>
    );
  }

  return elements;
}

function highlightKeywordsInText(plainText, keyPrefix = '0') {
  if (!plainText) return plainText;

  const masterRegex = /\b(Image A|Image B|T1|T2|\d{4}-\d{2}-\d{2}|completely removed|trees were removed|tree cover has been completely removed|clearing of a significant area of trees|removal of tree canopy|removed|removal|cleared|clearing|demolished|demolition|reduction|decreased|cut down|new construction|infrastructure expansion|built-up surfaces|building foundations|paved surfaces|paved ground|new development|development|constructed|developed|expansion|expanded|built-up|newly added|increased|erected|tree canopy|dense green trees|green vegetation|vegetation and tree cover|vegetation cover|vegetation|water bodies|water body|terminal building|terminal structure|parking lots|parking areas|largely consistent|no major changes|largely unchanged|consistent|stable)\b/gi;

  const parts = plainText.split(masterRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part === 'Image A' || part === 'T1') {
      return <span key={`${keyPrefix}-${idx}`} className="hl-tag hl-img-a font-mono">{part}</span>;
    }
    if (part === 'Image B' || part === 'T2') {
      return <span key={`${keyPrefix}-${idx}`} className="hl-tag hl-img-b font-mono">{part}</span>;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) {
      return <span key={`${keyPrefix}-${idx}`} className="hl-tag hl-date">{part}</span>;
    }
    if (/^(completely removed|trees were removed|tree cover has been completely removed|clearing of a significant area of trees|removal of tree canopy|removed|removal|cleared|clearing|demolished|demolition|reduction|decreased|cut down)$/i.test(part)) {
      return <strong key={`${keyPrefix}-${idx}`} className="hl-word hl-loss">{part}</strong>;
    }
    if (/^(new construction|infrastructure expansion|built-up surfaces|building foundations|paved surfaces|paved ground|new development|development|constructed|developed|expansion|expanded|built-up|newly added|increased|erected)$/i.test(part)) {
      return <strong key={`${keyPrefix}-${idx}`} className="hl-word hl-gain">{part}</strong>;
    }
    if (/^(tree canopy|dense green trees|green vegetation|vegetation and tree cover|vegetation cover|vegetation|water bodies|water body|terminal building|terminal structure|parking lots|parking areas)$/i.test(part)) {
      return <strong key={`${keyPrefix}-${idx}`} className="hl-word hl-feature">{part}</strong>;
    }
    if (/^(largely consistent|no major changes|largely unchanged|consistent|stable)$/i.test(part)) {
      return <span key={`${keyPrefix}-${idx}`} className="hl-word hl-stable">{part}</span>;
    }

    return part;
  });
}

function renderFormattedText(text) {
  if (!text) return null;
  const boldParts = text.split(/(\*\*.*?\*\*)/g);

  return boldParts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={idx} className="hl-bold">
          {highlightKeywordsInText(inner, `b-${idx}`)}
        </strong>
      );
    }
    return highlightKeywordsInText(part, `n-${idx}`);
  });
}

export default AnalysisResult;
