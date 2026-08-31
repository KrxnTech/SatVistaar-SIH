import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Trash2, 
  Layout, 
  Activity, 
  Info,
  SlidersHorizontal,
  Moon,
  Sun,
  Monitor,
  LogOut
} from 'lucide-react';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  // Settings States
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.70);
  const [showExecutionTrace, setShowExecutionTrace] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('satquery_theme') as 'dark' | 'light' | 'auto' | null;
    const savedThreshold = localStorage.getItem('satquery_confidence_threshold');
    const savedTrace = localStorage.getItem('satquery_show_execution_trace');

    if (savedTheme) setTheme(savedTheme);
    if (savedThreshold) setConfidenceThreshold(parseFloat(savedThreshold));
    if (savedTrace) setShowExecutionTrace(savedTrace === 'true');
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('satquery_theme', theme);
    localStorage.setItem('satquery_confidence_threshold', String(confidenceThreshold));
    localStorage.setItem('satquery_show_execution_trace', String(showExecutionTrace));

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const handleClearCache = () => {
    const confirmClear = window.confirm(
      "Confirm Cache Clear: This will delete all local configuration metrics, reset defaults, and wipe browser storage histories. Proceed?"
    );
    if (confirmClear) {
      localStorage.clear();
      setTheme('dark');
      setConfidenceThreshold(0.70);
      setShowExecutionTrace(true);
      alert("Local storage cache cleared and defaults successfully restored.");
    }
  };

  const handleLogOut = () => {
    const confirmLogOut = window.confirm("Are you sure you want to log out of the command console?");
    if (confirmLogOut) {
      localStorage.removeItem('satquery_auth_token');
      alert("Logged out successfully.");
      navigate('/');
    }
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Page Title Area */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-100 tracking-wide uppercase">Command Settings</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Configure theme preferences, confidence thresholds, and telemetry trace overrides</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Inputs Block (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Theme preferences card */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 shadow-panel space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2 border-b border-zinc-900 pb-2">
              <Layout className="w-4 h-4 text-violet-400" />
              Theme Preference
            </h2>

            <div>
              <label className="block text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-widest mb-2.5">
                SELECT INTERFACE THEME
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', label: 'Dark Mode', icon: Moon },
                  { id: 'light', label: 'Light Mode', icon: Sun },
                  { id: 'auto', label: 'System Default', icon: Monitor }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTheme(item.id as 'dark' | 'light' | 'auto')}
                      className={`py-3 px-4 rounded border text-xs font-mono flex flex-col items-center justify-center gap-2 transition duration-200 ${
                        isSelected
                          ? 'border-violet-500 bg-violet-600/10 text-violet-400 font-bold shadow-[0_0_12px_rgba(124,58,237,0.1)]'
                          : 'border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Model sliders parameters card */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 shadow-panel space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2 border-b border-zinc-900 pb-2">
              <SlidersHorizontal className="w-4 h-4 text-violet-400" />
              AI Inference Parameters
            </h2>

            <div className="space-y-4 text-left">
              <div>
                <div className="flex items-center justify-between mb-1.5 font-mono">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                    Confidence Threshold Limit
                  </label>
                  <span className="text-xs font-bold text-violet-400 bg-violet-950/30 border border-violet-900/30 px-2 py-0.5 rounded">
                    {Math.round(confidenceThreshold * 100)}%
                  </span>
                </div>
                
                {/* Confidence threshold slider */}
                <div className="flex items-center gap-4 py-2">
                  <span className="text-[9px] font-mono text-zinc-600">0%</span>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                    className="flex-grow accent-violet-600 h-1 bg-zinc-900 rounded-lg cursor-pointer"
                  />
                  <span className="text-[9px] font-mono text-zinc-600">100%</span>
                </div>
                
                <p className="text-[10.5px] font-sans text-zinc-500 leading-relaxed mt-1">
                  Filters oriented bounding box output detections. Boxes with class scores below this threshold will be hidden in the workspace.
                </p>
              </div>
            </div>
          </div>

          {/* Diagnostic controls card */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 shadow-panel space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2 border-b border-zinc-900 pb-2">
              <Activity className="w-4 h-4 text-violet-400" />
              Diagnostics & Overrides
            </h2>

            <div className="flex items-center justify-between bg-zinc-900/20 p-3.5 rounded border border-zinc-900 text-left">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-200">Show Execution Trace Drawer</p>
                <p className="text-[10px] text-zinc-500">Allow slide-over audit logs drawer during inference cycles.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showExecutionTrace}
                  onChange={(e) => setShowExecutionTrace(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-zinc-850 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600 peer-checked:after:bg-white"></div>
              </label>
            </div>
          </div>

          {/* Form Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearCache}
                className="px-4 py-2 bg-zinc-950 hover:bg-rose-950/20 border border-zinc-900 hover:border-rose-900/30 text-xs font-mono font-bold text-zinc-400 hover:text-rose-500 rounded transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Local Cache</span>
              </button>

              <button
                type="button"
                onClick={handleLogOut}
                className="px-4 py-2 bg-zinc-950 hover:bg-amber-950/20 border border-zinc-900 hover:border-amber-900/30 text-xs font-mono font-bold text-zinc-400 hover:text-amber-500 rounded transition flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              {isSaved && (
                <span className="text-xs text-emerald-400 font-mono animate-fade-in">
                  ✔ Configuration persisted
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white rounded transition shadow-[0_0_15px_-3px_rgba(124,58,237,0.25)] flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>

        </div>

        {/* Informative Operator panel (1 Col) */}
        <div className="space-y-6">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 shadow-panel h-full flex flex-col justify-between text-left">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-violet-400" />
                Workstation Notice
              </h2>
              <div className="text-[11px] text-zinc-400 space-y-3 leading-relaxed">
                <p>
                  These preference flags are saved directly within the browser client context. Restoring defaults or clearing cache will erase session metrics history logs.
                </p>
                <p>
                  Changes to the confidence thresholds limit are applied dynamically when the grounding detection models output bounding boxes on Taipei Port grids.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-zinc-950 border border-zinc-900 rounded text-center font-mono text-[9px] text-zinc-500 mt-6">
              <p>SATQUERY COMMAND CONSOLE V2.4</p>
              <p className="mt-1 font-bold text-zinc-650">SECURITY CLASSIFICATION: CONFIDENTIAL</p>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};

export default Settings;
