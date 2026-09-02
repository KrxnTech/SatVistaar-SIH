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
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {ANALYSIS_MODES.map((mode) => {
          const isSelected = selectedMode === mode.value;

          return (
            <div
              key={mode.value}
              onClick={() => onSelectMode(mode.value)}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition-all duration-200 cursor-pointer min-h-[155px]",
                isSelected
                  ? "border-[#ff5225] ring-2 ring-[#ff5225]/20 bg-[#fffaf8] shadow-sm -translate-y-0.5"
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
                className="relative flex flex-col justify-between h-full cursor-pointer"
              >
                {/* Title & Description Stack */}
                <div className="flex flex-col gap-2">
                  <h4
                    className={cn(
                      "text-[13px] font-bold tracking-tight transition-colors",
                      isSelected ? "text-[#000066]" : "text-slate-900"
                    )}
                  >
                    {mode.title}
                  </h4>
                  <p className="text-[11.5px] leading-snug text-slate-500 mt-1">
                    {mode.description}
                  </p>
                </div>

                {/* Bottom Action Pill Button */}
                <div className="pt-3 mt-auto">
                  <span
                    className={cn(
                      "relative inline-flex h-8 items-center justify-center rounded-lg px-4 text-xs font-semibold transition-all w-full select-none",
                      isSelected
                        ? "bg-[#ff5225] text-white shadow-sm shadow-[#ff5225]/20"
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
      `}</style>
    </div>
  );
}

export default ModeSelector;
