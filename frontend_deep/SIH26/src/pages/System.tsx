import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Compass, 
  Info,
  X,
  Sliders,
  ChevronRight,
  Database
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  codename: string;
  purpose: string;
  adaptation: string;
  dataset: string;
  version: string;
  status: 'Active' | 'Offline' | 'Loading';
  metrics: Record<string, string>;
  endpoint: string;
}

interface SystemNode {
  name: string;
  type: string;
  status: 'Online' | 'Offline' | 'Warning';
  utilization: number;
  temperature: string;
  ip: string;
}

const System: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  const nodes: SystemNode[] = [
    { name: 'Orbital Ingestion Core', type: 'Ingestion Engine', status: 'Online', utilization: 34, temperature: '42°C', ip: '10.240.0.12' },
    { name: 'GPU Cluster (Tesla H100)', type: 'AI Inference Array', status: 'Online', utilization: 78, temperature: '68°C', ip: '10.240.4.101' },
    { name: 'Rasterization Pipeline', type: 'Image Tiling Engine', status: 'Online', utilization: 12, temperature: '38°C', ip: '10.240.2.14' },
    { name: 'Swath Cache Array', type: 'High-speed Storage', status: 'Online', utilization: 55, temperature: '45°C', ip: '10.240.8.2' }
  ];

  const modelsData: AIModel[] = [
    {
      id: 'model-vqa',
      name: 'Remote-Sensing VQA',
      codename: 'SatVistaar-VQA-v2.1',
      purpose: 'Answers complex natural-language reasoning queries regarding terrain properties, land-cover classes, and localized port infrastructure layouts.',
      adaptation: 'Parameter-efficient fine-tuning (LoRA Rank=8, Alpha=16) over visual-language projection matrices.',
      dataset: 'SatVQA-100K + Custom Taiwan land classification benchmarks',
      version: '2.1.0-alpha',
      status: 'Active',
      metrics: { 'Accuracy': '78.4%', 'Avg Latency': '340ms', 'Parameters': '7.2B' },
      endpoint: '/api/v1/inference/vqa'
    },
    {
      id: 'model-grounding',
      name: 'Grounding Engine',
      codename: 'YOLOv8-OBB-Harbor',
      purpose: 'Performs fine-grained detection and generates oriented bounding box coordinate arrays around ships, storage tanks, and gantry cranes.',
      adaptation: 'Transfer learning on pre-trained YOLOv8-OBB core backbone with anchors adapted to marine shapes.',
      dataset: 'DOTA-v2.0 maritime classes + Taipei harbor aerial captures',
      version: '8.0.12-stable',
      status: 'Active',
      metrics: { 'mAP@50': '86.2%', 'Avg Latency': '45ms', 'Parameters': '26.5M' },
      endpoint: '/api/v1/inference/grounding'
    },
    {
      id: 'model-change',
      name: 'Change Analysis',
      codename: 'ResNet-50-CD',
      purpose: 'Compares bi-temporal raster grids (T1 baseline vs T2 target) to segment structural change updates and calculate area deltas.',
      adaptation: 'Siamese feature extraction structure with custom cross-attention change masking projection heads.',
      dataset: 'LEVIR-CD + Sentinel-2 change detection dataset pairs',
      version: '2.4.1',
      status: 'Active',
      metrics: { 'F1-Score': '89.1%', 'Avg Latency': '112ms', 'Parameters': '48.2M' },
      endpoint: '/api/v1/inference/change-detection'
    },
    {
      id: 'model-fusion',
      name: 'Optical-SAR Fusion',
      codename: 'Fusion-ResNet-X',
      purpose: 'Co-registers multi-modal rasters (Optical RGB + SAR radar backscatter) and computes high-reflectivity scatter footprints.',
      adaptation: 'Dual-encoder channel alignment fusion network with cross-attention coherence matching layers.',
      dataset: 'SEN12MS (Sentinel-1 and Sentinel-2 paired rasters)',
      version: '1.0.2',
      status: 'Active',
      metrics: { 'Coherence Acc': '94.5%', 'Avg Latency': '180ms', 'Parameters': '64.1M' },
      endpoint: '/api/v1/inference/fusion'
    }
  ];

  const systemLogs = [
    { time: '15:02:44', node: 'GPU_NODE_03', message: 'Inference model YOLOv8-OBB-Harbor loaded successfully.' },
    { time: '15:01:12', node: 'INGEST_CORE', message: 'Sentinel-2 band sync complete. 1.2 GB raw cache ingestion saved.' },
    { time: '14:55:08', node: 'AUTH_GATE', message: 'API validation token granted for user [OPERATOR_492].' },
    { time: '14:52:19', node: 'TILE_SERV', message: 'Cleared expired cache grids for region [Taipei Harbor].' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Title Area */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-100 tracking-wide uppercase">System Models & Infrastructure</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Real-time status of computing clusters, specialized AI engines, and hardware event logs</p>
        </div>
        <div className="p-2 bg-zinc-950 border border-zinc-900 rounded flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
          <Database className="w-3.5 h-3.5 text-violet-400" />
          <span>STATION NODE: ONLINE</span>
        </div>
      </div>

      {/* Hardware Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 shadow-panel flex items-center gap-4">
          <div className="p-3 bg-violet-950/30 border border-violet-900/30 text-violet-400 rounded">
            <Server className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Overall Status</p>
            <h3 className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
              OPERATIONAL
            </h3>
          </div>
        </div>

        <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 shadow-panel flex items-center gap-4">
          <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Average GPU Load</p>
            <h3 className="text-lg font-bold text-slate-200 mt-1 font-mono">54.2% Load</h3>
          </div>
        </div>

        <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 shadow-panel flex items-center gap-4">
          <div className="p-3 bg-indigo-950/30 border border-indigo-900/30 text-indigo-400 rounded">
            <Zap className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">API Gate Response</p>
            <h3 className="text-lg font-bold text-slate-200 mt-1 font-mono">118ms Ping</h3>
          </div>
        </div>
      </div>

      {/* AI Models Core Cluster */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono text-left">
            AI Analytics Core Models
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modelsData.map((model) => (
            <div
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className="bg-zinc-950/40 hover:bg-zinc-900/30 border border-zinc-900 hover:border-violet-900/50 rounded-lg p-4 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[140px] text-left group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-violet-600/5 rounded-full blur-xl pointer-events-none group-hover:bg-violet-600/10 transition duration-300"></div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {model.id === 'model-vqa' && <Terminal className="w-4 h-4 text-violet-400" />}
                    {model.id === 'model-grounding' && <Compass className="w-4 h-4 text-brand-sky" />}
                    {model.id === 'model-change' && <Sliders className="w-4 h-4 text-emerald-400" />}
                    {model.id === 'model-fusion' && <Sparkles className="w-4 h-4 text-amber-400" />}
                    <h3 className="text-sm font-bold text-slate-200">{model.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase">{model.status}</span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium line-clamp-2">
                  {model.purpose}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-900/50 mt-4">
                <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900/60 border border-zinc-850 px-2 py-0.5 rounded">
                  {model.codename}
                </span>
                <span className="text-[9.5px] font-mono text-violet-400 group-hover:text-violet-300 flex items-center gap-0.5 transition">
                  Inspect Spec
                  <ChevronRight className="w-3.5 h-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nodes Status Grid */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg shadow-panel">
        <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/20 text-left">
          <span className="text-xs font-semibold uppercase text-slate-200 tracking-wider">Computing Nodes & Cluster Health</span>
          <span className="text-[10px] font-mono text-zinc-500">IP DOMAIN: 10.240.*.*</span>
        </div>
        
        <div className="p-4 space-y-4">
          {nodes.map((node, index) => (
            <div key={index} className="bg-zinc-900/20 border border-zinc-900/60 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-black rounded border border-zinc-900 text-slate-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{node.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{node.type} • {node.ip}</p>
                </div>
              </div>

              {/* Progress bars & status details */}
              <div className="flex flex-1 md:justify-end items-center gap-6">
                {/* Utilization gauge */}
                <div className="w-full max-w-[200px] flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-500 w-10 text-right">LOAD: {node.utilization}%</span>
                  <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        node.utilization > 90 ? 'bg-rose-500' :
                        node.utilization > 70 ? 'bg-amber-500' : 'bg-violet-600'
                      }`}
                      style={{ width: `${node.utilization}%` }}
                    ></div>
                  </div>
                </div>

                {/* Temperature tag */}
                <div className="text-[10px] font-mono text-slate-400">
                  TEMP: <span className="text-slate-300">{node.temperature}</span>
                </div>

                {/* Status indicator badge */}
                <div className="w-20 text-right">
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider font-sans bg-emerald-950/20 text-emerald-400 border border-emerald-900/30">
                    {node.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Logs Panel */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg shadow-panel flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/20">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-semibold uppercase text-slate-200 tracking-wider">Live System Logs</span>
          </div>
          <span className="text-[10px] font-mono text-violet-400 bg-violet-950/30 px-2 py-0.5 rounded border border-violet-900/30">OPERATIONAL FEED</span>
        </div>
        <div className="bg-black p-4 font-mono text-[11px] text-slate-400 space-y-2 max-h-48 overflow-y-auto leading-relaxed border-t border-zinc-900 text-left">
          {systemLogs.map((log, index) => (
            <div key={index} className="flex items-start gap-4">
              <span className="text-zinc-500 select-none">{log.time}</span>
              <span className="text-violet-400 font-semibold min-w-[90px] select-none">[{log.node}]</span>
              <span className="text-slate-300">
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Model Spec Details Inspector Modal */}
      <AnimatePresence>
        {selectedModel && (
          <>
            {/* Backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModel(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 cursor-pointer"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[480px] bg-zinc-950 border border-zinc-900 rounded-lg p-5 z-50 flex flex-col shadow-2xl font-sans"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-zinc-900 pb-3">
                <div className="text-left space-y-0.5">
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">AI Core Model Specification</span>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{selectedModel.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="p-1.5 rounded hover:bg-zinc-900 text-zinc-500 hover:text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body Contents */}
              <div className="space-y-4 py-4 text-left font-mono text-[9.5px]">
                
                {/* Purpose Block */}
                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase">Core Purpose:</span>
                  <p className="text-slate-300 font-sans text-[10.5px] leading-relaxed">
                    {selectedModel.purpose}
                  </p>
                </div>

                {/* Grid Metadata details */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-0.5 p-2 bg-zinc-900/30 border border-zinc-900 rounded">
                    <span className="text-[7.5px] text-zinc-650 uppercase">MODEL CODENAME:</span>
                    <span className="text-slate-200 block truncate">{selectedModel.codename}</span>
                  </div>
                  <div className="space-y-0.5 p-2 bg-zinc-900/30 border border-zinc-900 rounded">
                    <span className="text-[7.5px] text-zinc-650 uppercase">ACTIVE VERSION:</span>
                    <span className="text-slate-200 block truncate">{selectedModel.version}</span>
                  </div>
                </div>

                {/* Adaptation Method */}
                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase">Adaptation Method:</span>
                  <div className="p-2 bg-zinc-900/20 border border-zinc-900 rounded text-slate-300 leading-relaxed font-sans text-[10px]">
                    {selectedModel.adaptation}
                  </div>
                </div>

                {/* Dataset */}
                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase">Training Dataset Pairs:</span>
                  <div className="p-2 bg-zinc-900/20 border border-zinc-900 rounded text-slate-300 leading-relaxed font-sans text-[10px] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>{selectedModel.dataset}</span>
                  </div>
                </div>

                {/* Metrics Table Grid */}
                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase">Performance Metrics:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(selectedModel.metrics).map(([key, val]) => (
                      <div key={key} className="p-2 bg-zinc-900/40 border border-zinc-900 rounded text-center">
                        <span className="text-[7px] text-zinc-600 block uppercase">{key}</span>
                        <span className="text-slate-200 font-bold text-[10.5px] block mt-0.5">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FastAPI Adapter Route */}
                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase">FastAPI API Endpoint Route:</span>
                  <div className="p-2 bg-black border border-zinc-900 rounded text-violet-400 flex items-center justify-between font-mono text-[9px]">
                    <span>POST {selectedModel.endpoint}</span>
                    <span className="text-[8px] px-1 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded uppercase font-bold">
                      Online
                    </span>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-zinc-900 flex justify-end">
                <button
                  onClick={() => setSelectedModel(null)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-[10px] font-mono font-bold text-slate-300 rounded transition uppercase"
                >
                  Close Spec
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default System;
