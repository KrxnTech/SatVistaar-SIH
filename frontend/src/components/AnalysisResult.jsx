import React from 'react';
import { Sparkles, Bot, AlertCircle, CheckCircle2, FileText, Image as ImageIcon, HelpCircle } from 'lucide-react';
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
  imageB
}) {
  if (loading) {
    return (
      <div className="result-card-root loading-state">
        <div className="loading-card-content">
          <div className="radar-spinner">
            <div className="radar-sweep" />
            <div className="radar-ring r1" />
            <div className="radar-ring r2" />
            <div className="radar-center" />
          </div>
          <h3 className="loading-heading">Vision-Language Model In Progress</h3>
          <p className="loading-subtext">Analyzing multimodal satellite imagery, spatial structures, and spectral features...</p>
          <div className="loading-mode-pill">
            <span>Mission: <strong>{selectedMode}</strong></span>
          </div>
        </div>
        <style>{`
          .loading-card-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            text-align: center;
            gap: 1rem;
          }
          .radar-spinner {
            position: relative;
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: rgba(0, 229, 255, 0.05);
            border: 1px solid rgba(0, 229, 255, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-shadow: 0 0 25px rgba(0, 229, 255, 0.2);
          }
          .radar-sweep {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: conic-gradient(from 0deg, transparent 60%, rgba(0, 229, 255, 0.5) 100%);
            border-radius: 50%;
            animation: radar-rotate 1.5s linear infinite;
          }
          .radar-ring {
            position: absolute;
            border-radius: 50%;
            border: 1px dashed rgba(0, 229, 255, 0.25);
          }
          .radar-ring.r1 { width: 36px; height: 36px; }
          .radar-ring.r2 { width: 56px; height: 56px; }
          .radar-center {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--accent-cyan);
            box-shadow: 0 0 10px var(--accent-cyan);
            z-index: 2;
          }
          @keyframes radar-rotate {
            to { transform: rotate(360deg); }
          }
          .loading-heading {
            font-size: 1.1rem;
            color: var(--text-main);
          }
          .loading-subtext {
            font-size: 0.8rem;
            color: var(--text-muted);
            max-width: 380px;
          }
          .loading-mode-pill {
            font-size: 0.75rem;
            color: var(--accent-cyan);
            background: rgba(0, 229, 255, 0.1);
            border: 1px solid rgba(0, 229, 255, 0.3);
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-card-root error-state">
        <div className="error-card-content">
          <div className="error-icon-box">
            <AlertCircle size={28} />
          </div>
          <h3 className="error-title">Analysis Error</h3>
          <p className="error-message">{error}</p>
          <div className="error-help">
            <span>Please verify that image inputs and query meet the requirements for <strong>{selectedMode}</strong> mode.</span>
          </div>
        </div>
        <style>{`
          .error-card-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 3.5rem 2rem;
            text-align: center;
            gap: 0.75rem;
          }
          .error-icon-box {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: var(--status-error-bg);
            color: var(--status-error);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error-title {
            font-size: 1.05rem;
            color: var(--status-error);
          }
          .error-message {
            font-size: 0.85rem;
            color: var(--text-muted);
            max-width: 440px;
            line-height: 1.45;
          }
          .error-help {
            font-size: 0.75rem;
            color: var(--text-dim);
            background: var(--bg-card);
            padding: 0.4rem 0.8rem;
            border-radius: var(--radius-sm);
            border: 1px solid var(--border-subtle);
          }
        `}</style>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="result-card-root empty-state">
        <div className="empty-card-content">
          <div className="empty-satellite-box">
            <Bot size={32} className="bot-icon" />
          </div>
          <h3 className="empty-title">Ready for Satellite Analysis</h3>
          <p className="empty-subtitle">
            Upload imagery, select an analysis mode on the left, and click <strong>Run Analysis</strong> to receive detailed Vision-Language insights.
          </p>
          <div className="capabilities-list">
            <div className="cap-item">
              <CheckCircle2 size={13} className="cap-check" />
              <span>Multi-band JPEG/PNG & GeoTIFF support</span>
            </div>
            <div className="cap-item">
              <CheckCircle2 size={13} className="cap-check" />
              <span>Deep VLM Reasoning & Spatial Localization</span>
            </div>
            <div className="cap-item">
              <CheckCircle2 size={13} className="cap-check" />
              <span>Bi-Temporal Visual Change Comparison</span>
            </div>
          </div>
        </div>
        <style>{`
          .empty-card-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 4rem 2rem;
            text-align: center;
            gap: 1rem;
          }
          .empty-satellite-box {
            width: 64px;
            height: 64px;
            border-radius: var(--radius-lg);
            background: var(--bg-card);
            border: 1px solid var(--border-medium);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .bot-icon {
            color: var(--accent-cyan);
          }
          .empty-title {
            font-size: 1.15rem;
            color: var(--text-main);
          }
          .empty-subtitle {
            font-size: 0.825rem;
            color: var(--text-muted);
            max-width: 440px;
            line-height: 1.45;
          }
          .capabilities-list {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            margin-top: 0.5rem;
            text-align: left;
          }
          .cap-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.775rem;
            color: var(--text-muted);
          }
          .cap-check {
            color: var(--status-success);
          }
        `}</style>
      </div>
    );
  }

  const { answerText, task, grounding, warnings, raw, trace } = analysisResult;

  return (
    <div className="result-card-root populated">
      {/* Header */}
      <div className="result-header">
        <div className="header-left">
          <div className="ai-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>AI ANALYSIS RESULT</span>
          </div>
          <span className="task-pill">{task}</span>
        </div>

        <div className="header-right">
          <span className="status-indicator-live">
            <span className="live-dot" /> Real Backend Response
          </span>
        </div>
      </div>

      {/* Primary Answer Box */}
      <div className="answer-text-container">
        <div className="answer-text-content">
          {formatAnswerContent(answerText)}
        </div>
      </div>

      {/* Visual Component depending on Mode */}
      {task === 'FEATURE_IDENTIFICATION' && (
        <GroundingVisualizer
          imagePreviewUrl={imageA?.previewUrl}
          grounding={grounding}
          answerText={answerText}
        />
      )}

      {task === 'CHANGE_ANALYSIS' && (
        <ChangeVisualizer
          imageAPreviewUrl={imageA?.previewUrl}
          imageBPreviewUrl={imageB?.previewUrl}
          imageAMeta={imageA?.metadata}
          imageBMeta={imageB?.metadata}
          grounding={grounding}
        />
      )}

      {/* For VQA and Captioning, show single image reference preview */}
      {(task === 'VQA' || task === 'CAPTIONING') && imageA?.previewUrl && (
        <div className="reference-thumbnail-section">
          <span className="ref-label">Analyzed Imagery Reference:</span>
          <div className="ref-thumb-wrapper">
            <img src={imageA.previewUrl} alt="Analyzed Satellite Frame" className="ref-thumb" />
            <div className="ref-name">{imageA.fileName}</div>
          </div>
        </div>
      )}

      {/* Metadata Telemetry */}
      <MetadataPanel result={analysisResult} />

      {/* Collapsible Execution Trace */}
      <ExecutionTraceViewer trace={trace} />

      {/* Collapsible Raw JSON */}
      <RawJsonViewer rawData={raw} />

      <style>{`
        .result-card-root {
          background: var(--bg-panel);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-sm);
        }
        .result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.875rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1rem;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .ai-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.775rem;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.04em;
        }
        .sparkle-icon {
          color: var(--accent-cyan);
        }
        .task-pill {
          font-size: 0.675rem;
          font-weight: 700;
          color: #a5b4fc;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 0.12rem 0.5rem;
          border-radius: 4px;
        }
        .status-indicator-live {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.725rem;
          color: #34d399;
          font-weight: 500;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }
        .answer-text-container {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1.15rem 1.35rem;
          border-left: 3px solid var(--accent-cyan);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }
        .answer-text-content {
          font-size: 0.935rem;
          color: #e2e8f0;
          line-height: 1.7;
          word-break: break-word;
        }
        .answer-paragraph {
          margin-bottom: 0.85rem;
        }
        .answer-paragraph:last-child {
          margin-bottom: 0;
        }
        .answer-heading {
          font-size: 0.975rem;
          font-weight: 700;
          color: var(--accent-cyan);
          margin-top: 0.85rem;
          margin-bottom: 0.4rem;
          letter-spacing: 0.02em;
        }
        .answer-bullet {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          margin-bottom: 0.6rem;
          padding-left: 0.25rem;
        }
        .bullet-dot {
          color: var(--accent-cyan);
          font-weight: bold;
          font-size: 1.1rem;
          line-height: 1.4;
        }
        .bullet-text-wrapper {
          flex: 1;
        }
        .bullet-topic-pill {
          color: #38bdf8;
          font-weight: 700;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.28);
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
          display: inline-block;
          margin-right: 0.45rem;
          letter-spacing: 0.01em;
        }
        .answer-summary-box {
          margin-top: 0.9rem;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(99, 102, 241, 0.08));
          border: 1px solid rgba(56, 189, 248, 0.28);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          line-height: 1.6;
        }
        .summary-badge {
          background: rgba(56, 189, 248, 0.22);
          color: #38bdf8;
          font-size: 0.675rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          border: 1px solid rgba(56, 189, 248, 0.4);
          flex-shrink: 0;
          margin-top: 0.15rem;
        }
        .summary-text {
          flex: 1;
          color: #f1f5f9;
        }
        .hl-bold {
          color: #ffffff;
          font-weight: 700;
          text-shadow: 0 0 6px rgba(255, 255, 255, 0.25);
        }
        .hl-tag {
          font-weight: 700;
          display: inline-block;
          line-height: 1.25;
        }
        .hl-img-a {
          color: #c7d2fe;
          background: rgba(99, 102, 241, 0.22);
          border: 1px solid rgba(99, 102, 241, 0.45);
          padding: 0.05rem 0.35rem;
          border-radius: 4px;
        }
        .hl-img-b {
          color: #a5f3fc;
          background: rgba(0, 229, 255, 0.2);
          border: 1px solid rgba(0, 229, 255, 0.45);
          padding: 0.05rem 0.35rem;
          border-radius: 4px;
        }
        .hl-date {
          color: #e2e8f0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.85em;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.3);
          padding: 0.05rem 0.3rem;
          border-radius: 3px;
        }
        .hl-word {
          font-weight: 700;
          padding: 0.02rem 0.25rem;
          border-radius: 3px;
        }
        .hl-loss {
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.16);
          border-bottom: 2px solid rgba(239, 68, 68, 0.6);
        }
        .hl-gain {
          color: #6ee7b7;
          background: rgba(16, 185, 129, 0.16);
          border-bottom: 2px solid rgba(16, 185, 129, 0.6);
        }
        .hl-feature {
          color: #fde047;
          background: rgba(234, 179, 8, 0.14);
          border-bottom: 1px dashed rgba(234, 179, 8, 0.5);
        }
        .hl-stable {
          color: #93c5fd;
          background: rgba(59, 130, 246, 0.14);
          border-bottom: 1px dotted rgba(59, 130, 246, 0.5);
        }
        .reference-thumbnail-section {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .ref-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-dim);
          text-transform: uppercase;
        }
        .ref-thumb-wrapper {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--bg-card);
          padding: 0.35rem 0.6rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          width: fit-content;
        }
        .ref-thumb {
          width: 32px;
          height: 32px;
          object-fit: cover;
          border-radius: 4px;
        }
        .ref-name {
          font-size: 0.725rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

/**
 * Format markdown/text response into structured React elements
 */
function formatAnswerContent(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for explicit heading
    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <div key={i} className="answer-heading">
          {line.replace(/\*\*/g, '')}
        </div>
      );
      continue;
    }

    // Check for Summary line
    if (/^(in summary,?\s*|summary:?\s*|conclusion:?\s*)/i.test(line)) {
      const cleaned = line.replace(/^(in summary,?\s*|summary:?\s*|conclusion:?\s*)/i, '');
      elements.push(
        <div key={i} className="answer-summary-box">
          <span className="summary-badge">Summary</span>
          <span className="summary-text">{renderFormattedText(cleaned)}</span>
        </div>
      );
      continue;
    }

    // Check for bullet line
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      let bulletContent = line.substring(2).trim();

      // Check if bullet has a topic title like "Removal of Tree Canopy: ..." or "**Removal of Tree Canopy**: ..."
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

    // Standard paragraph
    elements.push(
      <p key={i} className="answer-paragraph">
        {renderFormattedText(line)}
      </p>
    );
  }

  return elements;
}

