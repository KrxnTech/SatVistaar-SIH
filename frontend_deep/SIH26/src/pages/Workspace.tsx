import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { InputPanel } from '../components/InputPanel';
import type { InputFileItem } from '../components/InputPanel';
import { AgentStatus } from '../components/AgentStatus';
import type { AgentStep } from '../components/AgentStatus';
import { ImageViewer } from '../components/ImageViewer';
import type { ViewerMode } from '../components/ImageViewer';
import { QueryPanel } from '../components/QueryPanel';
import { ResultPanel } from '../components/ResultPanel';
import type { EvidenceItem } from '../components/ResultPanel';
import { ExecutionTrace } from '../components/ExecutionTrace';
import type { TraceStep } from '../components/ExecutionTrace';
import { 
  Terminal, 
  Compass, 
  Activity, 
  Grid, 
  Maximize2, 
  Minimize2
} from 'lucide-react';

const DEFAULT_MOCK_FILES: InputFileItem[] = [
  {
    id: 'layer-01',
    name: 'S2B_MSIL1C_20260830_T51R.tif',
    size: '42.8 MB',
    imageType: 'Multispectral',
    format: 'GeoTIFF',
    validationStatus: 'valid',
    validationMessage: 'Header verified. Coordinate reference system EPSG:4326 parsed.',
    compatibilityStatus: 'coregistered',
    crs: 'EPSG:4326',
    resolution: '10m/px',
    bounds: [121.45, 24.95, 121.65, 25.15],
    bands: ['B02 (Blue)', 'B03 (Green)', 'B04 (Red)', 'B08 (NIR)'],
    acquisitionDate: '2026-08-30 04:12 UTC',
    sensor: 'Sentinel-2B MS Imager'
  },
  {
    id: 'layer-02',
    name: 'CAP_G06_SAR_CO_REGS.geotiff',
    size: '84.2 MB',
    imageType: 'SAR',
    format: 'GeoTIFF',
    validationStatus: 'valid',
    validationMessage: 'Co-polarization band extracted. Header WGS84 aligned.',
    compatibilityStatus: 'coregistered',
    crs: 'EPSG:4326',
    resolution: '0.5m/px',
    bounds: [121.50, 25.00, 121.60, 25.10],
    bands: ['HH', 'HV'],
    acquisitionDate: '2026-08-29 18:24 UTC',
    sensor: 'Capella-6 SAR Radar'
  },
  {
    id: 'layer-03',
    name: 'L8_TIRS_THERMAL_BAND10.tiff',
    size: '12.4 MB',
    imageType: 'Thermal',
    format: 'TIFF',
    validationStatus: 'warning',
    validationMessage: 'Projection mismatch: File uses EPSG:3857. Coregistration will auto-resample cell sizes.',
    compatibilityStatus: 'resample_needed',
    crs: 'EPSG:3857',
    resolution: '30m/px',
    bounds: [121.40, 24.90, 121.70, 25.20],
    bands: ['B10 (Thermal Infrared)'],
    acquisitionDate: '2026-08-28 09:50 UTC',
    sensor: 'Landsat-8 TIRS'
  },
  {
    id: 'layer-04',
    name: 'DRONE_TAIPEI_DOCK_LOCAL.png',
    size: '8.1 MB',
    imageType: 'Optical',
    format: 'PNG',
    validationStatus: 'warning',
    validationMessage: 'No CRS metadata found. Alignment uses pixel reference coordinate anchor.',
    compatibilityStatus: 'mismatch',
    crs: 'Local Space',
    resolution: '0.1m/px',
    bounds: [121.54, 25.04, 121.56, 25.06],
    bands: ['Red', 'Green', 'Blue'],
    acquisitionDate: '2026-08-29 10:15 UTC',
    sensor: 'DJI Phantom 4 Pro'
  },
  {
    id: 'layer-05',
    name: 'CORRUPTED_HDF5_DATASET.hdf5',
    size: '156.0 MB',
    imageType: 'DEM',
    format: 'HDF5',
    validationStatus: 'error',
    validationMessage: 'Invalid file format. Cannot parse raster header metadata block. File is corrupted or structure mismatch.',
    compatibilityStatus: 'unknown',
    crs: 'Unknown',
    sensor: 'SRTM v4 DEM'
  }
];

