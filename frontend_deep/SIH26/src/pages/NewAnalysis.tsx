import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Satellite, 
  Layers, 
  Combine, 
  UploadCloud, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  ArrowRight, 
  Info 
} from 'lucide-react';

type AnalysisMode = 'single' | 'optical-sar' | 'bitemporal';

interface UploadedFile {
  file: File;
  name: string;
  size: string;
  type: string;
  previewUrl?: string;
  validationStatus: 'validating' | 'success' | 'error';
  validationMessage: string;
  isGeoreferenced: boolean;
}

const NewAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AnalysisMode>('single');
  const [promptText, setPromptText] = useState('Detect and outline building footprints and classify vegetation density zones.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Separate file upload state trackers
  const [singleFile, setSingleFile] = useState<UploadedFile | null>(null);
  
  // Optical + SAR
  const [opticalFile, setOpticalFile] = useState<UploadedFile | null>(null);
  const [sarFile, setSarFile] = useState<UploadedFile | null>(null);

  // Bi-temporal
  const [t1File, setT1File] = useState<UploadedFile | null>(null);
  const [t2File, setT2File] = useState<UploadedFile | null>(null);

  // Format bytes helper
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Mock validation runner
  const runMockValidation = (
    file: File, 
    onProgress: (status: UploadedFile) => void, 
    expectedType: 'any' | 'optical' | 'sar'
  ) => {
    const isImage = file.type.startsWith('image/') && !file.name.endsWith('.tiff') && !file.name.endsWith('.tif');
    const isTiff = file.name.endsWith('.tiff') || file.name.endsWith('.tif') || file.name.endsWith('.geotiff');
    
    // Set initial validation state
    const initialFileState: UploadedFile = {
      file,
      name: file.name,
      size: formatBytes(file.size),
      type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      previewUrl: isImage ? URL.createObjectURL(file) : undefined,
      validationStatus: 'validating',
      validationMessage: 'Parsing raster header metadata...',
      isGeoreferenced: false
    };
    onProgress(initialFileState);

    // Simulate validation latency
    setTimeout(() => {
      // Validate file extension
      const validExtensions = ['tiff', 'tif', 'geotiff', 'png', 'jpg', 'jpeg'];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (!validExtensions.includes(ext)) {
        onProgress({
          ...initialFileState,
          validationStatus: 'error',
          validationMessage: 'Unsupported raster format. Use GeoTIFF, TIFF, PNG, or JPEG.'
        });
        return;
      }

      // Specific SAR checks (radar is usually TIFF/GeoTIFF)
      if (expectedType === 'sar' && !isTiff) {
        onProgress({
          ...initialFileState,
          validationStatus: 'error',
          validationMessage: 'SAR signal matrix requires GeoTIFF/TIFF formats (raw float bands).'
        });
        return;
      }

      // File size limits (Mock threshold: 100MB)
      if (file.size > 100 * 1024 * 1024) {
        onProgress({
          ...initialFileState,
          validationStatus: 'error',
          validationMessage: 'File size exceeds workstation buffer limit (100MB).'
        });
        return;
      }

      // Pass validation
      const georeferenced = isTiff || file.name.includes('geo');
      onProgress({
        ...initialFileState,
        validationStatus: 'success',
        validationMessage: georeferenced 
          ? 'Valid GeoTIFF: WGS84 Geotags and EPSG projection parsed.'
          : 'Valid Raster: standard visual frame (no georeference headers).',
        isGeoreferenced: georeferenced
      });

    }, 2000);
  };

  const handleModeChange = (newMode: AnalysisMode) => {
    setMode(newMode);
    setSubmitSuccess(false);
  };

  const handleAnalysisStart = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare files to send to workspace based on mode
    const filesToSend: any[] = [];
    if (mode === 'single' && singleFile) {
      filesToSend.push({
        name: singleFile.name,
        size: singleFile.size,
        imageType: 'Optical',
        format: singleFile.name.endsWith('.tiff') || singleFile.name.endsWith('.tif') || singleFile.name.endsWith('.geotiff') ? 'GeoTIFF' : 'PNG',
        validationStatus: singleFile.validationStatus === 'success' ? 'valid' : 'error',
        validationMessage: singleFile.validationMessage,
        crs: singleFile.isGeoreferenced ? 'EPSG:4326' : 'Local Space',
        resolution: '0.3m/px',
        bounds: [121.50, 25.00, 121.60, 25.10]
      });
    } else if (mode === 'optical-sar') {
      if (opticalFile) {
        filesToSend.push({
          name: opticalFile.name,
          size: opticalFile.size,
          imageType: 'Optical',
          format: opticalFile.name.endsWith('.tiff') || opticalFile.name.endsWith('.tif') || opticalFile.name.endsWith('.geotiff') ? 'GeoTIFF' : 'PNG',
          validationStatus: opticalFile.validationStatus === 'success' ? 'valid' : 'error',
          validationMessage: opticalFile.validationMessage,
          crs: opticalFile.isGeoreferenced ? 'EPSG:4326' : 'Local Space',
          resolution: '0.3m/px',
          bounds: [121.50, 25.00, 121.60, 25.10]
        });
      }
      if (sarFile) {
        filesToSend.push({
          name: sarFile.name,
          size: sarFile.size,
          imageType: 'SAR',
          format: 'GeoTIFF',
          validationStatus: sarFile.validationStatus === 'success' ? 'valid' : 'error',
          validationMessage: sarFile.validationMessage,
          crs: sarFile.isGeoreferenced ? 'EPSG:4326' : 'Local Space',
          resolution: '0.5m/px',
          bounds: [121.51, 25.01, 121.59, 25.09]
        });
      }
    } else if (mode === 'bitemporal') {
      if (t1File) {
        filesToSend.push({
          name: t1File.name,
          size: t1File.size,
          imageType: 'Optical',
          format: t1File.name.endsWith('.tiff') || t1File.name.endsWith('.tif') || t1File.name.endsWith('.geotiff') ? 'GeoTIFF' : 'PNG',
          validationStatus: t1File.validationStatus === 'success' ? 'valid' : 'error',
          validationMessage: t1File.validationMessage,
          crs: t1File.isGeoreferenced ? 'EPSG:4326' : 'Local Space',
          resolution: '0.3m/px',
          bounds: [121.48, 24.98, 121.58, 25.08]
        });
      }
      if (t2File) {
        filesToSend.push({
          name: t2File.name,
          size: t2File.size,
          imageType: 'Optical',
          format: t2File.name.endsWith('.tiff') || t2File.name.endsWith('.tif') || t2File.name.endsWith('.geotiff') ? 'GeoTIFF' : 'PNG',
          validationStatus: t2File.validationStatus === 'success' ? 'valid' : 'error',
          validationMessage: t2File.validationMessage,
          crs: t2File.isGeoreferenced ? 'EPSG:4326' : 'Local Space',
          resolution: '0.3m/px',
          bounds: [121.52, 25.02, 121.62, 25.12]
        });
      }
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      navigate('/workspace', { 
        state: { 
          files: filesToSend,
          prompt: promptText,
          mode: mode
        } 
      });
    }, 2000);
  };

  // Check if uploads are ready based on current mode
  const isUploadReady = (): boolean => {
    if (mode === 'single') {
      return singleFile?.validationStatus === 'success';
    } else if (mode === 'optical-sar') {
      return opticalFile?.validationStatus === 'success' && sarFile?.validationStatus === 'success';
    } else if (mode === 'bitemporal') {
      return t1File?.validationStatus === 'success' && t2File?.validationStatus === 'success';
    }
    return false;
  };

  // Sub-component for upload zones
  interface ZoneProps {
    label: string;
    description: string;
    fileState: UploadedFile | null;
    setFileState: (f: UploadedFile | null) => void;
    expectedType: 'any' | 'optical' | 'sar';
    accept: string;
  }

  const UploadZone: React.FC<ZoneProps> = ({ 
    label, 
    description, 
    fileState, 
    setFileState, 
    expectedType,
    accept 
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        runMockValidation(e.dataTransfer.files[0], setFileState, expectedType);
      }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        runMockValidation(e.target.files[0], setFileState, expectedType);
      }
    };

    return (
      <div className="bg-zinc-950 border border-zinc-900 rounded p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">{label}</label>
          <span className="text-[10px] text-zinc-500 font-mono">Max size: 100MB</span>
        </div>

        {fileState ? (
          /* File Upload Preview / Status card */
          <div className="bg-black border border-zinc-900 rounded p-4 flex gap-4 relative">
            
            {/* Remove file button */}
            <button
              type="button"
              onClick={() => setFileState(null)}
              className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Thumbnail / Symbol */}
            <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 rounded flex items-center justify-center overflow-hidden shrink-0">
              {fileState.previewUrl ? (
                <img src={fileState.previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
              ) : (
                <FileCode className="w-6 h-6 text-violet-400" />
              )}
            </div>

            {/* Details */}
            <div className="flex-grow pr-6 space-y-1">
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[200px]" title={fileState.name}>
                {fileState.name}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                {fileState.type} • {fileState.size}
              </p>

              {/* Status Row */}
              <div className="pt-1 flex items-center gap-1.5 text-[10px] font-sans font-medium">
                {fileState.validationStatus === 'validating' && (
                  <div className="flex items-center gap-1 text-violet-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{fileState.validationMessage}</span>
                  </div>
                )}
                {fileState.validationStatus === 'success' && (
                  <div className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{fileState.validationMessage}</span>
                  </div>
                )}
                {fileState.validationStatus === 'error' && (
                  <div className="flex items-center gap-1 text-rose-500">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{fileState.validationMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Drag and Drop Zone */
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
              dragActive 
                ? 'border-violet-500 bg-violet-600/5' 
                : 'border-zinc-900 bg-black hover:bg-zinc-900/50 hover:border-zinc-800'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept={accept}
            />
            <UploadCloud className="w-8 h-8 text-zinc-500 mb-2" />
            <p className="text-xs text-slate-300 font-semibold">{description}</p>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">GeoTIFF, TIFF, PNG, JPEG</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title Area */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-wide uppercase">Ingest Mission Telemetry</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Upload multi-spectral frames and radar signals to task intelligence algorithms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Form - 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Mode Selector */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 shadow-panel">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3.5">
              1. Select Configuration Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'single', label: 'Single Image', desc: 'Isolate target on single capture', icon: Satellite },
                { id: 'optical-sar', label: 'Optical + SAR', desc: 'Overlay optical and radar frames', icon: Combine },
                { id: 'bitemporal', label: 'Bi-temporal', desc: 'Scan change deltas (T1 vs T2)', icon: Layers }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModeChange(m.id as AnalysisMode)}
                    className={`p-4 rounded border text-left flex flex-col justify-between transition ${
                      mode === m.id
                        ? 'border-violet-500/40 bg-violet-600/5 text-violet-400 shadow-[inset_0_0_10px_rgba(124,58,237,0.05)]'
                        : 'border-zinc-900 bg-zinc-950 hover:bg-zinc-900/60 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-3" />
                    <div>
                      <p className="text-xs font-bold text-slate-200">{m.label}</p>
                      <p className="text-[10px] text-zinc-500 mt-1">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleAnalysisStart} className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-6 shadow-panel space-y-6">
            
            {/* Dynamic Upload Zones Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2. Upload Satellite Assets
                </h3>
                <span className="text-[10px] font-mono text-violet-400">MODE: {mode.toUpperCase()}</span>
              </div>

              {/* Render uploads dynamically based on configuration mode */}
              {mode === 'single' && (
                <div className="grid grid-cols-1 gap-4">
                  <UploadZone
                    label="Primary Satellite Capture"
                    description="Drag & drop primary raster frame or click to select"
                    fileState={singleFile}
                    setFileState={setSingleFile}
                    expectedType="any"
                    accept=".tiff,.tif,.geotiff,.png,.jpg,.jpeg"
                  />
                </div>
              )}

              {mode === 'optical-sar' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UploadZone
                    label="Optical Base Imagery"
                    description="Upload optical RGB/NIR band file"
                    fileState={opticalFile}
                    setFileState={setOpticalFile}
                    expectedType="optical"
                    accept=".tiff,.tif,.geotiff,.png,.jpg,.jpeg"
                  />
                  <UploadZone
                    label="SAR Signal Matrix"
                    description="Upload radar scatter file (.tif/.geotiff)"
                    fileState={sarFile}
                    setFileState={setSarFile}
                    expectedType="sar"
                    accept=".tiff,.tif,.geotiff"
                  />
                </div>
              )}

              {mode === 'bitemporal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UploadZone
                    label="T1 Earlier Date Capture"
                    description="Upload historical baseline imagery"
                    fileState={t1File}
                    setFileState={setT1File}
                    expectedType="any"
                    accept=".tiff,.tif,.geotiff,.png,.jpg,.jpeg"
                  />
                  <UploadZone
                    label="T2 Later Date Capture"
                    description="Upload recent checkup imagery"
                    fileState={t2File}
                    setFileState={setT2File}
                    expectedType="any"
                    accept=".tiff,.tif,.geotiff,.png,.jpg,.jpeg"
                  />
                </div>
              )}
            </div>

            {/* Target AI Parameters */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-zinc-900 pb-2">
                3. AI Co-Processor Settings
              </h3>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                  Natural Language Prompt instructions
                </label>
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500/60 transition"
                  placeholder="Identify structures, count vehicles, outline agricultural fields..."
                />
              </div>
            </div>

            {/* Submit Block */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
              <span className="text-[10px] text-zinc-500 font-mono">
                TASK_CREDITS: {mode === 'single' ? '120' : '240'} CREDITS REQUIRED
              </span>

              <button
                type="submit"
                disabled={!isUploadReady() || isSubmitting}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white rounded shadow-[0_0_15px_-3px_rgba(124,58,237,0.25)] hover:shadow-none transition flex items-center gap-2 font-sans uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Tasking Pipelines...
                  </>
                ) : (
                  <>
                    Continue to Analysis
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Info & Tasking Status Panel - 1 Col */}
        <div className="space-y-6">
          
          {/* Workstation guidelines */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 shadow-panel space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-violet-400" />
              Ingestion Notice
            </h2>
            <div className="text-xs text-slate-400 space-y-3 leading-relaxed">
              <p>
                For best results, upload images with valid **geotag projection metadata** (WGS84 EPSG:4326). 
              </p>
              <p>
                PNG/JPEG uploads will process without geolocation coordinate references, meaning distance maps will calculate relative pixels rather than geographical ground meters.
              </p>
            </div>
            <div className="p-3 bg-zinc-950 border border-zinc-900 rounded text-center">
              <p className="text-[10px] text-zinc-500 font-mono">GEOTIFF SUPPORT: ACTIVE</p>
              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">WGS84 AUTO-ALIGN: TRUE</p>
            </div>
          </div>

          {/* Ingestion results simulator log */}
          {submitSuccess && (
            <div className="bg-zinc-950/40 border border-emerald-900/30 bg-emerald-950/10 rounded-lg p-5 shadow-panel space-y-3 font-mono text-xs">
              <span className="font-sans font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Ingestion Completed
              </span>
              <p className="text-[10px] text-slate-300">
                Job ID: <strong className="text-violet-400">AN-2095-UPL</strong>
              </p>
              <p className="text-[10px] text-slate-400">
                Coordinate alignment succeeded. Raster arrays stacked. Launching segmentation network.
              </p>
              <div className="pt-2 border-t border-zinc-900">
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="text-[10px] text-violet-400 hover:underline"
                >
                  Create another run
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default NewAnalysis;
