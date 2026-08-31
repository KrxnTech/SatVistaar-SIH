import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Activity, 
  AlertCircle, 
  Settings, 
  Compass, 
  Cpu, 
  FileText,
  FileCheck,
  Terminal
} from 'lucide-react';

export interface AgentStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  details?: string;
}

export interface AgentStatusProps {
  steps: AgentStep[];
  detectedIntent?: string;
  selectedTool?: string;
  className?: string;
}

export const AgentStatus: React.FC<AgentStatusProps> = ({
  steps,
  detectedIntent,
  selectedTool,
  className = ''
}) => {
  // Calculate completion percentage
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const activeIndex = steps.findIndex(s => s.status === 'active');
  const totalCount = steps.length;
  
  // Estimate overall percentage completion
  let percentComplete = (completedCount / totalCount) * 100;
  if (activeIndex !== -1) {
    // Add half step weight for the currently active step
    percentComplete += (0.5 / totalCount) * 100;
  }
  percentComplete = Math.min(Math.max(percentComplete, 0), 100);

  // Get icons for each step index to keep it visual
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0: return <Terminal className="w-3.5 h-3.5" />; // Query Received
      case 1: return <Compass className="w-3.5 h-3.5" />; // Intent Classified
      case 2: return <FileText className="w-3.5 h-3.5" />; // Inputs Validated
      case 3: return <Settings className="w-3.5 h-3.5" />; // Specialist Tool Selected
      case 4: return <Cpu className="w-3.5 h-3.5 animate-spin-slow" />; // Model Running
      case 5: return <FileCheck className="w-3.5 h-3.5" />; // Evidence Generated
      case 6: return <CheckCircle2 className="w-3.5 h-3.5" />; // Analysis Complete
      default: return <Activity className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className={`bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden shadow-panel flex flex-col font-sans ${className}`}>
      
      {/* Top Header & Horizontal Progress Gauge */}
      <div className="p-3.5 bg-zinc-900/10 border-b border-zinc-900 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${completedCount === totalCount ? 'bg-emerald-400' : 'bg-violet-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${completedCount === totalCount ? 'bg-emerald-500' : 'bg-violet-500'}`}></span>
            </span>
            <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">
              Coprocessor Status
            </h4>
          </div>
          <span className="text-[9px] font-mono text-zinc-500 font-bold">
            {Math.round(percentComplete)}% EXEC
          </span>
        </div>
        
        {/* Progress Track */}
        <div className="h-1 bg-zinc-900/60 rounded-full overflow-hidden border border-zinc-900/20">
          <motion.div 
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${percentComplete}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Main Steps Flow Container */}
      <div className="p-4 relative flex flex-col space-y-4">
        
        {/* Connecting Vertical Track Lines */}
        <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-zinc-900 z-0">
          {/* Animated Glowing completed line segment */}
          <motion.div 
            className="w-full bg-gradient-to-b from-violet-500 via-indigo-500 to-emerald-500"
            style={{ originY: 0 }}
            initial={{ height: 0 }}
            animate={{ 
              height: `${(completedCount / Math.max(totalCount - 1, 1)) * 100}%` 
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Step Items List */}
        {steps.map((step, idx) => {
          const isActive = step.status === 'active';
          const isCompleted = step.status === 'completed';
          const isFailed = step.status === 'failed';

          return (
            <div key={step.id} className="relative z-10 flex gap-4 select-none">
              
              {/* Step indicator Circle */}
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                {isCompleted ? (
                  <motion.div 
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </motion.div>
                ) : isFailed ? (
                  <div className="w-6 h-6 rounded-full bg-rose-950/40 border border-rose-600 flex items-center justify-center text-rose-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                ) : isActive ? (
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    {/* Pulsing glow halo ring */}
                    <span className="absolute inset-0 rounded-full border border-violet-500 animate-ping opacity-60"></span>
                    <motion.div 
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative w-6 h-6 rounded-full bg-violet-950/60 border-2 border-violet-500 flex items-center justify-center text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.3)] z-10"
                    >
                      {getStepIcon(idx)}
                    </motion.div>
                  </div>
                ) : (
                  /* Pending state */
                  <div className="w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800/80 flex items-center justify-center text-zinc-650 text-[10px] font-mono font-bold">
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* Text labels layout */}
              <div className="flex-grow text-left pt-0.5">
                <h5 className={`text-[11px] font-bold tracking-wide transition ${
                  isActive ? 'text-violet-400 font-semibold' :
                  isCompleted ? 'text-slate-300' : 'text-zinc-600'
                }`}>
                  {step.label}
                </h5>
                <p className={`text-[9.5px] mt-0.5 font-sans transition ${
                  isActive ? 'text-slate-300' :
                  isCompleted ? 'text-zinc-500' : 'text-zinc-700'
                }`}>
                  {step.description}
                </p>

                {/* Sub details block animations (e.g. Detected Intent / Tool selected) */}
                <AnimatePresence>
                  {/* Step 2: Intent classified detail */}
                  {idx === 1 && (isCompleted || isActive) && detectedIntent && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 6 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-black/40 border border-zinc-900 p-2 rounded text-[9.5px] font-mono text-slate-300"
                    >
                      <span className="text-zinc-500 block text-[8px] uppercase">Classified Intent:</span>
                      <strong className="text-violet-400 font-semibold">{detectedIntent}</strong>
                    </motion.div>
                  )}

                  {/* Step 4: Specialist Tool detail */}
                  {idx === 3 && (isCompleted || isActive) && selectedTool && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 6 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-black/40 border border-zinc-900 p-2 rounded text-[9.5px] font-mono text-slate-300"
                    >
                      <span className="text-zinc-500 block text-[8px] uppercase">Selected Model Core:</span>
                      <strong className="text-emerald-400 font-semibold">{selectedTool}</strong>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
