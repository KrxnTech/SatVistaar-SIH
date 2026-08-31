import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowDownToLine, 
  RefreshCw, 
  Calendar, 
  Eye, 
  AlertCircle, 
  Compass, 
  Database,
  Sliders,
  Sparkles
} from 'lucide-react';

interface MockFile {
  name: string;
  size: string;
  imageType: 'Optical' | 'SAR' | 'Multi-Spectral' | 'Thermal';
  format: 'GeoTIFF' | 'TIFF' | 'PNG' | 'JPEG';
  validationStatus: 'valid' | 'warning' | 'error';
  crs: string;
  resolution: string;
  bounds?: [number, number, number, number];
}

interface HistoryRecord {
  id: string;
  target: string;
  coords: string;
  analysisType: 'Single Image' | 'Change Analysis' | 'Optical + SAR';
  date: string;
  credits: number;
  status: 'Completed' | 'Failed';
  prompt: string;
  files: MockFile[];
}

const History: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Single Image' | 'Change Analysis' | 'Optical + SAR' | 'Failed'>('All');

  const historyData: HistoryRecord[] = [
    { 
      id: 'AN-2094', 
      target: 'Taipei Harbor Docks', 
      coords: '25.0342° N, 121.5621° E', 
      analysisType: 'Change Analysis', 
      date: '2026-08-30 11:45', 
      credits: 240, 
      status: 'Completed',
      prompt: 'Compare T1 (historical) baseline against current optical frames to track dock infrastructure updates.',
      files: [
        { name: 'taipei_optical_t2.tiff', size: '42.8 MB', imageType: 'Optical', format: 'GeoTIFF', validationStatus: 'valid', crs: 'EPSG:4326', resolution: '0.3m/px', bounds: [121.48, 24.98, 121.58, 25.08] },
        { name: 'taipei_historical_t1.tiff', size: '38.5 MB', imageType: 'Optical', format: 'GeoTIFF', validationStatus: 'valid', crs: 'EPSG:4326', resolution: '0.3m/px', bounds: [121.48, 24.98, 121.58, 25.08] }
      ]
    },
    { 
      id: 'AN-2093', 
      target: 'Taipei Harbor Berth 5', 
      coords: '25.0342° N, 121.5621° E', 
      analysisType: 'Single Image', 
      date: '2026-08-29 15:30', 
      credits: 120, 
      status: 'Completed',
      prompt: 'Extract all vessel bounds overlays and outline port dry docks.',
      files: [
        { name: 'taipei_harbor_optical.tiff', size: '42.8 MB', imageType: 'Optical', format: 'GeoTIFF', validationStatus: 'valid', crs: 'EPSG:4326', resolution: '0.3m/px', bounds: [121.50, 25.00, 121.55, 25.05] }
      ]
    },
    { 
      id: 'AN-2092', 
      target: 'Taipei Port Radar Sectors', 
      coords: '25.0342° N, 121.5621° E', 
      analysisType: 'Optical + SAR', 
      date: '2026-08-29 11:20', 
      credits: 320, 
      status: 'Completed',
      prompt: 'Ingest SAR radar backscatter intensities and overlay high-reflectivity targets over optical base.',
      files: [
        { name: 'taipei_sar.tiff', size: '64.1 MB', imageType: 'SAR', format: 'GeoTIFF', validationStatus: 'valid', crs: 'EPSG:4326', resolution: '1.0m/px', bounds: [121.48, 24.98, 121.58, 25.08] },
        { name: 'taipei_optical.tiff', size: '42.8 MB', imageType: 'Optical', format: 'GeoTIFF', validationStatus: 'valid', crs: 'EPSG:4326', resolution: '0.3m/px', bounds: [121.48, 24.98, 121.58, 25.08] }
      ]
    },
    { 
      id: 'AN-2091', 
      target: 'Keelung Port Locks', 
      coords: '25.1276° N, 121.7391° E', 
      analysisType: 'Change Analysis', 
      date: '2026-08-28 09:15', 
      credits: 240, 
      status: 'Failed',
      prompt: 'Detect structural changes inside Keelung Port locks.',
      files: [
        { name: 'keelung_base.tiff', size: '31.2 MB', imageType: 'Optical', format: 'GeoTIFF', validationStatus: 'valid', crs: 'EPSG:3857', resolution: '0.5m/px' }
      ]
    },
    { 
      id: 'AN-2090', 
      target: 'Taichung Terminal 4', 
      coords: '24.2644° N, 120.5189° E', 
      analysisType: 'Single Image', 
      date: '2026-08-27 18:24', 
      credits: 120, 
      status: 'Completed',
      prompt: 'Locate and outline all terminal oil storage tank dimensions.',
      files: [
        { name: 'taichung_tanker.png', size: '12.4 MB', imageType: 'Optical', format: 'PNG', validationStatus: 'valid', crs: 'Local Grid', resolution: '1.2m/px' }
      ]
    },
    { 
      id: 'AN-2089', 
      target: 'Kaohsiung Port Channels', 
      coords: '22.6174° N, 120.3014° E', 
      analysisType: 'Optical + SAR', 
      date: '2026-08-26 14:10', 
      credits: 320, 
      status: 'Completed',
      prompt: 'Co-register Sentinel-1 SAR and optical channels to isolate vessel berths.',
      files: [
        { name: 'kaohsiung_optical.tiff', size: '51.3 MB', imageType: 'Optical', format: 'GeoTIFF', validationStatus: 'valid', crs: 'EPSG:4326', resolution: '0.3m/px' },
        { name: 'kaohsiung_sar.tiff', size: '58.9 MB', imageType: 'SAR', format: 'GeoTIFF', validationStatus: 'valid', crs: 'EPSG:4326', resolution: '1.0m/px' }
      ]
    }
  ];

  // Filtering Logic
  const filteredHistory = historyData.filter(record => {
    const matchesSearch = 
      record.target.toLowerCase().includes(searchTerm.toLowerCase()) || 
      record.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.coords.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.prompt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = 
      activeTab === 'All' ||
      (activeTab === 'Failed' && record.status === 'Failed') ||
      (activeTab !== 'Failed' && record.analysisType === activeTab && record.status === 'Completed');

    return matchesSearch && matchesTab;
  });

  // Navigate to Workspace, passing prompt & file state configurations
  const handleViewInWorkspace = (record: HistoryRecord) => {
    // Map MockFile structures to Workspace InputFileItem schema
    const filesToSend = record.files.map((file, idx) => ({
      id: `history-file-${idx}`,
      name: file.name,
      size: file.size,
      imageType: file.imageType,
      format: file.format,
      validationStatus: file.validationStatus,
      crs: file.crs,
      resolution: file.resolution,
      bounds: file.bounds || [121.50, 25.00, 121.55, 25.05]
    }));

    navigate('/workspace', { 
      state: { 
        files: filesToSend,
        prompt: record.prompt,
        mode: record.analysisType === 'Single Image' ? 'single' : 
              record.analysisType === 'Change Analysis' ? 'bitemporal' : 'optical-sar'
      } 
    });
  };

  const handleDownloadTrace = (id: string) => {
    alert(`Downloading execution trace telemetry report for Analysis ${id}...`);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title Area */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
        <div className="text-left">
          <h1 className="text-2xl font-bold text-slate-100 tracking-wide uppercase">Mission History Logs</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Filter, search, and reload chronological analytics runs and telemetry outputs</p>
        </div>
        <div className="p-2 bg-zinc-950 border border-zinc-900 rounded flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
          <Database className="w-3.5 h-3.5 text-violet-400" />
          <span>DATABASE ACCESS: ENCRYPTED</span>
        </div>
      </div>

      {/* Interactive Tabs and Search Box */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-4 shadow-panel space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Real-time Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by job ID, target harbor, query payload..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 rounded pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-zinc-650 focus:outline-none focus:border-violet-500/60 transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-slate-300 rounded transition">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Full Range</span>
            </button>
            <button 
              onClick={() => { setSearchTerm(''); setActiveTab('All'); }}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-slate-300 rounded transition"
              title="Refresh database records"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap border-b border-zinc-900 gap-1">
          {(['All', 'Single Image', 'Change Analysis', 'Optical + SAR', 'Failed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-mono transition-all border-b-2 -mb-[1px] ${
                activeTab === tab 
                  ? 'border-violet-500 text-slate-200 font-bold bg-violet-950/10' 
                  : 'border-transparent text-zinc-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

      </div>

      {/* History Table Container */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg shadow-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-500 uppercase font-semibold bg-zinc-900/20 font-mono text-[9px]">
                <th className="p-4">Analysis ID</th>
                <th className="p-4">Target Location</th>
                <th className="p-4">Sensor Modality</th>
                <th className="p-4">Coordinates</th>
                <th className="p-4">Run Time</th>
                <th className="p-4">Task Cost</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Inspect Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50 text-slate-300 font-mono">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-zinc-900/20 transition text-[11px]">
                    
                    {/* Job ID */}
                    <td className="p-4 text-violet-400 font-bold">
                      {record.id}
                    </td>

                    {/* Location target description */}
                    <td className="p-4 text-slate-200 font-sans font-medium">
                      <div className="space-y-0.5">
                        <span className="block">{record.target}</span>
                        <span className="block text-[9.5px] text-zinc-500 truncate max-w-[240px]">
                          "{record.prompt}"
                        </span>
                      </div>
                    </td>

                    {/* Sensor Config / Analysis Type */}
                    <td className="p-4 text-slate-400 font-sans">
                      <div className="flex items-center gap-1.5">
                        {record.analysisType === 'Single Image' && <Compass className="w-3.5 h-3.5 text-brand-sky shrink-0" />}
                        {record.analysisType === 'Change Analysis' && <Sliders className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                        {record.analysisType === 'Optical + SAR' && <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span>{record.analysisType}</span>
                      </div>
                    </td>

                    {/* Coordinates location */}
                    <td className="p-4 text-slate-400">
                      {record.coords}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-zinc-500">
                      {record.date}
                    </td>

                    {/* Credits */}
                    <td className="p-4 text-slate-400">
                      {record.credits} CR
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 font-sans">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9.5px] font-semibold border ${
                        record.status === 'Completed' 
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
                          : 'bg-rose-950/20 text-rose-500 border-rose-900/30'
                      }`}>
                        {record.status === 'Failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {record.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2.5 font-sans">
                        
                        {/* View Workspace session button */}
                        <button 
                          onClick={() => handleViewInWorkspace(record)}
                          className="px-2.5 py-1 text-slate-400 hover:text-white bg-zinc-950 border border-zinc-900 hover:border-zinc-700 rounded transition flex items-center gap-1 text-[10px] font-bold"
                          title="Restore parameters in analysis workspace"
                        >
                          <Eye className="w-3 h-3 text-violet-400" />
                          <span>View</span>
                        </button>

                        {/* Download Trace button */}
                        <button 
                          onClick={() => handleDownloadTrace(record.id)}
                          disabled={record.status === 'Failed'}
                          className="p-1.5 text-slate-500 hover:text-emerald-400 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 rounded disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:border-zinc-900 transition"
                          title="Download execution trace logs JSON"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500 font-sans">
                    No historic mission logs match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary indicators */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-500 font-sans">
          <span>Displaying {filteredHistory.length} of {historyData.length} records in cache</span>
          <div className="flex gap-1">
            <button className="px-2.5 py-1 bg-zinc-950 border border-zinc-900 rounded hover:bg-zinc-900 disabled:opacity-50 transition" disabled>Previous</button>
            <button className="px-2.5 py-1 bg-zinc-950 border border-zinc-900 rounded hover:bg-zinc-900 disabled:opacity-50 transition" disabled>Next</button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default History;