/**
 * Smart highlighting of key words, dates, image tags, and change verbs
 */
function highlightKeywordsInText(plainText, keyPrefix = '0') {
  if (!plainText) return plainText;

  // Master combined regex pattern for atomic keyword matching
  const masterRegex = /\b(Image A|Image B|T1|T2|\d{4}-\d{2}-\d{2}|completely removed|trees were removed|tree cover has been completely removed|clearing of a significant area of trees|removal of tree canopy|removed|removal|cleared|clearing|demolished|demolition|reduction|decreased|cut down|new construction|infrastructure expansion|built-up surfaces|building foundations|paved surfaces|paved ground|new development|development|constructed|developed|expansion|expanded|built-up|newly added|increased|erected|tree canopy|dense green trees|green vegetation|vegetation and tree cover|vegetation cover|vegetation|water bodies|water body|terminal building|terminal structure|parking lots|parking areas|largely consistent|no major changes|largely unchanged|consistent|stable)\b/gi;

  const parts = plainText.split(masterRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part === 'Image A' || part === 'T1') {
      return <span key={`${keyPrefix}-${idx}`} className="hl-tag hl-img-a">{part}</span>;
    }
    if (part === 'Image B' || part === 'T2') {
      return <span key={`${keyPrefix}-${idx}`} className="hl-tag hl-img-b">{part}</span>;
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

  // Split by markdown bold markers: **...**
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
