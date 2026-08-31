import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Terminal, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Cpu, 
  Layers, 
  Settings, 
  Clock, 
  FileCode
} from 'lucide-react';

export interface TraceStep {
  id: string;
  phase: 'Input Validation' | 'Query Interpretation' | 'Tool Selection' | 'Model Execution' | 'Output Generation';
  status: 'success' | 'warning' | 'error' | 'pending';
  timestamp: string;
  details: string;
  metadata?: Record<string, string>;
}

export interface ExecutionTraceProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: TraceStep[];
}

const DEFAULT_TRACE_STEPS: TraceStep[] = [
  {
    id: 'tr-01',
    phase: 'Input Validation',
    status: 'success',
    timestamp: '13:58:24.041',
    details: 'Raster headers validated. Coordinate reference systems matched workspace projection WGS84 EPSG:4326.',
    metadata: {
      'Bands Ingested': 'RGB + NIR (Sentinel-2)',
      'CRS Coordinate System': 'WGS84 (EPSG:4326)',
      'Ground Resolution': '0.3m per pixel',
      'Georeferencing Sync': 'Valid Tags'
    }
  },
  {
    id: 'tr-02',
    phase: 'Query Interpretation',
    status: 'success',
    timestamp: '13:58:24.810',
    details: 'Parsed natural-language prompt token vector. Extracted visual intent parameters.',
    metadata: {
      'Classified Intent': 'Bi-Temporal Change Detection',
      'Prompt Payload': 'Compare T1 (historical) vs T2 (current) Taipei Docks.',
      'Intent Taxonomy': 'Overlay CD Mapping',
      'Tokens Parsed': '12 Tokens'
    }
  },
  {
    id: 'tr-03',
    phase: 'Tool Selection',
    status: 'success',
    timestamp: '13:58:25.212',
    details: 'Selected appropriate visual segmenter backbone weight files matching coregistered grids.',
    metadata: {
      'Selected Model Core': 'ResNet-50-CD Segmenter',
      'Model Weight Backbone': 'ResNet-50 (Fine-tuned)',
      'Weight Parameters': '48.2 Million',
      'Selection Confidence': '98.24% Coherence'
    }
  },
  {
    id: 'tr-04',
    phase: 'Model Execution',
    status: 'success',
    timestamp: '13:58:26.634',
    details: 'Completed forward-pass model inference on Taipei harbor coordinates bounding boxes.',
    metadata: {
      'Computation Device': 'NVIDIA T4 TensorCore GPU',
      'Execution Latency': '1.42 seconds',
      'Numerical Precision': 'FP16 Half-Precision',
      'Model Output Matrix': 'Segmentation Mask Array'
    }
  },
  {
    id: 'tr-05',
    phase: 'Output Generation',
    status: 'success',
    timestamp: '13:58:27.120',
    details: 'Vectorized classification masks outputs. Saved executive result summary object.',
    metadata: {
      'Output Geometry Format': 'GeoJSON FeatureCollection',
      'Polygons Generated': '28 coordinates areas',
      'Detections Count': '2 Vessels, 1 Graded Yard',
      'Confidence Score': '92% Average'
    }
  }
];

export const ExecutionTrace: React.FC<ExecutionTraceProps> = ({
  isOpen,
  onClose,
  steps = DEFAULT_TRACE_STEPS
}) => {
  
  const handleDownloadTrace = () => {
    const traceJson = JSON.stringify(steps, null, 2);
    const blob = new Blob([traceJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.download = `satquery_execution_trace_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: TraceStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />;
    }
  };

  const getPhaseIcon = (phase: TraceStep['phase']) => {
    switch (phase) {
      case 'Input Validation': return <Layers className="w-3.5 h-3.5" />;
      case 'Query Interpretation': return <Terminal className="w-3.5 h-3.5" />;
      case 'Tool Selection': return <Settings className="w-3.5 h-3.5" />;
      case 'Model Execution': return <Cpu className="w-3.5 h-3.5" />;
      case 'Output Generation': return <FileCode className="w-3.5 h-3.5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 cursor-pointer"
          />

          {/* Drawer Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-zinc-950 border-l border-zinc-900 z-50 flex flex-col shadow-2xl select-none"
          >
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-900/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-left">
                <div className="p-1.5 bg-violet-950/40 border border-violet-900/30 text-violet-400 rounded">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
                    Telemetry Execution Trace
                  </h3>
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">
                    Session Audit Token: TR-9024-SYS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded hover:bg-zinc-900 text-zinc-500 hover:text-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Scroll Container */}
            <div className="flex-1 overflow-y-auto p-5 relative space-y-6">
              
              {/* Vertical timeline connector line */}
              <div className="absolute left-[33px] top-6 bottom-6 w-0.5 bg-zinc-900 z-0" />

              {steps.map((step, idx) => {
                const isCompleted = step.status === 'success';

                return (
                  <div key={step.id} className="relative z-10 flex gap-4 text-left">
                    
                    {/* Circle Dot Connector status */}
                    <div className="w-7 h-7 flex items-center justify-center shrink-0">
                      {isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-950/30 border border-emerald-900/40 flex items-center justify-center shadow-md">
                          {getStatusIcon(step.status)}
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-650 text-[9px] font-mono">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    {/* Step details block layout */}
                    <div className="flex-grow space-y-1.5 bg-zinc-950/40 border border-zinc-900 rounded p-3 font-mono text-[9px]">
                      
                      {/* Title Header */}
                      <div className="flex items-center justify-between border-b border-zinc-900/50 pb-1.5 gap-2">
                        <div className="flex items-center gap-1.5 text-slate-200 font-sans font-bold text-[10px]">
                          <span className="text-violet-400 shrink-0">
                            {getPhaseIcon(step.phase)}
                          </span>
                          <span>{step.phase}</span>
                        </div>
                        <span className="text-zinc-500 text-[8px] flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-zinc-600" />
                          {step.timestamp}
                        </span>
                      </div>

                      {/* Details text */}
                      <p className="text-zinc-400 text-[9px] leading-relaxed">
                        {step.details}
                      </p>

                      {/* Key-Value Metadata properties grid */}
                      {step.metadata && Object.keys(step.metadata).length > 0 && (
                        <div className="pt-2 border-t border-zinc-900/30 grid grid-cols-1 gap-1 text-[8px] text-zinc-500 select-text">
                          {Object.entries(step.metadata).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-zinc-600 uppercase">{key}:</span>
                              <span className="text-slate-300 font-semibold truncate max-w-[190px]">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>

            {/* Exporter Footer Panel */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-900/10 flex items-center justify-between">
              <span className="text-[8px] font-mono text-zinc-550 uppercase">
                Audit Log Sync: Secure
              </span>
              <button
                type="button"
                onClick={handleDownloadTrace}
                className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-[10px] font-mono font-bold text-white rounded transition flex items-center gap-1.5 uppercase shadow-[0_0_15px_-3px_rgba(124,58,237,0.2)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON Trace</span>
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default ExecutionTrace;
