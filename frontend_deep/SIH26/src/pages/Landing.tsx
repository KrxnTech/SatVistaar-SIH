import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthUI } from '../components/ui/auth-ui';
import { 
  Combine, 
  Target, 
  ArrowRight, 
  User,
  Scan,
  FileText,
  Eye,
  Edit3
} from 'lucide-react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="14" height="14" rx="2" stroke="#8B5CF6" strokeWidth="2.5" fill="#8B5CF6" fillOpacity="0.1" />
    <rect x="8" y="8" width="14" height="14" rx="2" stroke="#C084FC" strokeWidth="2.5" fill="#000000" />
    <circle cx="15" cy="15" r="2" fill="#8B5CF6" />
  </svg>
);

const Landing: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Split slider states
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Dragging event handlers for the split screen comparison
  const handleSliderStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsSliderDragging(true);
  };

  useEffect(() => {
    const handleMove = (clientX: number) => {
      if (!sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setSliderPosition(percentage);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSliderDragging) return;
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSliderDragging) return;
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleStop = () => {
      setIsSliderDragging(false);
    };

    if (isSliderDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleStop);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleStop);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleStop);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleStop);
    };
  }, [isSliderDragging]);

  const capabilities = [
    {
      id: '01',
      title: 'Satellite VQA',
      desc: 'Ask complex questions about optical and SAR imagery with high accuracy and domain-specific vocabulary.',
      icon: Edit3,
      color: 'text-violet-400 border-violet-950/40'
    },
    {
      id: '02',
      title: 'Change Detection',
      desc: 'Automatically identify and highlight deforestation or structural changes between temporal pairs.',
      icon: Target,
      color: 'text-emerald-400 border-emerald-950/40'
    },
    {
      id: '03',
      title: 'Optical + SAR Fusion',
      desc: 'Co-register different radar resolution with high resolution optical data for complex situational awareness.',
      icon: Combine,
      color: 'text-amber-500 border-amber-950/40'
    },
    {
      id: '04',
      title: 'Text-Guided grounding',
      desc: 'Locate specific objects, vehicles, or structures using natural language description.',
      icon: Scan,
      color: 'text-fuchsia-400 border-fuchsia-950/40'
    }
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-200 overflow-x-hidden font-sans relative selection:bg-violet-600/30 selection:text-white">
      
      {/* Background space glow grid details */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Large purple nebula glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-[60vw] h-[60vw] bg-violet-950/5 rounded-full blur-[140px]"></div>
        <div className="absolute inset-0 radar-grid opacity-15"></div>
      </div>

      {/* TOP NAVIGATION */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-[#08080a]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <LogoIcon />
            <span className="font-extrabold text-base tracking-wider text-slate-100 uppercase font-mono">
              SATVISTAAR.AI
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider font-mono">
            <Link to="/dashboard" className="text-zinc-400 hover:text-slate-100 transition relative py-2">
              DASHBOARD
            </Link>
            <Link to="/new-analysis" className="text-zinc-400 hover:text-slate-100 transition relative py-2">
              NEW ANALYSIS
            </Link>
            <Link to="/history" className="text-zinc-400 hover:text-slate-100 transition relative py-2">
              HISTORY
            </Link>
            <Link to="/reports" className="text-zinc-400 hover:text-slate-100 transition relative py-2">
              REPORTS
            </Link>
            <Link to="/system" className="text-zinc-400 hover:text-slate-100 transition relative py-2">
              SYSTEM
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setShowAuthModal(true)} 
              className="w-9 h-9 rounded-full border border-violet-500/20 bg-zinc-900/60 hover:bg-zinc-900 hover:border-violet-500/40 transition flex items-center justify-center text-violet-400 cursor-pointer"
            >
              <User className="w-4 h-4" />
            </div>
          </div>

        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-24 pb-16 z-10 flex flex-col items-center text-center px-6">
        
        {/* Technical Label */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-950/20 border border-violet-500/20 rounded-full text-[10px] font-bold text-violet-300 tracking-wider uppercase mb-8 shadow-inner font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
          INTERACTIVE VISION-LANGUAGE ASSISTANT FOR EARTH OBSERVATION
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-8xl font-black tracking-tight text-white max-w-6xl leading-[1.05] uppercase">
          ASK YOUR <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-400">SATELLITE DATA</span> ANYTHING.
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-sm md:text-base text-zinc-500 max-w-3xl leading-relaxed font-semibold">
          SatVistaar AI is an interactive vision-language assistant that lets users analyze multimodal remote-sensing imagery through natural-language queries.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-row items-center gap-4">
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded transition uppercase tracking-wider font-mono flex items-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.3)]"
          >
            START ANALYSIS
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <a
            href="#capabilities"
            className="px-6 py-3 bg-transparent hover:bg-zinc-900/60 border border-zinc-800 text-slate-350 font-extrabold text-xs rounded transition uppercase tracking-wider font-mono"
          >
            EXPLORE CAPABILITIES
          </a>
        </div>

        {/* Underline specs */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono font-extrabold text-zinc-600 tracking-widest uppercase border-t border-zinc-900 pt-8 w-full max-w-5xl">
          <span>OPTICAL</span>
          <span>•</span>
          <span>SAR</span>
          <span>•</span>
          <span>MULTISPECTRAL</span>
          <span>•</span>
          <span>CHANGE DETECTION</span>
          <span>•</span>
          <span>VISUAL GROUNDING</span>
        </div>

      </section>

      {/* 2. CORE FEATURES / CAPABILITIES SECTION */}
      <section id="capabilities" className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-zinc-900">
        <div className="mb-12">
          <p className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
            CORE FEATURES
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-2">
            ONE QUERY. MULTIPLE REMOTE-SENSING TASKS.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div key={cap.id} className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-6 flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative group h-48">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-650 font-extrabold">{cap.id}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-205 mt-4 tracking-wider uppercase">{cap.title}</h3>
                  <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed font-semibold">{cap.desc}</p>
                </div>
                
                <div className="flex justify-end mt-2">
                  <div className={`p-1.5 rounded-sm bg-zinc-900/60 ${cap.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. INTERACTIVE QUERY DEMO */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-zinc-900">
        <div className="mb-12">
          <p className="text-[10px] font-mono font-bold text-violet-405 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
            DEMO
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-2">
            ASK. ANALYZE. UNDERSTAND.
          </h2>
          <p className="text-xs md:text-sm text-zinc-500 mt-2 max-w-3xl leading-relaxed font-semibold">
            Interact with multi-temporal imagery as if you were talking to an expert geospatial analyst. The system automatically routes the query to the correct execution pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Left Panel: Query Terminal Output */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-lg p-6 flex flex-col justify-center space-y-6">
            
            {/* User query bubble */}
            <div className="border-l-2 border-violet-500 bg-violet-950/10 px-4 py-3.5 rounded-r-md">
              <p className="text-xs text-violet-350 font-mono leading-relaxed">
                <span className="text-violet-405 font-bold block mb-1 uppercase tracking-widest text-[9px]">● User Query:</span>
                "What changed in the industrial sector between T1 and T2?"
              </p>
            </div>

            {/* Checklist pipeline status */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="text-emerald-500 font-bold">✔</span>
                <span>Ingestion Pipeline Active</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="text-emerald-500 font-bold">✔</span>
                <span>Alignment Spatially (Co-Reg: OK)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="text-emerald-500 font-bold">✔</span>
                <span>Tool: Multimodal Diff engine</span>
              </div>
              <div className="flex items-center gap-2 text-violet-400 animate-pulse font-bold">
                <span className="inline-block animate-spin text-[10px] mr-0.5">⏳</span>
                <span>Synthesizing evidence...</span>
              </div>
            </div>

          </div>

          {/* Right Panel: Bounding box target lock visualizer */}
          <div className="bg-[#080b11] border-2 border-double border-violet-500/20 rounded-lg aspect-[4/3] flex items-center justify-center overflow-hidden relative">
            {/* Radar layout lines */}
            <div className="absolute inset-0 radar-grid opacity-30 z-0"></div>
            
            {/* Corner Bracket Braces */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-violet-500/30"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-violet-500/30"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-violet-500/30"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-violet-500/30"></div>

            {/* Camera / Image placement corner placeholders */}
            <div className="absolute top-5 left-5 text-violet-500/25">
              <Eye className="w-4 h-4" />
            </div>
            <div className="absolute top-5 right-5 text-violet-500/25">
              <Eye className="w-4 h-4" />
            </div>
            <div className="absolute bottom-5 left-5 text-violet-500/25">
              <Eye className="w-4 h-4" />
            </div>
            <div className="absolute bottom-5 right-5 text-violet-500/25">
              <Eye className="w-4 h-4" />
            </div>

            {/* Center neon target box */}
            <div className="z-10 w-52 h-36 border-2 border-emerald-500/60 bg-emerald-500/5 flex flex-col items-center justify-center text-center p-4 rounded animate-pulse">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mb-2 animate-ping"></div>
              <span className="text-[10px] font-mono text-emerald-400 font-extrabold tracking-widest uppercase">
                DIFF_STRUCT DETECTED
              </span>
              <span className="text-[8px] font-mono text-emerald-600 mt-1 uppercase">
                CONF: 94.6% // LOCK_1A
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. BI-TEMPORAL CHANGE DETECTION SPLIT SLIDER */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-zinc-900">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight">
            See What Changed.
          </h2>
          <p className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest mt-2">
            TEMPORAL ANALYSIS (T1 VS T2)
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-zinc-950/40 border border-zinc-900 rounded-xl p-5 shadow-panel space-y-6">
          
          {/* Comparison Slider Container */}
          <div 
            ref={sliderContainerRef}
            className="relative h-[480px] rounded-lg overflow-hidden border border-zinc-800 select-none cursor-ew-resize touch-none"
            onMouseDown={handleSliderStart}
            onTouchStart={handleSliderStart}
          >
            {/* T1 (Optical/Historical) - Base background image */}
            <div className="absolute inset-0 select-none pointer-events-none z-0">
              <img 
                src="/sat-historical.jpg" 
                alt="T1 Baseline" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-4 left-4 bg-zinc-950/95 border border-zinc-800/80 text-zinc-450 text-[10px] font-mono px-3 py-1.5 rounded uppercase tracking-wider font-extrabold">
                T1 (Natural Color, OCT 2023)
              </div>
            </div>

            {/* T2 (SAR Radar / Change Detected) - Foreground cropped overlay */}
            <div 
              className="absolute inset-0 select-none pointer-events-none z-10"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <img 
                src="/sat-sar.jpg" 
                alt="T2 SAR Scan" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-4 right-4 bg-violet-950/95 border border-violet-850/80 text-violet-405 text-[10px] font-mono px-3 py-1.5 rounded uppercase tracking-wider font-extrabold">
                T2 (SAR/Change, APR 2024)
              </div>
            </div>

            {/* Slider Center Line and Handle */}
            <div 
              className="absolute inset-y-0 w-0.5 bg-violet-500 z-20 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black border-2 border-violet-500 flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(139,92,246,0.6)] cursor-ew-resize">
                ↔
              </div>
            </div>
          </div>

          {/* Slider Control Instructions */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-550 max-w-md mx-auto pt-2 font-bold">
            <span>T1 BASICS</span>
            <span className="text-violet-400">◄ DRAG SLIDER TO COMPARE ►</span>
            <span>T2 ANOMALIES</span>
          </div>

        </div>
      </section>

      {/* 5. TEXT-GUIDED GROUNDING */}
      <section className="max-w-7xl mx-auto px-6 py-20 z-10 relative border-t border-zinc-900">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Visual Grounding Map Screenshot Overlay */}
          <div className="bg-[#0c0c0e] border border-zinc-900 rounded-xl p-5 relative overflow-hidden">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-zinc-800">
              <img 
                src="/sat-optical.jpg" 
                alt="Satellite Grounding" 
                className="w-full h-full object-cover opacity-80" 
              />
              
              {/* Coordinate Grid Overlay */}
              <div className="absolute inset-0 radar-grid opacity-20 pointer-events-none"></div>

              {/* Bounding box mock target highlight */}
              <div className="absolute top-[35%] left-[28%] w-[42%] h-[30%] border-2 border-emerald-500 bg-emerald-500/10 rounded-sm flex flex-col justify-between p-2 z-20">
                <span className="absolute -top-6 -left-0.5 bg-emerald-500 text-black text-[9px] font-extrabold px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                  AGRICULTURAL SEGMENTATION
                </span>
                <div className="w-full h-full border border-dashed border-emerald-400/40"></div>
              </div>

              {/* Scope/crosshair lines */}
              <div className="absolute top-[50%] left-0 right-0 h-px bg-emerald-500/10 pointer-events-none"></div>
              <div className="absolute left-[49%] top-0 bottom-0 w-px bg-emerald-500/10 pointer-events-none"></div>

              {/* Scale Marker overlay */}
              <div className="absolute bottom-3 left-3 bg-black/80 border border-zinc-800 px-2 py-1 rounded text-[9px] font-mono text-zinc-400">
                SCALE: 1 : 12,000 WGS84
              </div>
            </div>

            {/* Bottom details block */}
            <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-555 font-bold">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                ACTIVE GEOTAGS: TRUE
              </span>
              <span>GRID LOCK: 42-F // CLASSIFIED</span>
            </div>
          </div>

          {/* Right Column: Grounding Description & Prompt Details */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-mono font-bold text-violet-405 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                VISUAL GROUNDING
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mt-2">
                DESCRIBE IT. FIND IT.
              </h2>
              <p className="text-xs md:text-sm text-zinc-500 mt-4 leading-relaxed font-semibold">
                Use natural language to locate specific assets, infrastructure, or anomalies across vast swathes of imagery. The AI provides precise coordinates and confidence scores.
              </p>
            </div>

            {/* Grounding query bubble card */}
            <div className="bg-violet-950/10 border-l-2 border-violet-500 p-5 rounded-r-md">
              <span className="block text-[9px] font-mono font-extrabold text-violet-400 uppercase tracking-widest mb-1.5">query:</span>
              <p className="text-sm md:text-base text-violet-300 font-medium italic font-serif">
                "Find the large manufacturing plant with multiple loading docks near the main avenue."
              </p>
            </div>

            {/* Technical details footer metadata strip */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-zinc-950 border border-zinc-900 p-3 rounded">
                <span className="text-[9px] text-zinc-600 font-bold block mb-1">LATITUDE/LONGITUDE</span>
                <span className="text-slate-350 font-extrabold">25.0330° N, 121.5654° E</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-900 p-3 rounded">
                <span className="text-[9px] text-zinc-600 font-bold block mb-1">MATCH CONFIDENCE</span>
                <span className="text-emerald-400 font-extrabold">94.6% MATCH SCORE</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. CTA & FINAL FOOTER */}
      <section className="max-w-7xl mx-auto px-6 py-24 z-10 relative border-t border-zinc-900 text-center flex flex-col items-center">
        <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight uppercase">
          READY TO QUERY THE EARTH?
        </h2>

        <div className="mt-10 flex flex-row items-center gap-4">
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs rounded transition uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          >
            START ANALYSIS
          </button>
          <a
            href="#capabilities"
            className="px-6 py-3 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-slate-350 font-extrabold text-xs rounded transition uppercase tracking-wider font-mono flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 animate-pulse" />
            VIEW SCHEMA
          </a>
        </div>
      </section>

      {/* Footer footer station details */}
      <footer className="w-full border-t border-zinc-900 bg-black/60 py-10 text-center text-zinc-700 text-[10px] font-mono tracking-wider z-20 relative">
        <p className="uppercase font-extrabold">© 2026 SATVISTAAR.AI. ALL OBSERVATIONAL CORES OPERATIONAL.</p>
        <p className="text-zinc-800 mt-1 uppercase font-extrabold">SIH PROBLEM STATEMENT IMPLEMENTATION WORKSTATION V1.0.4</p>
      </footer>

      {/* Auth UI Modal Backdrop */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-[850px] bg-black border border-zinc-900 rounded-xl overflow-hidden shadow-2xl">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-zinc-950/80 border border-zinc-800 rounded-full text-zinc-405 hover:text-white transition"
              aria-label="Close Authentication Form"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AuthUI onSuccess={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;
