import React from 'react';
import { Download, Share2, Eye, Calendar, HardDrive, ClipboardCheck } from 'lucide-react';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  size: string;
  date: string;
  pages: number;
  category: 'Strategic' | 'Environmental' | 'Intelligence';
}

const Reports: React.FC = () => {
  const reports: ReportItem[] = [
    {
      id: 'REP-2026-004',
      title: 'Taipei Harbor Cargo & Vessel Density Matrix',
      description: 'Temporal analysis of shipping containers and docking patterns across major terminals. Employs dual-band synthetic aperture radar.',
      size: '4.8 MB',
      date: 'Aug 29, 2026',
      pages: 14,
      category: 'Strategic'
    },
    {
      id: 'REP-2026-003',
      title: 'Nord Stream Seafloor Thermal Anomaly Audit',
      description: 'Thermal infrared mapping and bathymetric anomalies detection around Section C gas pipeline pipelines.',
      size: '8.2 MB',
      date: 'Aug 28, 2026',
      pages: 22,
      category: 'Intelligence'
    },
    {
      id: 'REP-2026-002',
      title: 'Amazon Canopy Deforestation Index (Sect. 4)',
      description: 'Environmental monitoring report tracking canopy cover loss using L1C cloud penetration index filtering.',
      size: '3.1 MB',
      date: 'Aug 25, 2026',
      pages: 9,
      category: 'Environmental'
    },
    {
      id: 'REP-2026-001',
      title: 'Suez Canal Ship Stacking Alert Log',
      description: 'Short report summarizing anchor limits and waiting bay backups using high-resolution optical imagery.',
      size: '2.5 MB',
      date: 'Aug 22, 2026',
      pages: 6,
      category: 'Strategic'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Title Area */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-wide uppercase">Intelligence Reports</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Access structured reports, AI findings, and exported sensor datasets</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-5 shadow-panel flex flex-col justify-between hover:border-zinc-800 transition duration-300">
            <div>
              {/* Category & ID tag */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                  report.category === 'Strategic' ? 'bg-violet-950/30 text-violet-400 border border-violet-900/30' :
                  report.category === 'Environmental' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-900/30' :
                  'bg-violet-950/30 text-violet-400 border border-violet-900/30'
                }`}>
                  {report.category}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">{report.id}</span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-200 mt-3 hover:text-violet-300 transition cursor-pointer">
                {report.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Footer details & action links */}
            <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{report.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>{report.size}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>{report.pages} Pages</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button className="p-2 bg-zinc-950 hover:bg-zinc-900 text-slate-400 hover:text-slate-200 rounded border border-zinc-900 transition">
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button className="p-2 bg-zinc-950 hover:bg-zinc-900 text-slate-400 hover:text-slate-200 rounded border border-zinc-900 transition">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button className="flex items-center gap-1 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-[10px] font-bold text-white rounded transition shadow-[0_0_15px_-3px_rgba(124,58,237,0.25)] hover:shadow-none">
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
