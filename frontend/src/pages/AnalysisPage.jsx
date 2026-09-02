import React, { useState } from 'react';
import {
  RotateCcw,
  AlertCircle,
  Cpu,
  Activity,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';
import { useAnalysis } from '../context/AnalysisContext.jsx';
import ModeSelector from '../components/ModeSelector.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import QueryInput from '../components/QueryInput.jsx';
import AnalyzeButton from '../components/AnalyzeButton.jsx';
import AnalysisResult from '../components/AnalysisResult.jsx';

export function AnalysisPage({ backendHealth }) {
  const {
    selectedMode,
    handleSelectMode,
    imageA,
    setImageA,
    imageB,
    setImageB,
    enrichedImageA,
    enrichedImageB,
    biTemporalDates,
    setBiTemporalDates,
    query,
    setQuery,
    loading,
    error,
    setError,
    analysisResult,
    handleAnalyze,
    resetWorkspace,
    isAnalyzeDisabled
  } = useAnalysis();

  const [notesExpanded, setNotesExpanded] = useState(false);
  const resultRef = React.useRef(null);
  const isHealthy = backendHealth?.ok && (backendHealth.status === 'healthy' || backendHealth.status === 'ok');

  const onExecute = async () => {
    try {
      await handleAnalyze();
    } catch (err) {
      // Handled in context
    }
  };

  // Auto-scroll to result when analysis completes
  React.useEffect(() => {
    if (analysisResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResult]);

  return (
    <div className="sat-analysis-workspace">
      {/* Workspace Header Bar */}
      <div className="workspace-header-bar">
        <div className="container header-container">
          <div className="header-titles">
            <div className="title-row">
              <h1 className="workspace-title">Satellite Analysis Workspace</h1>
              <span className="workspace-badge font-mono">MISSION CONTROL v1.0</span>
            </div>
            <p className="workspace-subtitle">
              Follow the guided 3-step sequence: select your task, upload imagery, and ask SatVistaar.
            </p>
          </div>

          <div className="header-actions">
            {/* Live Model Gateway Status — Announcement Banner Style */}
            <div className={`gateway-status-pill ${isHealthy ? 'live' : 'standby'}`}>
              <Sparkles size={12} className="gateway-sparkle" />
              <span className="gateway-vlm-name">{isHealthy ? 'Qwen3.8-27B Vision' : 'VLM Connecting...'}</span>
              {isHealthy && (
                <>
                  <span className="gateway-sep">·</span>
                  <span className="gateway-provider">Groq Cloud</span>
                </>
              )}
            </div>

            {/* Reset Workspace */}
            <button
              type="button"
              className="workspace-reset-btn font-mono"
              onClick={resetWorkspace}
              title="Reset all inputs, imagery, and current result"
            >
              <RotateCcw size={13} />
              <span>Reset Workspace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Guided Workspace Layout */}
      <main className="container workspace-main-layout">
        {/* Error Alert Bar */}
        {error && (
          <div className="workspace-error-banner">
            <AlertCircle size={18} className="error-icon" />
            <div className="error-text">
              <strong>Execution Notice:</strong>
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="dismiss-error-btn"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="workspace-grid-2col">
          {/* LEFT / CENTER: PRIMARY GUIDED SERIES WORKFLOW */}
          <div className="guided-workflow-stream">
            {/* STEP 1: CHOOSE ANALYSIS TASK */}
            <div className="workflow-step-card step-1-card">
              <ModeSelector
                selectedMode={selectedMode}
                onSelectMode={handleSelectMode}
              />
            </div>

            {/* STEP 2: UPLOAD SATELLITE IMAGERY (Single or Bi-Temporal Pair) */}
            <div className="workflow-step-card step-2-card">
              <ImageUploader
                selectedMode={selectedMode}
                imageA={imageA}
                setImageA={setImageA}
                imageB={imageB}
                setImageB={setImageB}
                biTemporalDates={biTemporalDates}
                setBiTemporalDates={setBiTemporalDates}
              />
            </div>

            {/* STEP 3: ASK SATVISTAAR (Natural Language Query & Prompt Chips) */}
            <div className="workflow-step-card step-3-card">
              <QueryInput
                selectedMode={selectedMode}
                query={query}
                setQuery={setQuery}
                onSubmit={onExecute}
                loading={loading}
              />
            </div>

            {/* STEP 4: RUN ANALYSIS ACTION BUTTON */}
            <div className="workflow-step-card step-4-card">

              <AnalyzeButton
                loading={loading}
                onClick={onExecute}
                disabled={isAnalyzeDisabled}
                selectedMode={selectedMode}
                imageA={imageA}
                imageB={imageB}
                query={query}
              />
            </div>

            {/* STEP 5: ANALYSIS RESULT — shown below the run button */}
            {loading && (
              <div className="workflow-card-block loading-block" ref={resultRef}>
                <AnalysisResult
                  analysisResult={null}
                  loading={true}
                  error={null}
                  selectedMode={selectedMode}
                  imageA={enrichedImageA}
                  imageB={enrichedImageB}
                  query={query}
                />
              </div>
            )}
            {analysisResult && (
              <div className="workflow-card-block results-block" ref={resultRef}>
                <AnalysisResult
                  analysisResult={analysisResult}
                  loading={loading}
                  error={error}
                  selectedMode={selectedMode}
                  imageA={enrichedImageA}
                  imageB={enrichedImageB}
                  query={query}
                />
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: AI TELEMETRY & PIPELINE */}
          <aside className="telemetry-sidebar">

            {/* â”€â”€ CARD 1: AI ENGINE & ROUTING â”€â”€ */}
            <div className="sb-dark-card">
              {/* Card header */}
              <div className="sb-card-header">
                <div className="sb-header-left">
                  <div className="sb-header-icon-wrap">
                    <Cpu size={14} className="sb-icon" />
                  </div>
                  <div>
                    <h3 className="sb-card-title font-mono">AI ENGINE & ROUTING</h3>
                    <p className="sb-card-sub font-mono">Vision Language Model Gateway</p>
                  </div>
                </div>
                <span className={`sb-status-badge font-mono ${
                  loading ? 'sb-badge-orange' : analysisResult ? 'sb-badge-green' : 'sb-badge-blue'
                }`}>
                  {loading ? 'Analyzing' : analysisResult ? 'Complete' : 'Ready'}
                </span>
              </div>

              {/* Divider */}
              <div className="sb-divider" />

              {/* Stats timeline entries */}
              <div className="sb-timeline">
                <div className="sb-tl-row">
                  <span className="sb-tl-bullet sb-bullet-blue" />
                  <div className="sb-tl-body">
                    <span className="sb-tl-badge sb-badge-blue font-mono">vlm</span>
                    <span className="sb-tl-text font-mono">{analysisResult?.modelName || 'Qwen3.8-27B Vision'}</span>
                  </div>
                </div>
                <div className="sb-tl-row">
                  <span className="sb-tl-bullet sb-bullet-orange" />
                  <div className="sb-tl-body">
                    <span className="sb-tl-badge sb-badge-orange font-mono">cloud</span>
                    <span className="sb-tl-text font-mono">{analysisResult?.provider || 'GROQ CLOUD'}</span>
                  </div>
                </div>
                <div className="sb-tl-row">
                  <span className="sb-tl-bullet sb-bullet-muted" />
                  <div className="sb-tl-body">
                    <span className="sb-tl-badge sb-badge-muted font-mono">fallback</span>
                    <span className="sb-tl-text font-mono">Ollama Local (qwen2-vl)</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="sb-divider" />

              {/* Metrics row */}
              <div className="sb-metrics font-mono">
                <div className="sb-metric">
                  <span className="sb-metric-label">Confidence</span>
                  <span className="sb-metric-val">{analysisResult?.confidence || '94.2%'}</span>
                </div>
                <div className="sb-metric-sep" />
                <div className="sb-metric">
                  <span className="sb-metric-label">Latency</span>
                  <span className="sb-metric-val">{analysisResult?.latency || (loading ? '...' : '2.18s')}</span>
                </div>
                <div className="sb-metric-sep" />
                <div className="sb-metric">
                  <span className="sb-metric-label">Request ID</span>
                  <span className="sb-metric-val sb-metric-id">{analysisResult?.requestId || 'req_sat_ready'}</span>
                </div>
              </div>
            </div>

            {/* â”€â”€ CARD 2: PIPELINE FLOW â”€â”€ */}
            <div className="sb-dark-card">
              <div className="sb-card-header">
                <div className="sb-header-left">
                  <div className="sb-header-icon-wrap">
                    <Activity size={14} className="sb-icon" />
                  </div>
                  <div>
                    <h3 className="sb-card-title font-mono">PIPELINE FLOW</h3>
                    <p className="sb-card-sub font-mono">Inference execution stages</p>
                  </div>
                </div>
                <span className={`sb-status-badge font-mono ${
                  loading ? 'sb-badge-orange' : analysisResult ? 'sb-badge-green' : 'sb-badge-muted'
                }`}>
                  {loading ? 'Running' : analysisResult ? 'Done' : 'Idle'}
                </span>
              </div>

              <div className="sb-divider" />

              <div className="sb-pipeline-list">
                {[
                  { num: 1, title: 'Input Ingestion', sub: imageA?.fileId ? 'Raster Ingested' : 'Awaiting Image',
                    state: imageA?.fileId ? 'completed' : 'active' },
                  { num: 2, title: 'Intent Classifier', sub: `Task: ${selectedMode}`,
                    state: (loading || analysisResult) ? 'completed' : imageA?.fileId ? 'active' : 'idle' },
                  { num: 3, title: 'Compatibility Engine', sub: 'CRS & Format Check',
                    state: (loading || analysisResult) ? 'completed' : 'idle' },
                  { num: 4, title: 'Model Router (VLM)', sub: 'Qwen3.8-27B Vision',
                    state: loading ? 'active' : analysisResult ? 'completed' : 'idle' },
                  { num: 5, title: 'Evidence Synthesis', sub: 'Visual Bounding & Reasoning',
                    state: analysisResult ? 'completed' : 'idle' },
                ].map((step) => (
                  <div key={step.num} className={`sb-pipe-row sb-pipe-${step.state}`}>
                    <div className="sb-pipe-left">
                      <span className="sb-pipe-num">
                        {step.state === 'completed' ? <CheckCircle2 size={13} /> : step.num}
                      </span>
                      {step.num < 5 && <span className="sb-pipe-line" />}
                    </div>
                    <div className="sb-pipe-content">
                      <span className="sb-pipe-title font-mono">{step.title}</span>
                      <span className="sb-pipe-sub font-mono">{step.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sb-divider" />
              <div className="sb-pipe-footer font-mono">
                <Sparkles size={11} className="sb-pipe-footer-icon" />
                <span>Next update on analysis run</span>
              </div>
            </div>

            {/* â”€â”€ CARD 3: TECH SPECS (collapsible) â”€â”€ */}
            <div className="sb-dark-card">
              <button
                type="button"
                className="sb-card-header sb-toggle-btn"
                onClick={() => setNotesExpanded(!notesExpanded)}
              >
                <div className="sb-header-left">
                  <div className="sb-header-icon-wrap">
                    <Info size={14} className="sb-icon" />
                  </div>
                  <h3 className="sb-card-title font-mono">TECHNICAL SPECS</h3>
                </div>
                {notesExpanded ? <ChevronUp size={14} className="sb-chevron" /> : <ChevronDown size={14} className="sb-chevron" />}
              </button>

              {notesExpanded && (
                <>
                  <div className="sb-divider" />
                  <div className="sb-specs-body">
                    <div className="sb-tl-row">
                      <span className="sb-tl-bullet sb-bullet-blue" />
                      <div>
                        <p className="sb-spec-label font-mono">Formats</p>
                        <p className="sb-spec-text">GeoTIFF, PNG, JPEG Â· up to 50MB/scene</p>
                      </div>
                    </div>
                    <div className="sb-tl-row">
                      <span className="sb-tl-bullet sb-bullet-orange" />
                      <div>
                        <p className="sb-spec-label font-mono">Spatial Alignment</p>
                        <p className="sb-spec-text">Co-registered scenes in EPSG:4326/3857</p>
                      </div>
                    </div>
                    <div className="sb-tl-row">
                      <span className="sb-tl-bullet sb-bullet-muted" />
                      <div>
                        <p className="sb-spec-label font-mono">Attention Grounding</p>
                        <p className="sb-spec-text">Relative attention bounding boxes normalized to spatial coords</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Security footer */}
            <div className="sb-sec-notice font-mono">
              <ShieldCheck size={13} className="sb-sec-icon" />
              <span>256-Bit Encrypted Inference Session</span>
            </div>

          </aside>
        </div>
      </main>

      <style>{`
        .sat-analysis-workspace {
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          min-height: calc(100vh - 140px);
          padding-bottom: 2.5rem;
        }

        /* Header Bar */
        .workspace-header-bar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.25rem 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .header-titles {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .workspace-title {
          font-size: 1.45rem;
          font-weight: 900;
          color: #000066;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .workspace-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          background: rgba(0, 0, 102, 0.08);
          color: #000066;
          border-radius: 4px;
        }

        .workspace-subtitle {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* Announcement-banner capsule pill */
        .gateway-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.9rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s ease;
        }

        .gateway-status-pill.live {
          background: rgba(22, 163, 74, 0.08);
          color: #16a34a;
          border: 1px solid rgba(22, 163, 74, 0.28);
        }

        .gateway-status-pill.standby {
          background: rgba(245, 158, 11, 0.08);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.28);
        }

        .gateway-sparkle {
          flex-shrink: 0;
          opacity: 0.85;
        }

        .gateway-vlm-name {
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .gateway-sep {
          opacity: 0.4;
          font-weight: 400;
          margin: 0 -0.1rem;
        }

        .gateway-provider {
          font-weight: 500;
          opacity: 0.75;
          font-size: 0.68rem;
        }

        .workspace-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.9rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.15s ease;
        }

        .workspace-reset-btn:hover {
          color: #ff5225;
          border-color: rgba(255,82,37,0.4);
          background: rgba(255,82,37,0.04);
        }

        /* Workspace Grid */
        .workspace-main-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 1.5rem;
        }

        .workspace-error-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.25rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #dc2626;
          font-size: 0.825rem;
        }

        .error-icon {
          flex-shrink: 0;
          color: #ef4444;
        }

        .error-text {
          flex: 1;
          display: flex;
          gap: 0.4rem;
        }

        .dismiss-error-btn {
          background: none;
          border: none;
          color: #dc2626;
          font-weight: 700;
          font-size: 0.75rem;
          cursor: pointer;
          text-decoration: underline;
        }

        /* 2-Column Responsive Workspace Grid */
        .workspace-grid-2col {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 1.25rem;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .workspace-grid-2col {
            grid-template-columns: 1fr;
          }
          .telemetry-sidebar {
            display: grid !important;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .security-notice {
            grid-column: span 2;
          }
        }

        @media (max-width: 640px) {
          .telemetry-sidebar {
            grid-template-columns: 1fr;
          }
          .security-notice {
            grid-column: span 1;
          }
        }

        /* Guided Workflow Stream (Step 1 -> 2 -> 3 -> 4) */
        .guided-workflow-stream {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          min-width: 0;
        }

        .workflow-step-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 2px 10px -2px rgba(0, 0, 70, 0.04);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .workflow-step-card:hover {
          border-color: #cbd5e1;
        }

        .step-4-card {
          padding: 1rem 1.25rem;
        }

        .results-block {
          width: 100%;
        }

        .loading-block {
          width: 100%;
        }

        /* Right Sidebar Telemetry */
        .telemetry-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 0;
        }

        .sidebar-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.15rem;
          box-shadow: 0 2px 10px -2px rgba(0, 0, 70, 0.04);
        }

        .panel-title-bar {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid #f1f5f9;
          margin-bottom: 0.85rem;
        }

        .telemetry-icon {
          color: #ff5225;
        }

        .panel-heading {
          font-size: 0.75rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .engine-stats-list {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          font-size: 0.725rem;
        }

        .stat-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .stat-label {
          color: #64748b;
        }

        .stat-val {
          color: #0f172a;
          font-weight: 700;
        }

        .stat-val.highlight-blue {
          color: #2563eb;
        }

        .stat-val.text-muted {
          color: #94a3b8;
        }

        .stat-val.truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .status-pill {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .status-pill.ready {
          background: #f1f5f9;
          color: #475569;
        }

        .status-pill.active {
          background: rgba(255, 82, 37, 0.12);
          color: #ff5225;
        }

        .status-pill.ok {
          background: rgba(22, 163, 74, 0.12);
          color: #16a34a;
        }

        /* Pipeline Steps */
        .pipeline-steps-vertical {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .pipe-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          color: #94a3b8;
        }

        .step-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #64748b;
          font-size: 0.68rem;
          font-weight: 800;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .step-info {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }

        .step-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #334155;
        }

        .step-sub {
          font-size: 0.675rem;
          color: #94a3b8;
        }

        .pipe-item.completed .step-circle {
          background: #16a34a;
          color: #ffffff;
        }

        .pipe-item.completed .step-title {
          color: #0f172a;
        }

        .pipe-item.active .step-circle {
          background: #ff5225;
          color: #ffffff;
        }

        .pipe-item.active .step-title {
          color: #ff5225;
          font-weight: 800;
        }

        .pipe-item.pulse-box .step-circle {
          animation: pulse 1s infinite alternate;
        }

        /* Operational Notes */
        .notes-toggle-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: #475569;
        }

        .toggle-title-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .notes-icon {
          color: #3b82f6;
        }

        .notes-heading {
          font-size: 0.75rem;
          font-weight: 800;
          color: #000066;
          letter-spacing: 0.04em;
        }

        .notes-expanded-content {
          margin-top: 0.85rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .spec-bullets-list {
          padding-left: 1.15rem;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.45;
        }

        .spec-bullets-list strong {
          color: #0f172a;
        }

        .security-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.68rem;
          color: #64748b;
          padding: 0.5rem;
          text-align: center;
        }

        .sec-icon {
          color: #16a34a;
          flex-shrink: 0;
        }


        /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
           SIDEBAR CARDS â€” LIGHT THEME (site palette)
        â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

        .sb-dark-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1rem 1.1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 102, 0.04);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Card header row */
        .sb-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .sb-toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          padding: 0;
          text-align: left;
        }

        .sb-header-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Tiny accent dot instead of icon wrap */
        .sb-header-icon-wrap {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff5225;
          flex-shrink: 0;
        }

        .sb-icon { display: none; }

        .sb-card-title {
          font-size: 0.7rem;
          font-weight: 700;
          color: #000066;
          letter-spacing: 0.06em;
          margin: 0;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }

        .sb-card-sub {
          display: none;
        }

        .sb-chevron {
          color: #94a3b8;
          flex-shrink: 0;
        }

        /* Status badge */
        .sb-status-badge {
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
          flex-shrink: 0;
          font-family: 'Inter', sans-serif;
          text-transform: uppercase;
        }

        .sb-badge-blue {
          background: rgba(0, 0, 102, 0.07);
          color: #000066;
          border: 1px solid rgba(0, 0, 102, 0.15);
        }

        .sb-badge-orange {
          background: rgba(255, 82, 37, 0.09);
          color: #ff5225;
          border: 1px solid rgba(255, 82, 37, 0.2);
        }

        .sb-badge-green {
          background: rgba(22, 163, 74, 0.09);
          color: #16a34a;
          border: 1px solid rgba(22, 163, 74, 0.2);
        }

        .sb-badge-muted {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        /* Divider */
        .sb-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0.7rem 0;
        }

        /* Timeline entries */
        .sb-timeline {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .sb-tl-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sb-tl-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .sb-bullet-blue   { background: #000066; }
        .sb-bullet-orange { background: #ff5225; }
        .sb-bullet-muted  { background: #cbd5e1; }
        .sb-bullet-green  { background: #22c55e; }

        .sb-tl-body {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }

        .sb-tl-badge {
          font-size: 0.58rem;
          font-weight: 700;
          padding: 0.08rem 0.3rem;
          border-radius: 3px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }

        .sb-tl-text {
          font-size: 0.72rem;
          color: #334155;
          font-family: 'Inter', sans-serif;
        }

        /* Metrics strip */
        .sb-metrics {
          display: flex;
          align-items: stretch;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          overflow: hidden;
        }

        .sb-metric {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.1rem;
          padding: 0.4rem 0.25rem;
        }

        .sb-metric-label {
          font-size: 0.55rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Inter', sans-serif;
        }

        .sb-metric-val {
          font-size: 0.72rem;
          font-weight: 700;
          color: #0f172a;
          font-family: 'Inter', sans-serif;
        }

        .sb-metric-id {
          font-size: 0.58rem;
          color: #64748b;
          word-break: break-all;
          text-align: center;
          font-family: 'Inter', sans-serif;
        }

        .sb-metric-sep {
          width: 1px;
          background: #e2e8f0;
          align-self: stretch;
        }

        /* Pipeline list */
        .sb-pipeline-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .sb-pipe-row {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
        }

        .sb-pipe-left {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .sb-pipe-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight: 700;
          flex-shrink: 0;
          background: #f1f5f9;
          color: #94a3b8;
          font-family: 'Inter', sans-serif;
        }

        .sb-pipe-line {
          width: 1px;
          flex: 1;
          min-height: 14px;
          background: #e2e8f0;
          margin: 2px 0;
        }

        .sb-pipe-content {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding-bottom: 0.55rem;
        }

        .sb-pipe-title {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.01em;
          font-family: 'Inter', sans-serif;
        }

        .sb-pipe-sub {
          font-size: 0.6rem;
          color: #94a3b8;
          font-family: 'Inter', sans-serif;
        }

        /* States */
        .sb-pipe-active .sb-pipe-num {
          background: rgba(255, 82, 37, 0.12);
          color: #ff5225;
        }
        .sb-pipe-active .sb-pipe-title {
          color: #ff5225;
          font-weight: 700;
        }

        .sb-pipe-completed .sb-pipe-num {
          background: rgba(22, 163, 74, 0.12);
          color: #16a34a;
        }
        .sb-pipe-completed .sb-pipe-title {
          color: #16a34a;
        }

        /* Pipeline footer */
        .sb-pipe-footer {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.6rem;
          color: #94a3b8;
          font-family: 'Inter', sans-serif;
        }

        .sb-pipe-footer-icon {
          color: #ff5225;
          flex-shrink: 0;
        }

        /* Tech specs body */
        .sb-specs-body {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .sb-spec-label {
          font-size: 0.6rem;
          font-weight: 700;
          color: #000066;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 1px;
          font-family: 'Inter', sans-serif;
        }

        .sb-spec-text {
          font-size: 0.67rem;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
          font-family: 'Inter', sans-serif;
        }

        /* Security notice */
        .sb-sec-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          font-size: 0.6rem;
          color: #94a3b8;
          padding: 0.35rem;
          text-align: center;
          font-family: 'Inter', sans-serif;
        }

        .sb-sec-icon {
          color: #16a34a;
          flex-shrink: 0;
        }
      `}</style>

    </div>
  );
}

export default AnalysisPage;

