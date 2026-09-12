import React from 'react';
import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '../lib/utils';

export const ANALYSIS_MODES = [
  {
    value: 'VQA',
    id: 'VQA',
    title: 'Visual Q&A',
    description: 'Ask natural-language questions about visible terrain, infrastructure, and facilities.',
    defaultQuery: 'What is visible in this satellite image?',
    minImages: 1
  },
  {
    value: 'CAPTIONING',
    id: 'CAPTIONING',
    title: 'Scene Description',
    description: 'Generate structured summaries of land cover, transport grids, and installations.',
    defaultQuery: 'Describe this satellite image in detail.',
    minImages: 1
  },
  {
    value: 'FEATURE_IDENTIFICATION',
    id: 'FEATURE_IDENTIFICATION',
    title: 'Visual Grounding',
    description: 'Localize targets with coordinate attention bounding box overlays.',
    defaultQuery: 'Where are the major buildings and facilities located?',
    minImages: 1
  },
  {
    value: 'CHANGE_ANALYSIS',
    id: 'CHANGE_ANALYSIS',
    title: 'Bi-Temporal Change',
    description: 'Compare baseline reference (T1) with later pass (T2) to detect modifications.',
    defaultQuery: 'What changed between these two satellite images?',
    minImages: 2
  },
  {
    value: 'OPTICAL_SAR_FUSION',
    id: 'OPTICAL_SAR_FUSION',
    title: 'Optical + SAR Fusion',
    description: 'Jointly analyze optical spectral features with radar backscatter for cross-modal intelligence.',
    defaultQuery: 'Use the optical and SAR images together to identify built-up and water-covered regions.',
    minImages: 2,
    badge: 'MULTIMODAL'
  }
];

export function ModeSelector({ selectedMode, onSelectMode }) {
  return (
    <div className="sat-task-selector-root">
      {/* Header */}
      <div className="task-selector-header">
        <div className="header-title-group">
          <span className="step-num-pill font-mono">01</span>
          <div>
            <h3 className="selector-heading">CHOOSE ANALYSIS TASK</h3>
            <p className="selector-subheading">Select the vision intelligence pipeline to route your satellite raster</p>
          </div>
        </div>
        <span className="pipeline-route-tag font-mono">PIPELINE ROUTING</span>
      </div>

      {/* Cards Grid */}
      <RadioGroup
        value={selectedMode}
        onValueChange={(val) => onSelectMode(val)}
        className="task-cards-grid grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"
      >
        {ANALYSIS_MODES.map((mode) => {
          const isSelected = selectedMode === mode.value;

          return (
            <div
              key={mode.value}
              onClick={() => onSelectMode(mode.value)}
              className={cn(
                "task-card-item group relative flex flex-col justify-between rounded-xl border p-5 shadow-xs transition-all duration-200 cursor-pointer min-h-[165px]",
                isSelected
                  ? "selected border-[#ff5225] ring-2 ring-[#ff5225]/20 bg-[#fffaf8] shadow-sm -translate-y-0.5"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 hover:-translate-y-0.5"
              )}
            >
              <RadioGroupItem
                value={mode.value}
                id={mode.value}
                className="sr-only"
              />

              <label
                htmlFor={mode.value}
                className="task-card-content relative flex flex-col justify-between h-full w-full cursor-pointer"
              >
                {/* Title & Description Stack */}
                <div className="task-card-header flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <h4
                      className={cn(
                        "task-card-title text-[13px] font-bold tracking-tight transition-colors",
                        isSelected ? "text-[#000066]" : "text-slate-900"
                      )}
                    >
                      {mode.title}
                    </h4>
                    {mode.badge && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono bg-purple-100 text-purple-700 border border-purple-200">
                        {mode.badge}
                      </span>
                    )}
                  </div>
                  <p className="task-card-desc text-[11px] leading-snug text-slate-500 mt-0.5">
                    {mode.description}
                  </p>
                </div>

                {/* Bottom Action Pill Button */}
                <div className="task-card-action pt-3 mt-auto w-full">
                  <span
                    className={cn(
                      "task-card-btn relative inline-flex h-8 items-center justify-center rounded-lg px-4 text-xs font-semibold transition-all w-full select-none",
                      isSelected
                        ? "selected bg-[#ff5225] text-white shadow-sm shadow-[#ff5225]/20"
                        : "bg-slate-100 text-slate-700 group-hover:bg-slate-200/80"
                    )}
                  >
                    <span>{isSelected ? "Selected" : "Select Task"}</span>
                    {isSelected && (
                      <motion.span
                        className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-[#ff5225]"
                        layoutId="activeTaskIndicator"
                      />
                    )}
                  </span>
                </div>
              </label>
            </div>
          );
        })}
      </RadioGroup>

      <style>{`
        .sat-task-selector-root {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }

        .task-selector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .step-num-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: #000066;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .selector-heading {
          font-size: 0.9rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          margin: 0;
        }

        .selector-subheading {
          font-size: 0.775rem;
          color: #64748b;
          margin: 0;
        }

        .pipeline-route-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .task-cards-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem;
          width: 100%;
        }
        @media (min-width: 768px) {
          .task-cards-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1200px) {
          .task-cards-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        .task-card-item {
          box-sizing: border-box !important;
          padding: 1.25rem 1.15rem 1rem 1.15rem !important;
          min-height: 165px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 12px;
          background: #ffffff;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .task-card-item:hover {
          transform: translateY(-2px);
        }

        .task-card-item.selected {
          background: #fffaf8;
        }

        .task-card-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .task-card-header {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .task-card-title {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: -0.015em;
          line-height: 1.3;
          margin: 0;
        }

        .task-card-desc {
          font-size: 0.745rem;
          line-height: 1.45;
          margin: 0;
        }

        .task-card-action {
          margin-top: auto;
          padding-top: 0.85rem;
          width: 100%;
        }

        .task-card-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 34px;
          border-radius: 8px;
          padding: 0 1rem;
          font-size: 0.775rem;
          font-weight: 600;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

export default ModeSelector;
