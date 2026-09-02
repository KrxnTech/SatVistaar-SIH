import React from 'react';
import { Bot, AlertCircle, CheckCircle2, FileText, Activity } from 'lucide-react';
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
      <div className="gov-result-card loading-state">
        <div className="loading-content">
          <div className="loading-spinner" />
          <h3 className="loading-title">Vision-Language Model In Progress</h3>
          <p className="loading-desc">
            Processing multimodal satellite raster, extracting spatial land-cover features, and synthesizing natural language response...
          </p>
          <div className="loading-task-tag font-mono">
            Task: <strong className="t-orange">{selectedMode}</strong> • Backbone: <strong className="t-blue">Qwen3.8-27B</strong>
          </div>
        </div>
        <style>{`
          .loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3.5rem 2rem;
            text-align: center;
            gap: 1rem;
          }
          .loading-spinner {
            width: 44px;
            height: 44px;
            border: 3px solid var(--border-medium);
            border-top-color: var(--accent-orange);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-title {
            font-size: 1.15rem;
            color: var(--text-main);
          }
          .loading-desc {
            font-size: 0.85rem;
            color: var(--text-muted);
            max-width: 420px;
            line-height: 1.5;
          }
          .loading-task-tag {
            font-size: 0.75rem;
            background: var(--bg-main);
            border: 1px solid var(--border-subtle);
            padding: 0.25rem 0.65rem;
            border-radius: 4px;
            color: var(--text-secondary);
          }
          .t-orange { color: var(--accent-orange-text); }
          .t-blue { color: var(--accent-blue-text); }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gov-result-card error-state">
        <div className="error-content">
          <div className="error-icon-circle">
            <AlertCircle size={28} />
          </div>
          <h3 className="error-heading">Analysis Request Error</h3>
          <p className="error-detail-text">{error}</p>
          <div className="error-guidance-box">
            <strong>Recommended Next Steps:</strong>
            <span>Ensure the uploaded satellite imagery conforms to supported formats (.tif, .png, .jpg up to 50MB) and meets image count requirements ({selectedMode === 'CHANGE_ANALYSIS' ? '2 images for Bi-Temporal Change' : '1 image'}).</span>
          </div>
        </div>
        <style>{`
          .error-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 3rem 1.5rem;
            text-align: center;
            gap: 0.85rem;
          }
          .error-icon-circle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(239, 68, 68, 0.12);
            color: var(--status-red);
            border: 1px solid rgba(239, 68, 68, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error-heading {
            font-size: 1.1rem;
            color: var(--status-red-text);
          }
          .error-detail-text {
            font-size: 0.875rem;
            color: var(--text-secondary);
            max-width: 460px;
            line-height: 1.5;
          }
          .error-guidance-box {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
            font-size: 0.775rem;
            color: var(--text-muted);
            background: var(--bg-main);
            border: 1px solid var(--border-subtle);
            padding: 0.6rem 0.85rem;
            border-radius: var(--radius-sm);
            text-align: left;
            max-width: 480px;
          }
          .error-guidance-box strong {
            color: var(--status-red-text);
          }
        `}</style>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="gov-result-card empty-state">
        <div className="empty-content">
          <div className="empty-icon-circle">
            <Bot size={32} />
          </div>
          <h3 className="empty-heading">Ready for Satellite Analysis</h3>
          <p className="empty-desc">
            Select a task on the left, upload optical imagery, and click <strong className="t-orange">Run Analysis</strong> to synthesize geospatial intelligence.
          </p>
          <div className="empty-verified-list">
            <div className="verified-item">
              <CheckCircle2 size={14} className="check-icon" />
              <span>Multi-band GeoTIFF, TIFF, PNG, and JPEG support</span>
            </div>
            <div className="verified-item">
              <CheckCircle2 size={14} className="check-icon" />
              <span>VLM Reasoning & Visual Grounding Overlays</span>
            </div>
            <div className="verified-item">
              <CheckCircle2 size={14} className="check-icon" />
              <span>Bi-Temporal Visual Pair Comparison</span>
            </div>
          </div>
        </div>
        <style>{`
          .empty-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 3.5rem 2rem;
            text-align: center;
            gap: 0.85rem;
          }
          .empty-icon-circle {
            width: 56px;
            height: 56px;
            border-radius: var(--radius-sm);
            background: var(--bg-card);
            border: 1px solid var(--border-medium);
            color: var(--accent-orange);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .empty-heading {
            font-size: 1.2rem;
            color: var(--text-main);
          }
          .empty-desc {
            font-size: 0.85rem;
            color: var(--text-secondary);
            max-width: 420px;
            line-height: 1.5;
          }
          .empty-verified-list {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            margin-top: 0.5rem;
            text-align: left;
          }
          .verified-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
            color: var(--text-secondary);
          }
          .check-icon {
            color: var(--status-green-text);
          }
          .t-orange { color: var(--accent-orange-text); }
        `}</style>
      </div>
    );
  }

  const { answerText, task, grounding, warnings, raw, trace } = analysisResult;

  return (
    <div className="gov-result-card populated">
      {/* Result Header */}
      <div className="result-header-row">
        <div className="header-left-meta">
          <span className="result-badge font-mono">ANALYSIS RESULT</span>
          <span className="task-badge font-mono">{task}</span>
        </div>

        <div className="header-right-meta">
          <span className="live-indicator font-mono">
            <span className="live-dot" /> REAL BACKEND RESPONSE
          </span>
        </div>
      </div>

      {/* Primary Answer Box */}
      <div className="answer-card">
        <div className="answer-text-body">
          {formatAnswerContent(answerText)}
        </div>
      </div>

      {/* Visualizer Component depending on Mode */}
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

      {/* Single image reference preview for VQA and Captioning */}
      {(task === 'VQA' || task === 'CAPTIONING') && imageA?.previewUrl && (
        <div className="ref-image-section">
          <span className="ref-section-label font-mono">Analyzed Imagery Frame:</span>
          <div className="ref-image-box">
            <img src={imageA.previewUrl} alt="Analyzed Satellite Frame" className="ref-img-thumb" />
            <div className="ref-image-details">
              <span className="ref-img-name">{imageA.fileName}</span>
              {imageA.fileId && <span className="ref-img-id font-mono">ID: {imageA.fileId.slice(0, 16)}...</span>}
            </div>
          </div>
        </div>
      )}

      {/* Execution Telemetry & Metadata */}
      <MetadataPanel result={analysisResult} />

      {/* Execution Trace Timeline */}
      <ExecutionTraceViewer trace={trace} />

      {/* Raw Backend JSON Viewer */}
      <RawJsonViewer rawData={raw} />

      <style>{`
        .gov-result-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
        }
        .result-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1rem;
        }
        .header-left-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .result-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: 0.05em;
        }
        .task-badge {
          font-size: 0.675rem;
          font-weight: 700;
          color: var(--accent-orange-text);
          background: rgba(255, 82, 37, 0.12);
          border: 1px solid rgba(255, 82, 37, 0.35);
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
        }
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.7rem;
          color: var(--status-green-text);
          font-weight: 700;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--status-green);
        }
        .answer-card {
          background: var(--bg-main);
          border: 1px solid var(--border-subtle);
          border-left: 3px solid var(--accent-orange);
          border-radius: var(--radius-sm);
          padding: 1.15rem;
        }
        .answer-text-body {
          font-size: 0.925rem;
          color: var(--text-main);
          line-height: 1.65;
          word-break: break-word;
        }
        .answer-paragraph {
          margin-bottom: 0.75rem;
        }
        .answer-paragraph:last-child {
          margin-bottom: 0;
        }
        .answer-heading {
          font-size: 0.975rem;
          font-weight: 700;
          color: var(--accent-orange-text);
          margin-top: 0.85rem;
          margin-bottom: 0.35rem;
        }
        .answer-bullet {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          padding-left: 0.2rem;
        }
        .bullet-dot {
          color: var(--accent-orange);
          font-weight: bold;
          font-size: 1.1rem;
          line-height: 1.3;
        }
        .bullet-text-wrapper {
          flex: 1;
        }
        .bullet-topic-pill {
          color: var(--accent-blue-text);
          font-weight: 700;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.3);
          padding: 0.1rem 0.4rem;
          border-radius: 3px;
          display: inline-block;
          margin-right: 0.4rem;
          font-size: 0.85rem;
        }
        .answer-summary-box {
          margin-top: 0.85rem;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          line-height: 1.55;
        }
        .summary-badge {
          background: rgba(34, 197, 94, 0.2);
          color: var(--status-green-text);
          font-size: 0.675rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 0.12rem 0.4rem;
          border-radius: 3px;
          border: 1px solid rgba(34, 197, 94, 0.4);
          flex-shrink: 0;
          margin-top: 0.15rem;
        }
        .summary-text {
          flex: 1;
          color: var(--success);
        }
        .hl-bold {
          color: var(--text-main);
          font-weight: 700;
        }
        .hl-tag {
          font-weight: 700;
          display: inline-block;
          line-height: 1.25;
        }
        .hl-img-a {
          color: var(--accent-blue-text);
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.35);
          padding: 0.05rem 0.35rem;
          border-radius: 3px;
        }
        .hl-img-b {
          color: var(--status-green-text);
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.35);
          padding: 0.05rem 0.35rem;
          border-radius: 3px;
        }
        .hl-date {
          color: var(--light-gray);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85em;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          padding: 0.05rem 0.3rem;
          border-radius: 3px;
        }
        .hl-word {
          font-weight: 700;
          padding: 0.02rem 0.25rem;
          border-radius: 3px;
        }
        .hl-loss {
          color: var(--error);
          background: rgba(239, 68, 68, 0.2);
          border-bottom: 2px solid var(--error);
        }
        .hl-gain {
          color: var(--success);
          background: rgba(34, 197, 94, 0.2);
          border-bottom: 2px solid var(--success);
        }
        .hl-feature {
          color: var(--warning);
          background: rgba(234, 179, 8, 0.2);
          border-bottom: 1px dashed var(--warning);
        }
        .hl-stable {
          color: var(--info);
          background: rgba(59, 130, 246, 0.2);
          border-bottom: 1px dotted var(--info);
        }
        .ref-image-section {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .ref-section-label {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-dim);
          text-transform: uppercase;
        }
        .ref-image-box {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: var(--bg-main);
          padding: 0.4rem 0.65rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          width: fit-content;
        }
        .ref-img-thumb {
          width: 36px;
          height: 36px;
          object-fit: cover;
          border-radius: 3px;
        }
        .ref-image-details {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .ref-img-name {
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .ref-img-id {
          font-size: 0.65rem;
          color: var(--text-dim);
        }
      `}</style>
    </div>
  );
}

function formatAnswerContent(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <div key={i} className="answer-heading">
          {line.replace(/\*\*/g, '')}
        </div>
      );
      continue;
    }

    if (/^(in summary,?\s*|summary:?\s*|conclusion:?\s*)/i.test(line)) {
      const cleaned = line.replace(/^(in summary,?\s*|summary:?\s*|conclusion:?\s*)/i, '');
      elements.push(
        <div key={i} className="answer-summary-box">
          <span className="summary-badge font-mono">Summary</span>
          <span className="summary-text">{renderFormattedText(cleaned)}</span>
        </div>
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