export const Workspace: React.FC = () => {
  const location = useLocation();
  const [files, setFiles] = useState<InputFileItem[]>(DEFAULT_MOCK_FILES);
  const [selectedFileId, setSelectedFileId] = useState<string>('layer-01');
  const [visibleFileIds, setVisibleFileIds] = useState<string[]>(['layer-01', 'layer-02', 'layer-03', 'layer-04']);
  const [mapCRS, setMapCRS] = useState<string>('EPSG:4326');
  const [isMapExpanding, setIsMapExpanding] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Agent Status Steps State
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([
    { id: 'step-1', label: 'Query Received', description: 'Ingested raw prompt vector', status: 'pending' },
    { id: 'step-2', label: 'Intent Classified', description: 'Parsing visual task parameters', status: 'pending' },
    { id: 'step-3', label: 'Inputs Validated', description: 'Checking coordinate projection bounds', status: 'pending' },
    { id: 'step-4', label: 'Specialist Tool Selected', description: 'Tasking AI detection models', status: 'pending' },
    { id: 'step-5', label: 'Model Running', description: 'Evaluating ground samples neural nets', status: 'pending' },
    { id: 'step-6', label: 'Evidence Generated', description: 'Compiling coordinate overlay arrays', status: 'pending' },
    { id: 'step-7', label: 'Analysis Complete', description: 'Ready to download findings report', status: 'pending' }
  ]);
  const [detectedIntent, setDetectedIntent] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [showAgentStatus, setShowAgentStatus] = useState<boolean>(false);
  const [workspaceMode, setWorkspaceMode] = useState<ViewerMode>('single');

  // Result Panel State
  const [workspaceResultStatus, setWorkspaceResultStatus] = useState<'empty' | 'loading' | 'success' | 'error'>('empty');
  const [workspaceResults, setWorkspaceResults] = useState<{
    answer?: string;
    confidence?: number;
    evidenceItems?: EvidenceItem[];
    highlightedRegions?: string[];
    modelSummary?: {
      backbone: string;
      latency: string;
      parameters: string;
      version: string;
    };
  }>({});

  // Trace Drawer State
  const [isTraceOpen, setIsTraceOpen] = useState<boolean>(false);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([
    { id: 'tr-01', phase: 'Input Validation', status: 'pending', timestamp: '--:--:--.---', details: 'Raster headers validated. Coordinate reference systems matched workspace projection WGS84 EPSG:4326.' },
    { id: 'tr-02', phase: 'Query Interpretation', status: 'pending', timestamp: '--:--:--.---', details: 'Parsed natural-language prompt token vector. Extracted visual intent parameters.' },
    { id: 'tr-03', phase: 'Tool Selection', status: 'pending', timestamp: '--:--:--.---', details: 'Selected appropriate visual segmenter backbone weight files matching coregistered grids.' },
    { id: 'tr-04', phase: 'Model Execution', status: 'pending', timestamp: '--:--:--.---', details: 'Completed forward-pass model inference on Taipei harbor coordinates bounding boxes.' },
    { id: 'tr-05', phase: 'Output Generation', status: 'pending', timestamp: '--:--:--.---', details: 'Vectorized classification masks outputs. Saved executive result summary object.' }
  ]);

  // Map state coordinates / details
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 25.0342, lng: 121.5621 });
  const [mapZoom, setMapZoom] = useState<number>(13);
  const [_focusedBounds, setFocusedBounds] = useState<[number, number, number, number] | null>(null);

  // AI Prompt and logs
  const [promptText, setPromptText] = useState('Cross-register optical layer and SAR radar grids to outline change footprints.');
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] SatQuery Analysis Workspace Initialized.',
    '[TELEMETRY] AOS Link: STABLE. Telemetry feed active.',
    '[GIS] CRS Coordinate Lock: EPSG:4326 (WGS84 Reference).',
    '[AGENT] Standing by for telemetry analytics pipelines execution command.'
  ]);

  // Load router state files if any
  useEffect(() => {
    const routerState = location.state as { files?: InputFileItem[]; prompt?: string; mode?: string } | null;
    if (routerState) {
      if (routerState.mode) {
        const mappedMode = routerState.mode === 'optical-sar' ? 'fusion' : routerState.mode as ViewerMode;
        setWorkspaceMode(mappedMode);
      }
      if (routerState.files && routerState.files.length > 0) {
      // Merge route files with existing mocks
      const newFiles = [...routerState.files];
      
      // Pad missing keys for the components
      const mappedNewFiles: InputFileItem[] = newFiles.map((file, idx) => ({
        id: `uploaded-${idx}`,
        name: file.name,
        size: file.size || '32.1 MB',
        imageType: file.imageType || 'Optical',
        format: file.format || 'GeoTIFF',
        validationStatus: file.validationStatus || 'valid',
        validationMessage: file.validationStatus === 'valid'
          ? 'Header verified. Coordinate reference system EPSG:4326 parsed.'
          : file.validationMessage || 'Raster headers parsed.',
        compatibilityStatus: file.validationStatus === 'error' ? 'unknown' : 'coregistered',
        crs: file.crs || 'EPSG:4326',
        resolution: file.resolution || '0.3m/px',
        bounds: file.bounds || [121.51, 25.01, 121.55, 25.05],
        bands: file.bands || ['Red', 'Green', 'Blue'],
        acquisitionDate: file.acquisitionDate || new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
        sensor: file.sensor || 'Spectral Sensor'
      }));

      // Combine arrays, placing uploaded ones first
      setFiles([...mappedNewFiles, ...DEFAULT_MOCK_FILES]);
      setSelectedFileId(`uploaded-0`);
      setVisibleFileIds([`uploaded-0`, ...DEFAULT_MOCK_FILES.filter(f => f.validationStatus === 'valid').map(f => f.id)]);
      
      if (routerState.prompt) {
        setPromptText(routerState.prompt);
      }

      addLog(`[UPL_INGEST] Successfully loaded ${newFiles.length} telemetry files into the workspace session.`);
    }
  }
}, [location.state]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setVisibleFileIds(prev => prev.filter(vid => vid !== id));
    if (selectedFileId === id) {
      setSelectedFileId('');
    }
    const file = files.find(f => f.id === id);
    if (file) {
      addLog(`[LAYERS] Removed layer reference: ${file.name}`);
    }
  };

  const handleSelectFile = (file: InputFileItem) => {
    setSelectedFileId(file.id);
    if (file.bounds) {
      setFocusedBounds(file.bounds);
      setMapCenter({
        lat: (file.bounds[1] + file.bounds[3]) / 2,
        lng: (file.bounds[0] + file.bounds[2]) / 2
      });
      addLog(`[MAP] Selected layer focus: ${file.name}. Visual focus set to coordinate centroid.`);
    } else {
      addLog(`[MAP] Selected layer focus: ${file.name}. Layer contains no coordinates metadata.`);
    }
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    setVisibleFileIds(prev => 
      isVisible 
        ? [...prev, id] 
        : prev.filter(vid => vid !== id)
    );
    const file = files.find(f => f.id === id);
    if (file) {
      addLog(`[MAP] Layer overlay visibility set to ${isVisible ? 'ACTIVE' : 'INACTIVE'} for layer: ${file.name}`);
    }
  };

  const handleFocusBounds = (bounds: [number, number, number, number]) => {
    setFocusedBounds(bounds);
    setMapCenter({
      lat: (bounds[1] + bounds[3]) / 2,
      lng: (bounds[0] + bounds[2]) / 2
    });
    setMapZoom(14);
    addLog(`[MAP] Zoom and alignment locked onto coordinate bounds: [${bounds.join(', ')}]`);
  };



  // Change projection CRS grid
  const handleCRSChange = (crs: string) => {
    setMapCRS(crs);
    addLog(`[GIS] Projection system changed to ${crs}. Calculating coordinate offsets...`);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      
      // Update compatibility states based on current CRS
      setFiles(prev => prev.map(file => {
        if (file.crs === 'Unknown' || file.crs === 'Local Space') return file;
        
        let compatibility: InputFileItem['compatibilityStatus'] = 'coregistered';
        let status: InputFileItem['validationStatus'] = file.validationStatus;
        let message = file.validationMessage;

        if (file.crs !== crs) {
          compatibility = 'resample_needed';
          status = 'warning';
          message = `Projection alignment needed: Feed uses ${file.crs} but workspace is configured to ${crs}. Coregistration resampling will occur.`;
        } else {
          compatibility = 'compatible';
          status = 'valid';
          message = `Header verified. CRS matched workspace grid (${crs}).`;
        }

        return {
          ...file,
          compatibilityStatus: compatibility,
          validationStatus: status,
          validationMessage: message
        };
      }));

      addLog(`[GIS] Raster layers re-alignment verified. Grid matching complete under ${crs}.`);
    }, 1500);
  };

  // Run AI Co-processor trigger
  const runAICoprocessor = (prompt: string) => {
    if (!prompt.trim() || isProcessing) return;

    setIsProcessing(true);
    setShowAgentStatus(true);
    setDetectedIntent('');
    setSelectedTool('');
    setWorkspaceResultStatus('loading');
    setWorkspaceResults({});

    const getTimestamp = () => {
      const d = new Date();
      const pad = (num: number) => String(num).padStart(2, '0');
      const msPad = (num: number) => String(num).padStart(3, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${msPad(d.getMilliseconds())}`;
    };

    // Reset trace steps, validating active feeds immediately
    setTraceSteps([
      {
        id: 'tr-01',
        phase: 'Input Validation',
        status: 'success',
        timestamp: getTimestamp(),
        details: 'Raster headers validated. Coordinate reference systems matched workspace projection WGS84 EPSG:4326.',
        metadata: {
          'Bands Ingested': 'RGB + NIR (Sentinel-2)',
          'CRS Coordinate System': 'WGS84 (EPSG:4326)',
          'Ground Resolution': '0.3m per pixel',
          'Georeferencing Sync': 'Valid Tags'
        }
      },
      { id: 'tr-02', phase: 'Query Interpretation', status: 'pending', timestamp: '--:--:--.---', details: 'Parsed natural-language prompt token vector. Extracted visual intent parameters.' },
      { id: 'tr-03', phase: 'Tool Selection', status: 'pending', timestamp: '--:--:--.---', details: 'Selected appropriate visual segmenter backbone weight files matching coregistered grids.' },
      { id: 'tr-04', phase: 'Model Execution', status: 'pending', timestamp: '--:--:--.---', details: 'Completed forward-pass model inference on Taipei harbor coordinates bounding boxes.' },
      { id: 'tr-05', phase: 'Output Generation', status: 'pending', timestamp: '--:--:--.---', details: 'Vectorized classification masks outputs. Saved executive result summary object.' }
    ]);
    
    // Reset all steps to pending
    setAgentSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));

    addLog(`[AGENT] Initiated prompt vector parsing: "${prompt}"`);
    addLog(`[AGENT] Selected primary layers: ${files.filter(f => visibleFileIds.includes(f.id)).map(f => f.name).join(', ')}`);

    let currentTick = 0;
    
    // Set Step 1 Active immediately
    setAgentSteps(prev => prev.map((step, idx) => idx === 0 ? { ...step, status: 'active' } : step));
    addLog(`[AGENT] State transitioned: Step 1 [Query Received] is ACTIVE.`);

    const interval = setInterval(() => {
      currentTick++;
      
      setAgentSteps(prev => {
        const nextSteps = [...prev];
        
        if (currentTick === 1) {
          // Step 1 completed, Step 2 active
          nextSteps[0].status = 'completed';
          nextSteps[1].status = 'active';
          setDetectedIntent(prompt.toLowerCase().includes('change') || prompt.toLowerCase().includes('temporal') 
            ? 'Bi-Temporal Change Detection' 
            : 'Object Footprint Grounding');
          addLog(`[INGEST] Coregistered raster stack alignment check: OK.`);
          addLog(`[AGENT] State transitioned: Step 2 [Intent Classified] is ACTIVE.`);

          // Update query interpretation trace step
          setTraceSteps(prevTrace => prevTrace.map((step, idx) => idx === 1 ? {
            ...step,
            status: 'success',
            timestamp: getTimestamp(),
            metadata: {
              'Classified Intent': prompt.toLowerCase().includes('change') || prompt.toLowerCase().includes('temporal') ? 'Bi-Temporal Change Detection' : 'Object Footprint Grounding',
              'Prompt Payload': prompt.substring(0, 45) + (prompt.length > 45 ? '...' : ''),
              'Tokens Parsed': '12 Tokens'
            }
          } : step));
        } 
        else if (currentTick === 2) {
          // Step 2 completed, Step 3 active
          nextSteps[1].status = 'completed';
          nextSteps[2].status = 'active';
          addLog(`[AGENT] State transitioned: Step 3 [Inputs Validated] is ACTIVE.`);
        } 
        else if (currentTick === 3) {
          // Step 3 completed, Step 4 active
          nextSteps[2].status = 'completed';
          nextSteps[3].status = 'active';
          setSelectedTool(prompt.toLowerCase().includes('sar') 
            ? 'Fusion-ResNet Radar Segmenter' 
            : 'YOLOv8-OBB Fine-Grained Object Grounding');
          addLog(`[AGENT] State transitioned: Step 4 [Specialist Tool Selected] is ACTIVE.`);

          // Update tool selection trace step
          setTraceSteps(prevTrace => prevTrace.map((step, idx) => idx === 2 ? {
            ...step,
            status: 'success',
            timestamp: getTimestamp(),
            metadata: {
              'Selected Model Core': prompt.toLowerCase().includes('sar') ? 'Fusion-ResNet Radar Segmenter' : 'YOLOv8-OBB Fine-Grained Object Grounding',
              'Weight Parameters': prompt.toLowerCase().includes('sar') ? '64.1 Million' : '26.5 Million',
              'Selection Confidence': '98.24% Coherence'
            }
          } : step));
        } 
        else if (currentTick === 4) {
          // Step 4 completed, Step 5 active
          nextSteps[3].status = 'completed';
          nextSteps[4].status = 'active';
          addLog(`[PROCESS] Executing neural networks spatial grounding matrix.`);
          addLog(`[AGENT] State transitioned: Step 5 [Model Running] is ACTIVE.`);
        } 
        else if (currentTick === 5) {
          // Step 5 completed, Step 6 active
          nextSteps[4].status = 'completed';
          nextSteps[5].status = 'active';
          addLog(`[GEOMETRY] Vector polygons created. EPSG coordinates alignment succeeded.`);
          addLog(`[AGENT] State transitioned: Step 6 [Evidence Generated] is ACTIVE.`);

          // Update model execution trace step
          setTraceSteps(prevTrace => prevTrace.map((step, idx) => idx === 3 ? {
            ...step,
            status: 'success',
            timestamp: getTimestamp(),
            metadata: {
              'Computation Device': 'NVIDIA T4 TensorCore GPU',
              'Execution Latency': prompt.toLowerCase().includes('change') || prompt.toLowerCase().includes('temporal') ? '1.42 seconds' : '0.88 seconds',
              'Numerical Precision': 'FP16 Half-Precision'
            }
          } : step));
        } 
        else if (currentTick === 6) {
          // Step 6 completed, Step 7 active
          nextSteps[5].status = 'completed';
          nextSteps[6].status = 'active';
          addLog(`[AGENT] State transitioned: Step 7 [Analysis Complete] is ACTIVE.`);
          
          // Switch visual mode to grounding to display the output boxes overlays
          setWorkspaceMode('grounding');
        } 
        else if (currentTick === 7) {
          // Step 7 completed
          nextSteps[6].status = 'completed';
          addLog(`[SYSTEM] Complete. Generated segmentation masks vector coordinates output.`);
          addLog(`[SYSTEM] Change area calculated: 14,242 sq meters. Found 28 structural updates.`);

          // Update output generation trace step
          setTraceSteps(prevTrace => prevTrace.map((step, idx) => idx === 4 ? {
            ...step,
            status: 'success',
            timestamp: getTimestamp(),
            metadata: {
              'Output Geometry Format': 'GeoJSON FeatureCollection',
              'Polygons Generated': '28 coordinates areas',
              'Confidence Score': prompt.toLowerCase().includes('change') || prompt.toLowerCase().includes('temporal') ? '92% Average' : '94% Average'
            }
          } : step));
          
          // Populate dynamic visual results based on query prompt context keywords
          const isChangeDetection = prompt.toLowerCase().includes('change') || prompt.toLowerCase().includes('temporal') || prompt.toLowerCase().includes('bitemporal');
          const isSARRadar = prompt.toLowerCase().includes('sar') || prompt.toLowerCase().includes('radar') || prompt.toLowerCase().includes('fusion');
          
          if (isChangeDetection) {
            setWorkspaceResults({
              answer: "Bi-temporal change detection maps major container terminal infrastructure developments. Docks grading has been completed, container storage capacity is expanded by 28%, and two shipping cranes are fully operational.",
              confidence: 0.92,
              evidenceItems: [
                { id: 'ev-1', label: 'Graded container yard', value: '+14,242 m²', coordinates: '25.034° N, 121.562° E', confidence: 0.94 },
                { id: 'ev-2', label: 'Terminals building construction', value: 'Completed', coordinates: '25.038° N, 121.564° E', confidence: 0.89 }
              ],
              highlightedRegions: ["Area-49C Docks", "Taipei Lock B"],
              modelSummary: {
                backbone: 'ResNet-50-CD',
                latency: '1.42s',
                parameters: '48.2M',
                version: '2.4.1'
              }
            });
          } else if (isSARRadar) {
            setWorkspaceResults({
              answer: "Optical and SAR radar fusion successfully mapped metallic backscatter hotspots against regional ship channels. Identified two high-reflectivity container ships and three storage tank structures.",
              confidence: 0.95,
              evidenceItems: [
                { id: 'ev-1', label: 'Strong metal backscatter (Ship)', value: 'High Coherence', coordinates: '25.035° N, 121.561° E', confidence: 0.96 },
                { id: 'ev-2', label: 'Built-up dock crane structures', value: 'VV Polarity', coordinates: '25.039° N, 121.565° E', confidence: 0.91 }
              ],
              highlightedRegions: ["Hotspot Delta", "Taipei Ship Grid"],
              modelSummary: {
                backbone: 'Fusion-ResNet-X',
                latency: '1.84s',
                parameters: '64.1M',
                version: '1.0.2'
              }
            });
          } else {
            setWorkspaceResults({
              answer: "Satellite segmenter grounded vessels and harbor storage infrastructure coordinates matching Taipei Port terminals. Active ships count: 2. Impervious storage tanks: 3.",
              confidence: 0.94,
              evidenceItems: [
                { id: 'ev-1', label: 'Vessel (Container)', value: 'Grounded Box', coordinates: '25.034° N, 121.562° E', confidence: 0.94 },
                { id: 'ev-2', label: 'Petroleum Storage Tank', confidence: 0.88, coordinates: '25.031° N, 121.558° E', value: 'Impervious Area' }
              ],
              highlightedRegions: ["Ship-Alpha Grid", "Tank-Gamma 4"],
              modelSummary: {
                backbone: 'YOLOv8-OBB',
                latency: '0.88s',
                parameters: '26.5M',
                version: '8.0.12'
              }
            });
          }
          
          setWorkspaceResultStatus('success');
          setIsProcessing(false);
          clearInterval(interval);
        }
        
        return nextSteps;
      });
    }, 1200);
  };

  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className="space-y-6 select-none">
      
      {/* Page Title Row */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-wide uppercase">Analysis Workspace</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Unified GIS workstation for stacking rasters, auditing telemetry, and prompt-based grounding</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono bg-zinc-900/80 border border-zinc-800 rounded px-2.5 py-1 text-slate-400">
            AOS SYNC: <strong className="text-emerald-400">100%</strong>
          </span>
          <button
            onClick={() => handleCRSChange(mapCRS)}
            className="flex items-center gap-1.5 px-3 py-1 bg-violet-600 hover:bg-violet-700 text-xs text-white rounded transition shadow-[0_0_15px_-3px_rgba(124,58,237,0.2)]"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Force Re-align</span>
          </button>
          <button
            onClick={() => setIsTraceOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 hover:border-zinc-700 text-xs text-slate-300 hover:text-white rounded transition"
          >
            <Terminal className="w-3.5 h-3.5 text-violet-400" />
            <span>Trace Audit</span>
          </button>
        </div>
      </div>

      {/* Workspace Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* PANEL LEFT: INPUTS (1 Col) */}
        <div className="lg:col-span-1 space-y-4">
          <InputPanel
            files={files}
            selectedFileId={selectedFileId}
            visibleFileIds={visibleFileIds}
            onSelectFile={handleSelectFile}
            onRemoveFile={handleRemoveFile}
            onToggleVisibility={handleToggleVisibility}
            onFocusBounds={handleFocusBounds}
            isLoading={isProcessing && files.length === 0}
          />

          {/* Quick Stats Panel */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-4 space-y-3 font-mono text-[9px] text-zinc-500">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans border-b border-zinc-900 pb-1.5 flex items-center justify-between">
              <span>Raster Statistics</span>
              <Grid className="w-3.5 h-3.5 text-zinc-500" />
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>TOTAL AREA SPAN:</span>
                <span className="text-slate-300">32.84 sq km</span>
              </div>
              <div className="flex justify-between">
                <span>FUSED GRID ZOOM:</span>
                <span className="text-slate-300">Level {mapZoom}</span>
              </div>
              <div className="flex justify-between">
                <span>GEOLOCKED CHANNELS:</span>
                <span className="text-emerald-400 font-semibold">{files.filter(f => f.crs !== 'Local Space' && f.crs !== 'Unknown').length} Layers</span>
              </div>
              <div className="flex justify-between">
                <span>RESAMPLING BUFFER:</span>
                <span className="text-slate-300">Bilinear Matrix</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL CENTER: MAP (2 Cols) */}
        <div className={`lg:col-span-2 flex flex-col space-y-4 ${isMapExpanding ? 'lg:col-span-3' : ''} transition-all duration-300`}>
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden flex flex-col relative shadow-panel">
            
            {/* Map Header Controls */}
            <div className="bg-zinc-900/30 border-b border-zinc-900 px-4 py-2.5 flex items-center justify-between z-10 text-[10px] font-mono text-zinc-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-brand-sky animate-spin-slow" />
                  <span className="text-slate-200 font-bold uppercase tracking-wider font-sans">GIS Viewer Port</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">PROJECTION:</span>
                  <div className="flex bg-black border border-zinc-800 rounded p-0.5">
                    {['EPSG:4326', 'EPSG:3857', 'EPSG:32643'].map(crs => (
                      <button
                        key={crs}
                        onClick={() => handleCRSChange(crs)}
                        className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold ${
                          mapCRS === crs 
                            ? 'bg-violet-950/50 border border-violet-900/40 text-violet-400' 
                            : 'hover:text-slate-200 text-zinc-500'
                        }`}
                      >
                        {crs.replace('EPSG:', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">VIEW MODE:</span>
                  <div className="flex bg-black border border-zinc-800 rounded p-0.5">
                    {['single', 'grounding', 'bitemporal', 'fusion'].map(m => (
                      <button
                        key={m}
                        onClick={() => setWorkspaceMode(m as ViewerMode)}
                        className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase ${
                          workspaceMode === m 
                            ? 'bg-violet-950/50 border border-violet-900/40 text-violet-400' 
                            : 'hover:text-slate-200 text-zinc-500'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMapExpanding(!isMapExpanding)}
                  className="p-1 hover:bg-zinc-900 text-zinc-500 hover:text-slate-200 border border-transparent hover:border-zinc-800 rounded transition"
                  title={isMapExpanding ? 'Compress view grid' : 'Expand map canvas'}
                >
                  {isMapExpanding ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Satellite Image Viewer */}
            <ImageViewer
              mode={workspaceMode}
              opticalUrl="/sat-optical.jpg"
              sarUrl="/sat-sar.jpg"
              historicalUrl="/sat-historical.jpg"
              className="w-full h-[380px] border-none rounded-none"
            />

            {/* Map Footer Metadata info bar */}
            <div className="bg-zinc-950/60 p-3.5 flex items-center justify-between text-[9px] font-mono text-zinc-500 z-10">
              <div className="flex gap-4">
                <div>CENTER LAT: <strong className="text-slate-300">{mapCenter.lat.toFixed(5)}° N</strong></div>
                <div>CENTER LNG: <strong className="text-slate-300">{mapCenter.lng.toFixed(5)}° E</strong></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>COHERENCE SYNC STATUS: SECURE</span>
              </div>
            </div>
          </div>

          {/* Selected Layer Info panel details */}
          {selectedFile ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-mono text-violet-400 bg-violet-950/30 border border-violet-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Layer Focus
                  </span>
                  <h3 className="text-sm font-bold text-slate-200 mt-2 tracking-wide font-mono truncate max-w-[320px]">
                    {selectedFile.name}
                  </h3>
                </div>
                <div className="font-mono text-right text-[10px] text-zinc-500">
                  <p>RESOLVED RES: <strong className="text-slate-300">{selectedFile.resolution || 'N/A'}</strong></p>
                  <p>SENSOR MODEL: <strong className="text-slate-300">{selectedFile.sensor || 'N/A'}</strong></p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 font-mono text-[9.5px]">
                <div className="bg-zinc-900/40 border border-zinc-900/50 p-2 rounded">
                  <span className="text-zinc-600 block text-[8px]">PROJECTION</span>
                  <span className="text-slate-300 font-bold">{selectedFile.crs}</span>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-900/50 p-2 rounded">
                  <span className="text-zinc-600 block text-[8px]">VALIDATION</span>
                  <span className={`font-bold capitalize ${
                    selectedFile.validationStatus === 'valid' ? 'text-emerald-400' :
                    selectedFile.validationStatus === 'warning' ? 'text-amber-400' : 'text-rose-500'
                  }`}>
                    {selectedFile.validationStatus}
                  </span>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-900/50 p-2 rounded">
                  <span className="text-zinc-600 block text-[8px]">FILE FORMAT</span>
                  <span className="text-slate-300 font-bold">{selectedFile.format}</span>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-900/50 p-2 rounded">
                  <span className="text-zinc-600 block text-[8px]">IMAGE TYPE</span>
                  <span className="text-slate-300 font-bold">{selectedFile.imageType}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-900 border-dashed rounded-lg p-6 text-center text-zinc-500 text-xs font-mono">
              Select a layer card in the Telemetry panel to view georeference mapping and band coordinates
            </div>
          )}
        </div>

        {/* PANEL RIGHT: ASK & LOGGER (1 Col) */}
        {!isMapExpanding && (
          <div className="lg:col-span-1 space-y-4">
            
            {/* Query Input Panel */}
            <QueryPanel
              mode={workspaceMode}
              promptValue={promptText}
              onChangePrompt={setPromptText}
              onSubmitQuery={runAICoprocessor}
              isProcessing={isProcessing}
            />

            {showAgentStatus && (
              <AgentStatus 
                steps={agentSteps}
                detectedIntent={detectedIntent}
                selectedTool={selectedTool}
              />
            )}

            <ResultPanel
              status={workspaceResultStatus}
              answer={workspaceResults.answer}
              confidence={workspaceResults.confidence}
              evidenceItems={workspaceResults.evidenceItems}
              highlightedRegions={workspaceResults.highlightedRegions}
              modelSummary={workspaceResults.modelSummary}
              onDownloadReport={() => {
                alert("Generating export report files... SatQuery_AI_Inference_Report.pdf downloaded successfully.");
              }}
            />

            {/* Ingestion & Telemetry Logs */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden flex flex-col shadow-panel">
              <div className="bg-zinc-900/30 border-b border-zinc-900 px-3 py-2 flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-violet-400" />
                  Console Audit
                </h4>
                <button 
                  onClick={() => setLogs([])}
                  className="text-[8px] font-mono text-zinc-500 hover:text-slate-300 uppercase"
                >
                  Clear
                </button>
              </div>

              <div className="p-3 bg-black/40 h-[260px] overflow-y-auto font-mono text-[9px] text-zinc-400 space-y-1.5 select-text">
                {logs.map((log, idx) => {
                  let color = 'text-zinc-500';
                  if (log.startsWith('[SYSTEM]')) color = 'text-brand-sky';
                  else if (log.startsWith('[TELEMETRY]')) color = 'text-slate-300';
                  else if (log.startsWith('[GIS]')) color = 'text-violet-400';
                  else if (log.startsWith('[AGENT]')) color = 'text-amber-400';
                  else if (log.includes('error') || log.includes('ERRORS')) color = 'text-rose-400';
                  else if (log.includes('UPL_INGEST')) color = 'text-emerald-400';

                  return (
                    <div key={idx} className={`leading-relaxed border-l border-zinc-900 pl-1.5 ${color}`}>
                      {log}
                    </div>
                  );
                })}
                {isProcessing && (
                  <div className="flex items-center gap-1.5 text-violet-400 animate-pulse pt-1">
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-ping"></span>
                    <span>AI Coprocessor running segmentation...</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Execution Trace Slide-over Drawer */}
      <ExecutionTrace 
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        steps={traceSteps}
      />
    </div>
  );
};

export default Workspace;
