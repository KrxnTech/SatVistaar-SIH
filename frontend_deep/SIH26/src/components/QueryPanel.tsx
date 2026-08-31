import React from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  MessageSquare,
  HelpCircle,
  Link
} from 'lucide-react';

export interface QueryPanelProps {
  mode: 'single' | 'bitemporal' | 'fusion' | 'grounding';
  promptValue: string;
  onChangePrompt: (value: string) => void;
  onSubmitQuery: (prompt: string) => void;
  isProcessing: boolean;
  className?: string;
}

interface SuggestionChip {
  label: string;
  query: string;
}

export const QueryPanel: React.FC<QueryPanelProps> = ({
  mode,
  promptValue,
  onChangePrompt,
  onSubmitQuery,
  isProcessing,
  className = ''
}) => {
  
  // Get suggestions dynamically based on mode
  const getSuggestions = (): SuggestionChip[] => {
    switch (mode) {
      case 'single':
      case 'grounding':
        return [
          { label: 'Land-cover description', query: 'Identify land-cover classes, calculate terrain coverage percentages, and describe dock lines.' },
          { label: 'Visible objects', query: 'Locate and count all visible maritime vessels, cargo shipping containers, and dock structures.' },
          { label: 'Road infrastructures', query: 'Extract coordinate paths of major highway links, railways, and terminal gates.' }
        ];
      case 'bitemporal':
        return [
          { label: 'What changed?', query: 'Compare T1 (historical) vs T2 (current) captures. What major changes occurred in the harbor layout?' },
          { label: 'Where did change occur?', query: 'Outline the precise coordinate boundary boxes where changes took place.' },
          { label: 'Did built-up area increase?', query: 'Verify structural density changes. Did built-up building footprints or terminals expand?' }
        ];
      case 'fusion':
        return [
          { label: 'Built-up regions', query: 'Highlight all built-up concrete regions and impervious dock structures using SAR backscatter.' },
          { label: 'Water-covered regions', query: 'Isolate water-covered channels and identify high-reflectivity ships within them.' },
          { label: 'Optical vs SAR comparison', query: 'Overlay SAR radar scatter over the optical RGB image and compare backscatter reflection hotspots.' }
        ];
      default:
        return [];
    }
  };

  const suggestions = getSuggestions();

  const handleChipClick = (query: string) => {
    if (isProcessing) return;
    onChangePrompt(query);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptValue.trim() || isProcessing) return;

    // FastAPI Integration hook ready:
    // try {
    //   const response = await fetch('http://localhost:8000/api/analyze', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       mode: mode,
    //       prompt: promptValue,
    //     }),
    //   });
    //   if (!response.ok) throw new Error('API server returned error status.');
    //   const result = await response.json();
    //   // Trigger callback with backend findings
    //   onSubmitQuery(promptValue);
    // } catch (error) {
    //   console.error("FastAPI connection failed, falling back to workspace simulation:", error);
    //   onSubmitQuery(promptValue);
    // }

    // Standalone callback execution
    onSubmitQuery(promptValue);
  };

  return (
    <div className={`bg-zinc-950 border border-zinc-900 rounded-lg p-4 space-y-4 shadow-panel ${className}`}>
      
      {/* Panel Header Title */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
        <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          AI Coprocessor
        </h4>
        <div className="flex items-center gap-1 text-[8px] font-mono text-zinc-650">
          <Link className="w-2.5 h-2.5 text-zinc-550" />
          <span>FASTAPI ADAPTER READY</span>
        </div>
      </div>

      {/* Main NLP Query input Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="relative">
          <textarea
            rows={3}
            value={promptValue}
            onChange={(e) => onChangePrompt(e.target.value)}
            disabled={isProcessing}
            className="w-full bg-black border border-zinc-900 rounded p-2.5 text-[10.5px] font-mono text-slate-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500/50 transition resize-none disabled:opacity-40 disabled:cursor-not-allowed"
            placeholder="Enter natural-language query to task regional sensors..."
          />
        </div>

        {/* Suggestion Chips Section */}
        {suggestions.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[8.5px] font-mono text-zinc-500 flex items-center gap-1 uppercase">
              <HelpCircle className="w-3 h-3 text-zinc-600" />
              Suggested Queries:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleChipClick(chip.query)}
                  className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-[8.5px] font-mono text-slate-400 hover:text-slate-200 rounded transition flex items-center gap-1"
                >
                  <MessageSquare className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit Block */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
          <span className="text-[8px] font-mono text-zinc-550">
            {isProcessing ? 'TASK RUNNING...' : 'TASK READY'}
          </span>
          
          <button
            type="submit"
            disabled={isProcessing || !promptValue.trim()}
            className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-mono font-bold text-white rounded transition flex items-center gap-1.5 uppercase shadow-[0_0_15px_-3px_rgba(124,58,237,0.2)]"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Analyze
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default QueryPanel;
