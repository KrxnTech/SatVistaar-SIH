import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  FileDown, 
  MapPin, 
  Brain, 
  Search,
  RefreshCw
} from 'lucide-react';

export interface EvidenceItem {
  id: string;
  label: string;
  value: string;
  coordinates?: string;
  confidence: number;
}

export interface ResultPanelProps {
  status: 'loading' | 'success' | 'empty' | 'error';
  answer?: string;
  confidence?: number; // scale 0 - 1
  evidenceItems?: EvidenceItem[];
  highlightedRegions?: string[];
  modelSummary?: {
    backbone: string;
    latency: string;
    parameters: string;
    version: string;
  };
  errorMessage?: string;
  onDownloadReport?: () => void;
  className?: string;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({
  status,
  answer,
  confidence = 0,
  evidenceItems = [],
  highlightedRegions = [],
  modelSummary,
  errorMessage,
  onDownloadReport,
  className = ''
}) => {
  
  // Calculate SVG circular stroke parameters (r = 18, circumference = 113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (confidence * circumference);

  const getConfidenceColor = (val: number) => {
    if (val >= 0.90) return { stroke: 'stroke-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-900/30' };
    if (val >= 0.70) return { stroke: 'stroke-amber-500', text: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-900/30' };
    return { stroke: 'stroke-rose-600', text: 'text-rose-500', bg: 'bg-rose-950/20 border-rose-900/30' };
  };

  const colors = getConfidenceColor(confidence);

  return (
    <div className={`bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden shadow-panel flex flex-col font-sans ${className}`}>
      
      {/* Header title */}
      <div className="bg-zinc-900/10 border-b border-zinc-900 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-400" />
          <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">
            Analysis Output Findings
          </h4>
        </div>
        <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase">
          RESULT_STREAM: READY
        </span>
      </div>

      {/* 1. EMPTY STATE (Waiting for task execution) */}
      {status === 'empty' && (
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
          <div className="w-12 h-12 rounded-full border border-dashed border-zinc-800 flex items-center justify-center text-zinc-650 animate-pulse">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1 select-none">
            <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              Inference Core Standing By
            </h5>
            <p className="text-[9.5px] text-zinc-600 max-w-[200px] leading-relaxed">
              Task the AI Coprocessor with natural-language prompt instructions to generate target answers.
            </p>
          </div>
        </div>
      )}

      {/* 2. LOADING STATE (Executing models / fetching backend) */}
      {status === 'loading' && (
        <div className="p-5 space-y-4 min-h-[220px] select-none">
          {/* Skeleton Header */}
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-zinc-900 shrink-0"></div>
            <div className="space-y-1.5 flex-grow">
              <div className="h-3 bg-zinc-900 rounded w-1/3"></div>
              <div className="h-2 bg-zinc-900 rounded w-1/2"></div>
            </div>
          </div>
          
          {/* Skeleton Body Text */}
          <div className="space-y-2.5 animate-pulse pt-2">
            <div className="h-2.5 bg-zinc-900 rounded w-full"></div>
            <div className="h-2.5 bg-zinc-900 rounded w-full"></div>
            <div className="h-2.5 bg-zinc-900 rounded w-4/5"></div>
          </div>

          <div className="flex items-center justify-center gap-1.5 py-6 text-[10px] font-mono text-violet-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>FastAPI: Ingesting Inference Result Stream...</span>
          </div>
        </div>
      )}

      {/* 3. ERROR STATE (Backend fetch error) */}
      {status === 'error' && (
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
          <div className="w-10 h-10 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center text-rose-500">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h5 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider font-mono">
              Inference Failure
            </h5>
            <p className="text-[9.5px] text-zinc-500 max-w-[200px] leading-relaxed select-text">
              {errorMessage || 'FastAPI backend connection refused or timeout during telemetry stacking.'}
            </p>
          </div>
        </div>
      )}

      {/* 4. SUCCESS STATE (Renders results details) */}
      {status === 'success' && (
        <div className="p-4 space-y-4 select-text">
          
          {/* Answer and Confidence Score Row */}
          <div className="flex items-start justify-between gap-4">
            
            {/* AI Generated Answer Text */}
            <div className="space-y-1.5 flex-grow pr-2 text-left">
              <span className="text-[8px] font-mono text-zinc-500 uppercase block">AI Executive Summary:</span>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                {answer}
              </p>
            </div>

            {/* Circular Confidence SVG Gauge */}
            <div className="flex flex-col items-center shrink-0">
              <span className="text-[7.5px] font-mono text-zinc-500 uppercase block mb-1">CONFIDENCE</span>
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* SVG circular track background */}
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className="stroke-zinc-900 fill-none"
                    strokeWidth="3.5"
                  />
                  {/* Glowing Animated foreground fill */}
                  <motion.circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className={`fill-none ${colors.stroke}`}
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeOffset }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Percentage value overlay */}
                <div className="absolute text-[8.5px] font-mono font-bold text-slate-200">
                  {Math.round(confidence * 100)}%
                </div>
              </div>
            </div>

          </div>

          {/* Evidence Detections List */}
          {evidenceItems.length > 0 && (
            <div className="space-y-2">
              <span className="text-[8px] font-mono text-zinc-500 uppercase block">Detections Audit Evidence ({evidenceItems.length}):</span>
              <div className="border border-zinc-900 rounded bg-black/40 overflow-hidden divide-y divide-zinc-900/60 font-mono text-[9px]">
                {evidenceItems.map((item) => (
                  <div key={item.id} className="p-2 flex items-center justify-between gap-3 text-left">
                    <div className="space-y-0.5 max-w-[150px]">
                      <span className="text-slate-300 font-sans font-semibold text-[9.5px] block truncate">{item.label}</span>
                      {item.coordinates && (
                        <span className="text-[8.5px] text-zinc-650 flex items-center gap-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5 text-zinc-600 shrink-0" />
                          {item.coordinates}
                        </span>
                      )}
                    </div>
                    <div className="text-right space-y-0.5 shrink-0">
                      <span className="text-slate-400 block">{item.value}</span>
                      <span className={`text-[8px] px-1 rounded-sm border font-bold inline-block ${
                        item.confidence >= 0.90 ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' :
                        item.confidence >= 0.70 ? 'bg-amber-950/20 text-amber-400 border-amber-900/30' : 'bg-rose-950/20 text-rose-500 border-rose-900/30'
                      }`}>
                        MATCH: {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Highlighted Bounding Coordinates */}
          {highlightedRegions.length > 0 && (
            <div className="space-y-1.5 text-left">
              <span className="text-[8px] font-mono text-zinc-500 uppercase block">Regions Coordinates Highlighted:</span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[8.5px]">
                {highlightedRegions.map((region, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-zinc-900/60 border border-zinc-900 text-slate-300 rounded flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-violet-400" />
                    {region}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Model execution statistics summary grid */}
          {modelSummary && (
            <div className="pt-2 border-t border-zinc-900/60 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[8.5px] text-zinc-500">
                <div className="p-1.5 bg-zinc-900/30 border border-zinc-900/50 rounded">
                  <span className="text-zinc-650 block text-[7.5px] uppercase">BACKBONE:</span>
                  <span className="text-slate-300 font-semibold">{modelSummary.backbone}</span>
                </div>
                <div className="p-1.5 bg-zinc-900/30 border border-zinc-900/50 rounded">
                  <span className="text-zinc-650 block text-[7.5px] uppercase">LATENCY:</span>
                  <span className="text-slate-300 font-semibold">{modelSummary.latency}</span>
                </div>
                <div className="p-1.5 bg-zinc-900/30 border border-zinc-900/50 rounded">
                  <span className="text-zinc-650 block text-[7.5px] uppercase">PARAMETERS:</span>
                  <span className="text-slate-300 font-semibold">{modelSummary.parameters}</span>
                </div>
                <div className="p-1.5 bg-zinc-900/30 border border-zinc-900/50 rounded">
                  <span className="text-zinc-650 block text-[7.5px] uppercase">VERSION:</span>
                  <span className="text-slate-300 font-semibold">{modelSummary.version}</span>
                </div>
              </div>
            </div>
          )}

          {/* Export / Download PDF Report Button */}
          {onDownloadReport && (
            <div className="pt-2 border-t border-zinc-900/60 flex justify-end">
              <button
                type="button"
                onClick={onDownloadReport}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-[10px] font-mono font-bold text-slate-300 hover:text-white rounded transition flex items-center gap-1.5 uppercase"
              >
                <FileDown className="w-3.5 h-3.5 text-brand-sky" />
                <span>Export Report PDF</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
export default ResultPanel;
