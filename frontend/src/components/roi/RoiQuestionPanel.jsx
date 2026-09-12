import React, { useState } from 'react';
import { HelpCircle, Sparkles, Send, Loader2, ArrowRight } from 'lucide-react';

export function RoiQuestionPanel({
  task = 'VQA',
  onAnalyzeRoi,
  loading = false,
  hasRoi = false,
  disabled = false
}) {
  const [roiQuery, setRoiQuery] = useState('');

  // Task-specific suggested question presets as mandated in specification
  const getSuggestedQuestions = (taskType) => {
    switch (taskType) {
      case 'OPTICAL_SAR_FUSION':
        return [
          'What is the dominant land cover?',
          'How much of this area is built-up?',
          'How much vegetation is present?',
          'Where is water detected?',
          'What does SAR reveal that Optical does not?',
          'Where do Optical and SAR agree?',
          'Where do Optical and SAR disagree?',
          'Describe this region using both modalities.'
        ];
      case 'CHANGE_ANALYSIS':
        return [
          'What changed inside this selected region?',
          'Did the built-up area increase?',
          'Did vegetation decrease?',
          'Did water coverage change?',
          'Which objects disappeared?',
          'Which new objects appeared?',
          'Estimate the changed area.'
        ];
      case 'FEATURE_IDENTIFICATION':
        return [
          'Find buildings in this region.',
          'Find roads in this region.',
          'Find water bodies.',
          'Find vegetation.',
          'Find industrial structures.',
          'Show the location of the requested object.'
        ];
      case 'CAPTIONING':
        return [
          'Describe this selected region.',
          'What is the dominant land cover?',
          'What major objects are visible?',
          'Is this region urban, agricultural, forested, or water-dominated?',
          'What are the main characteristics of this region?'
        ];
      case 'VQA':
      default:
        return [
          'What objects are present in this region?',
          'What is the dominant land cover?',
          'How much vegetation is visible?',
          'Are there buildings in this region?',
          'Are there water bodies?',
          'Describe this selected area.'
        ];
    }
  };

  const suggestions = getSuggestedQuestions(task);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!hasRoi || loading || !roiQuery.trim()) return;
    onAnalyzeRoi(roiQuery.trim());
  };

  const handleSelectPreset = (preset) => {
    setRoiQuery(preset);
    if (hasRoi && !loading) {
      onAnalyzeRoi(preset);
    }
  };

  return (
    <div className="sat-roi-question-panel">
      <div className="question-panel-header">
        <div className="title-group font-mono">
          <HelpCircle size={15} className="text-orange-500" />
          <h3 className="panel-title">What do you want to know about this area?</h3>
        </div>
        <span className="task-tag font-mono">
          TASK: {task.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Suggested Questions Grid */}
      <div className="suggested-section">
        <div className="section-label font-mono">
          <Sparkles size={12} className="text-amber-500" />
          <span>SUGGESTED QUESTIONS</span>
        </div>
        <div className="suggestions-chips-grid">
          {suggestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              className="suggestion-chip font-mono"
              onClick={() => handleSelectPreset(q)}
              disabled={disabled || loading}
            >
              <span>{q}</span>
              <ArrowRight size={11} className="chip-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Custom Question Input Form */}
      <form className="custom-question-section" onSubmit={handleSubmit}>
        <div className="section-label font-mono">
          <span>OR ASK YOUR OWN QUESTION</span>
        </div>

        <div className="input-row">
          <input
            type="text"
            className="roi-query-input"
            placeholder={
              hasRoi
                ? 'e.g., What percentage of this area is built-up?'
                : 'Select an area on the image first to ask questions...'
            }
            value={roiQuery}
            onChange={(e) => setRoiQuery(e.target.value)}
            disabled={disabled || loading || !hasRoi}
          />

          <button
            type="submit"
            className="roi-analyze-btn font-mono"
            disabled={disabled || loading || !hasRoi || !roiQuery.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Analyzing ROI...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Analyze Selected Area</span>
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .sat-roi-question-panel {
          background: #ffffff;
          border: 1.5px solid #000066;
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          box-shadow: 0 4px 16px -4px rgba(0, 0, 70, 0.08);
          margin-top: 1rem;
        }
        .question-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.65rem;
        }
        .title-group {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .panel-title {
          font-size: 0.875rem;
          font-weight: 800;
          color: #000066;
          margin: 0;
        }
        .task-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: #ff5225;
          background: #fff5f2;
          border: 1px solid #ffd8cc;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }
        .section-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.65rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.04em;
          margin-bottom: 0.45rem;
        }
        .suggestions-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .suggestion-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }
        .suggestion-chip:hover:not(:disabled) {
          background: #fff5f2;
          border-color: #ff5225;
          color: #000066;
          transform: translateY(-1px);
        }
        .chip-arrow {
          color: #94a3b8;
          transition: transform 0.15s ease;
        }
        .suggestion-chip:hover .chip-arrow {
          color: #ff5225;
          transform: translateX(2px);
        }
        .custom-question-section {
          display: flex;
          flex-direction: column;
        }
        .input-row {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .roi-query-input {
          flex: 1;
          background: #f8fafc;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.6rem 0.85rem;
          font-size: 0.825rem;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s ease;
        }
        .roi-query-input:focus {
          border-color: #ff5225;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 82, 37, 0.15);
        }
        .roi-analyze-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.6rem 1.15rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          background: #ff5225;
          color: #ffffff;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(255, 82, 37, 0.3);
        }
        .roi-analyze-btn:hover:not(:disabled) {
          background: #e0441b;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 82, 37, 0.4);
        }
        .roi-analyze-btn:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}

export default RoiQuestionPanel;
