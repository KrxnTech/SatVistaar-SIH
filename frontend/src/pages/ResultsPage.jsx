import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Copy,
  Check,
  Download,
  Share2,
  ArrowLeft,
  Bot,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  Cpu
} from 'lucide-react';
import { useRouter } from '../context/RouterContext.jsx';
import { useAnalysis } from '../context/AnalysisContext.jsx';
import AnalysisResult from '../components/AnalysisResult.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import CyberCard from '../components/common/CyberCard.jsx';
import CyberButton from '../components/common/CyberButton.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';

export function ResultsPage({ backendHealth }) {
  const { navigateTo } = useRouter();
  const {
    analysisResult,
    selectedMode,
    enrichedImageA,
    enrichedImageB,
    loading,
    error,
    resetWorkspace
  } = useAnalysis();

  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleCopySummary = () => {
    if (!analysisResult?.answerText) return;
    navigator.clipboard.writeText(analysisResult.answerText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleExportJson = () => {
    if (!analysisResult?.raw) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analysisResult.raw, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `satvistaar_analysis_${analysisResult.requestId || 'export'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="results-page-root">
      <PageHeader
        title="Intelligence Dossier"
        subtitle="AI-synthesized remote-sensing findings, visual groundings, temporal comparisons, and execution telemetry."
        tag="SAT_INTELLIGENCE"
        breadcrumbs="RESULTS_DOSSIER"
        accentColor="cyan"
        badge={
          analysisResult ? (
            <StatusBadge label="VERIFIED VLM RESPONSE" variant="cyan" />
          ) : (
            <StatusBadge label="AWAITING MISSION EXECUTION" variant="neutral" />
          )
        }
        actions={
          <div className="results-header-actions">
            {analysisResult && (
              <>
                <CyberButton
                  variant="outline"
                  size="sm"
                  icon={copiedSummary ? Check : Copy}
                  onClick={handleCopySummary}
                >
                  {copiedSummary ? 'Copied' : 'Copy Summary'}
                </CyberButton>

                <CyberButton
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={handleExportJson}
                >
                  Export JSON
                </CyberButton>
              </>
            )}

            <CyberButton
              variant="primary"
              size="sm"
              icon={Play}
              cutCorner
              onClick={() => navigateTo('/analysis')}
            >
              {analysisResult ? 'New Analysis' : 'Start Analysis'}
            </CyberButton>
          </div>
        }
      />

      <main className="container results-container">
        {/* If Results Exist, display dedicated Dossier */}
        {analysisResult ? (
          <div className="results-layout">
            <AnalysisResult
              analysisResult={analysisResult}
              loading={loading}
              error={error}
              selectedMode={selectedMode}
              imageA={enrichedImageA}
              imageB={enrichedImageB}
            />

            {/* Bottom Actions Bar */}
            <div className="results-bottom-actions glass-panel">
              <div className="bottom-left-info font-mono">
                <span>REQUEST: {analysisResult.requestId || 'N/A'}</span>
                <span>•</span>
                <span>STATUS: {analysisResult.status}</span>
              </div>

              <div className="bottom-right-btns">
                <CyberButton
                  variant="outline"
                  size="md"
                  icon={ArrowLeft}
                  onClick={() => navigateTo('/analysis')}
                >
                  Back to Workspace
                </CyberButton>

                <CyberButton
                  variant="primary"
                  size="md"
                  icon={Play}
                  cutCorner
                  onClick={() => {
                    resetWorkspace();
                    navigateTo('/analysis');
                  }}
                >
                  Analyze Another Scene
                </CyberButton>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State: No active analysis loaded yet */
          <div className="results-empty-view">
            <div className="empty-dossier-card glass-panel cyber-cut border-neon-cyan">
              <div className="empty-icon-box">
                <Bot size={36} className="empty-bot-icon" />
              </div>
              <h2 className="empty-heading">No Active Intelligence Dossier</h2>
              <p className="empty-description">
                You haven't run a satellite analysis mission yet in this session. Configure your inputs in the workspace to generate structured VLM insights, grounding overlays, and temporal comparisons.
              </p>

              <div className="empty-actions-row">
                <CyberButton
                  variant="primary"
                  size="lg"
                  icon={Play}
                  cutCorner
                  onClick={() => navigateTo('/analysis')}
                >
                  LAUNCH MISSION WORKSPACE
                </CyberButton>
                <CyberButton
                  variant="outline"
                  size="lg"
                  icon={FileText}
                  onClick={() => navigateTo('/system')}
                >
                  SYSTEM DOCUMENTATION
                </CyberButton>
              </div>

              {/* Supported Output Preview Tiles */}
              <div className="empty-capabilities-grid">
                <div className="empty-cap-tile">
                  <CheckCircle2 size={16} className="cap-icon green" />
                  <div>
                    <strong>Visual Grounding Overlays</strong>
                    <p>Bounding coordinates and spatial quadrant highlights</p>
                  </div>
                </div>
                <div className="empty-cap-tile">
                  <CheckCircle2 size={16} className="cap-icon cyan" />
                  <div>
                    <strong>Bi-Temporal Comparison</strong>
                    <p>Co-registered old vs new imagery change evaluation</p>
                  </div>
                </div>
                <div className="empty-cap-tile">
                  <CheckCircle2 size={16} className="cap-icon magenta" />
                  <div>
                    <strong>Execution Telemetry</strong>
                    <p>Sub-second step-by-step latency & token tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .results-page-root {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-bottom: 4rem;
        }
        .results-header-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }
        .results-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .results-layout {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .results-bottom-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .bottom-left-info {
          font-size: 0.725rem;
          color: var(--text-dim);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .bottom-right-btns {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* Empty State */
        .results-empty-view {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
        }
        .empty-dossier-card {
          max-width: 720px;
          width: 100%;
          padding: 3.5rem 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.25rem;
          background: rgba(255, 255, 255, 0.95);
        }
        .empty-icon-box {
          width: 68px;
          height: 68px;
          border-radius: var(--radius-sm);
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid var(--tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px var(--tertiary-glow);
        }
        .empty-bot-icon {
          color: var(--tertiary);
        }
        .empty-heading {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }
        .empty-description {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 540px;
        }
        .empty-actions-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 0.5rem;
        }
        .empty-capabilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 1rem;
          width: 100%;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
          text-align: left;
        }
        .empty-cap-tile {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          background: rgba(255, 255, 255, 0.6);
          padding: 0.85rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }
        .cap-icon {
          flex-shrink: 0;
          margin-top: 0.15rem;
        }
        .cap-icon.green { color: var(--primary); }
        .cap-icon.cyan { color: var(--tertiary); }
        .cap-icon.magenta { color: var(--secondary); }
        .empty-cap-tile strong {
          display: block;
          font-size: 0.775rem;
          color: var(--text-main);
          margin-bottom: 0.2rem;
        }
        .empty-cap-tile p {
          font-size: 0.7rem;
          color: var(--text-muted);
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}

export default ResultsPage;
