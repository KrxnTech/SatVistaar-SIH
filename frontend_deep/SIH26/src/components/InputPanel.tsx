import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  EyeOff, 
  Trash2, 
  MapPin, 
  FileCode, 
  Layers, 
  Globe, 
  Compass, 
  Search 
} from 'lucide-react';

export interface InputFileItem {
  id: string;
  name: string;
  size: string;
  imageType: 'Optical' | 'SAR' | 'Thermal' | 'Multispectral' | 'DEM';
  format: 'GeoTIFF' | 'TIFF' | 'PNG' | 'JPEG' | 'NITF' | 'HDF5';
  validationStatus: 'valid' | 'warning' | 'error' | 'checking';
  validationMessage?: string;
  compatibilityStatus: 'compatible' | 'coregistered' | 'mismatch' | 'resample_needed' | 'unknown';
  crs: string; // Coordinate Reference System, e.g. EPSG:4326
  resolution?: string; // e.g. "0.3m/px"
  bounds?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
  bands?: string[]; // e.g. ["Red", "Green", "Blue", "NIR"]
  acquisitionDate?: string;
  sensor?: string; // Sentinel-2B, Capella-6, WorldView-4 etc.
}

export interface InputPanelProps {
  files: InputFileItem[];
  onRemoveFile?: (id: string) => void;
  onSelectFile?: (file: InputFileItem) => void;
  onToggleVisibility?: (id: string, isVisible: boolean) => void;
  onFocusBounds?: (bounds: [number, number, number, number]) => void;
  selectedFileId?: string;
  visibleFileIds?: string[];
  className?: string;
  isLoading?: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  files,
  onRemoveFile,
  onSelectFile,
  onToggleVisibility,
  onFocusBounds,
  selectedFileId,
  visibleFileIds = [],
  className = '',
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFileId(expandedFileId === id ? null : id);
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.imageType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.crs.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: InputFileItem['validationStatus']) => {
    switch (status) {
      case 'valid':
        return (
          <div className="relative flex items-center justify-center">
            <span className="absolute w-5 h-5 rounded-full bg-emerald-500/20 animate-ping opacity-75"></span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 z-10" />
          </div>
        );
      case 'warning':
        return (
          <div className="relative flex items-center justify-center">
            <span className="absolute w-5 h-5 rounded-full bg-amber-500/20 animate-pulse opacity-75"></span>
            <AlertTriangle className="w-4 h-4 text-amber-400 z-10" />
          </div>
        );
      case 'error':
        return (
          <div className="relative flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-rose-500 z-10" />
          </div>
        );
      case 'checking':
        return (
          <div className="relative flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-violet-400 animate-spin z-10" />
          </div>
        );
    }
  };

  const getFormatBadgeStyle = (format: InputFileItem['format']) => {
    switch (format) {
      case 'GeoTIFF':
      case 'TIFF':
        return 'bg-violet-950/40 text-violet-400 border-violet-900/30';
      case 'PNG':
      case 'JPEG':
        return 'bg-slate-900 text-slate-400 border-zinc-800';
      case 'NITF':
      case 'HDF5':
        return 'bg-cyan-950/40 text-cyan-400 border-cyan-900/30';
    }
  };

  const getTypeBadgeStyle = (type: InputFileItem['imageType']) => {
    switch (type) {
      case 'Optical':
        return 'bg-brand-sky/10 text-brand-sky border-brand-sky/20';
      case 'SAR':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'Multispectral':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Thermal':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DEM':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    }
  };

  const getCompatibilityStyle = (status: InputFileItem['compatibilityStatus']) => {
    switch (status) {
      case 'compatible':
      case 'coregistered':
        return 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30';
      case 'resample_needed':
        return 'text-amber-400 bg-amber-950/20 border-amber-900/30';
      case 'mismatch':
        return 'text-rose-400 bg-rose-950/20 border-rose-900/30';
      default:
        return 'text-slate-400 bg-zinc-900 border-zinc-800';
    }
  };

  const getCompatibilityLabel = (status: InputFileItem['compatibilityStatus']) => {
    switch (status) {
      case 'compatible': return 'Compatible Grid';
      case 'coregistered': return 'Co-Registered';
      case 'resample_needed': return 'Resample Req.';
      case 'mismatch': return 'Grid Mismatch';
      default: return 'Pending Match';
    }
  };

  // Analyze files to see if all CRS values are matching
  const uniqueCRS = Array.from(new Set(files.map(f => f.crs))).filter(crs => crs);
  const crsMismatch = uniqueCRS.length > 1;

  return (
    <div className={`flex flex-col bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden shadow-panel ${className}`}>
      
      {/* Top Header Summary */}
      <div className="bg-zinc-900/20 border-b border-zinc-900 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">
              Telemetry Layers ({files.length})
            </h3>
          </div>
          <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">
            STATION: OPERATIONAL
          </span>
        </div>

        {/* Global CRS & Coregistration Summary */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px]">
            <div className={`p-1.5 rounded border flex items-center justify-between ${
              crsMismatch 
                ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' 
                : 'bg-zinc-950 border-zinc-900 text-slate-400'
            }`}>
              <span className="text-zinc-500">CRS GRID:</span>
              <span className="font-bold flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" />
                {crsMismatch ? 'MIXED PROJ' : uniqueCRS[0] || 'LOCAL'}
              </span>
            </div>
            
            <div className={`p-1.5 rounded border flex items-center justify-between ${
              files.some(f => f.validationStatus === 'error')
                ? 'bg-rose-950/20 border-rose-900/30 text-rose-400'
                : files.some(f => f.validationStatus === 'warning')
                ? 'bg-amber-950/20 border-amber-900/30 text-amber-400'
                : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
            }`}>
              <span className="text-zinc-500">ALIGNMENT:</span>
              <span className="font-bold uppercase">
                {files.some(f => f.validationStatus === 'error') ? 'ERRORS' :
                 crsMismatch ? 'RESAMPLE REQ' : 'CO-ALIGNED'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2 border-b border-zinc-900 bg-zinc-950/60">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <input
            type="text"
            placeholder="Filter active raster feeds..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-zinc-900 rounded pl-8 pr-3 py-1 text-[10px] font-mono text-slate-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500/50 transition"
          />
        </div>
      </div>

      {/* Inputs List */}
      <div className="flex-grow overflow-y-auto max-h-[380px] p-2 space-y-2 min-h-[150px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2 text-zinc-500 font-mono text-xs">
            <RefreshCw className="w-5 h-5 animate-spin text-violet-400" />
            <span>Parsing file metadata...</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-600 font-mono text-[10px]">
            <Compass className="w-5 h-5 mb-1.5 text-zinc-700" />
            <p>No active satellite layers</p>
            <p className="text-[9px] mt-0.5 text-zinc-700">Upload TIFF/PNG raster files to task analysis</p>
          </div>
        ) : (
          filteredFiles.map((file) => {
            const isSelected = selectedFileId === file.id;
            const isExpanded = expandedFileId === file.id;
            const isVisible = visibleFileIds.includes(file.id);

            return (
              <div
                key={file.id}
                onClick={() => onSelectFile?.(file)}
                className={`group border rounded overflow-hidden cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-violet-500/60 bg-violet-950/10 shadow-[0_0_8px_rgba(124,58,237,0.1)]' 
                    : 'border-zinc-900 bg-zinc-950 hover:border-zinc-800'
                }`}
              >
                {/* Main Card row */}
                <div className="p-2.5 flex items-center justify-between gap-2.5">
                  {/* Validation Icon & File Symbol */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(file.validationStatus)}
                    <div className="text-left">
                      <p className="text-[11px] font-semibold text-slate-200 truncate max-w-[130px] font-sans group-hover:text-white transition" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-mono text-zinc-500">
                        <span className={`px-1 rounded-[2px] border text-[8px] font-bold ${getFormatBadgeStyle(file.format)}`}>
                          {file.format}
                        </span>
                        <span>•</span>
                        <span>{file.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges / Visibility Controls */}
                  <div className="flex items-center gap-2">
                    {/* Image Type Badge */}
                    <span className={`hidden sm:inline-block px-1.5 py-0.5 rounded-[2px] border text-[8px] font-mono uppercase tracking-wider font-bold ${getTypeBadgeStyle(file.imageType)}`}>
                      {file.imageType}
                    </span>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility?.(file.id, !isVisible);
                      }}
                      className={`p-1 rounded hover:bg-zinc-900 border transition ${
                        isVisible 
                          ? 'text-brand-sky border-zinc-800 bg-zinc-950' 
                          : 'text-zinc-650 border-transparent hover:text-zinc-400'
                      }`}
                      title={isVisible ? 'Hide layer on map' : 'Overlay layer on map'}
                    >
                      {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Expand Detail Arrow */}
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(file.id, e)}
                      className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-slate-300 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-zinc-900/60 bg-black/40 p-3 space-y-2.5 font-mono text-[9.5px] text-slate-400 select-text">
                    
                    {/* Status Alert Message if warning/error */}
                    {file.validationMessage && file.validationStatus !== 'valid' && (
                      <div className={`p-2 rounded border text-[9px] flex gap-2 items-start ${
                        file.validationStatus === 'error' 
                          ? 'bg-rose-950/25 border-rose-900/40 text-rose-400' 
                          : 'bg-amber-950/25 border-amber-900/40 text-amber-400'
                      }`}>
                        <div className="shrink-0 mt-0.5">
                          {file.validationStatus === 'error' ? <AlertCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        </div>
                        <span>{file.validationMessage}</span>
                      </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-zinc-500">
                      <div>
                        <span className="text-zinc-600 block text-[8px] uppercase">CRS Reference:</span>
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                          <Globe className="w-3 h-3 text-violet-400" />
                          {file.crs || 'Local Grid (Unreferenced)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block text-[8px] uppercase">Compatibility:</span>
                        <span className={`inline-block px-1 rounded-[2px] border text-[8px] font-bold ${getCompatibilityStyle(file.compatibilityStatus)}`}>
                          {getCompatibilityLabel(file.compatibilityStatus)}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block text-[8px] uppercase">Sensor platform:</span>
                        <span className="text-slate-300 font-semibold">{file.sensor || 'Generic Imager'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-600 block text-[8px] uppercase">Resolution (GSD):</span>
                        <span className="text-slate-300 font-semibold">{file.resolution || 'N/A'}</span>
                      </div>
                      {file.bands && (
                        <div className="col-span-2">
                          <span className="text-zinc-600 block text-[8px] uppercase">Spectral bands:</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {file.bands.map((band, idx) => (
                              <span key={idx} className="bg-zinc-900 border border-zinc-800 text-[8.5px] text-slate-300 px-1 rounded-sm">
                                {band}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {file.bounds && (
                        <div className="col-span-2">
                          <span className="text-zinc-600 block text-[8px] uppercase">Bounding Box:</span>
                          <div className="bg-zinc-950 p-1.5 rounded border border-zinc-900/60 mt-0.5 grid grid-cols-2 gap-1 text-[8.5px] font-mono text-zinc-500">
                            <div>Min Lng: <strong className="text-slate-300">{file.bounds[0].toFixed(5)}</strong></div>
                            <div>Min Lat: <strong className="text-slate-300">{file.bounds[1].toFixed(5)}</strong></div>
                            <div>Max Lng: <strong className="text-slate-300">{file.bounds[2].toFixed(5)}</strong></div>
                            <div>Max Lat: <strong className="text-slate-300">{file.bounds[3].toFixed(5)}</strong></div>
                          </div>
                        </div>
                      )}
                      {file.acquisitionDate && (
                        <div className="col-span-2 pt-1 border-t border-zinc-900/50 flex items-center justify-between text-[8px] text-zinc-600">
                          <span>Captured: {file.acquisitionDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Action Row */}
                    <div className="pt-2 border-t border-zinc-900/60 flex items-center justify-between gap-2">
                      <div className="flex gap-1.5">
                        {file.bounds && onFocusBounds && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFocusBounds(file.bounds!);
                            }}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-slate-300 hover:text-white transition"
                          >
                            <MapPin className="w-2.5 h-2.5 text-brand-sky" />
                            <span>Locate</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`File: ${file.name}\nCRS: ${file.crs}\nResolution: ${file.resolution}\nImageType: ${file.imageType}\nBands: ${file.bands?.join(', ') || 'N/A'}\nSensor: ${file.sensor || 'N/A'}`);
                          }}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-slate-300 hover:text-white transition"
                        >
                          <FileCode className="w-2.5 h-2.5 text-violet-400" />
                          <span>Inspect Header</span>
                        </button>
                      </div>

                      {onRemoveFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFile(file.id);
                          }}
                          className="p-1 rounded hover:bg-rose-950/20 text-zinc-600 hover:text-rose-400 border border-transparent hover:border-rose-900/30 transition"
                          title="Remove from Workspace"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
