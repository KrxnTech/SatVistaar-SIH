import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  Layers, 
  Combine, 
  Target, 
  Terminal,
  Activity
} from 'lucide-react';

interface AnalysisCardProps {
  title: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  linkTo: string;
}

const AnalysisModelCard: React.FC<AnalysisCardProps> = ({ 
  title, 
  description, 
  badge,
  icon: Icon, 
  linkTo
}) => {
  return (
    <Link to={linkTo} className="block group">
      <div className="bg-[#0c0c0e]/80 backdrop-blur-md border border-zinc-900 rounded-lg p-5 flex flex-col justify-between hover:border-violet-500/40 transition duration-300 shadow-panel h-48 relative overflow-hidden">
        <div>
          {/* Top layout */}
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-extrabold text-slate-200 uppercase tracking-wider">{title}</h3>
            <span className="text-[8px] font-mono font-bold text-violet-400 bg-violet-950/20 border border-violet-900/30 px-2 py-0.5 rounded uppercase tracking-widest">
              {badge}
            </span>
          </div>
          {/* Description */}
          <p className="text-[11px] text-zinc-500 mt-3 leading-relaxed font-semibold">{description}</p>
        </div>
        
        {/* Bottom icon container */}
        <div className="flex justify-end mt-2">
          <div className="p-1.5 rounded-sm bg-zinc-900/60 text-violet-400">
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Accent hover line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
      </div>
    </Link>
  );
};

const TelemetryWave: React.FC = () => (
  <div className="h-20 w-full mt-4 flex items-center justify-center bg-black/60 border border-zinc-900/60 rounded p-1 overflow-hidden relative select-none">
    <svg className="w-full h-full" viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M0 30 C 20 10, 40 50, 60 30 C 80 10, 100 50, 120 30 C 140 10, 160 50, 180 30 C 200 10, 220 50, 240 30 C 260 10, 280 50, 300 30" 
        stroke="#10B981" 
        strokeWidth="1.75" 
        strokeDasharray="6,4"
        fill="none"
      />
      <path 
        d="M0 30 C 20 10, 40 50, 60 30 C 80 10, 100 50, 120 30 C 140 10, 160 50, 180 30 C 200 10, 220 50, 240 30 C 260 10, 280 50, 300 30" 
        stroke="#10B981" 
        strokeWidth="3.5" 
        fill="none"
        opacity="0.15"
      />
    </svg>
  </div>
);

