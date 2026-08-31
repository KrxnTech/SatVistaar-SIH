import React from 'react';
import {
  RotateCcw,
  AlertCircle,
  Cpu,
  Activity,
  Info
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

  const isHealthy = backendHealth?.ok && (backendHealth.status === 'healthy' || backendHealth.status === 'ok');

  const onExecute = async () => {
    try {
      await handleAnalyze();
    } catch (err) {
      // Handled in context
    }
  };

  return (
    <div className="gov-dashboard-page">
      {/* Header Bar */}
      <div className="dashboard-header-bar">
        <div className="container header-inner">
          <div>
            <h1 className="dashboard-page-title">Satellite Analysis Dashboard</h1>
            <p className="dashboard-page-subtitle">
              Configure multi-band imagery inputs, analysis modes, and conversational natural-language queries.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <div className={`engine-badge font-mono ${isHealthy ? 'live' : 'standby'}`}>
              <span className="dot" />
              <span>{isHealthy ? 'Qwen3.8-27B Vision (Groq Cloud)' : 'VLM Connecting...'}</span>
            </div>

            <button
              type="button"
              className="reset-btn font-mono"
              onClick={resetWorkspace}
              title="Reset all inputs and current result"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <main className="container dashboard-main-container">
        {/* Error Alert */}
        {error && (
          <div className="dashboard-error-alert gov-card">
            <AlertCircle size={18} className="error-icon" />
            <div className="error-msg-block">
              <strong>Execution Notice:</strong>
              <span>{error}</span>
            </div>
            <button
              type="button"
              className="error-dismiss"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3-Column Structured Dashboard Grid */}
        <div className="dashboard-3col-grid">
          {/* COLUMN 1: LEFT - Analysis Configuration & Inputs */}
          <div className="dash-col input-col">
            <div className="dash-panel gov-card">
              <ModeSelector
                selectedMode={selectedMode}
                onSelectMode={handleSelectMode}
              />
            </div>

            <div className="dash-panel gov-card">
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

            <div className="dash-panel gov-card">
              <QueryInput
                selectedMode={selectedMode}
                query={query}
                setQuery={setQuery}
              />
            </div>

            <div className="dash-panel gov-card action-panel">
              <AnalyzeButton
                loading={loading}
                onClick={onExecute}
                disabled={isAnalyzeDisabled}
                selectedMode={selectedMode}
              />

              <div className="pipeline-notice font-mono">
                <span>Input: {imageA?.fileId ? 'Image Uploaded' : 'Awaiting Image'}</span>
                <span>•</span>
                <span>Mode: {selectedMode}</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: CENTER - Main Analysis Result & Visual Evidence */}
          <div className="dash-col result-col">
            <AnalysisResult
              analysisResult={analysisResult}
              loading={loading}
              error={error}
              selectedMode={selectedMode}
              imageA={enrichedImageA}
              imageB={enrichedImageB}
            />
          </div>

          {/* COLUMN 3: RIGHT - AI & Backend Execution Information */}
          <div className="dash-col execution-col">
            {/* AI Engine & Routing Specs */}
            <div className="dash-panel gov-card execution-panel">
              <div className="panel-title-row">
                <Cpu size={15} className="panel-icon" />
                <h3 className="panel-heading font-mono">AI ENGINE & ROUTING</h3>
              </div>

              <div className="engine-details-list font-mono">
                <div className="engine-row">
                  <span className="e-key">Provider:</span>
                  <span className="e-val uppercase t-blue">{analysisResult?.provider || 'GROQ CLOUD'}</span>
                </div>
                <div className="engine-row">
                  <span className="e-key">Selected VLM:</span>
                  <span className="e-val t-blue">{analysisResult?.modelName || 'Qwen3.8-27B Vision'}</span>
                </div>
                <div className="engine-row">
                  <span className="e-key">Fallback Model:</span>
                  <span className="e-val t-blue">Ollama Local (qwen2-vl)</span>
                </div>
                <div className="engine-row">
                  <span className="e-key">Execution Status:</span>
                  <span className={`status-val ${analysisResult?.status === 'success' ? 'ok' : 'neutral'}`}>
                    {analysisResult?.status ? analysisResult.status.toUpperCase() : (loading ? 'IN PROGRESS' : 'READY')}
                  </span>
                </div>
                <div className="engine-row">
                  <span className="e-key">Intent Confidence:</span>
                  <span className="e-val">{analysisResult?.confidence || 'N/A'}</span>
                </div>
                <div className="engine-row">
                  <span className="e-key">Latency:</span>
                  <span className="e-val">{analysisResult?.latency || (loading ? 'Measuring...' : 'N/A')}</span>
                </div>
                <div className="engine-row">
                  <span className="e-key">Request ID:</span>
                  <span className="e-val truncate" title={analysisResult?.requestId || 'N/A'}>
                    {analysisResult?.requestId || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Pipeline Routing Diagram */}
            <div className="dash-panel gov-card pipeline-flow-panel">
              <div className="panel-title-row">
                <Activity size={15} className="panel-icon" />
                <h3 className="panel-heading font-mono">PIPELINE FLOW</h3>
              </div>

              <div className="flow-steps-list font-mono">
                <div className={`flow-step ${imageA?.fileId ? 'completed' : 'active'}`}>
                  <span className="step-dot" />
                  <span className="step-text">1. Input Ingestion</span>
                </div>
                <div className={`flow-step ${loading || analysisResult ? 'completed' : ''}`}>
                  <span className="step-dot" />
                  <span className="step-text">2. Intent Classification</span>
                </div>
                <div className={`flow-step ${loading || analysisResult ? 'completed' : ''}`}>
                  <span className="step-dot" />
                  <span className="step-text">3. Compatibility Engine</span>
                </div>
                <div className={`flow-step ${loading ? 'active pulse' : analysisResult ? 'completed' : ''}`}>
                  <span className="step-dot" />
                  <span className="step-text">4. Model Router (VLM)</span>
                </div>
                <div className={`flow-step ${analysisResult ? 'completed' : ''}`}>
                  <span className="step-dot" />
                  <span className="step-text">5. Evidence Synthesis</span>
                </div>
              </div>
            </div>

            {/* Operational Notes */}
            <div className="dash-panel gov-card notes-panel">
              <div className="panel-title-row">
                <Info size={15} className="panel-icon" />
                <h3 className="panel-heading font-mono">OPERATIONAL NOTES</h3>
              </div>

              <ul className="notes-list">
                <li>Supported formats: GeoTIFF (.tif), PNG, JPG up to 50MB.</li>
                <li>Bi-Temporal Change requires two co-registered scenes.</li>
                <li>Visual Grounding generates approximate relative attention quadrants.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .gov-dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-bottom: 3.5rem;
          background: #08090d;
        }
        .dashboard-header-bar {
          background: #0c0e14;
          border-bottom: 1px solid var(--border-subtle);
          padding: 1.5rem 0;
        }
        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .dashboard-page-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        .dashboard-page-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .dashboard-header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .engine-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.725rem;
          font-weight: 700;
        }
        .engine-badge.live {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: var(--status-green-text);
        }
        .engine-badge.standby {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fbbf24;
        }
        .engine-badge .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }
        .reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          background: #141722;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          min-height: 36px;
        }
        .reset-btn:hover {
          background: #181c28;
          color: #ffffff;
          border-color: var(--border-medium);
        }

        .dashboard-main-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .dashboard-error-alert {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.25rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: var(--status-red-text);
          font-size: 0.85rem;
        }
        .error-icon {
          color: var(--status-red);
          flex-shrink: 0;
        }
        .error-msg-block {
          flex: 1;
          display: flex;
          gap: 0.4rem;
        }
        .error-dismiss {
          font-size: 0.75rem;
          color: var(--status-red-text);
          text-decoration: underline;
          min-height: auto;
        }

        /* 3-Column Grid */
        .dashboard-3col-grid {
          display: grid;
          grid-template-columns: minmax(340px, 420px) minmax(0, 1fr) minmax(280px, 320px);
          gap: 1.25rem;
          align-items: start;
        }
        @media (max-width: 1200px) {
          .dashboard-3col-grid {
            grid-template-columns: minmax(340px, 400px) minmax(0, 1fr);
          }
          .execution-col {
            grid-column: span 2;
            display: grid !important;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
        }
        @media (max-width: 840px) {
          .dashboard-3col-grid {
            grid-template-columns: 1fr;
          }
          .execution-col {
            grid-column: span 1;
            grid-template-columns: 1fr;
          }
        }

        .dash-col {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          min-width: 0;
        }
        .dash-panel {
          padding: 1.15rem;
          background: #141722;
          border: 1px solid var(--border-subtle);
        }
        .action-panel {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .pipeline-notice {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.675rem;
          color: var(--text-dim);
          padding-top: 0.25rem;
        }

        /* Execution Column */
        .panel-title-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 0.75rem;
        }
        .panel-icon {
          color: var(--accent-blue-text);
        }
        .panel-heading {
          font-size: 0.775rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.05em;
        }
        .engine-details-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          font-size: 0.725rem;
        }
        .engine-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .e-key {
          color: var(--text-dim);
        }
        .e-val {
          color: #ffffff;
          font-weight: 600;
        }
        .e-val.t-blue {
          color: var(--accent-blue-text);
        }
        .e-val.truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }
        .status-val {
          font-weight: 700;
        }
        .status-val.ok {
          color: var(--status-green-text);
        }
        .status-val.neutral {
          color: var(--text-dim);
        }

        /* Flow Steps */
        .flow-steps-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.725rem;
        }
        .flow-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-dim);
        }
        .flow-step .step-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2a3044;
        }
        .flow-step.completed {
          color: var(--text-secondary);
        }
        .flow-step.completed .step-dot {
          background: var(--status-green);
        }
        .flow-step.active {
          color: var(--accent-orange);
          font-weight: 700;
        }
        .flow-step.active .step-dot {
          background: var(--accent-orange);
        }

        /* Notes */
        .notes-list {
          padding-left: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}

export default AnalysisPage;