const Dashboard: React.FC = () => {
  const analysisModels: AnalysisCardProps[] = [
    {
      title: 'Single Image Analysis',
      description: 'Isolate objects, classify land terrain features, and perform structural boundary mapping on a single capture.',
      icon: ImageIcon,
      badge: 'L1C_STD',
      linkTo: '/new-analysis?model=single'
    },
    {
      title: 'Bi-temporal Change',
      description: 'Compare co-registered images of the same coordinates taken at distinct time frames to compute differences.',
      icon: Layers,
      badge: 'DIFF_MAP',
      linkTo: '/new-analysis?model=bitemporal'
    },
    {
      title: 'Optical + SAR Fusion',
      description: 'Fuse Synthetic Aperture Radar (SAR) signals with high-fidelity optical layers to bypass cover conditions.',
      icon: Combine,
      badge: 'SAR_FUSE',
      linkTo: '/new-analysis?model=fusion'
    },
    {
      title: 'Text-guided Grounding',
      description: 'Query high-res scans using natural language prompt vectors to automatically detect, frame, and count.',
      icon: Target,
      badge: 'Z_SHOT',
      linkTo: '/new-analysis?model=grounding'
    }
  ];

  const recentAnalyses = [
    { id: 'MSN-8889', sensor: 'Sentinel-2 (L2A)', type: 'Bi-temporal', time: '14:22:01', status: 'Completed' },
    { id: 'MSN-8888', sensor: 'WorldView-3', type: 'Z-Shot AI', time: '14:15:44', status: 'Running' },
    { id: 'MSN-8887', sensor: 'Landsat 9', type: 'Single Image', time: '12:05:19', status: 'Completed' },
    { id: 'MSN-8886', sensor: 'Sentinel-1 (SAR)', type: 'Fusion', time: '09:44:11', status: 'Failed' },
    { id: 'MSN-8885', sensor: 'WorldView-2', type: 'Bi-temporal', time: '08:12:00', status: 'Completed' }
  ];

  const [logs, setLogs] = useState([
    { time: '[14:22]', text: 'MSN-8892 completed. Delta variance detected in Sector 4G. Flagged for review.', highlight: false },
    { time: '[14:15]', text: 'Initiated MSN-8891 Z-Shot sequence. Awaiting feature extraction vectors.', highlight: true },
    { time: '[13:50]', text: 'System recalibration complete. Sensor array alignment nominal.', highlight: false },
    { time: '[12:05]', text: 'MSN-8890 archived to cold storage.', highlight: false },
  ]);
  const [newLogText, setNewLogText] = useState('');

  const handleAddLog = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newLogText.trim() !== '') {
      const currentTime = new Date();
      const timeStr = `[${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}]`;
      setLogs(prev => [
        { time: timeStr, text: newLogText.trim(), highlight: false },
        ...prev
      ]);
      setNewLogText('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start relative z-10">
      
      {/* LEFT SECTION (Col Span 3) */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Welcome Banner Card */}
        <div className="bg-[#0c0c0e]/80 backdrop-blur-md border border-zinc-900 rounded-lg p-8 shadow-panel relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-650/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Satellite Intelligence <br /> Coprocessor
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 leading-relaxed font-semibold max-w-2xl">
              Acquire multi-spectral sensor feeds, align bi-temporal delta scans, and run zero-shot visual AI models
            </p>
            
            <div className="pt-4">
              <Link
                to="/new-analysis"
                className="inline-flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-500 text-xs font-extrabold text-white rounded transition shadow-[0_0_20px_rgba(139,92,246,0.2)] tracking-wider font-mono uppercase"
              >
                START ANALYSIS MISSION
              </Link>
            </div>
          </div>
        </div>

        {/* Features Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analysisModels.map((model, index) => (
            <AnalysisModelCard key={index} {...model} />
          ))}
        </div>

        {/* Recent Audits Table */}
        <div className="bg-[#0c0c0e]/80 backdrop-blur-md border border-zinc-900 rounded-lg shadow-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[11px] font-mono">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-650 uppercase font-extrabold bg-zinc-950/20 select-none">
                  <th className="p-4 tracking-wider">Analysis ID</th>
                  <th className="p-4 tracking-wider">Sensor Feed</th>
                  <th className="p-4 tracking-wider">Type</th>
                  <th className="p-4 tracking-wider">Status</th>
                  <th className="p-4 tracking-wider">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50 text-slate-350">
                {recentAnalyses.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/10 transition">
                    <td className="p-4 text-violet-400 font-bold">{item.id}</td>
                    <td className="p-4 text-slate-200 font-sans font-medium">{item.sensor}</td>
                    <td className="p-4 text-zinc-500 font-sans font-semibold">{item.type}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'Completed' 
                            ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' 
                            : item.status === 'Running'
                            ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_#F59E0B]'
                            : 'bg-rose-500 shadow-[0_0_8px_#EF4444]'
                        }`} />
                        <span className={`uppercase font-bold tracking-widest text-[9px] ${
                          item.status === 'Completed' 
                            ? 'text-emerald-400' 
                            : item.status === 'Running'
                            ? 'text-amber-450'
                            : 'text-rose-500'
                        }`}>{item.status}</span>
                      </span>
                    </td>
                    <td className="p-4 text-zinc-600 font-semibold">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* RIGHT SECTION (Col Span 1) */}
      <div className="space-y-6">
        
        {/* Active Telemetry Card */}
        <div className="bg-[#0c0c0e]/80 backdrop-blur-md border border-zinc-900 rounded-lg p-5 shadow-panel font-mono text-[10px] space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 border-b border-zinc-900 pb-3">
            <Activity className="w-4 h-4" />
            <span className="font-extrabold tracking-widest text-[11px]">ACTIVE TELEMETRY</span>
          </div>

          <div className="space-y-2 text-zinc-400">
            <div className="flex justify-between items-center">
              <span className="font-semibold tracking-wider text-zinc-600">LATITUDE:</span>
              <span className="text-slate-205 font-bold">37.7750° N</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold tracking-wider text-zinc-600">LONGITUDE:</span>
              <span className="text-slate-205 font-bold">122.4195° W</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold tracking-wider text-zinc-600">ELEVATION:</span>
              <span className="text-slate-205 font-bold">15.2m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold tracking-wider text-zinc-600">AZIMUTH:</span>
              <span className="text-amber-450 font-extrabold">144.8°</span>
            </div>
          </div>

          {/* Telemetry wave line animation */}
          <TelemetryWave />
        </div>

        {/* Operator Log Card */}
        <div className="bg-[#0c0c0e]/80 backdrop-blur-md border border-zinc-900 rounded-lg p-5 shadow-panel font-mono text-[10px] space-y-4 flex flex-col justify-between min-h-[300px]">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-400 border-b border-zinc-900 pb-3">
              <Terminal className="w-4 h-4" />
              <span className="font-extrabold tracking-widest text-[11px]">OPERATOR LOG</span>
            </div>

            {/* Scrollable logs */}
            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5 leading-relaxed font-semibold">
                  <span className="text-zinc-600 font-bold shrink-0">{log.time}</span>
                  <span className={log.highlight ? 'text-amber-400' : 'text-zinc-400'}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Input box */}
          <div className="border-t border-zinc-900 pt-3.5">
            <input 
              type="text"
              value={newLogText}
              onChange={(e) => setNewLogText(e.target.value)}
              onKeyDown={handleAddLog}
              placeholder="> Append log entry..."
              className="w-full bg-transparent text-emerald-400 focus:outline-none placeholder-zinc-650 font-bold text-[10px]"
            />
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
